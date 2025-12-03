"""Serviço de inferência de formato de entrada usando LLM"""
import json
import re
from typing import List, Dict, Optional, Any
from pydantic import ValidationError

from app.services.gemini_service import GeminiService
from app.services.prompt_template_service import PromptTemplateService
from app.models.format_schema import FormatSchema
from app.utils.logger import logger


class InputFormatInferenceService:
    """
    Serviço dedicado para inferência automática do formato de entrada.
    Usa LLM para extrair estrutura semântica e constraints do problema.
    """
    
    def __init__(self, gemini_service: Optional[GeminiService] = None):
        self.gemini_service = gemini_service or GeminiService()
        self.prompt_service = PromptTemplateService()
    
    async def infer_format(
        self,
        statement: str,
        examples: Optional[List[Dict[str, str]]] = None,
        constraints: Optional[str] = None
    ) -> FormatSchema:
        """
        Infere o formato de entrada a partir do enunciado e exemplos.
        
        Args:
            statement: Enunciado do problema
            examples: Lista de exemplos com 'input' e 'output'
            constraints: Constraints adicionais do problema
        
        Returns:
            FormatSchema validado com estrutura completa
        
        Raises:
            ValueError: Se não conseguir inferir o formato
        """
        logger.info("🔍 Iniciando inferência de formato de entrada...")
        
        # Construir prompt usando template
        prompt = self.prompt_service.build_format_inference_prompt(
            statement=statement,
            examples=examples,
            constraints=constraints
        )
        
        # Chamar LLM para gerar JSON estruturado
        try:
            response_text = await self.gemini_service.generate_content(
                prompt=prompt,
                temperature=0.2,  # Baixa temperatura para saída mais determinística
                max_tokens=4000
            )
            
            logger.debug(f"Resposta LLM (primeiros 500 chars): {response_text[:500]}")
            
            # Parsear JSON da resposta
            schema_dict = self._parse_json_response(response_text)
            
            # Validar com Pydantic
            format_schema = FormatSchema(**schema_dict)
            
            logger.info("✅ Formato inferido com sucesso")
            self._log_schema_summary(format_schema)
            
            return format_schema
            
        except Exception as e:
            logger.error(f"❌ Erro ao inferir formato: {e}")
            logger.warning("Usando fallback: formato básico padrão")
            return self._fallback_schema()
    
    def _parse_json_response(self, response_text: str) -> Dict[str, Any]:
        """
        Extrai e parseia JSON da resposta do LLM.
        Tenta múltiplas estratégias para lidar com diferentes formatos.
        """
        # Estratégia 1: JSON direto (sem markdown)
        try:
            return json.loads(response_text.strip())
        except json.JSONDecodeError:
            pass
        
        # Estratégia 2: JSON dentro de bloco de código ```json
        json_block_match = re.search(r'```json\s*\n(.*?)\n```', response_text, re.DOTALL)
        if json_block_match:
            try:
                return json.loads(json_block_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Estratégia 3: JSON dentro de qualquer bloco ```
        code_block_match = re.search(r'```\s*\n(.*?)\n```', response_text, re.DOTALL)
        if code_block_match:
            try:
                return json.loads(code_block_match.group(1))
            except json.JSONDecodeError:
                pass
        
        # Estratégia 4: Procurar por { ... } balanceado
        json_str = self._extract_balanced_json(response_text)
        if json_str:
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                pass
        
        # Se todas as estratégias falharem
        logger.error(f"Não foi possível extrair JSON válido da resposta")
        logger.debug(f"Resposta completa: {response_text}")
        raise ValueError("LLM não retornou JSON válido para inferência de formato")
    
    def _extract_balanced_json(self, text: str) -> Optional[str]:
        """
        Extrai o primeiro JSON balanceado do texto.
        Procura por { e conta chaves até fechar.
        """
        start_idx = text.find('{')
        if start_idx == -1:
            return None
        
        brace_count = 0
        in_string = False
        escape_next = False
        
        for i in range(start_idx, len(text)):
            char = text[i]
            
            # Lidar com strings (ignorar chaves dentro de strings)
            if char == '"' and not escape_next:
                in_string = not in_string
            
            if char == '\\' and in_string:
                escape_next = not escape_next
            else:
                escape_next = False
            
            # Contar chaves apenas fora de strings
            if not in_string:
                if char == '{':
                    brace_count += 1
                elif char == '}':
                    brace_count -= 1
                    
                    # Quando fechar o JSON principal
                    if brace_count == 0:
                        return text[start_idx:i+1]
        
        return None
    
    def _fallback_schema(self) -> FormatSchema:
        """
        Retorna um schema básico padrão quando a inferência falha.
        """
        logger.warning("⚠️ Usando schema de fallback básico")
        return FormatSchema(
            has_test_count=False,
            test_count_variable=None,
            input_structure={
                "lines": [
                    {
                        "line_number": 1,
                        "type": "integer",
                        "variable_names": ["n"],
                        "constraints": {"n": {"min": 1, "max": 100000}}
                    }
                ],
                "total_lines": 1,
                "is_variable_length": False
            },
            semantic_constraints={},
            algorithm_type="default"
        )
    
    def _log_schema_summary(self, schema: FormatSchema):
        """Log resumo do schema inferido"""
        logger.info(f"📊 Schema inferido:")
        logger.info(f"  - Múltiplos casos de teste: {schema.has_test_count}")
        if schema.has_test_count:
            logger.info(f"  - Variável de contagem: {schema.test_count_variable}")
        logger.info(f"  - Número de linhas: {schema.input_structure.total_lines}")
        logger.info(f"  - Linhas com comprimento variável: {schema.input_structure.is_variable_length}")
        
        # Log de constraints semânticas
        if schema.has_graph:
            graph = schema.graph_constraints
            logger.info(f"  - 📈 GRAFO detectado:")
            logger.info(f"    - Direcionado: {graph.directed}")
            logger.info(f"    - Acíclico (DAG): {graph.acyclic}")
            logger.info(f"    - Conexo: {graph.connected}")
            logger.info(f"    - É árvore: {graph.is_tree}")
            logger.info(f"    - Var. nós: {graph.num_nodes_var}, arestas: {graph.num_edges_var}")
        
        if schema.has_permutation:
            perm = schema.permutation_constraints
            logger.info(f"  - 🔢 PERMUTAÇÃO detectada:")
            logger.info(f"    - Range: {perm.range_start}..{perm.range_var}")
        
        logger.info(f"  - Tipo de algoritmo: {schema.algorithm_type}")
