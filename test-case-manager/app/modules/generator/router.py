"""Router do módulo de Geração de Casos de Teste"""
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.security import HTTPAuthorizationCredentials
from typing import Dict, Any
from app.models.request import GenerateTestCasesRequest, GenerateAndSaveRequest
from app.models.response import GenerateTestCasesResponse, GenerateAndSaveResponse
from app.services.test_case_service import TestCaseService
from app.middlewares.auth import jwt_bearer
from app.utils.logger import logger

router = APIRouter(prefix="/api/generator", tags=["generator"])

# Instanciar serviço
test_case_service = TestCaseService()


@router.post("/generate", response_model=GenerateTestCasesResponse)
async def generate_test_cases(
    request: GenerateTestCasesRequest,
    req: Request,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> GenerateTestCasesResponse:
    """
    🔧 [GERAÇÃO] Gera casos de teste para uma questão
    
    Usa Gemini para inferir o formato de entrada e gera
    casos com estratégias diversas (edge cases, aleatórios, etc).
    
    Args:
        request: Request com question_id, oracle_code, count, use_gemini
        req: Request object
        credentials: JWT token validado
    
    Returns:
        Resposta com casos de teste gerados
    """
    logger.info('='*80)
    logger.info('🔧 GERANDO CASOS DE TESTE')
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
        
        logger.info(f'✅ Gerados {result["total_generated"]} casos de teste')
        
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


@router.post("/generate-and-save", response_model=GenerateAndSaveResponse)
async def generate_and_save_test_cases(
    request: GenerateAndSaveRequest,
    req: Request,
    credentials: HTTPAuthorizationCredentials = Depends(jwt_bearer)
) -> GenerateAndSaveResponse:
    """
    🔧 [GERAÇÃO + SAVE] Gera e salva casos de teste diretamente no AtalJudge
    
    Args:
        request: Request com question_id, oracle_code, count, use_gemini
        req: Request object
        credentials: JWT token validado
    
    Returns:
        Resposta com IDs dos casos salvos
    """
    logger.info('='*80)
    logger.info('🔧 GERANDO E SALVANDO CASOS DE TESTE')
    logger.info('='*80)
    
    try:
        current_user = req.state.user
        token = req.state.token
        
        logger.info(f'Usuário: {current_user.get("sub")}')
        logger.info(f'Question ID: {request.question_id}')
        
        # Primeiro gera
        result = await test_case_service.generate_test_cases(
            question_id=request.question_id,
            oracle_code=request.oracle_code,
            token=token,
            count=request.count or 20,
            use_gemini=request.use_gemini if request.use_gemini is not None else True,
            strategies=request.strategies,
            use_supervision=request.use_supervision if request.use_supervision is not None else False
        )
        
        # Depois salva no AtalJudge
        from app.services.ataljudge_client import AtalJudgeClient
        client = AtalJudgeClient(base_url="http://localhost:3333/api", token=token)
        
        test_case_ids = []
        for tc in result['test_cases']:
            tc_id = await client.save_test_case(
                question_id=request.question_id,
                input_data=tc['input'],
                output_data=tc['output']
            )
            test_case_ids.append(tc_id)
        
        logger.info(f'✅ Salvos {len(test_case_ids)} casos no AtalJudge')
        
        return GenerateAndSaveResponse(
            saved=True,
            test_case_ids=test_case_ids,
            total_generated=len(test_case_ids),
            message=f"{len(test_case_ids)} casos de teste gerados e salvos com sucesso"
        )
        
    except Exception as e:
        logger.error(f'Erro ao gerar e salvar: {e}')
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check do módulo de geração"""
    return {
        "status": "healthy",
        "module": "generator",
        "version": "2.0.0"
    }
