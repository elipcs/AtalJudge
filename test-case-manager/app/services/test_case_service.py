"""Serviço principal para geração de casos de teste"""
from typing import List, Dict, Any, Optional
import traceback
from app.services.ataljudge_client import AtalJudgeClient
from app.services.generator_validator_supervision_service import GeneratorValidatorSupervisionService
from app.services.code_executor import CodeExecutor
from app.services.gemini_service import GeminiService
from app.utils.logger import logger
from app.models.response import TestCase


class TestCaseService:
    """Serviço principal para geração de casos de teste"""
    
    def __init__(
        self,
        ataljudge_client: Optional[AtalJudgeClient] = None,
        code_executor: Optional[CodeExecutor] = None,
        gemini_service: Optional[GeminiService] = None,
        supervision_service: Optional[GeneratorValidatorSupervisionService] = None
    ):
        self.ataljudge_client = ataljudge_client or AtalJudgeClient()
        self.code_executor = code_executor or CodeExecutor()
        self.gemini_service = gemini_service or GeminiService()
        # Inicialização lazy - só criar quando realmente for usado (use_supervision=True)
        self._supervision_service = supervision_service
    
    @property
    def supervision_service(self) -> GeneratorValidatorSupervisionService:
        """Propriedade lazy para supervision_service - só cria quando necessário"""
        if self._supervision_service is None:
            self._supervision_service = GeneratorValidatorSupervisionService()
        return self._supervision_service
    
    async def generate_test_cases(
        self,
        question_id: str,
        oracle_code: str,
        token: Optional[str] = None,
        count: int = 20
    ) -> Dict[str, Any]:
        """
        Gera casos de teste para uma questão
        
        Args:
            question_id: ID da questão no AtalJudge
            oracle_code: Código base correto em Python
            token: JWT token para autenticação (opcional)
            count: Número de casos a gerar
        
        Returns:
            Dicionário com casos de teste gerados e informações adicionais
        """
        logger.info(f'Iniciando geração de casos de teste para questão: {question_id}')
        
        try:
            # 1. Buscar questão no AtalJudge
            logger.info('Buscando questão no AtalJudge...')
            question = await self.ataljudge_client.get_question(question_id, token)
            
            # 1.1. Se código oráculo não foi fornecido, tentar usar o salvo na questão
            if not oracle_code:
                saved_oracle_code = question.get('oracleCode') or question.get('oracle_code')
                if saved_oracle_code:
                    oracle_code = saved_oracle_code
                    logger.info('Usando código oráculo salvo na questão')
                else:
                    raise ValueError('Código oráculo é obrigatório. Forneça um código oráculo ou use uma questão que já tenha um código oráculo salvo.')
            
            # 1.2. Salvar código oráculo na questão se fornecido
            if oracle_code:
                logger.info('Salvando código oráculo na questão...')
                try:
                    await self.ataljudge_client.update_question_oracle(
                        question_id, oracle_code, 'python', token
                    )
                    logger.info('Código oráculo salvo com sucesso')
                except Exception as e:
                    logger.warning(f'Erro ao salvar código oráculo (continuando mesmo assim): {e}')
            
            # O campo correto é 'text', não 'statement'
            statement = question.get('text', '') or question.get('statement', '')
            examples = question.get('examples', [])
            constraints = question.get('constraints', '')
            
            # Log do statement para debug
            logger.debug(f'Statement da questão (primeiros 300 chars): {statement[:300] if statement else "VAZIO"}...')
            
            # 2. Usar sistema Generator-Validator (novo padrão do artigo)
            logger.info('Usando sistema Generator-Validator com supervisão...')
            
            # Preparar exemplos no formato esperado
            examples_list = []
            for ex in examples:
                examples_list.append({
                    "input": ex.get('input', ''),
                    "output": ex.get('output', '')
                })
            
            # Gerar casos de teste usando sistema Generator-Validator
            result = await self.supervision_service.generate_test_cases(
                problem_statement=statement,
                oracle_code=oracle_code,
                examples=examples_list if examples_list else None,
                constraints=constraints if constraints else None,
                target_count=count,
                use_supervision=True
            )
            
            # Converter para formato esperado
            test_cases = [
                TestCase(input=tc["input"], output=tc["output"])
                for tc in result["test_cases"]
            ]
            
            return {
                'test_cases': [tc.model_dump() for tc in test_cases],
                'total_generated': result['total_generated'],
                'algorithm_type': 'default',  # Generator-Validator não usa algorithm_type
                'format_schema': None,
                'method': result.get('method', 'generator_validator'),
                'generator_code': result.get('generator_code'),
                'validator_code': result.get('validator_code'),
                'iterations': result.get('iterations', 1)
            }
            
            # Sistema antigo removido - agora usa apenas Generator-Validator
            
        except Exception as e:
            error_traceback = traceback.format_exc()
            logger.error(f'Erro ao gerar casos de teste: {e}')
            logger.error(f'Traceback completo:\n{error_traceback}')
            raise
    
    async def generate_and_save_test_cases(
        self,
        question_id: str,
        oracle_code: str,
        token: Optional[str] = None,
        count: int = 20
    ) -> Dict[str, Any]:
        """
        Gera e salva casos de teste diretamente no AtalJudge
        
        Args:
            question_id: ID da questão
            oracle_code: Código oráculo
            token: JWT token
            count: Número de casos
        
        Returns:
            Dict com casos salvos
        """
        try:
            # 1. Salvar código oráculo na questão se fornecido
            if oracle_code:
                logger.info('Salvando código oráculo na questão...')
                try:
                    await self.ataljudge_client.update_question_oracle(
                        question_id, oracle_code, 'python', token
                    )
                    logger.info('Código oráculo salvo com sucesso')
                except Exception as e:
                    logger.warning(f'Erro ao salvar código oráculo (continuando mesmo assim): {e}')
            
            # 2. Gerar casos de teste usando novo sistema
            result = await self.generate_test_cases(
                question_id, oracle_code, token, count
            )
            
            test_cases = result['test_cases']
            
            if not test_cases:
                raise ValueError('Nenhum caso de teste foi gerado')
            
            # 3. Preparar casos para salvar no AtalJudge
            test_cases_to_save = []
            for i, tc in enumerate(test_cases):
                test_cases_to_save.append({
                    'input': tc['input'],
                    'expectedOutput': tc['output'],
                    'weight': 10  # Peso padrão
                })
            
            # 4. Salvar casos no AtalJudge
            logger.info(f'Salvando {len(test_cases_to_save)} casos de teste no AtalJudge...')
            saved_test_cases = await self.ataljudge_client.bulk_create_test_cases(
                question_id, test_cases_to_save, token
            )
            
            # 5. Extrair IDs dos casos salvos
            test_case_ids = [tc.get('id', '') for tc in saved_test_cases if tc.get('id')]
            
            logger.info(f'{len(test_case_ids)} casos de teste salvos no AtalJudge')
            
            return {
                'test_case_ids': test_case_ids,
                'total_saved': len(test_case_ids),
                'total_generated': result['total_generated']
            }
            
        except Exception as e:
            error_traceback = traceback.format_exc()
            logger.error(f'Erro ao gerar e salvar casos de teste: {e}')
            logger.error(f'Traceback completo:\n{error_traceback}')
            raise










