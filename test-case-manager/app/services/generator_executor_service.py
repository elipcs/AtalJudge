"""Serviço para executar gerador C++ e gerar casos de teste"""
import subprocess
import hashlib
import os
from typing import Dict, Any, List, Optional
from app.utils.logger import logger


class GeneratorExecutorService:
    """Executa programa gerador C++ com comandos variados"""
    
    def __init__(self, executable_path: str):
        self.executable_path = executable_path
    
    def generate_test_case(
        self,
        command: str,
        timeout_seconds: int = 10
    ) -> Dict[str, Any]:
        """
        Executa comando do gerador e retorna caso de teste
        
        Args:
            command: Comando completo (ex: "./gen -n 10 -type random")
            timeout_seconds: Timeout em segundos
        
        Returns:
            Dict com 'success', 'input_data', 'error', 'execution_time_ms'
        """
        import time
        start_time = time.time()
        
        try:
            # Parsear comando (remover ./gen e usar executável)
            cmd_parts = command.split()
            if cmd_parts[0] == "./gen" or cmd_parts[0] == "gen":
                args = cmd_parts[1:]
            else:
                args = cmd_parts
            
            # Executar gerador
            result = subprocess.run(
                [self.executable_path] + args,
                capture_output=True,
                text=True,
                timeout=timeout_seconds,
                cwd=os.path.dirname(self.executable_path) or "."
            )
            
            execution_time = (time.time() - start_time) * 1000
            
            if result.returncode == 0:
                # IMPORTANTE: O gerador output DEVE TER newline no final para ser compatível com testlib
                # Mas remover espaço em branco EXCESSIVO (múltiplas newlines no final, etc)
                input_data = result.stdout
                
                # Validar que está vazio ou tem conteúdo real
                if not input_data or not input_data.strip():
                    return {
                        "success": False,
                        "input_data": None,
                        "error": "Gerador não produziu saída",
                        "execution_time_ms": execution_time
                    }
                
                # Garantir que tem EXATAMENTE UMA newline no final (se houver conteúdo)
                input_data = input_data.rstrip('\n') + '\n'
                
                # DEBUG: Log do que foi gerado
                lines_preview = input_data.replace('\n', '\\n')[:100]
                logger.debug(f'Gerador output (repr): {repr(input_data[:100])}')
                
                logger.debug(f'Caso gerado com sucesso em {execution_time:.2f}ms')
                return {
                    "success": True,
                    "input_data": input_data,
                    "error": None,
                    "execution_time_ms": execution_time
                }
            else:
                error_msg = result.stderr or result.stdout or "Erro desconhecido"
                logger.warning(f'Gerador retornou erro: {error_msg}')
                return {
                    "success": False,
                    "input_data": None,
                    "error": error_msg,
                    "execution_time_ms": execution_time
                }
                
        except subprocess.TimeoutExpired:
            execution_time = (time.time() - start_time) * 1000
            error_msg = f"Timeout após {timeout_seconds}s"
            logger.warning(error_msg)
            return {
                "success": False,
                "input_data": None,
                "error": error_msg,
                "execution_time_ms": execution_time
            }
        except Exception as e:
            execution_time = (time.time() - start_time) * 1000
            error_msg = str(e)
            logger.error(f'Exceção ao executar gerador: {error_msg}')
            return {
                "success": False,
                "input_data": None,
                "error": error_msg,
                "execution_time_ms": execution_time
            }
    
    def generate_test_cases_batch(
        self,
        commands: List[str],
        max_cases: Optional[int] = None,
        timeout_seconds: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Executa múltiplos comandos e retorna casos de teste
        
        Args:
            commands: Lista de comandos
            max_cases: Número máximo de casos a gerar
            timeout_seconds: Timeout por comando
        
        Returns:
            Lista de resultados (sucesso ou erro)
        """
        results = []
        target_count = max_cases or len(commands)
        
        logger.info(f'Executando {len(commands)} comandos do gerador (máximo {target_count} casos)')
        
        for i, command in enumerate(commands):
            if len(results) >= target_count:
                break
            
            logger.debug(f'Executando comando {i+1}/{len(commands)}: {command}')
            result = self.generate_test_case(command, timeout_seconds)
            results.append({
                **result,
                "command": command,
                "index": i
            })
        
        success_count = sum(1 for r in results if r["success"])
        logger.info(f'Gerados {success_count}/{len(results)} casos com sucesso')
        
        return results
    
    @staticmethod
    def calculate_seed(command: str) -> int:
        """
        Calcula seed baseado no hash do comando (como no artigo)
        
        Args:
            command: Comando do gerador
        
        Returns:
            Seed numérico
        """
        # Hash do comando e converter para int
        hash_obj = hashlib.md5(command.encode())
        hash_hex = hash_obj.hexdigest()
        # Pegar primeiros 8 caracteres e converter para int
        seed = int(hash_hex[:8], 16)
        return seed



