"""Cliente HTTP para comunicação com API do AtalJudge"""
import httpx
from typing import Optional, Dict, Any, List
from app.config import config
from app.utils.logger import logger


class AtalJudgeClient:
    """Cliente para fazer requisições à API do AtalJudge"""
    
    def __init__(self, base_url: str = None, default_token: str = None):
        self.base_url = base_url or config.ATALJUDGE_API_URL
        self.default_token = default_token  # Token não é mais padrão, deve ser passado nas chamadas
        self.timeout = 30.0
    
    def _get_headers(self, token: Optional[str] = None) -> Dict[str, str]:
        """Gera headers HTTP com autenticação"""
        headers = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Internal-Service': config.SECRET_KEY  # Header para autenticação de serviço interno
        }
        
        # Usar token fornecido ou token padrão
        auth_token = token or self.default_token
        if auth_token:
            headers['Authorization'] = f'Bearer {auth_token}'
        
        return headers
    
    async def get_question(self, question_id: str, token: Optional[str] = None) -> Dict[str, Any]:
        """
        Busca uma questão pelo ID
        
        Args:
            question_id: ID da questão
            token: JWT token para autenticação (opcional)
        
        Returns:
            Dados da questão
        
        Raises:
            httpx.HTTPError: Se a requisição falhar
        """
        url = f'{self.base_url}/questions/{question_id}'
        headers = self._get_headers(token)
        
        logger.info(f'Buscando questão no AtalJudge: {question_id}')
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                data = response.json()  # json() é síncrono
                
                # A resposta pode estar em diferentes formatos
                if 'question' in data:
                    question = data['question']
                elif 'data' in data:
                    question = data['data']
                else:
                    question = data
                
                logger.info(f'Questão encontrada: {question.get("title", "N/A")}')
                return question
                
        except httpx.HTTPStatusError as e:
            logger.error(f'Erro ao buscar questão: {e.response.status_code} - {e.response.text}')
            raise
        except Exception as e:
            logger.error(f'Erro inesperado ao buscar questão: {e}')
            raise
    
    async def create_test_case(
        self,
        question_id: str,
        input_data: str,
        expected_output: str,
        is_sample: bool = False,
        weight: int = 0,
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Cria um caso de teste no AtalJudge
        
        Args:
            question_id: ID da questão
            input_data: Entrada do caso de teste
            expected_output: Saída esperada
            is_sample: Se é um caso de exemplo
            weight: Peso do caso de teste
            token: JWT token para autenticação
        
        Returns:
            Dados do caso de teste criado
        
        Raises:
            httpx.HTTPError: Se a requisição falhar
        """
        url = f'{self.base_url}/questions/{question_id}/testcases'
        headers = self._get_headers(token)
        payload = {
            'input': input_data,
            'expectedOutput': expected_output,
            'weight': weight
        }
        
        logger.info(f'Criando caso de teste para questão: {question_id}')
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
                # A resposta pode estar em diferentes formatos
                if 'testCase' in data:
                    test_case = data['testCase']
                elif 'data' in data:
                    test_case = data['data']
                else:
                    test_case = data
                
                logger.info(f'Caso de teste criado: {test_case.get("id", "N/A")}')
                return test_case
                
        except httpx.HTTPStatusError as e:
            logger.error(f'Erro ao criar caso de teste: {e.response.status_code} - {e.response.text}')
            raise
        except Exception as e:
            logger.error(f'Erro inesperado ao criar caso de teste: {e}')
            raise
    
    async def bulk_create_test_cases(
        self,
        question_id: str,
        test_cases: List[Dict[str, Any]],
        token: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Cria múltiplos casos de teste em lote
        
        Args:
            question_id: ID da questão
            test_cases: Lista de casos de teste com formato:
                [{'input': str, 'expectedOutput': str, 'weight': int}, ...]
            token: JWT token para autenticação
        
        Returns:
            Lista de casos de teste criados
        
        Raises:
            httpx.HTTPError: Se a requisição falhar
        """
        url = f'{self.base_url}/questions/{question_id}/testcases/bulk'
        headers = self._get_headers(token)
        payload = {
            'testCases': test_cases
        }
        
        logger.info(f'Criando {len(test_cases)} casos de teste em lote para questão: {question_id}')
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.put(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
                # A resposta pode estar em diferentes formatos
                if 'testCases' in data:
                    test_cases = data['testCases']
                elif 'data' in data:
                    test_cases = data['data']
                else:
                    test_cases = data if isinstance(data, list) else []
                
                logger.info(f'{len(test_cases)} casos de teste criados com sucesso')
                return test_cases
                
        except httpx.HTTPStatusError as e:
            logger.error(f'Erro ao criar casos de teste em lote: {e.response.status_code} - {e.response.text}')
            raise
        except Exception as e:
            logger.error(f'Erro inesperado ao criar casos de teste em lote: {e}')
            raise
    
    async def update_question_oracle(
        self,
        question_id: str,
        oracle_code: str,
        oracle_language: str = 'python',
        token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Atualiza o código oráculo de uma questão no AtalJudge
        
        Args:
            question_id: ID da questão
            oracle_code: Código oráculo
            oracle_language: Linguagem do código oráculo (padrão: 'python')
            token: JWT token para autenticação
        
        Returns:
            Dados da questão atualizada
        
        Raises:
            httpx.HTTPError: Se a requisição falhar
        """
        url = f'{self.base_url}/questions/{question_id}'
        headers = self._get_headers(token)
        payload = {
            'oracleCode': oracle_code,
            'oracleLanguage': oracle_language
        }
        
        logger.info(f'Atualizando código oráculo da questão: {question_id}')
        
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.put(url, headers=headers, json=payload)
                response.raise_for_status()
                data = response.json()
                
                # A resposta pode estar em diferentes formatos
                if 'question' in data:
                    question = data['question']
                elif 'data' in data:
                    question = data['data']
                else:
                    question = data
                
                logger.info(f'Código oráculo atualizado para questão: {question_id}')
                return question
                
        except httpx.HTTPStatusError as e:
            logger.error(f'Erro ao atualizar código oráculo: {e.response.status_code} - {e.response.text}')
            raise
        except Exception as e:
            logger.error(f'Erro inesperado ao atualizar código oráculo: {e}')
            raise


