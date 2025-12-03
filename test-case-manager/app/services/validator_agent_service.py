"""Validator Agent Service - Gera programa validador C++ usando LLM"""
import re
from typing import Dict, Any, List, Optional
from app.services.gemini_service import GeminiService
from app.services.oracle_analyzer_service import OracleAnalyzerService
from app.services.prompt_template_service import PromptTemplateService
from app.services.code_extraction_service import CodeExtractionService
from app.utils.logger import logger

# Regex compilado - para melhor performance
REGEX_CODE_CPP = re.compile(r'```cpp')
REGEX_CODE_CXX = re.compile(r'```c\+\+')
REGEX_MARKDOWN_CODE = re.compile(r'```')
REGEX_SUSPICIOUS_KEYWORDS = re.compile(r'\b(critical|important|note|fix|corrected|based on)\b', re.IGNORECASE)


class ValidatorAgentService:
    """Agente LLM que gera programa validador C++ baseado no problema"""
    
    def __init__(self, gemini_service: Optional[GeminiService] = None):
        self.gemini_service = gemini_service or GeminiService()
        self.oracle_analyzer = OracleAnalyzerService()
        self.prompt_service = PromptTemplateService()
    
    async def generate_validator_program(
        self,
        problem_statement: str,
        examples: Optional[List[Dict[str, str]]] = None,
        constraints: Optional[str] = None,
        oracle_code: Optional[str] = None,
        format_schema: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Gera programa validador C++ usando LLM
        
        Args:
            problem_statement: Enunciado do problema
            examples: Exemplos de entrada/saída (opcional)
            constraints: Constraints adicionais (opcional)
        
        Returns:
            Dict com 'validator_code', 'explanation'
        """
        logger.info('Validator Agent: Iniciando geração de programa validador')
        
        prompt = await self._build_validator_prompt(
            problem_statement, examples, constraints, oracle_code, format_schema
        )
        
        try:
            response = await self.gemini_service.generate_content(
                prompt,
                temperature=0.3,
                max_tokens=8000
            )
            
            validator_code = self._parse_validator_response(response)
            
            # Log do código gerado para debug (primeiras 500 linhas)
            code_preview = '\n'.join(validator_code.split('\n')[:20])
            logger.debug(f'Código validador gerado (primeiras 20 linhas):\n{code_preview}')
            
            # Verificar se registerValidation está presente
            if "registerValidation" not in validator_code:
                logger.error("⚠️ ATENÇÃO: Código validador não contém registerValidation - tentando corrigir...")
            else:
                logger.debug("✅ registerValidation encontrado no código")
            
            logger.info('Validator Agent: Programa validador gerado com sucesso')
            return {
                "validator_code": validator_code,
                "explanation": response
            }
            
        except Exception as e:
            logger.error(f'Validator Agent: Erro ao gerar programa: {e}')
            raise
    
    async def _build_validator_prompt(
        self,
        problem_statement: str,
        examples: Optional[List[Dict[str, str]]],
        constraints: Optional[str],
        oracle_code: Optional[str] = None,
        format_schema: Optional[Dict[str, Any]] = None
    ) -> str:
        """Constrói prompt para o Validator Agent usando PromptTemplateService"""
        
        # Analisar oráculo se disponível
        if oracle_code:
            try:
                oracle_hints = await self.oracle_analyzer.generate_format_hints(oracle_code)
                logger.info("✓ Hints de formato extraídos do código oráculo (validator)")
            except Exception as e:
                logger.warning(f"Não foi possível analisar oráculo: {e}")
                oracle_code = None
        
        # Usar novo serviço de prompts
        return self.prompt_service.build_validator_prompt(
            statement=problem_statement,
            examples=examples,
            constraints=constraints,
            format_schema=format_schema,
            oracle_code=oracle_code
        )
    
    def _parse_validator_response(self, response: str) -> str:
        """Extrai código validador da resposta do LLM"""
        
        validator_code = CodeExtractionService.extract_cpp_code(response)
        
        # CRÍTICO: Remover instruções inline embutidas (ANTES de qualquer outro processamento)
        validator_code = self._remove_inline_instructions(validator_code)
        
        # Validar código básico e corrigir problemas comuns
        validator_code = self._validate_and_fix_validator_code(validator_code)
        
        # Garantir que o código é compilável
        validator_code = self._ensure_compilable_validator(validator_code)
        
        return validator_code
    
    def _remove_inline_instructions(self, code: str) -> str:
        """Remove instruções inline de forma ULTRA agressiva"""
        logger.info("Limpando instruções inline embutidas por Gemini (modo ultra-agressivo)...")
        
        lines = code.split('\n')
        cleaned_lines = []
        
        for line in lines:
            original_line = line
            
            # ULTRA AGRESSIVO: Remover TODOS os comentários que começam com palavras-chave suspeitas
            if '//' in line:
                comment_start = line.find('//')
                comment = line[comment_start:].lower()
                # Se comentário começa com palavra-chave suspeita, remover TODA a linha
                suspicious_keywords = ['critical', 'important', 'note', 'fix', 'corrected', 'based on']
                if any(keyword in comment for keyword in suspicious_keywords):
                    # Manter apenas o código antes do comentário
                    code_before = line[:comment_start].rstrip()
                    if code_before:
                        cleaned_lines.append(code_before)
                        logger.warning(f"Removida instrução inline (comentário instrucional): {line.strip()}")
                    else:
                        logger.warning(f"Removida linha de instrução: {line.strip()}")
                    continue
            
            # ULTRA AGRESSIVO: Remover QUALQUER texto após ; que não seja outro ;, }, ou comentário válido
            if ';' in line and '//' not in line[:line.find(';')]:  # Tem ; e não tem // antes dele
                parts = line.split(';')
                if len(parts) >= 2:
                    # Verificar a última parte após o último semicolon
                    last_part = parts[-1].strip()
                    # Se tem texto mas não começa com // ou /* e não é só }
                    if last_part and not last_part.startswith('//') and not last_part.startswith('/*') and last_part != '}':
                        # Verificar se parece texto de instrução (tem espaços e palavras comuns)
                        if ' ' in last_part and re.search(r'\b(use|the|for|to|is|are|will|must|should|can|was|were|only)\b', last_part, re.IGNORECASE):
                            # Remover a última parte
                            line = ';'.join(parts[:-1]) + ';'
                            logger.warning(f"Removida instrução inline (após semicolon): {original_line.strip()}")
            
            cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
    def _validate_and_fix_validator_code(self, code: str) -> str:
        """Valida e corrige código validador C++ básico"""
        code = code.strip()
        
        # Primeiro: corrigir problemas de sintaxe incompleta
        # Procurar por "return" isolado (sem valor) antes de }
        code = self._fix_incomplete_returns(code)
        
        # Verificar se tem includes básicos
        if "#include" not in code:
            code = '#include "testlib.h"\n#include <bits/stdc++.h>\nusing namespace std;\n\n' + code
        
        # Verificar se tem registerValidation - CRÍTICO para evitar crash
        if "registerValidation" not in code:
            logger.error("Código validador não contém registerValidation - VAI CAUSAR CRASH!")
            logger.error("Adicionando registerValidation automaticamente...")
            # Tentar adicionar registerValidation no início do main
            lines = code.split('\n')
            added = False
            for i, line in enumerate(lines):
                # Procurar por "int main" ou "main("
                if ("int main" in line or "main(" in line) and not added:
                    # Procurar a próxima linha com { (abertura do main)
                    for j in range(i, min(i+10, len(lines))):
                        if '{' in lines[j] and not added:
                            # Adicionar registerValidation na próxima linha após {
                            indent = len(lines[j]) - len(lines[j].lstrip())
                            if '{' in lines[j]:
                                # Se a chave está na mesma linha, adicionar na próxima
                                register_line = ' ' * (indent + 4) + 'registerValidation(argc, argv);'
                                lines.insert(j+1, register_line)
                                code = '\n'.join(lines)
                                logger.info("✅ registerValidation adicionado automaticamente após abertura do main")
                                added = True
                                break
                    if added:
                        break
            if not added:
                logger.error("❌ Não foi possível adicionar registerValidation automaticamente - código pode crashar")
                # Tentar adicionar no início do arquivo como último recurso
                if "int main" in code:
                    code = code.replace("int main", "int main")  # Não muda nada, mas garante que main existe
                    # Adicionar logo após includes
                    if '#include' in code:
                        last_include_idx = code.rfind('#include')
                        next_line = code.find('\n', last_include_idx)
                        if next_line != -1:
                            code = code[:next_line+1] + '\nusing namespace std;\n\n' + code[next_line+1:]
                            # Agora adicionar registerValidation no main
                            main_pos = code.find('int main')
                            if main_pos != -1:
                                brace_pos = code.find('{', main_pos)
                                if brace_pos != -1:
                                    indent = 4
                                    register_line = '\n' + ' ' * indent + 'registerValidation(argc, argv);'
                                    code = code[:brace_pos+1] + register_line + code[brace_pos+1:]
                                    logger.info("✅ registerValidation adicionado como último recurso")
                                    added = True
                if not added:
                    logger.error("❌❌ FALHA CRÍTICA: Não foi possível adicionar registerValidation - validador vai crashar!")
        
        # Verificar se tem main
        if "int main" not in code and "main(" not in code:
            logger.warning("Código validador não tem função main")
        
        # Balancear chaves (remoção/adicionando se necessário)
        code = self._balance_braces(code)
        
        # Substituir uso incorreto de quitf(_ok, ...) por return 0;
        if "quitf(_ok" in code:
            logger.warning("Removendo quitf(_ok, ...) e utilizando return 0; para sucesso no validador")
            code = re.sub(r'quitf\(_ok\s*,[^;]*\);?', 'return 0;', code)
        
        # Avisar sobre métodos inexistentes curLine
        if "curLine" in code:
            logger.warning("Removendo chamadas a curLine(), inexistente no testlib. Use contadores manuais de linha.")
            code = code.replace("inf.curLine()", "line_number_hint")
            code = code.replace("curLine()", "line_number_hint")
            if "line_number_hint" not in code:
                code = code.replace(
                    "registerValidation(argc, argv);",
                    "registerValidation(argc, argv);\n    int line_number_hint = 1; // Atualize manualmente se precisar"
                )
        
        # Verificar se tem readEof e quitf
        if "readEof" not in code:
            logger.warning("Código validador não contém inf.readEof() - pode causar problemas")
        if "quitf" not in code:
            logger.warning("Código validador não contém quitf() - pode causar problemas")
        
        return code
    
    def _balance_braces(self, code: str) -> str:
        """Balanceia chaves para evitar erros de compilação."""
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
            logger.warning(f"Validator Agent: removidas {removed} chaves de fechamento extras")
        if open_count > 0:
            logger.warning(f"Validator Agent: adicionando {open_count} chaves de fechamento ausentes")
            balanced_chars.append("\n" + "}" * open_count)
        return "".join(balanced_chars)
    
    def _fix_incomplete_returns(self, code: str) -> str:
        """Corrige statements 'return' incompletos antes de }"""
        import re
        
        # Padrão: "return" seguido de whitespace e depois "}" ou outra coisa
        # Procurar por "return" sem valor antes de }
        lines = code.split('\n')
        new_lines = []
        
        for i, line in enumerate(lines):
            stripped = line.strip()
            # Se a linha é apenas "return" (sem valor e sem semicolon)
            if stripped == 'return' or (stripped.startswith('return') and not stripped.endswith(';')):
                # Verificar se a próxima linha é só }
                if i + 1 < len(lines):
                    next_line = lines[i + 1].strip()
                    if next_line == '}' or next_line.startswith('}'):
                        # Completar o return
                        indent = len(line) - len(line.lstrip())
                        new_lines.append(' ' * indent + 'return 0;')
                        logger.warning(f"Corrigindo return incompleto na linha {i+1}: 'return' -> 'return 0;'")
                        continue
            
            new_lines.append(line)
        
        return '\n'.join(new_lines)
    
    def _ensure_compilable_validator(self, code: str) -> str:
        """Garante que o código validador é compilável"""
        # Balancear chaves
        code = self._balance_braces(code)
        
        # Remover quitf(_ok) se existir
        if "quitf(_ok" in code:
            logger.warning("Removendo quitf(_ok, ...) e utilizando return 0; para sucesso no validador")
            code = re.sub(r'quitf\(_ok\s*,[^;]*\);?', 'return 0;', code)
        
        # Garantir que readEof é seguido por return 0
        if "readEof" in code:
            # Procurar por readEof e garantir que tem return 0 depois
            if "return 0" not in code.split("readEof")[1]:
                logger.warning("Adicionando 'return 0;' após inf.readEof()")
                code = code.replace("inf.readEof()", "inf.readEof();\n    return 0;")
        
        return code
    
    async def revise_validator_program(
        self,
        problem_statement: str,
        current_validator_code: str,
        sample_inputs: List[str],
        validation_outputs: List[str],
        compilation_errors: Optional[str] = None,
        expected_outputs: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        Revisa programa validador baseado em feedback
        
        Args:
            problem_statement: Enunciado do problema
            current_validator_code: Código validador atual
            sample_inputs: Entradas de exemplo do problema
            validation_outputs: Saídas do validador para essas entradas
            compilation_errors: Erros de compilação (opcional)
        
        Returns:
            Dict com código revisado
        """
        logger.info('Validator Agent: Revisando programa validador baseado em feedback')
        
        # CRÍTICO: Analisar o formato exato dos inputs de amostra
        format_analysis = self._analyze_input_format(sample_inputs)
        logger.info(f'Análise de formato dos inputs: {format_analysis}')
        
        samples_parts = []
        for i, (sample_input, output) in enumerate(zip(sample_inputs, validation_outputs), 1):
            # Mostrar formato exato do input (incluindo caracteres especiais como \n)
            input_repr = repr(sample_input)
            input_lines = sample_input.split('\n')
            samples_parts.append(f"\n{'='*60}\nExemplo {i}:\n{'='*60}\n")
            samples_parts.append(f"Entrada (texto, mostra visualmente):\n{sample_input}\n")
            samples_parts.append(f"Entrada (repr, mostra caracteres especiais como \\n): {input_repr}\n")
            samples_parts.append(f"Análise do formato:\n")
            samples_parts.append(f"  - Número total de linhas (split por \\n): {len(input_lines)}\n")
            # Verificar se termina com newline (não pode usar \n diretamente em f-string)
            ends_with_newline = sample_input.endswith('\n')
            samples_parts.append(f"  - Termina com newline? {'SIM' if ends_with_newline else 'NÃO'}\n")
            samples_parts.append(f"  - Linhas individuais:\n")
            for j, line in enumerate(input_lines, 1):
                line_repr = repr(line)
                samples_parts.append(f"    Linha {j}: {line_repr} (tamanho: {len(line)} chars)\n")
            if expected_outputs and i <= len(expected_outputs):
                samples_parts.append(f"Saída esperada (do problema):\n{expected_outputs[i-1]}\n")
            # Se output é uma string detalhada (da nova lógica), usar diretamente
            if isinstance(output, str) and '\n' in output and 'Input (texto):' in output:
                samples_parts.append(f"Erro detalhado do validador:\n{output}\n")
            else:
                samples_parts.append(f"Erro do validador (atual):\n{output}\n")
        
        samples_text = ''.join(samples_parts)
        
        # Adicionar instrução específica sobre o formato detectado
        format_instruction = self._get_format_instruction(format_analysis)
        
        compilation_text = f"\n\nErros de compilação:\n{compilation_errors}" if compilation_errors else ""
        
        prompt = f"""You are a Validator Agent that needs to revise a validator program.

CRITICAL: The sample inputs from the problem statement MUST PASS validation. These are official examples provided with the problem, so they are guaranteed to be valid inputs. If the validator is rejecting them, the validator is TOO STRICT or has INCORRECT constraint checks.

PROBLEM STATEMENT:
{problem_statement}

CURRENT VALIDATOR CODE:
```cpp
{current_validator_code}
```

SAMPLE INPUTS AND VALIDATOR OUTPUTS:
{samples_text}{compilation_text}

CRITICAL INPUT FORMAT INSTRUCTION:
{format_instruction}

CRITICAL: testlib API Usage:
- You MUST call `registerValidation(argc, argv);` at the VERY START of main() - this initializes testlib
- Without registerValidation, the validator will CRASH with segmentation fault
- CRITICAL: For validators, do NOT use quitf(_ok, ...) - it may return code 3 instead of 0
- After inf.readEof(), simply use: return 0; to indicate success
- Do NOT call inf.curLine() (esse método não existe); se precisar de número de linha, mantenha um contador manual
- If you need to report an error, use ensuref() which will automatically handle it
- quitf(_ok, ...) does not work correctly in validators - always use return 0; instead
- Use ensuref(condition, "message") to check constraints
- You MUST call inf.readEof() at the end to verify all input was consumed
- The validator reads from stdin automatically via inf - do NOT open files

If the validator is crashing (exit code 3221225785), it means:
- registerValidation(argc, argv) was NOT called at the start of main()
- OR the validator is trying to read from a file instead of stdin
- OR there's a memory access violation

If the validator returns exit code 3 with message "Input is valid", it means:
- The validator is using quitf(_ok, ...) which does NOT work correctly in validators
- Replace quitf(_ok, ...) with return 0; after inf.readEof()
- Validators should use return 0; to indicate success, NOT quitf(_ok, ...)

IMPORTANT: The sample inputs from the problem statement are GUARANTEED to be valid.
If the validator is rejecting them, the validator is TOO STRICT or has INCORRECT format expectations.

Common issues with "Expected EOLN" errors:
- This error means the validator is trying to read a newline that doesn't exist, or is missing a newline that should be read
- CRITICAL: Check the repr() output of sample inputs to see the EXACT format:
  * If repr shows 'text\\n' (with \\n at end), the input HAS a trailing newline - you need to read it
  * If repr shows 'text' (no \\n at end), the input does NOT have a trailing newline
- When reading the last value:
  * If the input ends with newline (repr shows \\n at end): After reading the last value, use readEoln() then readEof()
  * If the input does NOT end with newline (no \\n in repr): After reading the last value, use readEof() directly
- The validator MUST match the EXACT format shown in the sample inputs - no more, no less
- Count the actual lines in the input (split by \\n) and make sure you're reading exactly that many lines
- If you see "Expected EOLN (stdin, line X)", it means you're trying to read line X but it doesn't exist or has wrong format

Please:
1. Ensure registerValidation(argc, argv) is called at the START of main()
2. Ensure the validator reads from stdin using inf.readInt(), inf.readLong(), etc.
3. Match the EXACT format of the sample inputs (check repr() output)
4. If sample input ends without newline, use readEof() directly after reading the last value
5. If sample input ends with newline, use readEoln() then readEof()
6. Após validar tudo, chame inf.readEof() e retorne 0 (NÃO use quitf(_ok, ...))
7. Fix ALL compilation errors
8. Analyze why the sample inputs are failing and adjust the validator to accept them

Format your response as:
```cpp
[REVISED VALIDATOR CODE]
```
"""
        
        try:
            response = await self.gemini_service.generate_content(
                prompt,
                temperature=0.3,
                max_tokens=8000
            )
            
            validator_code = self._parse_validator_response(response)
            logger.info('Validator Agent: Programa revisado com sucesso')
            return {
                "validator_code": validator_code,
                "explanation": response
            }
            
        except Exception as e:
            logger.error(f'Validator Agent: Erro ao revisar programa: {e}')
            raise
    
    def _analyze_input_format(self, sample_inputs: List[str]) -> Dict[str, Any]:
        """Analisa o formato exato dos inputs de amostra"""
        analysis = {
            "num_samples": len(sample_inputs),
            "ends_with_newline": [],
            "num_lines": [],
            "line_formats": []
        }
        
        for input_str in sample_inputs:
            analysis["ends_with_newline"].append(input_str.endswith('\n'))
            lines = input_str.split('\n')
            analysis["num_lines"].append(len(lines))
            analysis["line_formats"].append([repr(line) for line in lines])
        
        return analysis
    
    def _get_format_instruction(self, format_analysis: Dict[str, Any]) -> str:
        """Gera instrução específica sobre o formato dos inputs"""
        instruction = "INPUT FORMAT ANALYSIS:\n"
        
        for i, (ends_newline, num_lines, formats) in enumerate(
            zip(
                format_analysis["ends_with_newline"],
                format_analysis["num_lines"],
                format_analysis["line_formats"]
            ),
            1
        ):
            instruction += f"\nSample {i}:\n"
            instruction += f"  - Ends with newline: {'YES' if ends_newline else 'NO'}\n"
            instruction += f"  - Number of lines (after split): {num_lines}\n"
            instruction += f"  - Line formats:\n"
            for j, fmt in enumerate(formats, 1):
                instruction += f"    Line {j}: {fmt}\n"
            
            # Dar instrução de como ler
            if ends_newline and num_lines > 1:
                instruction += f"  => READING STRATEGY: Read {num_lines-1} lines with readEoln(), then readEof()\n"
            elif ends_newline:
                instruction += f"  => READING STRATEGY: Direct readEof() (input is just a newline or single line with newline)\n"
            else:
                instruction += f"  => READING STRATEGY: Read all {num_lines} values, then direct readEof() (NO readEoln at end)\n"
        
        return instruction
    

