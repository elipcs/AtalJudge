"""Serviço consolidado para extração de código das respostas de LLM"""
import re
from typing import List, Tuple
from app.utils.logger import logger

# Regex compilado para melhor performance
REGEX_CODE_STRICT = re.compile(r'<<CODE>>\s*(.*?)\s*<<ENDCODE>>', re.DOTALL)
REGEX_CODE_CPP = re.compile(r'```cpp')
REGEX_CODE_CXX = re.compile(r'```c\+\+')
REGEX_MARKDOWN_CODE = re.compile(r'```')


class CodeExtractionService:
    """Serviço centralizado para extração de código C++ das respostas de LLM"""
    
    @staticmethod
    def extract_cpp_code(response: str) -> str:
        """
        Extrai código C++ da resposta do LLM com suporte a múltiplos formatos.
        
        Tenta extrair em ordem de prioridade:
        1. Formato strict: <<CODE>>...<<ENDCODE>>
        2. Markdown: ```cpp ou ```c++
        3. Fallback heurístico
        
        Args:
            response: Resposta do LLM
        
        Returns:
            Código C++ extraído
        
        Raises:
            ValueError: Se não conseguir extrair código válido
        """
        # Tentativa 1: Formato strict
        code = CodeExtractionService._extract_code_strict(response)
        if code:
            logger.debug(f"✓ Código extraído de formato strict ({len(code)} chars)")
            return code
        
        # Tentativa 2: Markdown ```cpp
        code = CodeExtractionService._extract_code_markdown(response, 'cpp')
        if code:
            logger.debug(f"✓ Código extraído de bloco ```cpp ({len(code)} chars)")
            return code
        
        # Tentativa 3: Markdown ```c++
        code = CodeExtractionService._extract_code_markdown(response, 'c++')
        if code:
            logger.debug(f"✓ Código extraído de bloco ```c++ ({len(code)} chars)")
            return code
        
        # Tentativa 4: Markdown genérico
        code = CodeExtractionService._extract_code_markdown(response)
        if code:
            logger.debug(f"✓ Código extraído de bloco ``` genérico ({len(code)} chars)")
            return code
        
        # Tentativa 5: Fallback heurístico
        code = CodeExtractionService._extract_code_heuristic(response)
        if code:
            logger.warning("⚠️ Nenhum bloco de código markdown encontrado, usando extração heurística")
            logger.debug(f"✓ Código extraído por fallback ({len(code)} chars)")
            return code
        
        # Falha total
        logger.error("❌ Falha na extração de código - resposta não contém código válido")
        logger.error(f"Resposta (primeiros 500 chars): {response[:500]}...")
        raise ValueError("Não foi possível extrair código da resposta do LLM")
    
    @staticmethod
    def _extract_code_strict(response: str) -> str:
        """Extrai código entre <<CODE>> e <<ENDCODE>>"""
        match = REGEX_CODE_STRICT.search(response)
        if match:
            return match.group(1).strip()
        return ""
    
    @staticmethod
    def _extract_code_markdown(response: str, language: str = '') -> str:
        """
        Extrai código de bloco markdown.
        
        Args:
            response: Resposta do LLM
            language: Linguagem (cpp, c++, ou vazio para qualquer)
        
        Returns:
            Código extraído ou string vazia
        """
        if language:
            marker = f"```{language}"
        else:
            marker = "```"
        
        if marker not in response:
            return ""
        
        parts = response.split(marker)
        if len(parts) < 2:
            return ""
        
        # Obter código entre o marcador de abertura e fechamento
        code_part = parts[1].split("```")[0].strip()
        
        # Remover primeira linha se for apenas o nome da linguagem
        lines = code_part.split('\n')
        if lines and (lines[0].strip() in ['cpp', 'c++', 'c', ''] or 
                      (language and lines[0].strip() == language)):
            code_part = '\n'.join(lines[1:]).strip()
        
        # Validação básica: deve ter pelo menos algumas linhas
        if len(code_part.split('\n')) < 3:
            logger.warning(f"Código extraído de markdown ({language or 'genérico'}) muito curto (< 3 linhas), descartando")
            return ""
        
        return code_part
    
    @staticmethod
    def _extract_code_heuristic(response: str) -> str:
        """
        Tenta extrair código C++ de forma heurística quando não há marcadores claros.
        
        Procura por includes, main(), e outras características de código C++.
        """
        lines = response.split('\n')
        code_lines = []
        in_code_block = False
        
        for line in lines:
            stripped_line = line.strip()
            
            # Início de um bloco de código heurístico
            if not in_code_block and (
                stripped_line.startswith("#include") or
                stripped_line.startswith("int main") or
                stripped_line.startswith("void main") or
                stripped_line.startswith("using namespace std;") or
                stripped_line.startswith("/*") or
                stripped_line.startswith("//")
            ):
                in_code_block = True
                code_lines.append(line)
            elif in_code_block:
                # Fim de um bloco de código heurístico
                if not stripped_line and code_lines and not code_lines[-1].strip():
                    # Duas linhas vazias consecutivas podem indicar o fim
                    if len(code_lines) >= 2 and not code_lines[-2].strip():
                        break
                
                # Se a linha parece ser um parágrafo de texto, parar
                if len(stripped_line.split()) > 5 and not (
                    stripped_line.endswith(';') or
                    stripped_line.endswith('{') or
                    stripped_line.endswith('}') or
                    stripped_line.startswith('#') or
                    stripped_line.startswith('//') or
                    stripped_line.startswith('/*') or
                    stripped_line.endswith('*/')
                ):
                    break
                
                code_lines.append(line)
        
        extracted_code = "\n".join(code_lines).strip()
        
        # Validação: deve ter pelo menos 5 linhas e conter 'main'
        if len(extracted_code.split('\n')) < 5 or ("int main" not in extracted_code and "main(" not in extracted_code):
            logger.warning("Extração heurística falhou - resultado muito curto ou sem main()")
            return ""
        
        return extracted_code
    
    @staticmethod
    def extract_commands(code: str) -> List[str]:
        """
        Extrai comandos do código gerador.
        
        Procura por:
        1. Bloco /* COMMANDS: ... */
        2. Linhas que começam com ./gen
        
        Args:
            code: Código C++ do gerador
        
        Returns:
            Lista de comandos
        """
        commands = []
        
        # Tentativa 1: Procurar por bloco /* COMMANDS: ... */
        regex_commands = re.compile(r'/\*\s*COMMANDS:(.*?)\*/', re.DOTALL)
        match = regex_commands.search(code)
        if match:
            lines = match.group(1).strip().split('\n')
            for line in lines:
                line = line.strip()
                if line.startswith("./gen"):
                    commands.append(line)
        
        # Tentativa 2: Se não encontrou, procurar por linhas que começam com ./gen
        if not commands:
            for line in code.split('\n'):
                line = line.strip()
                if line.startswith("./gen"):
                    commands.append(line)
        
        return commands
    
    @staticmethod
    def validate_code_completeness(code: str, code_type: str = "generator") -> Tuple[bool, str]:
        """
        Valida se o código está completo.
        
        Args:
            code: Código C++ para validar
            code_type: 'generator' ou 'validator'
        
        Returns:
            Tupla (is_complete, message)
        """
        # Verificações básicas
        checks = {
            "has_includes": "#include" in code,
            "has_main": "int main" in code or "main(" in code,
            "has_braces": "{" in code and "}" in code,
        }
        
        if code_type == "generator":
            checks["has_registerGen"] = "registerGen" in code
        elif code_type == "validator":
            checks["has_registerValidation"] = "registerValidation" in code
        
        is_complete = all(checks.values())
        
        missing = [k for k, v in checks.items() if not v]
        message = f"Verificações: {', '.join([f'{k}={v}' for k, v in checks.items()])}"
        
        if missing:
            message += f" | Faltando: {', '.join(missing)}"
        
        return is_complete, message
