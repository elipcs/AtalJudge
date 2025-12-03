"""Serviço de supervisão Generator-Validator com loop de feedback"""
from typing import Dict, Any, List, Optional, Tuple
import tempfile
import os
import time
import json
from app.services.generator_agent_service import GeneratorAgentService
from app.services.validator_agent_service import ValidatorAgentService
from app.services.cpp_compiler_service import CppCompilerService
from app.services.generator_executor_service import GeneratorExecutorService
from app.services.validator_executor_service import ValidatorExecutorService
from app.services.code_executor import CodeExecutor
from app.services.input_format_inference_service import InputFormatInferenceService
from app.utils.logger import logger


class GeneratorValidatorSupervisionService:
    """Orquestra o sistema Generator-Validator com loop de supervisão"""
    
    def __init__(
        self,
        generator_agent: Optional[GeneratorAgentService] = None,
        validator_agent: Optional[ValidatorAgentService] = None,
        compiler: Optional[CppCompilerService] = None,
        code_executor: Optional[CodeExecutor] = None,
        oracle_executor: Optional[CodeExecutor] = None
    ):
        self.generator_agent = generator_agent or GeneratorAgentService()
        self.validator_agent = validator_agent or ValidatorAgentService()
        self.compiler = compiler or CppCompilerService()
        self.code_executor = code_executor or CodeExecutor()
        self.oracle_executor = oracle_executor
        self.format_inference = InputFormatInferenceService()
        self.max_iterations = 100  # Aumentado para permitir mais tentativas até timeout
        self.max_compilation_fixes = 3  # Máximo de tentativas de correção automática de compilação
        self.timeout_seconds = 600  # 10 minutos de timeout
    
    async def _compile_with_auto_fix(
        self,
        code: str,
        code_type: str,  # "gerador" ou "validador"
        compile_func,
        revise_func,
        problem_statement: str,
        validation_errors: List[str],
        **revise_kwargs
    ) -> Tuple[Dict[str, Any], str]:
        """
        Compila código e, se falhar, automaticamente envia erro para o Gemini corrigir.
        Repete até compilar com sucesso ou atingir limite de tentativas.
        
        Args:
            code: Código C++ a compilar
            code_type: Tipo do código ("gerador" ou "validador")
            compile_func: Função de compilação (compile_generator ou compile_validator)
            revise_func: Função de revisão do agente
            problem_statement: Enunciado do problema
            validation_errors: Lista de erros de validação
            **revise_kwargs: Argumentos adicionais para revise_func
        
        Returns:
            Tupla (resultado_compilacao, codigo_corrigido)
        """
        current_code = code
        fix_attempt = 0
        
        while fix_attempt < self.max_compilation_fixes:
            # Tentar compilar
            compile_result = compile_func(current_code)
            
            if compile_result["success"]:
                logger.info(f'✅ {code_type.capitalize()} compilado com sucesso')
                return compile_result, current_code
            
            # Se falhou, extrair erro
            compilation_error = compile_result["error"]
            fix_attempt += 1
            
            logger.warning(f'❌ Erro ao compilar {code_type} (tentativa {fix_attempt}/{self.max_compilation_fixes})')
            logger.info(f'Enviando erro de compilação para o Gemini corrigir automaticamente...')
            
            # Extrair informações úteis do erro
            error_summary = self._extract_compilation_error_info(compilation_error)
            
            try:
                # Chamar função de revisão com o erro de compilação
                if code_type == "gerador":
                    revise_result = await revise_func(
                        problem_statement,
                        current_code,
                        validation_errors,
                        compilation_error
                    )
                    current_code = revise_result["generator_code"]
                else:  # validador
                    revise_result = await revise_func(
                        problem_statement,
                        current_code,
                        revise_kwargs.get("sample_inputs", []),
                        revise_kwargs.get("validation_outputs", []),
                        compilation_error,
                        revise_kwargs.get("expected_outputs")
                    )
                    current_code = revise_result["validator_code"]
                
                logger.info(f'Gemini corrigiu o código do {code_type}, tentando compilar novamente...')
                
            except Exception as e:
                logger.error(f'Erro ao solicitar correção do Gemini: {e}')
                # Se falhar ao corrigir, retornar erro
                break
        
        # Se chegou aqui, não conseguiu compilar após todas as tentativas
        logger.error(f'❌ Não foi possível compilar {code_type} após {fix_attempt} tentativas de correção')
        return compile_result, current_code
    
    def _extract_compilation_error_info(self, error_message: str) -> str:
        """
        Extrai informações úteis do erro de compilação para enviar ao Gemini.
        Remove informações redundantes e foca nos erros principais.
        """
        lines = error_message.split('\n')
        important_lines = []
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            # Manter linhas com "error:", "warning:", caminhos de arquivo, e números de linha
            if any(keyword in line.lower() for keyword in [
                'error:', 'warning:', '.cpp:', 'in function', 'required from',
                'no member named', 'has no member', 'expected', 'undefined'
            ]):
                important_lines.append(line)
        
        # Limitar tamanho para não exceder limites do prompt
        if len(important_lines) > 20:
            important_lines = important_lines[:20]
            important_lines.append("... (mais erros omitidos)")
        
        return '\n'.join(important_lines)
    
    async def generate_test_cases(
        self,
        problem_statement: str,
        oracle_code: str,
        examples: Optional[List[Dict[str, str]]] = None,
        constraints: Optional[str] = None,
        target_count: int = 20
    ) -> Dict[str, Any]:
        """
        Gera casos de teste usando sistema Generator-Validator com supervisão
        
        Args:
            problem_statement: Enunciado do problema
            oracle_code: Código oráculo (Python) para gerar saídas
            examples: Exemplos do problema
            constraints: Constraints adicionais
            target_count: Número alvo de casos de teste
        
        Returns:
            Dict com casos de teste gerados e informações
        """
        logger.info('Iniciando sistema Generator-Validator com supervisão')
        
        # Iniciar cronômetro
        start_time = time.time()
        
        # 🔥 NOVO: Inferir formato de entrada primeiro
        format_schema = None
        try:
            logger.info('🔍 Inferindo formato de entrada do problema...')
            format_obj = await self.format_inference.infer_format(
                statement=problem_statement,
                examples=examples,
                constraints=constraints
            )
            # Converter para dict para passar aos agentes
            format_schema = json.loads(format_obj.json())
            logger.info(f'✅ Formato inferido com sucesso')
            if format_obj.has_graph:
                logger.info(f'  📈 Grafo detectado: directed={format_obj.graph_constraints.directed}, acyclic={format_obj.graph_constraints.acyclic}')
        except Exception as e:
            logger.warning(f'⚠️ Erro ao inferir formato (continuando sem schema): {e}')
            format_schema = None
        
        iteration = 0
        generator_code = None
        validator_code = None
        generator_commands = []
        validation_errors = []
        compilation_errors = None
        sample_inputs = []
        validation_outputs = []
        generator_executable = None
        validator_executable = None
        valid_cases = []  # Acumular casos válidos entre iterações
        
        # Loop até atingir target_count OU timeout
        while True:
            # Verificar timeout
            elapsed_time = time.time() - start_time
            if elapsed_time >= self.timeout_seconds:
                logger.warning(f'⏱️ Timeout de {self.timeout_seconds}s atingido após {iteration} iterações')
                logger.info(f'Casos gerados até agora: {len(valid_cases)}/{target_count}')
                break
            
            # Verificar se atingiu o alvo
            if len(valid_cases) >= target_count:
                logger.info(f'✅ Alvo de {target_count} casos atingido!')
                break
            
            iteration += 1
            remaining_time = self.timeout_seconds - elapsed_time
            logger.info(f'Iteração {iteration} - {len(valid_cases)}/{target_count} casos - {remaining_time:.0f}s restantes')
            
            # Limitar iterações para evitar loop infinito (segurança)
            if iteration > self.max_iterations:
                logger.warning(f'⚠️ Limite de segurança de {self.max_iterations} iterações atingido')
                break
            
            try:
                # 1. Gerar/Revisar programa gerador
                if generator_code is None:
                    logger.info('Gerando programa gerador inicial...')
                    gen_result = await self.generator_agent.generate_generator_program(
                        problem_statement, examples, constraints, oracle_code, format_schema
                    )
                    generator_code = gen_result["generator_code"]
                    generator_commands = gen_result["generator_commands"]
                else:
                    logger.info('Revisando programa gerador...')
                    gen_result = await self.generator_agent.revise_generator_program(
                        problem_statement,
                        generator_code,
                        validation_errors,
                        compilation_errors
                    )
                    generator_code = gen_result["generator_code"]
                    if "generator_commands" in gen_result:
                        generator_commands = gen_result["generator_commands"]
                
                # 2. Compilar gerador (com correção automática)
                logger.info('Compilando gerador...')
                compile_result, generator_code = await self._compile_with_auto_fix(
                    generator_code,
                    "gerador",
                    self.compiler.compile_generator,
                    self.generator_agent.revise_generator_program,
                    problem_statement,
                    validation_errors
                )
                
                if not compile_result["success"]:
                    compilation_errors = compile_result["error"]
                    logger.warning(f'Erro ao compilar gerador após todas as tentativas: {compilation_errors}')
                    validation_errors = []
                    continue  # Tentar novamente na próxima iteração
                
                generator_executable = compile_result["executable_path"]
                compilation_errors = None
                
                # 3. Gerar/Revisar programa validador
                if validator_code is None:
                    logger.info('Gerando programa validador inicial...')
                    val_result = await self.validator_agent.generate_validator_program(
                        problem_statement, examples, constraints, oracle_code, format_schema
                    )
                    validator_code = val_result["validator_code"]
                else:
                    logger.info('Revisando programa validador...')
                    # Passar também os exemplos esperados do problema para melhor contexto
                    expected_outputs = [ex.get("output", "") for ex in examples if ex.get("input")] if examples else None
                    val_result = await self.validator_agent.revise_validator_program(
                        problem_statement,
                        validator_code,
                        sample_inputs,
                        validation_outputs,
                        compilation_errors,
                        expected_outputs
                    )
                    validator_code = val_result["validator_code"]
                
                # 4. Compilar validador
                logger.info('Compilando validador...')
                
                # Salvar código do validador para debug se necessário
                debug_file = None
                if validator_code:
                    # Verificar se registerValidation está presente antes de compilar
                    if "registerValidation" not in validator_code:
                        logger.error("⚠️ CRÍTICO: Código validador não contém registerValidation!")
                        # Salvar código para inspeção
                        try:
                            debug_file = tempfile.NamedTemporaryFile(mode='w', suffix='.cpp', delete=False)
                            debug_file.write(validator_code)
                            debug_file.close()
                            logger.error(f"Código validador salvo em: {debug_file.name}")
                        except Exception as e:
                            logger.error(f"Erro ao salvar código para debug: {e}")
                
                # Compilar validador (com correção automática)
                val_compile_result, validator_code = await self._compile_with_auto_fix(
                    validator_code,
                    "validador",
                    self.compiler.compile_validator,
                    lambda prob, code, samples, outputs, comp_err, exp_out=None: self.validator_agent.revise_validator_program(
                        prob, code, samples, outputs, comp_err, exp_out
                    ),
                    problem_statement,
                    validation_errors,
                    sample_inputs=sample_inputs,
                    validation_outputs=validation_outputs,
                    expected_outputs=[ex.get("output", "") for ex in examples if ex.get("input")] if examples else None
                )
                
                if not val_compile_result["success"]:
                    val_compilation_errors = val_compile_result["error"]
                    logger.warning(f'Erro ao compilar validador após todas as tentativas: {val_compilation_errors}')
                    
                    # FALLBACK: Se compilação falhar, usar validador mínimo
                    if iteration >= 1 and sample_inputs:  # Ativar fallback a partir da iteração 1
                        logger.warning(f'⚠️ Tentando validador mínimo devido ao erro de compilação...')
                        try:
                            validator_code = self.validator_agent.generate_minimal_validator_code(sample_inputs)
                            logger.info('Gerando executável com validador mínimo...')
                            
                            # Compilar validador mínimo
                            val_compile_result = self.compiler.compile_validator(validator_code)
                            if val_compile_result["success"]:
                                validator_executable = val_compile_result["executable_path"]
                                logger.info('✅ Validador mínimo compilou com sucesso')
                                compilation_errors = None
                                # Continuar para validação
                            else:
                                logger.error(f'❌ Validador mínimo também falhou ao compilar: {val_compile_result["error"]}')
                                compilation_errors = val_compile_result["error"]
                                validation_errors = []
                                continue
                        except Exception as e:
                            logger.error(f'Erro ao gerar validador mínimo: {e}')
                            compilation_errors = val_compilation_errors
                            validation_errors = []
                            continue
                    else:
                        compilation_errors = val_compilation_errors
                        validation_errors = []
                        continue
                
                validator_executable = val_compile_result["executable_path"]
                compilation_errors = None
                
                # Limpar arquivo de debug se compilou com sucesso
                if debug_file and os.path.exists(debug_file.name):
                    try:
                        os.unlink(debug_file.name)
                    except:
                        pass
                
                # 5. Validar exemplos do problema (supervisão do validador)
                if examples:
                    logger.info('Validando exemplos do problema...')
                    sample_inputs = [ex.get("input", "") for ex in examples if ex.get("input")]
                    if sample_inputs:
                        validator_executor = ValidatorExecutorService(validator_executable)
                        sample_validations = validator_executor.validate_test_cases_batch(sample_inputs)
                        
                        failed_samples = [v for v in sample_validations if not v["valid"]]
                        if failed_samples and iteration >= 3:
                            # Se validador falha após 3 iterações, usar validador mínimo
                            logger.warning(f'⚠️ Validador continua rejeitando exemplos na iteração {iteration}. Usando validador mínimo...')
                            try:
                                validator_code = self.validator_agent.generate_minimal_validator_code(sample_inputs)
                                logger.info('Gerando executável com validador mínimo...')
                                
                                # Compilar validador mínimo
                                val_compile_result = self.compiler.compile_validator(validator_code)
                                if val_compile_result["success"]:
                                    validator_executable = val_compile_result["executable_path"]
                                    logger.info('✅ Validador mínimo compilou com sucesso')
                                    
                                    # Re-testar com validador mínimo
                                    validator_executor = ValidatorExecutorService(validator_executable)
                                    sample_validations = validator_executor.validate_test_cases_batch(sample_inputs)
                                    failed_samples = [v for v in sample_validations if not v["valid"]]
                                    
                                    if not failed_samples:
                                        logger.info('✅ Todos os exemplos passaram com validador mínimo!')
                                        # Continuar com o validador mínimo
                                    else:
                                        logger.error('❌ Validador mínimo também falhou. Continuando com ele mesmo assim...')
                                else:
                                    logger.error(f'❌ Erro ao compilar validador mínimo: {val_compile_result["error"]}')
                                    # Tentar revisar normalmente
                            except Exception as e:
                                logger.error(f'Erro ao gerar validador mínimo: {e}')
                                # Continuar com revisão normal
                        
                        if failed_samples:
                            # Verificar se há crashes (código 3221225785)
                            crashes = [v for v in failed_samples if "3221225785" in str(v.get("error_message", ""))]
                            if crashes:
                                logger.error(f"⚠️ Validador crashou em {len(crashes)} casos (código 3221225785)")
                                # Salvar código do validador para debug
                                if validator_code:
                                    try:
                                        crash_debug_file = tempfile.NamedTemporaryFile(mode='w', suffix='_crash.cpp', delete=False)
                                        crash_debug_file.write(validator_code)
                                        crash_debug_file.close()
                                        logger.error(f"🔍 Código validador que crashou salvo em: {crash_debug_file.name}")
                                        # Logar primeiras 30 linhas do código
                                        code_lines = validator_code.split('\n')[:30]
                                        logger.error("Primeiras 30 linhas do código validador:")
                                        for i, line in enumerate(code_lines, 1):
                                            logger.error(f"  {i:3d}: {line}")
                                    except Exception as e:
                                        logger.error(f"Erro ao salvar código para debug: {e}")
                            
                            # Coletar informações detalhadas sobre os erros
                            validation_outputs = []
                            detailed_errors = []  # Para passar informações mais detalhadas na revisão
                            for i, (sample_input, validation) in enumerate(zip(sample_inputs, sample_validations)):
                                if not validation["valid"]:
                                    error_msg = validation.get("error_message", "Erro desconhecido")
                                    error_line = validation.get("error_line")
                                    if error_line:
                                        error_msg = f"Line {error_line}: {error_msg}"
                                    validation_outputs.append(error_msg)
                                    
                                    # Criar mensagem detalhada com formato do input
                                    input_repr = repr(sample_input)
                                    input_lines = sample_input.split('\n')
                                    detailed_error = f"Exemplo {i+1}:\n"
                                    detailed_error += f"  Input (texto):\n{sample_input}\n"
                                    detailed_error += f"  Input (repr, mostra caracteres especiais): {input_repr}\n"
                                    detailed_error += f"  Número de linhas: {len(input_lines)}\n"
                                    detailed_error += f"  Linhas do input:\n"
                                    for j, line in enumerate(input_lines, 1):
                                        detailed_error += f"    Linha {j}: {repr(line)}\n"
                                    detailed_error += f"  Erro do validador: {error_msg}\n"
                                    detailed_errors.append(detailed_error)
                                    
                                    logger.warning(f'Exemplo {i+1} inválido: {error_msg}')
                                    logger.warning(f'Input do exemplo {i+1} (repr): {input_repr}')
                                    logger.debug(f'Input do exemplo {i+1} (primeiros 200 chars): {sample_input[:200]}...')
                                else:
                                    validation_outputs.append("")
                            
                            logger.warning(f'{len(failed_samples)} exemplos falharam na validação')
                            
                            # Atualizar validation_outputs com informações detalhadas para melhor revisão
                            validation_outputs = detailed_errors if detailed_errors else validation_outputs
                            
                            continue  # Revisar validador
                
                # 6. Executar gerador para gerar casos
                logger.info(f'Executando gerador com {len(generator_commands)} comandos...')
                generator_executor = GeneratorExecutorService(generator_executable)
                generation_results = generator_executor.generate_test_cases_batch(
                    generator_commands,
                    max_cases=target_count * 2  # Gerar mais para ter margem
                )
                
                # Filtrar apenas casos gerados com sucesso
                generated_inputs = [
                    r["input_data"] for r in generation_results
                    if r["success"] and r["input_data"]
                ]
                
                if not generated_inputs:
                    validation_errors = ["Nenhum caso de teste foi gerado com sucesso"]
                    logger.warning(validation_errors[0])
                    continue
                
                logger.info(f'{len(generated_inputs)} casos gerados, validando...')
                
                # 7. Validar casos gerados
                validator_executor = ValidatorExecutorService(validator_executable)
                validation_results = validator_executor.validate_test_cases_batch(generated_inputs)
                
                # Separar casos válidos e inválidos (acumular válidos)
                new_valid_cases = []
                invalid_cases = []
                validation_errors = []
                
                for i, result in enumerate(validation_results):
                    if result["valid"]:
                        new_valid_cases.append(generated_inputs[i])
                    else:
                        invalid_cases.append(generated_inputs[i])
                        error_msg = result["error_message"] or "Erro desconhecido"
                        if result["error_line"]:
                            error_msg = f"Line {result['error_line']}: {error_msg}"
                        
                        # Se o erro é relacionado a formato (EOLN), tentar normalizar
                        if "EOLN" in error_msg or "Expected" in error_msg:
                            # Tentar normalizar: adicionar newline se faltar, ou remover se sobrar
                            original_input = generated_inputs[i]
                            normalized_input = None
                            
                            if not original_input.endswith('\n'):
                                # Tentar adicionar newline
                                normalized_input = original_input + '\n'
                                logger.info(f"Tentando normalizar caso {i} adicionando newline...")
                            else:
                                # Tentar remover newline
                                normalized_input = original_input.rstrip('\n')
                                logger.info(f"Tentando normalizar caso {i} removendo newline...")
                            
                            if normalized_input:
                                # Revalidar com input normalizado
                                revalidation = validator_executor.validate_test_cases_batch([normalized_input])[0]
                                if revalidation["valid"]:
                                    logger.info(f"✅ Caso {i} normalizado com sucesso!")
                                    valid_cases.append(normalized_input)
                                    continue  # Pular adição aos inválidos
                            
                            # Se não funcionou, adicionar informações de debug
                            generated_repr = repr(original_input)
                            ends_with_nl = original_input.endswith('\n')
                            format_info = f"\n  Caso gerado (repr): {generated_repr}"
                            format_info += f"\n  Caso gerado termina com newline? {'SIM' if ends_with_nl else 'NÃO'}"
                            if examples and examples[0].get("input"):
                                example_input = examples[0]["input"]
                                example_repr = repr(example_input)
                                example_ends_with_nl = example_input.endswith('\n')
                                format_info += f"\n  Exemplo do problema (repr): {example_repr}"
                                format_info += f"\n  Exemplo termina com newline? {'SIM' if example_ends_with_nl else 'NÃO'}"
                            error_msg += format_info
                        
                        validation_errors.append(error_msg)
                
                # Acumular casos válidos
                valid_cases.extend(new_valid_cases)
                logger.info(f'Validação: {len(new_valid_cases)} novos válidos, {len(invalid_cases)} inválidos')
                logger.info(f'Acumulado: {len(valid_cases)} casos válidos no total')
                
                # Se todos os casos gerados são válidos, continuar gerando mais
                if len(invalid_cases) == 0:
                    logger.info('Todos os casos gerados são válidos! Continuando para gerar mais...')
                    # Resetar erros para gerar novos casos
                    validation_errors = []
                    continue
                
                # Se ainda há erros mas temos alguns casos válidos, continuar tentando
                if len(new_valid_cases) > 0:
                    logger.info(f'Progresso: {len(valid_cases)}/{target_count} casos válidos')
                    # Continuar loop para gerar mais casos
                    validation_errors = []  # Resetar para nova tentativa
                    continue
                
                
                # Verificar se atingiu o alvo e executar oráculo para verificar diversidade
                if len(valid_cases) >= target_count:
                    # Executar oráculo para casos acumulados
                    logger.info(f'Executando oráculo para {len(valid_cases[:target_count])} casos válidos...')
                    test_cases = []
                    
                    for i, input_data in enumerate(valid_cases[:target_count]):
                        result = self.code_executor.execute(oracle_code, input_data)
                        if result["success"] and result["output"]:
                            test_cases.append({
                                "input": input_data,
                                "output": result["output"]
                            })
                    
                    # Verificar diversidade de saídas
                    if test_cases:
                        unique_outputs = set(tc["output"].strip() for tc in test_cases)
                        diversity_ratio = len(unique_outputs) / len(test_cases)
                        
                        logger.info(f'📊 Diversidade de saídas: {len(unique_outputs)} únicas de {len(test_cases)} casos ({diversity_ratio:.1%})')
                        
                        # Se todas as saídas são idênticas, rejeitar e forçar regeneração
                        if len(unique_outputs) == 1:
                            logger.warning(f'⚠️ BAIXA DIVERSIDADE: Todos os {len(test_cases)} casos têm a mesma saída: "{list(unique_outputs)[0].strip()[:50]}"')
                            logger.warning('Forçando revisão do gerador para criar casos mais diversos...')
                            
                            # Adicionar aos erros de validação para forçar revisão do gerador
                            validation_errors = [
                                f"DIVERSIDADE INSUFICIENTE: Todos os {len(test_cases)} casos gerados têm a mesma saída esperada.",
                                f"Saída repetida: {list(unique_outputs)[0].strip()[:100]}",
                                "O gerador deve criar casos que cubram diferentes cenários e produzam saídas variadas.",
                                "Analise o código oráculo para identificar quais condições levam a diferentes saídas.",
                                "Gere casos que testem TODOS os possíveis caminhos de execução (ex: YES e NO, diferentes ranges, edge cases)."
                            ]
                            
                            # Limpar casos para forçar regeneração
                            test_cases = []
                            valid_cases = []
                            
                            # Continuar loop para revisar gerador
                            continue
                        
                        # Se diversidade é muito baixa (< 20%), apenas avisar mas permitir
                        elif diversity_ratio < 0.2:
                            logger.warning(f'⚠️ Diversidade baixa: apenas {diversity_ratio:.1%} de saídas únicas')
                            logger.warning(f'Saídas únicas encontradas: {unique_outputs}')
                        
                        # Diversidade OK, finalizar
                        logger.info('✅ Diversidade de saídas aceitável!')
                        break
                
            except Exception as e:
                logger.error(f'Erro na iteração {iteration}: {e}')
                continue
        
# 8. Executar oráculo para obter saídas dos casos válidos
        if not valid_cases:
            raise ValueError("Nenhum caso de teste válido foi gerado após todas as iterações")
        
        # Limitar ao número alvo
        valid_cases = valid_cases[:target_count]
        
        logger.info(f'Executando oráculo para {len(valid_cases)} casos válidos...')
        test_cases = []
        
        for i, input_data in enumerate(valid_cases):
            result = self.code_executor.execute(oracle_code, input_data)
            if result["success"] and result["output"]:
                test_cases.append({
                    "input": input_data,
                    "output": result["output"]
                })
        
        logger.info(f'Sistema Generator-Validator concluído: {len(test_cases)} casos de teste gerados')
        
        return {
            "test_cases": test_cases,
            "total_generated": len(test_cases),
            "generator_code": generator_code,
            "validator_code": validator_code,
            "generator_commands": generator_commands,
            "iterations": iteration,
            "method": "generator_validator"
        }
    
    def cleanup(self):
        """Limpa recursos"""
        if self.compiler:
            self.compiler.cleanup()

