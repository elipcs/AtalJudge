"""Router do módulo de Importação do Database"""
from fastapi import APIRouter, HTTPException, status, Request, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any, List, Optional
import asyncio
import aiohttp
from app.models.request import ImportTestCasesRequest
from app.models.response import ImportTestCasesResponse
from app.services.dataset_import_service import DatasetImportService
from app.modules.import_database.service import ImportService
from app.middlewares.auth import jwt_bearer
from app.utils.logger import logger

router = APIRouter(prefix="/api/import", tags=["import_database"])

# Instanciar serviço
dataset_import_service = DatasetImportService()
import_service = ImportService()


@router.post("/testcases", response_model=ImportTestCasesResponse)
async def import_test_cases(
    request: ImportTestCasesRequest,
    req: Request,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> ImportTestCasesResponse:
    """
    📥 [IMPORT] Importa TODOS os problemas do dataset para o backend
    
    Esta é a operação de bulk import que:
    1. Lista todos os problemas do dataset local
    2. Obtém detalhes e test cases de cada problema
    3. Envia para o backend do AtalJudge para importação
    
    Args:
        request: Request com config e outras opções
        req: Request object
        credentials: JWT token validado
    
    Returns:
        Resposta com estatísticas de importação
    """
    logger.info('='*80)
    logger.info('📥 INICIANDO IMPORTAÇÃO BULK DO DATASET PARA BACKEND')
    logger.info('='*80)
    
    try:
        # Obter usuário e token do request state
        current_user = req.state.user
        jwt_token = req.state.token
        backend_url = request.backend_url or "http://localhost:3333"
        config = request.config or "1x"
        limit = request.limit or 1000
        
        logger.info(f'Usuário: {current_user.get("sub")}')
        logger.info(f'Config: {config}, Limit: {limit}')
        logger.info(f'Backend URL: {backend_url}')
        
        # 1. Listar todos os problemas do dataset
        logger.info(f'📊 Listando todos os problemas do dataset...')
        importer = import_service._get_importer(config)
        if not importer:
            raise ValueError(f"Dataset {config} não está disponível")
        
        # Obter status
        status_info = importer.get_import_status()
        if not status_info or status_info['status'] != 'completed':
            raise ValueError(
                f"Dataset {config} não foi importado. "
                "Execute: python scripts/import_dataset/run_import.py --config {config}"
            )
        
        # Buscar todos os problemas (usando busca genérica)
        all_problems = importer.search_local("", limit)
        
        logger.info(f'✅ Encontrados {len(all_problems)} problemas no dataset')
        
        # 2. Importar cada problema no backend
        successful_imports = 0
        failed_imports = 0
        total_test_cases = 0
        errors = []
        
        async with aiohttp.ClientSession() as session:
            for idx, problem in enumerate(all_problems, 1):
                try:
                    logger.info(f'[{idx}/{len(all_problems)}] Importando: {problem.get("title", problem.get("id"))}')
                    
                    # Obter detalhes completos
                    problem_details = importer.get_problem_by_id(problem['id'])
                    if not problem_details:
                        logger.warning(f'Problema {problem["id"]} não encontrado em detalhes')
                        failed_imports += 1
                        errors.append({
                            "problem_id": problem['id'],
                            "error": "Detalhes não encontrados"
                        })
                        continue
                    
                    # Obter test cases
                    test_cases = importer.get_test_cases(problem['id'])
                    logger.info(f'  └─ {len(test_cases)} test cases encontrados')
                    
                    # Preparar payload para backend
                    import_payload = {
                        "datasetConfig": config,
                        "problems": [{
                            "id": problem_details.get('id'),
                            "title": problem_details.get('title'),
                            "description": problem_details.get('description', ''),
                            "full_description": problem_details.get('full_description', ''),
                            "input_format": problem_details.get('input_format', ''),
                            "output_format": problem_details.get('output_format', ''),
                            "difficulty": problem_details.get('difficulty', 'medium'),
                            "time_limit": problem_details.get('time_limit', 2.0),
                            "memory_limit": problem_details.get('memory_limit', 256),
                            "tags": problem_details.get('tags', []),
                            "sample_inputs": problem_details.get('sample_inputs', []),
                            "sample_outputs": problem_details.get('sample_outputs', []),
                            "source": problem_details.get('source', 'Code-Contests-Plus'),
                            "test_cases": test_cases
                        }]
                    }
                    
                    # Enviar para backend
                    headers = {
                        'Authorization': f'Bearer {jwt_token}',
                        'Content-Type': 'application/json'
                    }
                    
                    async with session.post(
                        f'{backend_url}/api/questions/bulk-import-dataset',
                        json=import_payload,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=60)
                    ) as response:
                        if response.status == 201 or response.status == 200:
                            result = await response.json()
                            logger.info(f'  ✅ Importado com sucesso')
                            successful_imports += 1
                            total_test_cases += len(test_cases)
                        else:
                            error_text = await response.text()
                            logger.error(f'  ❌ Erro ao importar: {response.status} - {error_text}')
                            failed_imports += 1
                            errors.append({
                                "problem_id": problem['id'],
                                "error": f"Backend retornou {response.status}"
                            })
                
                except Exception as e:
                    logger.error(f'  ❌ Erro ao processar problema: {str(e)}')
                    failed_imports += 1
                    errors.append({
                        "problem_id": problem.get('id', 'unknown'),
                        "error": str(e)
                    })
                
                # Evitar sobrecarga do backend
                await asyncio.sleep(0.1)
        
        # 3. Retornar resultado
        logger.info('='*80)
        logger.info(f'✅ IMPORTAÇÃO CONCLUÍDA')
        logger.info(f'   Sucessos: {successful_imports}')
        logger.info(f'   Falhas: {failed_imports}')
        logger.info(f'   Test Cases: {total_test_cases}')
        logger.info('='*80)
        
        return ImportTestCasesResponse(
            test_cases=[],
            total_imported=successful_imports,
            dataset_source=f"Code-Contests-Plus ({config})",
            message=f"Importação concluída: {successful_imports} problemas, {total_test_cases} test cases"
        )
        
    except ValueError as e:
        logger.error(f'Erro de validação: {e}')
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f'Erro ao importar casos de teste: {e}')
        logger.error(f'Traceback completo:\n{error_traceback}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Erro ao importar casos de teste: {str(e)}'
        )


