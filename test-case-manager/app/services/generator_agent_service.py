"""Generator Agent Service - Gera programa gerador C++ usando LLM"""
import re
from typing import Dict, Any, List, Optional, Set
from app.services.gemini_service import GeminiService
from app.services.oracle_analyzer_service import OracleAnalyzerService
from app.services.prompt_template_service import PromptTemplateService
from app.services.code_extraction_service import CodeExtractionService
from app.utils.logger import logger

# Regex compilado - para melhor performance
REGEX_CODE_STRICT = re.compile(r'<<CODE>>\s*(.*?)\s*<<ENDCODE>>', re.DOTALL)
REGEX_COMMANDS = re.compile(r'/\*\s*COMMANDS:(.*?)\*/', re.DOTALL)
REGEX_OPT_PARAMS = re.compile(r'opt\s*<[^>]+>\s*\(\s*"([^"]+)"')
REGEX_CODE_CPP = re.compile(r'```cpp')
REGEX_CODE_CXX = re.compile(r'```c\+\+')
REGEX_PARAM_PATTERN = re.compile(r'-([a-zA-Z_][a-zA-Z0-9_]*)')
REGEX_MARKDOWN_CODE = re.compile(r'```')


class GeneratorAgentService:
    """Agente LLM que gera programa gerador C++ baseado no problema"""
    
    def __init__(self, gemini_service: Optional[GeminiService] = None):
        self.gemini_service = gemini_service or GeminiService()
        self.oracle_analyzer = OracleAnalyzerService()
        self.prompt_service = PromptTemplateService()
    
    async def generate_generator_program(
        self,
        problem_statement: str,
        examples: Optional[List[Dict[str, str]]] = None,
        constraints: Optional[str] = None,
        oracle_code: Optional[str] = None,
        format_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Gera programa gerador C++ e comandos usando LLM (Prompt A + B)
        """
        logger.info('Generator Agent: Iniciando geração de programa gerador (Strict Mode)')
        
        # Prompt A
        prompt = self.prompt_service.build_generator_prompt(
            statement=problem_statement,
            examples=examples
        )
        
        try:
            response = await self.gemini_service.generate_content(
                prompt,
                temperature=0.2,
                max_tokens=8000
            )
            
            # Extração de código centralizada
            generator_code = CodeExtractionService.extract_cpp_code(response)
            
            # Verificar integridade (Prompt B logic)
            is_complete, check_msg = CodeExtractionService.validate_code_completeness(generator_code, "generator")
            if not is_complete:
                logger.warning(f"⚠️ Código incompleto. {check_msg}. Iniciando Fallback (Prompt B)...")
                generator_code = await self._fix_partial_code(generator_code)
            
            # Extrair comandos do código
            generator_commands = CodeExtractionService.extract_commands(generator_code)
            
            # Se não tiver comandos, gerar fallback
            if not generator_commands:
                logger.warning("⚠️ Comandos não encontrados no código. Gerando fallback...")
                opt_params = self._extract_opt_params(generator_code)
                generator_commands = self._generate_fallback_commands(opt_params)

            return {
                "generator_code": generator_code,
                "generator_commands": generator_commands,
                "explanation": "Generated with Strict Pipeline"
            }
            
        except Exception as e:
            logger.error(f'Generator Agent: Erro ao gerar programa: {e}')
            raise
    
    async def _fix_partial_code(self, partial_code: str) -> str:
        """Executa Prompt B para corrigir código parcial"""
        prompt = self.prompt_service.build_fallback_generator_prompt(partial_code)
        
        try:
            response = await self.gemini_service.generate_content(
                prompt,
                temperature=0.2,
                max_tokens=8000
            )
            code = self._extract_code_strict(response)
            if not code:
                # Fallback extraction
                code = self._extract_code_without_markdown(response)
            
            if not code or not self._is_code_complete(code):
                 raise ValueError("Falha no Fallback (Prompt B): código continua incompleto")
            
            return code
        except Exception as e:
            logger.error(f"Erro no Fallback (Prompt B): {e}")
            raise

    def _extract_code_strict(self, response: str) -> str:
        """Extrai código entre <<CODE>> e <<ENDCODE>>"""
        match = REGEX_CODE_STRICT.search(response)
        if match:
            return match.group(1).strip()
        return ""
    
    def _extract_opt_params(self, code: str) -> Set[str]:
        """Extrai parâmetros opt<>() do código"""
        opt_params = set()
        matches = REGEX_OPT_PARAMS.findall(code)
        for match in matches:
            opt_params.add(match)
        return opt_params
    
    def _validate_commands(self, code: str, commands: List[str]) -> List[str]:
        """Valida comandos verificando se parâmetros existem no código"""
        # Extrair todos os parâmetros opt<>() do código
        opt_params = self._extract_opt_params(code)
        
        logger.info(f"Parâmetros encontrados no código: {opt_params}")
        
        # Validar cada comando
        valid_commands = []
        for cmd in commands:
            # Extrair parâmetros do comando (formato: -param value)
            cmd_params = set()
            cmd_matches = REGEX_PARAM_PATTERN.findall(cmd)
            for match in cmd_matches:
                cmd_params.add(match)
            
            # Verificar se todos os parâmetros do comando existem no código
            unused_params = cmd_params - opt_params
            
            if unused_params:
                logger.warning(f"⚠️ Comando usa parâmetros não declarados no código: {unused_params}")
                logger.warning(f"   Comando ignorado: {cmd}")
                logger.warning(f"   Parâmetros disponíveis: {opt_params}")
                # Não adicionar este comando
            else:
                valid_commands.append(cmd)
        if len(valid_commands) < len(commands):
            logger.warning(f"⚠️ {len(commands) - len(valid_commands)} comandos removidos por usar parâmetros inválidos")
            logger.info(f"✅ {len(valid_commands)} comandos validados com sucesso")
        
        # FALLBACK: Se TODOS os comandos foram rejeitados, gerar comandos simples automaticamente
        if not valid_commands and opt_params:
            logger.warning("⚠️ NENHUM comando válido! Gerando comandos automaticamente com parâmetros detectados...")
            valid_commands = self._generate_fallback_commands(opt_params)
            if valid_commands:
                logger.info(f"✅ Gerados {len(valid_commands)} comandos de fallback automaticamente")
        
        return valid_commands
    
    def _generate_fallback_commands(self, opt_params: set) -> List[str]:
        """Gera comandos simples automaticamente baseado nos parâmetros disponíveis"""
        commands = []
        sorted_params = sorted(opt_params)  # Ordem determinística
        
        # Gerar ~20 comandos com variação nos parâmetros
        # Assumir que parâmetros numéricos têm ranges razoáveis
        for i in range(20):
            cmd_parts = ["./gen"]
            for param in sorted_params:
                # Para cada parâmetro, gerar um valor baseado no índice
                if param.lower() in ['t', 'testcases', 'tests']:
                    # Número de test cases: 1 a 5
                    value = max(1, min(5, (i % 5) + 1))
                elif 'min' in param.lower():
                    # Valores mínimos: pequenos
                    value = 1 if i < 10 else 10
                elif 'max' in param.lower():
                    # Valores máximos: variar entre pequeno, médio, grande
                    if i < 5:
                        value = 10
                    elif i < 10:
                        value = 100
                    elif i < 15:
                        value = 1000
                    else:
                        value = 10000
                elif 'sum' in param.lower():
                    # Somas: médias a grandes
                    value = 100 if i < 10 else 200000
                else:
                    # Default: variar entre 1 e 20
                    value = (i % 20) + 1
                
                cmd_parts.append(f"-{param} {value}")
            
            commands.append(" ".join(cmd_parts))
        
        logger.info(f"Comandos de fallback gerados usando parâmetros: {sorted_params}")
        return commands
    
    def _validate_and_fix_code(self, code: str) -> str:
        """Valida e corrige código C++ básico"""
        code = code.strip()
        
        # Detectar e renomear variáveis proibidas que conflitam com testlib.h
        code = self._fix_reserved_variables(code)
        
        # Verificar se tem includes básicos
        if "#include" not in code:
            # Adicionar includes se não tiver
            code = '#include "testlib.h"\n#include <bits/stdc++.h>\nusing namespace std;\n\n' + code
        
        # Verificar se tem main
        if "int main" not in code and "main(" not in code:
            logger.warning("Código gerado não tem função main, pode estar incompleto")
            logger.error("❌ Código sem main() - rejeitar")
            raise ValueError("Código gerado está incompleto - falta função main()")
        
        # Garantir chaves balanceadas
        code = self._balance_braces(code, context="Generator Agent")
        
        # Corrigir chamadas inválidas do testlib
        code = self._fix_testlib_api_calls(code)
        
        # Verificar se tem return 0 no final do main (se não tiver, adicionar)
        if "int main" in code or "main(" in code:
            # Verificar se termina com return ou chave de fechamento
            lines = code.split('\n')
            last_non_empty_lines = [line.strip() for line in lines if line.strip()]
            if last_non_empty_lines:
                last_line = last_non_empty_lines[-1]
                # Se não termina com return ou }, pode estar incompleto
                if not (last_line.endswith('return 0;') or last_line.endswith('return 0') or 
                        last_line == '}' or last_line.endswith(';')):
                    # Verificar se tem return no código
                    if 'return 0' not in code and 'return' not in code:
                        # Adicionar return 0 antes da última chave
                        if code.rstrip().endswith('}'):
                            code = code.rstrip()[:-1] + "\n    return 0;\n}"
                        else:
                            code += "\n    return 0;"
        
        return code

    def _fix_reserved_variables(self, code: str) -> str:
        """Detecta e renomeia variáveis que conflitam com testlib.h"""
        # Variáveis reservadas do testlib.h: tout, inf, ouf, ans
        reserved_vars = {
            'tout': 'time_out',
            'inf': 'input_val',
            'ouf': 'output_val',
            'ans': 'answer_val'
        }
        
        for reserved, replacement in reserved_vars.items():
            # Detectar declarações de variáveis (evitar renomear métodos do testlib)
            # Padrão: tipo variável ou vector<tipo> variável
            patterns = [
                # int tout, vector<int> tout, etc.
                (rf'\b(int|long|ll|double|float|vector<[^>]+>)\s+{reserved}\b', f'\\1 {replacement}'),
                # tout[ ou tout.
                (rf'\b{reserved}(\[|\.|\s*=)', f'{replacement}\\1'),
            ]
            
            for pattern, repl in patterns:
                if re.search(pattern, code):
                    logger.warning(f"⚠️ Renomeando variável proibida '{reserved}' para '{replacement}'")
                    code = re.sub(pattern, repl, code)
        
        return code

    def _balance_braces(self, code: str, context: str) -> str:
        """Balanceia chaves adicionais/removendo excedentes."""
        balanced_chars: List[str] = []
        open_count = 0
        removed = 0
        for ch in code:
            if ch == '{':
                open_count += 1
                balanced_chars.append(ch)
            elif ch == '}':
                if open_count == 0:
                    removed += 1
                    continue
                open_count -= 1
                balanced_chars.append(ch)
            else:
                balanced_chars.append(ch)
        if removed > 0:
            logger.warning(f"{context}: removidas {removed} chaves de fechamento extras para manter o código compilável")
        if open_count > 0:
            logger.warning(f"{context}: adicionando {open_count} chaves de fechamento ausentes")
            balanced_chars.append("\n" + "}" * open_count)
        return "".join(balanced_chars)
    
    def _fix_testlib_api_calls(self, code: str) -> str:
        """Corrige chamadas inválidas de API do testlib"""
        # rnd.shuffle() não existe no testlib - substituir por implementação manual
        if "rnd.shuffle(" in code:
            logger.warning("Detectado rnd.shuffle() que não existe no testlib - corrigindo automaticamente")
            
            # Substituir linha por linha para manter indentação correta
            lines = code.split('\n')
            new_lines = []
            
            for line in lines:
                if "rnd.shuffle(" in line:
                    # Tentar extrair container da linha
                    # Padrão: rnd.shuffle(container.begin(), container.end())
                    container_match = re.search(r'(\w+)\.begin\(\)', line)
                    if container_match:
                        container_name = container_match.group(1)
                        indent = len(line) - len(line.lstrip())
                        # Substituir por Fisher-Yates shuffle manual
                        new_lines.append(' ' * indent + f'// Shuffle {container_name} using Fisher-Yates (rnd.shuffle() does not exist in testlib)')
                        new_lines.append(' ' * indent + f'for (int i = {container_name}.size() - 1; i > 0; i--) {{')
                        new_lines.append(' ' * (indent + 4) + f'int j = rnd.next(0, i);')
                        new_lines.append(' ' * (indent + 4) + f'std::swap({container_name}[i], {container_name}[j]);')
                        new_lines.append(' ' * indent + '}')
                    else:
                        # Tentar padrão alternativo: rnd.shuffle(container)
                        simple_match = re.search(r'rnd\.shuffle\s*\(\s*(\w+)', line)
                        if simple_match:
                            container_name = simple_match.group(1)
                            indent = len(line) - len(line.lstrip())
                            new_lines.append(' ' * indent + f'// Shuffle {container_name} using Fisher-Yates (rnd.shuffle() does not exist in testlib)')
                            new_lines.append(' ' * indent + f'for (int i = {container_name}.size() - 1; i > 0; i--) {{')
                            new_lines.append(' ' * (indent + 4) + f'int j = rnd.next(0, i);')
                            new_lines.append(' ' * (indent + 4) + f'std::swap({container_name}[i], {container_name}[j]);')
                            new_lines.append(' ' * indent + '}')
                        else:
                            # Se não conseguir extrair, manter linha original mas logar aviso
                            logger.warning(f"Não foi possível extrair container de: {line}")
                            new_lines.append(line)
                else:
                    new_lines.append(line)
            
            code = '\n'.join(new_lines)
        
        return code
    
    def _generate_default_commands(self) -> List[str]:
        """Gera comandos padrão quando LLM não fornece"""
        logger.warning("⚠️ Usando comandos padrão - recomenda-se fornecer comandos específicos no prompt")
        return [
            "./gen -n 1",
            "./gen -n 2",
            "./gen -n 5",
            "./gen -n 10",
            "./gen -n 20",
            "./gen -n 30"
        ]
    
    async def revise_generator_program(
        self,
        problem_statement: str,
        current_generator_code: str,
        validation_errors: List[str],
        compilation_errors: Optional[str] = None,
        validator_feedback: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Revisa programa gerador (Prompt C)
        """
        logger.info('Generator Agent: Revisando programa gerador (Strict Mode)')
        
        # Combinar erros
        error_log = ""
        if compilation_errors:
            error_log += f"COMPILATION ERRORS:\n{compilation_errors}\n"
        if validation_errors:
            error_log += f"VALIDATION ERRORS:\n" + "\n".join(validation_errors)
        
        prompt = self.prompt_service.build_generator_review_prompt(
            current_code=current_generator_code,
            error_log=error_log
        )
        
        try:
            response = await self.gemini_service.generate_content(
                prompt,
                temperature=0.2,
                max_tokens=8000
            )
            
            generator_code = self._extract_code_strict(response)
            if not generator_code:
                generator_code = self._extract_code_without_markdown(response)
            
            if not generator_code:
                raise ValueError("Não foi possível extrair código revisado")
                
            # Extrair comandos (podem ter mudado)
            generator_commands = self._extract_commands_from_code(generator_code)
            if not generator_commands:
                opt_params = self._extract_opt_params(generator_code)
                generator_commands = self._generate_fallback_commands(opt_params)
            
            return {
                "generator_code": generator_code,
                "generator_commands": generator_commands,
                "explanation": "Revised with Strict Pipeline"
            }
            
        except Exception as e:
            logger.error(f'Generator Agent: Erro ao revisar programa: {e}')
            raise

