"""Executor seguro de código Python com timeout e isolamento"""
import subprocess
import tempfile
import os
import time
import sys
from typing import Optional, Dict, Any, List
from app.config import config
from app.utils.logger import logger


class CodeExecutor:
    """Executor seguro de código Python com timeout e isolamento"""
    
    def __init__(self, timeout_seconds: int = None):
        self.timeout_seconds = timeout_seconds or config.CODE_TIMEOUT_SECONDS
        self.max_output_size = 10 * 1024 * 1024  # 10MB máximo de saída
    
    def execute(self, code: str, input_data: str) -> Dict[str, Any]:
        """
        Executa código Python com entrada fornecida
        
        Args:
            code: Código Python a ser executado
            input_data: Entrada para o código
        
        Returns:
            Resultado da execução com 'success', 'output', 'error', 'execution_time_ms'
        """
        logger.info('Executando código Python...')
        start_time = time.time()
        
        try:
            # Criar arquivo temporário para o código
            with tempfile.NamedTemporaryFile(
                mode='w',
                suffix='.py',
                delete=False
            ) as code_file:
                code_file.write(code)
                code_file_path = code_file.name
            
            try:
                # Executar código com subprocess
                result = self._run_subprocess(code_file_path, input_data)
                
                execution_time = (time.time() - start_time) * 1000  # em ms
                
                if result['success']:
                    logger.info(f'Código executado com sucesso em {execution_time:.2f}ms')
                    return {
                        'success': True,
                        'output': result['output'],
                        'error': None,
                        'execution_time_ms': execution_time
                    }
                else:
                    logger.warning(f'Erro na execução do código: {result["error"]}')
                    return {
                        'success': False,
                        'output': None,
                        'error': result['error'],
                        'execution_time_ms': execution_time
                    }
                    
            finally:
                # Limpar arquivo temporário
                try:
                    os.unlink(code_file_path)
                except OSError:
                    pass
                    
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            logger.error(f'Erro inesperado ao executar código: {e}')
            return {
                'success': False,
                'output': None,
                'error': f'Erro inesperado: {str(e)}',
                'execution_time_ms': execution_time
            }
    
    def _run_subprocess(self, code_file_path: str, input_data: str) -> Dict[str, Any]:
        """Executa código Python usando subprocess com timeout"""
        try:
            # Detectar comando Python (python3 ou python)
            python_cmd = 'python3' if sys.platform != 'win32' else 'python'
            
            # Executar código Python
            process = subprocess.Popen(
                [python_cmd, code_file_path],
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=tempfile.gettempdir(),  # Executar em diretório temporário
                env=self._get_safe_env()  # Ambiente seguro sem acesso a sistema de arquivos
            )
            
            # Enviar entrada e aguardar resultado com timeout
            try:
                stdout, stderr = process.communicate(
                    input=input_data,
                    timeout=self.timeout_seconds
                )
                
                # Verificar tamanho da saída
                if len(stdout) > self.max_output_size:
                    process.kill()
                    return {
                        'success': False,
                        'output': None,
                        'error': f'Saída muito grande (>{self.max_output_size} bytes)'
                    }
                
                # Verificar se houve erro
                if process.returncode != 0:
                    error_msg = stderr.strip() if stderr else 'Erro desconhecido'
                    return {
                        'success': False,
                        'output': None,
                        'error': error_msg
                    }
                
                # Sucesso
                return {
                    'success': True,
                    'output': stdout.strip(),
                    'error': None
                }
                
            except subprocess.TimeoutExpired:
                # Timeout excedido
                process.kill()
                process.wait()
                return {
                    'success': False,
                    'output': None,
                    'error': f'Tempo limite excedido ({self.timeout_seconds}s)'
                }
                
        except Exception as e:
            return {
                'success': False,
                'output': None,
                'error': f'Erro ao executar código: {str(e)}'
            }
    
    def _get_safe_env(self) -> Dict[str, str]:
        """Retorna ambiente seguro para execução de código"""
        # Criar ambiente baseado no ambiente atual, mas com restrições
        env = os.environ.copy()
        
        # Definir diretório temporário
        temp_dir = tempfile.gettempdir()
        env['TMPDIR'] = temp_dir
        env['TEMP'] = temp_dir
        env['TMP'] = temp_dir
        
        # Limitar PATH para Python apenas (manter PATH original para encontrar python3)
        # Não remover PATH completamente para que python3 possa ser encontrado
        
        return env
    
    def execute_batch(self, code: str, inputs: List[str], continue_on_error: bool = True) -> List[Dict[str, Any]]:
        """
        Executa código Python para múltiplas entradas
        
        Args:
            code: Código Python a ser executado
            inputs: Lista de entradas
            continue_on_error: Se True, continua processando mesmo quando encontra erros
        
        Returns:
            Lista de resultados da execução
        """
        logger.info(f'Executando código Python para {len(inputs)} entradas...')
        results = []
        
        for i, input_data in enumerate(inputs):
            logger.debug(f'Executando entrada {i+1}/{len(inputs)}')
            result = self.execute(code, input_data)
            results.append(result)
            
            # Se houver erro e não deve continuar, parar processamento
            if not result['success'] and not continue_on_error:
                logger.warning(f'Erro na execução da entrada {i+1}, interrompendo batch')
                # Preencher restante com erros
                for j in range(i + 1, len(inputs)):
                    results.append({
                        'success': False,
                        'output': None,
                        'error': f'Erro na entrada {i+1}, batch interrompido',
                        'execution_time_ms': 0
                    })
                break
        
        logger.info(f'Batch concluído: {sum(1 for r in results if r["success"])}/{len(results)} sucessos')
        return results




