@router.post("/search")
async def search_dataset(
    query: str = Query(..., min_length=1, description="Termo de busca"),
    limit: int = Query(20, ge=1, le=100, description="Máximo de resultados"),
    config: str = Query("1x", description="Configuração do dataset"),
    req: Request = None,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> Dict[str, Any]:
    """
    🔍 [SEARCH] Busca problemas no dataset Code-Contests-Plus
    
    Args:
        query: Termo de busca (ex: "graph", "sorting")
        limit: Máximo de resultados (1-100)
        config: Configuração do dataset (1x, 2x, 3x, 4x, 5x)
        req: Request object
        credentials: JWT token validado
    
    Returns:
        Lista de problemas encontrados no dataset
    """
    logger.info(f'🔍 Buscando no dataset: query="{query}", limit={limit}, config={config}')
    
    try:
        results = await import_service.search_dataset(
            query=query,
            limit=limit,
            config=config
        )
        
        logger.info(f'✅ Encontrados {len(results)} problemas')
        
        return {
            "status": "success",
            "results": results,
            "total_found": len(results),
            "config": config,
            "query": query
        }
        
    except Exception as e:
        logger.error(f'Erro ao buscar no dataset: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Erro ao buscar no dataset: {str(e)}'
        )


@router.get("/status")
async def get_dataset_status(
    config: str = Query("1x", description="Configuração do dataset"),
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> Dict[str, Any]:
    """
    📊 [STATUS] Obtém status do dataset importado
    
    Args:
        config: Configuração do dataset (1x, 2x, 3x, 4x, 5x)
        credentials: JWT token validado
    
    Returns:
        Status do import, número de problemas, etc
    """
    logger.info(f'📊 Obtendo status do dataset: config={config}')
    
    try:
        status_info = await import_service.get_import_status(config)
        return status_info
    except Exception as e:
        logger.error(f'Erro ao obter status do dataset: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Erro ao obter status: {str(e)}'
        )


@router.get("/problem/{problem_id}")
async def get_problem_details(
    problem_id: str,
    config: str = Query("1x", description="Configuração do dataset"),
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> Dict[str, Any]:
    """
    📋 [DETAILS] Obtém detalhes de um problema no dataset
    
    Args:
        problem_id: ID do problema no dataset
        config: Configuração do dataset
        credentials: JWT token validado
    
    Returns:
        Detalhes do problema (title, description, test_cases, etc)
    """
    logger.info(f'📋 Obtendo detalhes: problem_id={problem_id}, config={config}')
    
    try:
        problem = await import_service.get_problem_details(problem_id, config)
        
        if not problem:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Problema '{problem_id}' não encontrado"
            )
        
        return {
            "status": "success",
            "problem": problem
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f'Erro ao obter detalhes: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check do módulo de import"""
    return {
        "status": "healthy",
        "module": "import_database",
        "version": "2.0.0"
    }
