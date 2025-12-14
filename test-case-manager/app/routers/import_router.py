"""Import router for bulk dataset import integration with AtalJudge backend"""
from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
import httpx
import asyncio
from app.services.dataset_service import get_dataset_service
from app.middlewares.auth import jwt_bearer
from app.utils.logger import logger
import os


router = APIRouter(prefix="/api/import", tags=["import"])


class BulkImportRequest(BaseModel):
    config: str = "1x"
    limit: int = 1000
    skip_existing: bool = True


class BulkImportResponse(BaseModel):
    message: str
    status: str
    problems_count: int
    backend_url: str


async def bulk_import_to_backend(
    problems: list,
    config: str,
    skip_existing: bool = True,
    jwt_token: str = None
):
    """
    Import all problems to AtalJudge backend
    """
    backend_url = os.getenv('ATALJUDGE_API_URL', 'http://backend:3333/api')
    if not jwt_token:
        jwt_token = os.getenv('JWT_SECRET', '')
    
    logger.info(f"[BulkImportToBackend] Starting import of {len(problems)} problems to {backend_url}")
    
    successful_imports = 0
    failed_imports = 0
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        for idx, problem in enumerate(problems, 1):
            try:
                # Update progress: current problem
                problem_title = problem.get('title', 'Untitled')
                logger.info(f"[{idx}/{len(problems)}] Processing problem '{problem_title}'")
                
                # Prepare problem data for backend
                problem_data = {
                    'title': problem_title,
                    'text': problem.get('full_description', '') or problem.get('description', ''),
                    'oracle_code': '',
                    'oracle_language': 'python',
                    'source': f"Code-Contests-Plus ({config})",
                    'tags': problem.get('cf_tags', []) or problem.get('tags', []),
                    'time_limit_ms': int(problem.get('time_limit', 2.0) * 1000),
                    'memory_limit_kb': problem.get('memory_limit_bytes', 268435456) // 1024,
                }
                
                # Get test cases for this problem
                test_cases_data = []
                try:
                    dataset_service = get_dataset_service(config)
                    test_cases_data = dataset_service.get_all_test_cases(problem.get('problem_id') or problem.get('name', ''))
                    logger.info(f"Loaded {len(test_cases_data)} test cases for '{problem_title}'")
                except Exception as e:
                    logger.warn(f"Could not fetch test cases for problem '{problem_title}': {e}")
                    test_cases_data = []
                
                # Create problem in backend
                headers = {
                    'Content-Type': 'application/json',
                    'User-Agent': 'TestCaseManager/1.0'
                }
                
                if jwt_token:
                    headers['Authorization'] = f'Bearer {jwt_token}'
                
                # Try to create the problem
                response = await client.post(
                    f'{backend_url}/questions',
                    json=problem_data,
                    headers=headers,
                    timeout=30.0
                )
                
                if response.status_code not in [200, 201]:
                    logger.error(f"Failed to create problem '{problem_title}': {response.status_code} - {response.text}")
                    failed_imports += 1
                    continue
                
                problem_response = response.json()
                problem_id = problem_response.get('data', {}).get('id') or problem_response.get('id')
                
                if not problem_id:
                    logger.error(f"No problem ID in response for '{problem_title}'")
                    failed_imports += 1
                    continue
                
                successful_imports += 1
                logger.info(f"✅ Problem '{problem_title}' created with ID: {problem_id}")
                
                # Create test cases
                testcase_count = len(test_cases_data)
                
                for tc_idx, test_case in enumerate(test_cases_data, 1):
                    
                    test_case_data = {
                        'input': test_case.get('input', ''),
                        'expected_output': test_case.get('output', ''),
                        'weight': 1
                    }
                    
                    try:
                        tc_response = await client.post(
                            f'{backend_url}/questions/{problem_id}/testcases',
                            json=test_case_data,
                            headers=headers,
                            timeout=30.0
                        )
                        
                        if tc_response.status_code not in [200, 201]:
                            logger.warn(f"Failed to create test case {tc_idx}/{testcase_count} for problem {problem_id}: {tc_response.status_code}")
                    except Exception as e:
                        logger.error(f"Error creating test case {tc_idx}/{testcase_count}: {e}")
                
                logger.info(f"[{idx}/{len(problems)}] ✅ Successfully imported problem '{problem_title}' with {testcase_count} test cases")
                
            except Exception as e:
                logger.error(f"Error importing problem: {e}")
                failed_imports += 1
    
    logger.info(f"[BulkImportToBackend] Completed import: {successful_imports} successful, {failed_imports} failed")
    return {"successful": successful_imports, "failed": failed_imports}


@router.get("/health")
async def health_check():
    """Health check do módulo de import"""
    return {
        "status": "healthy",
        "module": "import_bulk",
        "version": "2.0.0"
    }


@router.post("/testcases", response_model=BulkImportResponse)
async def bulk_import_testcases(
    request: BulkImportRequest,
    req: Request = None,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
):
    """
    Bulk import all test cases from Code-Contests-Plus dataset to AtalJudge backend
    
    This endpoint imports problems synchronously.
    
    - **config**: Dataset configuration (1x, 2x, 3x, 4x, 5x)
    - **limit**: Maximum number of problems to import
    - **skip_existing**: Skip problems that already exist (for future use)
    """
    try:
        logger.info("="*80)
        logger.info("📥 INICIANDO IMPORTAÇÃO BULK DO DATASET PARA BACKEND")
        logger.info("="*80)
        logger.info(f"Config: {request.config}, Limit: {request.limit}")
        
        # Get user token from request state
        jwt_token = req.state.token if req and hasattr(req.state, 'token') else None
        backend_url = os.getenv('ATALJUDGE_API_URL', 'http://backend:3333/api')
        
        logger.info(f"Backend URL: {backend_url}")
        logger.info(f"JWT Token disponível: {bool(jwt_token)}")
        
        # Load dataset
        logger.info(f"📊 Carregando dataset e listando todos os problemas...")
        logger.info(f"⬇️  Iniciando download do dataset {request.config}...")
        dataset_service = get_dataset_service(request.config)
        
        # Force dataset download/load before searching
        logger.info(f"🔄 Verificando/baixando arquivos do dataset...")
        _ = dataset_service._get_dataset()
        logger.info(f"✅ Dataset carregado com sucesso!")
        
        problems = dataset_service.search_problems('', request.limit, max_scan=request.limit)
        
        logger.info(f"✅ Encontrados {len(problems)} problemas no dataset")
        
        # Import to backend
        result = await bulk_import_to_backend(
            problems=problems,
            config=request.config,
            skip_existing=request.skip_existing,
            jwt_token=jwt_token
        )
        
        logger.info("="*80)
        logger.info(f"✅ Bulk import completed: {result['successful']} successful, {result['failed']} failed")
        logger.info("="*80)
        
        return BulkImportResponse(
            message=f"Import completed: {result['successful']} successful, {result['failed']} failed",
            status="completed",
            problems_count=len(problems),
            backend_url=backend_url
        )
    
    except Exception as e:
        logger.error(f"Error in bulk_import_testcases: {e}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error during bulk import: {str(e)}")
