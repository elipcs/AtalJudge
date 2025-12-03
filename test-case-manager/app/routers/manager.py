"""Rotas da API REST para gerenciamento de casos de teste (geração + import)"""
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any
from app.models.request import GenerateTestCasesRequest, GenerateAndSaveRequest, ImportTestCasesRequest
from app.models.response import (
    GenerateTestCasesResponse,
    GenerateAndSaveResponse,
    ImportTestCasesResponse,
    ErrorResponse
)
from app.services.test_case_service import TestCaseService
from app.services.dataset_import_service import DatasetImportService
from app.middlewares.auth import jwt_bearer
from app.utils.logger import logger

router = APIRouter(prefix="/api", tags=["test-case-manager"])

# Instanciar serviços
test_case_service = TestCaseService()
dataset_import_service = DatasetImportService()


@router.post("/generate", response_model=GenerateTestCasesResponse)
async def generate_test_cases(
    request: GenerateTestCasesRequest,
    req: Request,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> GenerateTestCasesResponse:
    """
    [GERAÇÃO] Gera casos de teste para uma questão
    
    Args:
        request: Request com question_id, oracle_code, count, use_gemini
        req: Request object
        current_user: Usuário autenticado (do token JWT)
        token: Token JWT validado
    
    Returns:
        Resposta com casos de teste gerados
    """
    logger.info('='*80)
    logger.info('🚀 GERANDO CASOS DE TESTE')
    logger.info('='*80)
    
    try:
        # Obter usuário e token do request state (definidos pelo jwt_bearer)
        current_user = req.state.user
        token = req.state.token
        
        logger.info(f'Token validado para usuário: {current_user.get("sub")}')
        logger.info(f'Requisição: question_id={request.question_id}, count={request.count or 20}')
        
        result = await test_case_service.generate_test_cases(
            question_id=request.question_id,
            oracle_code=request.oracle_code,
            token=token,
            count=request.count or 20,
            use_gemini=request.use_gemini if request.use_gemini is not None else True,
            strategies=request.strategies,
            use_supervision=request.use_supervision if request.use_supervision is not None else False
        )
        
        return GenerateTestCasesResponse(
            test_cases=result['test_cases'],
            total_generated=result['total_generated'],
            algorithm_type=result.get('algorithm_type'),
            format_schema=result.get('format_schema')
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
        logger.error(f'Erro ao gerar casos de teste: {e}')
        logger.error(f'Traceback completo:\n{error_traceback}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Erro ao gerar casos de teste: {str(e)}'
        )


@router.post("/import", response_model=ImportTestCasesResponse)
async def import_test_cases(
    request: ImportTestCasesRequest,
    req: Request,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> ImportTestCasesResponse:
    """
    [IMPORT] Importa casos de teste do dataset Code-Contests-Plus
    
    Args:
        request: Request com question_id, dataset_problem_id, test_cases_count
        req: Request object
        current_user: Usuário autenticado (do token JWT)
        token: Token JWT validado
    
    Returns:
        Resposta com casos de teste importados
    """
    logger.info('='*80)
    logger.info('📥 IMPORTANDO CASOS DE TESTE DO DATASET')
    logger.info('='*80)
    
    try:
        # Obter usuário e token do request state
        current_user = req.state.user
        token = req.state.token
        
        logger.info(f'Token validado para usuário: {current_user.get("sub")}')
        logger.info(f'Requisição: question_id={request.question_id}, dataset_problem_id={request.dataset_problem_id}')
        
        result = await dataset_import_service.import_test_cases(
            question_id=request.question_id,
            dataset_problem_id=request.dataset_problem_id,
            token=token,
            count=request.test_cases_count or 20,
            config=request.config or "1x"
        )
        
        return ImportTestCasesResponse(
            test_cases=result['test_cases'],
            total_imported=result['total_imported'],
            dataset_source=result.get('dataset_source'),
            message=f"{result['total_imported']} casos importados com sucesso"
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


@router.post("/search-dataset")
async def search_dataset(
    query: str,
    limit: int = 20,
    config: str = "1x",
    req: Request = None,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> Dict[str, Any]:
    """
    Busca problemas no dataset Code-Contests-Plus
    
    Args:
        query: Termo de busca
        limit: Máximo de resultados
        config: Configuração do dataset (1x, 2x, 3x, 4x, 5x)
        req: Request object
        credentials: JWT token
    
    Returns:
        Lista de problemas encontrados no dataset
    """
    logger.info(f'🔍 Buscando no dataset: query={query}, limit={limit}, config={config}')
    
    try:
        results = await dataset_import_service.search_dataset(
            query=query,
            limit=limit,
            config=config
        )
        
        return {
            "status": "success",
            "results": results,
            "total_found": len(results),
            "config": config
        }
        
    except Exception as e:
        logger.error(f'Erro ao buscar no dataset: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Erro ao buscar no dataset: {str(e)}'
        )


@router.get("/dataset-status")
async def get_dataset_status(
    config: str = "1x",
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> Dict[str, Any]:
    """
    Obtém status do dataset importado
    
    Args:
        config: Configuração do dataset
        credentials: JWT token
    
    Returns:
        Status do import, número de problemas, etc
    """
    try:
        status_info = await dataset_import_service.get_import_status(config)
        return status_info
    except Exception as e:
        logger.error(f'Erro ao obter status do dataset: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f'Erro ao obter status: {str(e)}'
        )


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Endpoint de health check"""
    return {
        "status": "healthy",
        "service": "test-case-manager",
        "version": "2.0.0"
    }
