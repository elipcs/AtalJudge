"""Serviço para executar validador C++ em casos de teste"""
import subprocess
import tempfile
import os
from typing import Dict, Any, List
from app.utils.logger import logger


class ValidatorExecutorService:
    """Executa programa validador C++ em casos de teste"""
    
    def __init__(self, executable_path: str):
        self.executable_path = executable_path
    
    def validate_test_case(
        self,
        input_data: str,
        timeout_seconds: int = 5
    ) -> Dict[str, Any]:
        """
        Valida um caso de teste usando o validador
        
        Args:
            input_data: Dados de entrada do caso de teste
            timeout_seconds: Timeout em segundos
        
        Returns:
            Dict com 'valid', 'error_message', 'error_line', 'execution_time_ms'
        """
        import time
        start_time = time.time()
        
        try:
            # O validador do testlib lê de stdin, não de arquivo
            # Passar input via stdin usando input= do subprocess
            logger.debug(f'Executando validador: {self.executable_path}')
            logger.debug(f'Input (primeiros 200 chars): {input_data[:200] if len(input_data) > 200 else input_data}')
            
            # Adicionar diretório do MinGW ao PATH para encontrar DLLs (Windows)
            import platform
            env = os.environ.copy()
            if platform.system() == "Windows":
                # Tentar detectar o diretório bin do MinGW a partir do executável
                # Se o executável está em um diretório temporário, tentar encontrar MinGW no PATH ou locais comuns
                mingw_bin = None
                
                # Verificar se há MinGW no PATH atual
                current_path = env.get("PATH", "")
                for path_dir in current_path.split(os.pathsep):
                    if "mingw" in path_dir.lower() and os.path.exists(os.path.join(path_dir, "libgcc_s_seh-1.dll")):
                        mingw_bin = path_dir
                        break
                
                # Se não encontrou, tentar locais comuns
                if not mingw_bin:
                    common_paths = [
                        "C:\\mingw64\\bin",
                        "C:\\MinGW64\\bin",
                        "C:\\MinGW\\bin",
                        "C:\\msys64\\mingw64\\bin",
                        "C:\\msys64\\ucrt64\\bin"
                    ]
                    for path in common_paths:
                        if os.path.exists(path) and os.path.exists(os.path.join(path, "libgcc_s_seh-1.dll")):
                            mingw_bin = path
                            break
                
                if mingw_bin and mingw_bin not in env.get("PATH", ""):
                    env["PATH"] = mingw_bin + os.pathsep + env.get("PATH", "")
                    logger.debug(f"✅ Adicionado {mingw_bin} ao PATH para execução do validador")
                elif not mingw_bin:
                    logger.warning("⚠️ Não foi possível encontrar diretório bin do MinGW - DLLs podem não ser encontradas")
                    logger.warning("   Tentando continuar sem adicionar ao PATH (pode causar crash se DLLs não estiverem no PATH do sistema)")
                else:
                    logger.debug(f"✅ MinGW já está no PATH: {mingw_bin}")
            else:
                env = None  # Usar env padrão no Linux
            
            # Log do PATH se estiver em modo debug
            if env and platform.system() == "Windows":
                mingw_in_path = any("mingw" in p.lower() for p in env.get("PATH", "").split(os.pathsep))
                logger.debug(f"PATH contém MinGW: {mingw_in_path}")
            
            result = subprocess.run(
                [self.executable_path],
                input=input_data,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                encoding='utf-8',
                errors='replace',  # Substituir caracteres inválidos em vez de falhar
                env=env
            )
                
            execution_time = (time.time() - start_time) * 1000
            
            # Log detalhado para debug
            logger.debug(f'Return code: {result.returncode} (0x{result.returncode:08x})')
            logger.debug(f'Stderr: {repr(result.stderr)}')
            logger.debug(f'Stdout: {repr(result.stdout)}')
            
            if result.returncode == 0:
                logger.debug(f'Caso validado com sucesso em {execution_time:.2f}ms')
                return {
                    "valid": True,
                    "error_message": None,
                    "error_line": None,
                    "execution_time_ms": execution_time
                }
            else:
                # Parsear mensagem de erro do validador
                error_output = result.stderr or result.stdout or ""
                # Se ambos estão vazios, usar o código de retorno como mensagem
                if not error_output.strip():
                    error_output = f"Validator returned exit code {result.returncode}"
                
                error_message, error_line = self._parse_validator_error(error_output)
                
                # Verificar se a mensagem contém "Input is valid" - pode ser um falso positivo
                if "Input is valid" in error_message and result.returncode != 0:
                    logger.warning(f'⚠️ Validador retornou código {result.returncode} mas mensagem indica sucesso. Pode ser problema com quitf() ou formato da mensagem.')
                    logger.warning(f'   Mensagem completa: {error_message}')
                    logger.warning(f'   Stderr: {result.stderr}')
                    logger.warning(f'   Stdout: {result.stdout}')
                
                # Se ainda está vazio, usar uma mensagem padrão
                if not error_message or not error_message.strip():
                    error_message = f"Validation failed (exit code {result.returncode})"
                
                logger.warning(f'Caso inválido: {error_message}')
                
                # Código 3221225785 (0xC0000005) é ACCESS_VIOLATION no Windows
                # Isso geralmente indica que o programa crashou tentando acessar memória inválida
                if result.returncode == 3221225785 or result.returncode == -1073741819:
                    logger.error('Validador crashou (segmentation fault). Possíveis causas:')
                    logger.error('  - Validador não está usando registerValidation() corretamente')
                    logger.error('  - Validador está tentando ler de arquivo em vez de stdin')
                    logger.error('  - Input pode estar em formato incorreto')
                return {
                    "valid": False,
                    "error_message": error_message,
                    "error_line": error_line,
                    "execution_time_ms": execution_time
                }
                    
        except subprocess.TimeoutExpired:
            execution_time = (time.time() - start_time) * 1000
            error_msg = f"Timeout após {timeout_seconds}s"
            logger.warning(error_msg)
            return {
                "valid": False,
                "error_message": error_msg,
                "error_line": None,
                "execution_time_ms": execution_time
            }
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            error_msg = str(e)
            logger.error(f'Exceção ao validar caso: {error_msg}')
            return {
                "valid": False,
                "error_message": error_msg,
                "error_line": None,
                "execution_time_ms": execution_time
            }
    
    def validate_test_cases_batch(
        self,
        test_cases: List[str],
        timeout_seconds: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Valida múltiplos casos de teste
        
        Args:
            test_cases: Lista de casos de teste (strings de input)
            timeout_seconds: Timeout por caso
        
        Returns:
            Lista de resultados de validação
        """
        results = []
        
        logger.info(f'Validando {len(test_cases)} casos de teste')
        
        for i, test_case in enumerate(test_cases):
            logger.debug(f'Validando caso {i+1}/{len(test_cases)}')
            result = self.validate_test_case(test_case, timeout_seconds)
            results.append({
                **result,
                "index": i,
                "input_preview": test_case[:100] if len(test_case) > 100 else test_case
            })
        
        valid_count = sum(1 for r in results if r["valid"])
        logger.info(f'Validação concluída: {valid_count}/{len(results)} casos válidos')
        
        # DEBUG: Log dos primeiros inválidos
        invalid_results = [r for r in results if not r["valid"]]
        if invalid_results:
            first_invalid = invalid_results[0]
            logger.debug(f"Primeiro caso inválido (índice {first_invalid['index']}): {first_invalid['error_message']}")
            logger.debug(f"Input (repr): {repr(first_invalid['input_preview'])}")
        
        return results
    
    def _parse_validator_error(self, error_output: str) -> tuple:
        """
        Parseia mensagem de erro do validador para extrair linha e mensagem
        
        Args:
            error_output: Saída de erro do validador
        
        Returns:
            Tupla (mensagem_erro, linha_erro)
        """
        error_message = error_output.strip()
        error_line = None
        
        # Tentar extrair linha de erro (formato comum: "Line X: ...")
        import re
        line_match = re.search(r'Line\s+(\d+)', error_output, re.IGNORECASE)
        if line_match:
            try:
                error_line = int(line_match.group(1))
            except ValueError:
                pass
        
        # Se não encontrou, tentar outros formatos
        if error_line is None:
            line_match = re.search(r'line\s+(\d+)', error_output, re.IGNORECASE)
            if line_match:
                try:
                    error_line = int(line_match.group(1))
                except ValueError:
                    pass
        
        return error_message, error_line

