"""Serviço para compilar programas C++ com testlib"""
import subprocess
import tempfile
import os
import hashlib
from typing import Dict, Any, Optional
from pathlib import Path
from app.utils.logger import logger


class CppCompilerService:
    """Compila programas C++ usando testlib"""
    
    def __init__(self, testlib_path: Optional[str] = None):
        # Caminho para testlib.h (assumindo que está no projeto ou sistema)
        self.testlib_path = testlib_path or self._find_testlib()
        self.temp_dir = tempfile.mkdtemp(prefix="test_case_gen_")
        # Detectar compilador C++
        self.compiler = self._find_compiler()
    
    def _find_testlib(self) -> Optional[str]:
        """Tenta encontrar testlib.h no sistema"""
        # Possíveis locais
        possible_paths = [
            "/usr/include/testlib.h",
            "/usr/local/include/testlib.h",
        ]
        
        # Caminhos relativos ao arquivo atual (usando pathlib para ser mais robusto)
        current_file = Path(__file__).resolve()
        # test-case-generator/app/services/cpp_compiler_service.py
        # -> test-case-generator/testlib/testlib.h
        base_dir = current_file.parent.parent.parent  # Volta até test-case-generator
        possible_paths.append(str(base_dir / "testlib" / "testlib.h"))
        
        # Também tentar caminho relativo simples (compatibilidade)
        possible_paths.append(os.path.join(os.path.dirname(__file__), "../../testlib/testlib.h"))
        possible_paths.append(os.path.join(os.path.dirname(__file__), "../testlib/testlib.h"))
        
        for path in possible_paths:
            if os.path.exists(path):
                abs_path = os.path.abspath(path)
                logger.info(f"✅ testlib.h encontrado em: {abs_path}")
                return abs_path
        
        # Log em nível DEBUG pois é apenas informativo - o sistema funciona sem testlib.h
        # (só é necessário quando use_supervision=True e gera programas C++)
        logger.debug("testlib.h não encontrado. Será necessário baixar ou fornecer se for usar geração C++ com supervisão.")
        return None
    
    def _find_compiler(self) -> Optional[str]:
        """Tenta encontrar compilador C++ disponível no sistema"""
        import platform
        import shutil
        
        # Lista de compiladores possíveis
        possible_compilers = ["g++", "gcc", "clang++", "clang"]
        
        # No Windows, adicionar extensão .exe
        if platform.system() == "Windows":
            possible_compilers = [c + ".exe" for c in possible_compilers]
            # Também tentar MinGW
            possible_compilers.extend([
                "C:\\MinGW\\bin\\g++.exe",
                "C:\\MinGW64\\bin\\g++.exe",
                "C:\\msys64\\mingw64\\bin\\g++.exe",
                "C:\\msys64\\ucrt64\\bin\\g++.exe",
            ])
        
        for compiler in possible_compilers:
            # Verificar se está no PATH
            compiler_path = shutil.which(compiler)
            if compiler_path:
                logger.info(f"✅ Compilador C++ encontrado: {compiler_path}")
                return compiler_path
        
        # Se não encontrou, tentar verificar se existe diretamente (para caminhos absolutos)
        for compiler in possible_compilers:
            if os.path.exists(compiler):
                logger.info(f"✅ Compilador C++ encontrado: {compiler}")
                return compiler
        
        logger.warning("❌ Compilador C++ não encontrado. Instale MinGW, GCC ou Clang para usar geração C++.")
        logger.warning("   No Windows, você pode instalar MinGW-w64 ou usar o Visual Studio Build Tools.")
        return None
    
    def compile_generator(
        self,
        generator_code: str,
        output_name: str = "gen"
    ) -> Dict[str, Any]:
        """
        Compila programa gerador C++
        
        Args:
            generator_code: Código C++ do gerador
            output_name: Nome do executável
        
        Returns:
            Dict com 'success', 'executable_path', 'error'
        """
        logger.info(f'Compilando gerador: {output_name}')
        
        try:
            # Verificar se compilador está disponível
            if not self.compiler:
                error_msg = "Compilador C++ não encontrado. Instale MinGW, GCC ou Clang."
                logger.error(error_msg)
                return {
                    "success": False,
                    "executable_path": None,
                    "error": error_msg
                }
            
            # Criar arquivo temporário para o código
            code_file = os.path.join(self.temp_dir, f"{output_name}.cpp")
            with open(code_file, 'w', encoding='utf-8') as f:
                f.write(generator_code)
            
            # Caminho do executável (adicionar .exe no Windows)
            import platform
            if platform.system() == "Windows":
                executable_path = os.path.join(self.temp_dir, f"{output_name}.exe")
            else:
                executable_path = os.path.join(self.temp_dir, output_name)
            
            # Comando de compilação
            compile_cmd = [
                self.compiler,
                "-std=gnu++17",
                "-O2",
            ]
            
            # No Windows, adicionar flag para console application (evita erro WinMain)
            import platform
            if platform.system() == "Windows":
                compile_cmd.append("-mconsole")
                # Tentar linkar estático para reduzir dependências de DLL
                compile_cmd.extend(["-static-libgcc", "-static-libstdc++"])
            
            # Adicionar include path se testlib encontrado (antes do arquivo de código)
            if self.testlib_path:
                include_dir = os.path.dirname(self.testlib_path)
                compile_cmd.append(f"-I{include_dir}")
                logger.debug(f'Adicionando include path: -I{include_dir}')
            
            compile_cmd.extend([
                "-o", executable_path,
                code_file
            ])
            
            # Compilar
            logger.debug(f'Comando de compilação: {" ".join(compile_cmd)}')
            result = subprocess.run(
                compile_cmd,
                capture_output=True,
                text=True,
                timeout=60  # Aumentado para 60 segundos
            )
            
            if result.returncode == 0:
                logger.info(f'Gerador compilado com sucesso: {executable_path}')
                
                # No Windows, tentar copiar DLLs necessárias para o diretório do executável
                if platform.system() == "Windows":
                    try:
                        compiler_dir = os.path.dirname(self.compiler)
                        if os.path.exists(compiler_dir):
                            dlls_to_copy = [
                                "libgcc_s_seh-1.dll",
                                "libstdc++-6.dll",
                                "libwinpthread-1.dll"
                            ]
                            copied = []
                            for dll in dlls_to_copy:
                                src = os.path.join(compiler_dir, dll)
                                if os.path.exists(src):
                                    dst = os.path.join(self.temp_dir, dll)
                                    import shutil
                                    shutil.copy2(src, dst)
                                    copied.append(dll)
                            if copied:
                                logger.debug(f"Copiadas DLLs para diretório do executável: {', '.join(copied)}")
                    except Exception as e:
                        logger.debug(f"Erro ao copiar DLLs (não crítico): {e}")
                
                return {
                    "success": True,
                    "executable_path": executable_path,
                    "error": None
                }
            else:
                error_msg = result.stderr or result.stdout
                logger.error(f'Erro ao compilar gerador: {error_msg}')
                return {
                    "success": False,
                    "executable_path": None,
                    "error": error_msg
                }
                
        except subprocess.TimeoutExpired:
            error_msg = "Timeout ao compilar"
            logger.error(error_msg)
            return {
                "success": False,
                "executable_path": None,
                "error": error_msg
            }
        except FileNotFoundError as e:
            error_msg = f"Compilador C++ não encontrado: {self.compiler}. Instale MinGW, GCC ou Clang e adicione ao PATH."
            logger.error(error_msg)
            logger.error(f"Detalhes: {str(e)}")
            return {
                "success": False,
                "executable_path": None,
                "error": error_msg
            }
        except Exception as e:
            error_msg = str(e)
            logger.error(f'Exceção ao compilar gerador: {error_msg}')
            logger.debug(f'Comando tentado: {" ".join(compile_cmd) if "compile_cmd" in locals() else "N/A"}')
            return {
                "success": False,
                "executable_path": None,
                "error": error_msg
            }
    
    def compile_validator(
        self,
        validator_code: str,
        output_name: str = "validator"
    ) -> Dict[str, Any]:
        """
        Compila programa validador C++
        
        Args:
            validator_code: Código C++ do validador
            output_name: Nome do executável
        
        Returns:
            Dict com 'success', 'executable_path', 'error'
        """
        logger.info(f'Compilando validador: {output_name}')
        
        try:
            # Criar arquivo temporário para o código
            code_file = os.path.join(self.temp_dir, f"{output_name}.cpp")
            with open(code_file, 'w', encoding='utf-8') as f:
                f.write(validator_code)
            
            # Verificar se compilador está disponível
            if not self.compiler:
                error_msg = "Compilador C++ não encontrado. Instale MinGW, GCC ou Clang."
                logger.error(error_msg)
                return {
                    "success": False,
                    "executable_path": None,
                    "error": error_msg
                }
            
            # Caminho do executável (adicionar .exe no Windows)
            import platform
            if platform.system() == "Windows":
                executable_path = os.path.join(self.temp_dir, f"{output_name}.exe")
            else:
                executable_path = os.path.join(self.temp_dir, output_name)
            
            # Comando de compilação
            compile_cmd = [
                self.compiler,
                "-std=gnu++17",
                "-O2",
            ]
            
            # No Windows, adicionar flag para console application (evita erro WinMain)
            if platform.system() == "Windows":
                compile_cmd.append("-mconsole")
                # Tentar linkar estático para reduzir dependências de DLL
                # Isso pode ajudar a evitar problemas com DLLs não encontradas
                compile_cmd.extend(["-static-libgcc", "-static-libstdc++"])
            
            # Adicionar include path se testlib encontrado (antes do arquivo de código)
            if self.testlib_path:
                include_dir = os.path.dirname(self.testlib_path)
                compile_cmd.append(f"-I{include_dir}")
                logger.debug(f'Adicionando include path: -I{include_dir}')
            
            compile_cmd.extend([
                "-o", executable_path,
                code_file
            ])
            
            # Compilar
            result = subprocess.run(
                compile_cmd,
                capture_output=True,
                text=True,
                timeout=60  # Aumentado para 60 segundos
            )
            
            if result.returncode == 0:
                logger.info(f'Validador compilado com sucesso: {executable_path}')
                
                # No Windows, tentar copiar DLLs necessárias para o diretório do executável
                # como fallback se a linkagem estática não funcionar
                if platform.system() == "Windows":
                    try:
                        # Extrair diretório bin do compilador
                        compiler_dir = os.path.dirname(self.compiler)
                        if os.path.exists(compiler_dir):
                            # DLLs comuns que podem ser necessárias
                            dlls_to_copy = [
                                "libgcc_s_seh-1.dll",
                                "libstdc++-6.dll",
                                "libwinpthread-1.dll"
                            ]
                            copied = []
                            for dll in dlls_to_copy:
                                src = os.path.join(compiler_dir, dll)
                                if os.path.exists(src):
                                    dst = os.path.join(self.temp_dir, dll)
                                    import shutil
                                    shutil.copy2(src, dst)
                                    copied.append(dll)
                            if copied:
                                logger.debug(f"Copiadas DLLs para diretório do executável: {', '.join(copied)}")
                    except Exception as e:
                        logger.debug(f"Erro ao copiar DLLs (não crítico): {e}")
                
                return {
                    "success": True,
                    "executable_path": executable_path,
                    "error": None
                }
            else:
                error_msg = result.stderr or result.stdout
                logger.error(f'Erro ao compilar validador: {error_msg}')
                return {
                    "success": False,
                    "executable_path": None,
                    "error": error_msg
                }
                
        except subprocess.TimeoutExpired:
            error_msg = "Timeout ao compilar"
            logger.error(error_msg)
            return {
                "success": False,
                "executable_path": None,
                "error": error_msg
            }
        except FileNotFoundError as e:
            error_msg = f"Compilador C++ não encontrado: {self.compiler}. Instale MinGW, GCC ou Clang e adicione ao PATH."
            logger.error(error_msg)
            logger.error(f"Detalhes: {str(e)}")
            return {
                "success": False,
                "executable_path": None,
                "error": error_msg
            }
        except Exception as e:
            error_msg = str(e)
            logger.error(f'Exceção ao compilar validador: {error_msg}')
            logger.debug(f'Comando tentado: {" ".join(compile_cmd) if "compile_cmd" in locals() else "N/A"}')
            return {
                "success": False,
                "executable_path": None,
                "error": error_msg
            }
    
    def cleanup(self):
        """Limpa arquivos temporários"""
        try:
            import shutil
            if os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
                logger.debug(f'Diretório temporário removido: {self.temp_dir}')
        except Exception as e:
            logger.warning(f'Erro ao limpar arquivos temporários: {e}')

