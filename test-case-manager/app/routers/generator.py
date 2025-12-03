"""Rotas da API REST para geração de casos de teste"""
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any
from app.models.request import GenerateTestCasesRequest, GenerateAndSaveRequest
from app.models.response import (
    GenerateTestCasesResponse,
    GenerateAndSaveResponse,
    ErrorResponse
)
from app.services.test_case_service import TestCaseService
from app.middlewares.auth import jwt_bearer
from app.utils.logger import logger

router = APIRouter(prefix="/api", tags=["test-case-generator"])

# Instanciar serviço
test_case_service = TestCaseService()


@router.post("/generate", response_model=GenerateTestCasesResponse)
async def generate_test_cases(
    request: GenerateTestCasesRequest,
    req: Request,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> GenerateTestCasesResponse:
    """
    Gera casos de teste para uma questão
    
    Args:
        request: Request com question_id, oracle_code, count, use_gemini
        req: Request object
        current_user: Usuário autenticado (do token JWT)
        token: Token JWT validado
    
    Returns:
        Resposta com casos de teste gerados
    """
    logger.info('='*80)
    logger.info('🚀 NOVA REQUISIÇÃO RECEBIDA /api/generate')
    logger.info('='*80)
    
    try:
        # Obter usuário e token do request state (definidos pelo jwt_bearer)
        current_user = req.state.user
        token = req.state.token
        
        logger.info(f'Token validado para usuário: {current_user.get("sub")}')
        logger.info(f'Recebida requisição para gerar casos de teste: question_id={request.question_id}, user_id={current_user.get("sub")}')
        
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


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Endpoint de health check"""
    return {
        "status": "healthy",
        "service": "test-case-generator"
    }

