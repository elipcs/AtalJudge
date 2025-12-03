"""Checker Agent Service - Gera checker personalizado para problemas com múltiplas respostas"""
from typing import Dict, Any, List, Optional
from app.services.gemini_service import GeminiService
from app.services.prompt_template_service import PromptTemplateService
from app.utils.logger import logger


class CheckerAgentService:
    """
    Agente LLM que determina se um problema precisa de checker personalizado
    e gera o código C++ do checker se necessário.
    """
    
    def __init__(self, gemini_service: Optional[GeminiService] = None):
        self.gemini_service = gemini_service or GeminiService()
        self.prompt_service = PromptTemplateService()
    
    async def needs_custom_checker(
        self,
        problem_statement: str,
        examples: Optional[List[Dict[str, str]]] = None
    ) -> bool:
        """
        Determina se o problema precisa de um checker personalizado.
        
        Args:
            problem_statement: Enunciado do problema
            examples: Exemplos de entrada/saída
        
        Returns:
            True se precisa de checker personalizado, False caso contrário
        """
        logger.info("🔍 Analisando se problema precisa de checker personalizado...")
        
        # Heurística simples primeiro (antes de chamar LLM)
        keywords_multi_answer = [
            "qualquer", "any valid", "any correct", "várias", "multiple",
            "topological", "spanning tree", "matching", "partition",
            "ordem topológica", "árvore geradora", "qualquer ordem"
        ]
        
        statement_lower = problem_statement.lower()
        for keyword in keywords_multi_answer:
            if keyword in statement_lower:
                logger.info(f"✅ Palavra-chave detectada: '{keyword}' → provável necessidade de checker")
                return True
        
        # Se heurística não detectou, assumir que não precisa
        logger.info("❌ Nenhuma palavra-chave de múltiplas respostas detectada")
        logger.info("   Usando checker padrão (wcmp)")
        return False
    
    async def generate_checker_program(
        self,
        problem_statement: str,
        examples: Optional[List[Dict[str, str]]] = None,
        constraints: Optional[str] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Gera programa checker C++ usando LLM.
        
        Args:
            problem_statement: Enunciado do problema
            examples: Exemplos de entrada/saída
            constraints: Constraints adicionais
        
        Returns:
            Dict com 'checker_code', 'checker_type', 'explanation'
            ou None se não precisa de checker personalizado
        """
        logger.info("🛠️ Checker Agent: Gerando programa checker personalizado...")
        
        # Construir prompt
        prompt = self.prompt_service.build_checker_prompt(
            statement=problem_statement,
            examples=examples,
            has_multiple_answers=True
        )
        
        try:
            # Chamar Gemini
            response = await self.gemini_service.generate_content(
                prompt,
                temperature=0.3,
                max_tokens=8000
            )
            
            # Parsear resposta
            result = self._parse_checker_response(response)
            
            if result.get('checker_type') == 'wcmp':
                logger.info("✅ Problema não requer checker personalizado (usando wcmp)")
                return None
            
            logger.info("✅ Checker personalizado gerado com sucesso")
            return result
            
        except Exception as e:
            logger.error(f"❌ Erro ao gerar checker: {e}")
            logger.warning("Usando checker padrão (wcmp) como fallback")
            return None
    
    def _parse_checker_response(self, response: str) -> Dict[str, Any]:
        """Extrai código checker da resposta do LLM"""
        
        # Verificar se LLM decidiu usar wcmp
        if "CHECKER_TYPE: wcmp" in response or "CHECKER_TYPE:wcmp" in response:
            return {
                "checker_type": "wcmp",
                "checker_code": None,
                "explanation": response
            }
        
        # Extrair código C++
        checker_code = ""
        if "```cpp" in response:
            parts = response.split("```cpp")
            if len(parts) > 1:
                code_part = parts[1].split("```")[0]
                checker_code = code_part.strip()
        elif "```c++" in response:
            parts = response.split("```c++")
            if len(parts) > 1:
                code_part = parts[1].split("```")[0]
                checker_code = code_part.strip()
        elif "```" in response:
            parts = response.split("```")
            if len(parts) > 1:
                checker_code = parts[1].strip()
        
        if not checker_code:
            logger.warning("Não foi possível extrair código checker - usando wcmp")
            return {
                "checker_type": "wcmp",
                "checker_code": None,
                "explanation": response
            }
        
        # Validação básica
        if "registerTestlibCmd" not in checker_code:
            logger.warning("Código checker não contém registerTestlibCmd - pode estar incompleto")
        
        return {
            "checker_type": "custom",
            "checker_code": checker_code,
            "explanation": response
        }
    
    async def revise_checker_program(
        self,
        problem_statement: str,
        current_checker_code: str,
        test_failures: List[str],
        compilation_errors: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Revisa programa checker baseado em feedback.
        
        Args:
            problem_statement: Enunciado do problema
            current_checker_code: Código checker atual
            test_failures: Lista de falhas de teste
            compilation_errors: Erros de compilação
        
        Returns:
            Dict com código revisado
        """
        logger.info("🔧 Checker Agent: Revisando programa checker...")
        
        failures_text = "\n".join([f"- {fail}" for fail in test_failures])
        compilation_text = f"\n\nErros de compilação:\n{compilation_errors}" if compilation_errors else ""
        
        prompt = f"""Você é o Checker Reviewer Agent.

Revise o checker C++ baseado no feedback fornecido.

**PROBLEMA:**
{problem_statement}

**CÓDIGO CHECKER ATUAL:**
```cpp
{current_checker_code}
```

**ERROS DETECTADOS:**
{failures_text}{compilation_text}

**REGRAS:**
1. Use `registerTestlibCmd(argc, argv)` no início
2. Leia entrada com `inf` stream
3. Leia resposta do juiz com `ans` stream (se disponível)
4. Leia resposta do participante com `ouf` stream
5. Use `quitf(_ok, "msg")` para sucesso
6. Use `quitf(_wa, "msg")` para resposta errada
7. Use `quitf(_pe, "msg")` para erro de formato

Retorne apenas o código corrigido:

```cpp
[CÓDIGO CHECKER CORRIGIDO]
```
"""
        
        try:
            response = await self.gemini_service.generate_content(
                prompt,
                temperature=0.3,
                max_tokens=8000
            )
            
            result = self._parse_checker_response(response)
            logger.info("✅ Checker revisado com sucesso")
            return result
            
        except Exception as e:
            logger.error(f"❌ Erro ao revisar checker: {e}")
            raise
