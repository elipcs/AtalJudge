"""Serviço de integração com Google Gemini API"""
import asyncio
from google import genai
from google.genai import types
import httpx
import json
from typing import Optional, Dict, Any
from app.config import config
from app.utils.logger import logger


class GeminiService:
    """Serviço para interagir com a API do Google Gemini"""
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.use_vertex_ai = config.USE_VERTEX_AI
        self.vertex_project_id = config.VERTEX_AI_PROJECT_ID
        self.vertex_location = config.VERTEX_AI_LOCATION
        
        # Debug: mostrar configuração lida
        logger.info(f'📋 Configuração Vertex AI:')
        logger.info(f'   USE_VERTEX_AI: {self.use_vertex_ai}')
        logger.info(f'   VERTEX_AI_PROJECT_ID: {self.vertex_project_id or "(não configurado)"}')
        logger.info(f'   VERTEX_AI_LOCATION: {self.vertex_location}')
        
        self.api_key = api_key or config.GEMINI_API_KEY
        self.fallback_api_key = None
        configured_fallback = getattr(config, 'GEMINI_FALLBACK_API_KEY', None)
        if configured_fallback and configured_fallback != self.api_key:
            self.fallback_api_key = configured_fallback
        self.model_name = model or config.GEMINI_MODEL
        
        # Tentar Vertex AI primeiro se configurado
        if self.use_vertex_ai and self.vertex_project_id:
            try:
                logger.info(f'🔄 Tentando inicializar Vertex AI...')
                logger.info(f'   Project: {self.vertex_project_id}')
                logger.info(f'   Location: {self.vertex_location}')
                self.client = genai.Client(
                    vertexai=True,
                    project=self.vertex_project_id,
                    location=self.vertex_location
                )
                logger.info(f'✅ Vertex AI inicializado - Projeto: {self.vertex_project_id}, Região: {self.vertex_location}, Modelo: {self.model_name}')
                logger.info('🚀 Usando Vertex AI (mais estável que Google AI Studio)')
                return
            except Exception as e:
                logger.error(f'❌ Erro ao inicializar Vertex AI: {type(e).__name__}: {str(e)}')
                logger.info('💡 Possíveis causas:')
                logger.info('   - API Vertex AI não habilitada: gcloud services enable aiplatform.googleapis.com')
                logger.info('   - Permissões insuficientes: adicione role "Vertex AI User"')
                logger.info('   - Projeto incorreto: verifique VERTEX_AI_PROJECT_ID')
                logger.info('🔄 Tentando fallback para Google AI Studio...')
        elif self.use_vertex_ai:
            logger.warning('⚠️ USE_VERTEX_AI=true mas VERTEX_AI_PROJECT_ID não configurado')
            logger.info('💡 Configure VERTEX_AI_PROJECT_ID no .env para usar Vertex AI')
        
        # Fallback para Google AI Studio
        if not self.api_key:
            logger.warning('GEMINI_API_KEY não configurada. Funcionalidades do Gemini estarão desabilitadas.')
            self.client = None
        else:
            try:
                # Criar cliente uma vez e reutilizar
                try:
                    self.client = genai.Client(api_key=self.api_key)
                    # Usar o modelo configurado (já validado acima)
                    logger.info(f'Gemini (Google AI Studio) inicializado com modelo: {self.model_name}')
                    logger.info('💡 Dica: Configure Vertex AI para melhor estabilidade (USE_VERTEX_AI=true)')
                except Exception as e:
                    logger.debug(f'Erro ao inicializar cliente Gemini: {e}')
                    self.client = None
                    logger.info('Usando apenas API REST para chamadas do Gemini')
                        
            except Exception as e:
                logger.error(f'Erro ao inicializar Gemini: {e}')
                self.client = None
    
    def is_available(self) -> bool:
        """Verifica se o serviço Gemini está disponível (API key configurada)"""
        return self.api_key is not None and len(self.api_key) > 0
    
    async def infer_input_format(
        self,
        statement: str,
        example_input: Optional[str] = None,
        constraints: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Infere o formato de entrada a partir do enunciado e exemplo
        
        Args:
            statement: Enunciado da questão
            example_input: Exemplo de entrada (opcional)
            constraints: Constraints da questão (opcional)
        
        Returns:
            Esquema estruturado do formato de entrada
        """
        if not self.is_available():
            logger.warning('Gemini não disponível. Retornando esquema padrão.')
            return self._default_schema()
        
        try:
            # Construir prompt para o Gemini
            prompt = self._build_inference_prompt(statement, example_input, constraints)
            
            logger.info('Enviando requisição ao Gemini para inferência de formato...')
            
            # Priorizar Vertex AI SDK se estiver configurado
            if self.use_vertex_ai and self.client:
                try:
                    logger.info('Usando Vertex AI SDK para inferência de formato...')
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            temperature=0.0,  # Temperatura zero para reduzir alucinações
                            top_p=0.8,
                            top_k=20,
                            max_output_tokens=4000
                        )
                    )
                    # Processar resposta do Vertex AI SDK
                    if response and hasattr(response, 'text'):
                        text = response.text.strip()
                        schema = self._parse_gemini_response(text)
                        logger.info('✅ Formato inferido com sucesso usando Vertex AI SDK')
                        logger.info(f'📋 Resposta completa do Gemini (JSON): {json.dumps(schema, indent=2, ensure_ascii=False)}')
                        return schema
                except Exception as e:
                    logger.warning(f'Erro ao usar Vertex AI SDK: {e}')
                    logger.info('Tentando fallback para API REST...')
            
            # Fallback: usar API REST (Google AI Studio ou quando Vertex AI SDK falhar)
            if self.api_key:
                logger.info('Usando API REST do Gemini...')
                rest_result = await self._try_rest_api_async(prompt)
                if rest_result:
                    return rest_result
            
            # Último recurso: tentar SDK do Google AI Studio
            response = None
            if self.client and not self.use_vertex_ai:
                try:
                    logger.info('Tentando SDK do Google AI Studio...')
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=prompt
                    )
                except Exception as e1:
                    logger.debug(f'Tentativa com SDK do Google AI Studio falhou: {e1}')
                    return None
            
            # Se temos resposta do SDK, processar
            if response:
                # Nova API: response.text é um atributo direto
                text = None
                try:
                    if hasattr(response, 'text'):
                        text = response.text.strip()
                    elif hasattr(response, 'candidates') and response.candidates:
                        # Fallback: tentar extrair dos candidates (compatibilidade com API antiga)
                        candidate = response.candidates[0]
                        finish_reason = getattr(candidate, 'finish_reason', None)
                        
                        # Verificar se foi bloqueado
                        if finish_reason in [2, 3, 4]:
                            reason_map = {
                                2: "SAFETY (bloqueado por filtros de segurança)",
                                3: "RECITATION (bloqueado por recitação)",
                                4: "OTHER (outro motivo)"
                            }
                            logger.warning(f'Resposta do Gemini bloqueada: {reason_map.get(finish_reason, f"finish_reason={finish_reason}")}')
                            return None
                        
                        # Extrair texto dos candidates
                        if hasattr(candidate, 'content') and hasattr(candidate.content, 'parts'):
                            parts = candidate.content.parts
                            if parts and hasattr(parts[0], 'text'):
                                text = parts[0].text.strip()
                                logger.info('Texto extraído dos candidates')
                            else:
                                logger.warning('Resposta do Gemini não contém texto válido')
                                return None
                        else:
                            logger.warning('Resposta do Gemini não contém conteúdo válido')
                            return None
                    else:
                        logger.warning('Resposta do Gemini não contém texto ou candidates')
                        return None
                except (ValueError, AttributeError) as e:
                    logger.warning(f'Erro ao acessar resposta do Gemini: {e}')
                    return None
                
                if not text:
                    logger.warning('Resposta do Gemini não contém texto')
                    return None
                
                # Parsear resposta do Gemini (esperado JSON)
                import json
                try:
                    # Tentar extrair JSON da resposta
                    schema = self._parse_gemini_response(text)
                    logger.info('Formato inferido com sucesso pelo Gemini (SDK)')
                    logger.info(f'📋 Resposta completa do Gemini (JSON): {json.dumps(schema, indent=2, ensure_ascii=False)}')
                    return schema
                except (json.JSONDecodeError, ValueError) as e:
                    logger.warning(f'Erro ao parsear resposta do Gemini como JSON: {e}')
                    logger.warning(f'📝 Resposta completa do Gemini (primeiros 1000 chars): {text[:1000]}...')
                    logger.debug(f'Resposta completa do Gemini: {text}')
                    # Tentar inferir estrutura básica da resposta de texto
                    parsed_schema = self._parse_text_response(text, statement, example_input)
                    return parsed_schema
            
            # Se chegou aqui, nenhum método funcionou
            return None
                
        except Exception as e:
            logger.error(f'Erro ao inferir formato com Gemini: {e}')
            logger.debug(f'Detalhes do erro: {str(e)}')
            # Retornar None para que o FormatInferenceService use fallback manual
            return None
    
    def _build_inference_prompt(
        self,
        statement: str,
        example_input: Optional[str],
        constraints: Optional[str]
    ) -> str:
        """Constrói o prompt para inferência de formato com instruções mais específicas para reduzir alucinações"""
        
        # Limitar tamanho do statement para evitar contexto muito longo
        statement_limited = statement[:2000] if len(statement) > 2000 else statement
        
        prompt = f"""Você é um especialista em análise de formatos de entrada para problemas de programação competitiva. Sua tarefa é analisar COMPLETAMENTE o enunciado e exemplo de entrada para extrair TODA a estrutura do input, incluindo todas as dependências, relações e constraints.

OBJETIVO PRINCIPAL:
Extrair a estrutura COMPLETA do input de forma que o código gerador possa criar casos de teste aleatórios válidos apenas seguindo o schema fornecido. Você deve capturar TODAS as informações necessárias.

REGRAS CRÍTICAS:
1. Analise o ENUNCIADO COMPLETO para entender a estrutura do input descrita.
2. Use o EXEMPLO DE ENTRADA para validar e confirmar a estrutura detectada no enunciado.
3. Capture TODAS as dependências entre variáveis (ex: "n seguido de n strings", "t seguido de t casos de teste").
4. Capture TODAS as constraints mencionadas no enunciado (valores mínimos, máximos, tipos, restrições).
5. Se o enunciado menciona múltiplos casos de teste, SEMPRE marque "has_test_count": true.
6. Se uma variável define a quantidade de elementos seguintes, marque as dependências com "depends_on".
7. Retorne APENAS JSON válido, sem explicações, sem markdown, sem texto adicional.
8. Seja COMPLETO e DETALHADO - capture toda a informação necessária.

ENUNCIADO (analise COMPLETAMENTE):
{statement_limited}

"""
        
        if example_input:
            prompt += f"""EXEMPLO DE ENTRADA (use para VALIDAR e CONFIRMAR a estrutura detectada no enunciado):
{example_input}

INSTRUÇÕES PARA O EXEMPLO:
- Conte EXATAMENTE quantas linhas existem
- Identifique o tipo de cada linha (integer, edge, three_integers, string, array)
- Verifique se a primeira linha é um contador (t, n, k, etc.) e quantos elementos seguem
- Confirme se há padrões repetitivos que indicam múltiplos casos de teste
- Valide todas as dependências detectadas no enunciado

"""
        else:
            prompt += """ATENÇÃO: Não há exemplo de entrada fornecido. Baseie-se APENAS no enunciado, mas seja conservador.\n\n"""
        
        if constraints:
            prompt += f"""CONSTRAINTS (use apenas para validar valores, não para inventar formato):
{constraints[:500]}

"""
        
        prompt += """EXEMPLOS DE RESPOSTA ESPERADA:

EXEMPLO 1 - Caso simples:
Enunciado: "Primeira linha contém um inteiro n. Segunda linha contém n inteiros."
Entrada:
```
5
1 2 3 4 5
```

Retorne:
{
  "input_structure": {
    "lines": [
      {"type": "integer", "variable": "n", "description": "Tamanho do array", "constraints": {"min": 1, "max": 100000}},
      {"type": "array", "variable": "arr", "description": "Array de n inteiros", "constraints": {"min": 1, "max": 100000, "depends_on": "n", "size": "n"}}
    ],
    "total_lines": 2
  },
  "constraints": {
    "n": {"min": 1, "max": 100000, "type": "integer"}
  },
  "algorithm_type": "default"
}

EXEMPLO 2 - Múltiplos casos de teste com dependência:
Enunciado: "Primeira linha contém t (número de casos de teste). Cada caso contém: primeira linha é n, segunda linha contém n strings."
Entrada:
```
2
3
abc
def
ghi
2
xy
zw
```

Retorne:
{
  "input_structure": {
    "lines": [
      {"type": "integer", "variable": "t", "description": "Número de casos de teste", "constraints": {"min": 1, "max": 100}},
      {"type": "integer", "variable": "n", "description": "Número de strings no caso", "constraints": {"min": 1, "max": 100}},
      {"type": "string", "variable": "s", "description": "String", "constraints": {"min_length": 1, "max_length": 100, "depends_on": "n"}}
    ],
    "total_lines": 3,
    "has_test_count": true,
    "test_count": "t",
    "test_case_schema": {
      "input_structure": {
        "lines": [
          {"type": "integer", "variable": "n", "description": "Número de strings", "constraints": {"min": 1, "max": 100}},
          {"type": "string", "variable": "s", "description": "String", "constraints": {"min_length": 1, "max_length": 100, "depends_on": "n"}}
        ],
        "total_lines": 2
      }
    }
  },
  "constraints": {
    "t": {"min": 1, "max": 100, "type": "integer"},
    "n": {"min": 1, "max": 100, "type": "integer"}
  },
  "algorithm_type": "default"
}

EXEMPLO 3 - Três inteiros seguidos de arrays dependentes:
Enunciado: "Cada caso contém: primeira linha tem três inteiros a, b, k (1 <= a, b, k <= 2×10^5). Segunda linha tem k inteiros a_i (1 <= a_i <= a). Terceira linha tem k inteiros b_i (1 <= b_i <= b)."
Entrada:
```
3 4 2
1 2
3 4
```

Retorne:
{
  "input_structure": {
    "lines": [
      {"type": "three_integers", "variable": "a_b_k", "description": "Três inteiros a, b, k", "constraints": {"min": 1, "max": 200000, "k_min": 1, "k_max": 200000}},
      {"type": "array", "variable": "arr1", "description": "Primeiro array de k inteiros (boys)", "constraints": {"min": 1, "max": "a", "depends_on": "k", "size": "k"}},
      {"type": "array", "variable": "arr2", "description": "Segundo array de k inteiros (girls)", "constraints": {"min": 1, "max": "b", "depends_on": "k", "size": "k"}}
    ],
    "total_lines": 3
  },
  "constraints": {
    "a": {"min": 1, "max": 200000, "type": "integer"},
    "b": {"min": 1, "max": 200000, "type": "integer"},
    "k": {"min": 1, "max": 200000, "type": "integer"}
  },
  "algorithm_type": "default"
}

EXEMPLO 4 - Strings com caracteres limitados:
Enunciado: "Primeira linha contém n (1 <= n <= 100). Segunda linha contém n strings, cada uma contendo apenas as letras 'B' ou 'G'."
Entrada:
```
3
BGB
GBB
BGG
```

Retorne:
{
  "input_structure": {
    "lines": [
      {"type": "integer", "variable": "n", "description": "Número de strings", "constraints": {"min": 1, "max": 100}},
      {"type": "string", "variable": "s", "description": "String com apenas B ou G", "constraints": {"min_length": 1, "max_length": 100, "depends_on": "n", "allowed_chars": "BG"}}
    ],
    "total_lines": 2,
    "has_test_count": false
  },
  "constraints": {
    "n": {"min": 1, "max": 100, "type": "integer"}
  },
  "algorithm_type": "default"
}

EXEMPLO 5 - Arrays com intervalos específicos:
Enunciado: "Primeira linha contém n (1 <= n <= 10^5). Segunda linha contém n inteiros a_i (-10^9 <= a_i <= 10^9)."
Entrada:
```
5
-1000000000 0 500000000 1000000000 -500000000
```

Retorne:
{
  "input_structure": {
    "lines": [
      {"type": "integer", "variable": "n", "description": "Tamanho do array", "constraints": {"min": 1, "max": 100000}},
      {"type": "array", "variable": "arr", "description": "Array de n inteiros", "constraints": {"min": -1000000000, "max": 1000000000, "depends_on": "n", "size": "n"}}
    ],
    "total_lines": 2
  },
  "constraints": {
    "n": {"min": 1, "max": 100000, "type": "integer"}
  },
  "algorithm_type": "default"
}

TIPOS DE LINHA (use APENAS estes tipos):
- "integer": Linha com UM único inteiro (ex: "5")
- "edge": Linha com EXATAMENTE DOIS inteiros separados por espaço (ex: "5 1")
- "three_integers": Linha com EXATAMENTE TRÊS inteiros separados por espaço (ex: "5 3 2")
- "string": Linha com uma string de texto
- "array": Linha com múltiplos inteiros separados por espaço (ex: "1 2 3 4")

CAMPOS IMPORTANTES NAS CONSTRAINTS (SEJA ESPECÍFICO COM VALORES):

PARA INTEIROS E ARRAYS:
- "min": Valor MÍNIMO EXATO mencionado no enunciado (ex: se diz "1 <= n", use min: 1)
- "max": Valor MÁXIMO EXATO mencionado no enunciado (ex: se diz "n <= 10^5", use max: 100000)
- NÃO use valores genéricos - use os valores ESPECÍFICOS do enunciado
- Se o enunciado diz "valores entre 1 e 10^9", use min: 1, max: 1000000000
- Se o enunciado diz "valores positivos", use min: 1 (não deixe genérico)

PARA STRINGS:
- "min_length": Comprimento mínimo EXATO (se mencionado, senão use 1)
- "max_length": Comprimento máximo EXATO (se mencionado, senão use valor razoável baseado no exemplo)
- "lowercase_only": true APENAS se o enunciado EXPLICITAMENTE diz "apenas letras minúsculas" ou similar
- "allowed_chars": Caracteres ESPECÍFICOS permitidos (ex: se diz "apenas B e G", use "allowed_chars": "BG")
  - Se diz "apenas letras do alfabeto", não use allowed_chars (deixe genérico)
  - Se diz "apenas certos caracteres", liste EXATAMENTE esses caracteres
- "uppercase_only": true se mencionar apenas letras maiúsculas
- "digits_only": true se mencionar apenas dígitos
- "alphanumeric": true se mencionar letras e números

PARA DEPENDÊNCIAS:
- "depends_on": Nome da variável da qual esta linha depende (ex: "depends_on": "n" significa que há n elementos desta linha)
- "size": Tamanho fixo ou variável do array/string (ex: "size": "n" significa array de tamanho n)

PARA THREE_INTEGERS:
- "k_min", "k_max": Valores min/max ESPECÍFICOS para o terceiro inteiro (k) se mencionados separadamente
- Se k tem constraints diferentes de a e b, SEMPRE especifique k_min e k_max

IMPORTANTE: NUNCA deixe constraints vazias ou genéricas se o enunciado fornece informações específicas!

DETECÇÃO OBRIGATÓRIA DE PADRÕES:

1. MÚLTIPLOS CASOS DE TESTE:
   - Se o enunciado menciona "t casos de teste", "t test cases", "primeira linha contém t", etc.
   - Se o exemplo mostra primeira linha com número único seguido de múltiplas linhas
   - SEMPRE defina: "has_test_count": true, "test_count": "t" (ou variável apropriada)
   - Crie "test_case_schema" com o schema de um caso individual

2. DEPENDÊNCIAS DE TAMANHO:
   - Se o enunciado diz "n seguido de n inteiros/strings/arrays"
   - Se o enunciado diz "k arrays de tamanho k"
   - SEMPRE adicione "depends_on": "nome_variavel" nas constraints das linhas dependentes
   - Adicione "size": "nome_variavel" se o tamanho é fixo

3. CONSTRAINTS DO ENUNCIADO (SEJA ESPECÍFICO):
   - Extraia TODOS os valores min/max mencionados EXATAMENTE como aparecem (ex: "1 <= n <= 10^5" → min: 1, max: 100000)
   - Para notação exponencial (10^5, 10**5, 2×10^5), converta para número real (100000, 200000)
   - Extraia TODAS as restrições de caracteres para strings:
     * "apenas letras minúsculas" → lowercase_only: true
     * "apenas B e G" → allowed_chars: "BG"
     * "apenas dígitos" → digits_only: true
     * "letras e números" → alphanumeric: true
   - Para arrays, se menciona "valores entre X e Y", use min: X, max: Y
   - Para strings, se menciona "comprimento entre X e Y", use min_length: X, max_length: Y
   - NÃO use valores genéricos - use os valores ESPECÍFICOS do enunciado

4. PADRÕES ESPECÍFICOS:
   - "three_integers" seguido de arrays: se k define tamanho dos arrays, marque "depends_on": "k" e "size": "k"
   - Arrays de boys/girls: se a e b definem limites, use "min": 1, "max": "a" ou "max": "b"
   - Strings repetidas: se há n strings, marque cada uma com "depends_on": "n"

INSTRUÇÕES DETALHADAS:

1. LEIA O ENUNCIADO COMPLETO primeiro para entender toda a estrutura descrita.

2. ANALISE O EXEMPLO DE ENTRADA linha por linha para confirmar a estrutura.

3. CAPTURE TODAS AS DEPENDÊNCIAS:
   - Se variável X define quantidade de elementos Y, marque Y com "depends_on": "X"
   - Se array tem tamanho fixo definido por variável, marque com "size": "nome_variavel"

4. EXTRAIA TODAS AS CONSTRAINTS COM VALORES ESPECÍFICOS:
   - Valores min/max EXATOS de cada variável mencionada no enunciado
     * Procure por padrões como "1 <= n <= 10^5", "n entre 1 e 100", "valores de 1 a 10^9"
     * Converta notação exponencial (10^5 = 100000, 2×10^5 = 200000)
     * Se diz "valores positivos", use min: 1
     * Se diz "valores não negativos", use min: 0
   - Restrições de caracteres ESPECÍFICAS para strings:
     * "apenas letras minúsculas do alfabeto latino" → lowercase_only: true
     * "apenas B e G" → allowed_chars: "BG"
     * "apenas letras maiúsculas" → uppercase_only: true
     * "apenas dígitos" → digits_only: true
     * "letras e números" → alphanumeric: true
   - Limites de tamanho ESPECÍFICOS:
     * Para arrays: se menciona tamanho, use size ou constraints apropriadas
     * Para strings: se menciona comprimento, use min_length e max_length específicos
   - NUNCA deixe genérico se o enunciado fornece valores específicos

5. IDENTIFIQUE MÚLTIPLOS CASOS DE TESTE:
   - Se detectar, SEMPRE crie "test_case_schema" com estrutura do caso individual
   - Marque "has_test_count": true e "test_count" com nome da variável

6. SEJA ESPECÍFICO E COMPLETO COM VALORES EXATOS:
   - Não deixe campos vazios se a informação está no enunciado
   - Use valores EXATOS mencionados no enunciado, não valores genéricos
   - Se o enunciado diz "1 <= n <= 10^5", use min: 1, max: 100000 (não use 1 a 1000000)
   - Se o enunciado diz "apenas B e G", use allowed_chars: "BG" (não apenas "string")
   - Se o enunciado diz "valores entre 1 e 10^9", use min: 1, max: 1000000000
   - Capture todas as relações entre variáveis
   - Para strings, especifique EXATAMENTE quais caracteres são permitidos se mencionado
   - Para arrays, especifique EXATAMENTE os intervalos de valores se mencionado

7. VALIDE CONTRA O EXEMPLO:
   - O schema gerado deve ser capaz de descrever completamente o exemplo fornecido
   - Todas as linhas do exemplo devem ter correspondência no schema

Retorne APENAS o JSON válido, sem markdown, sem ```json, sem explicações. Seja COMPLETO e DETALHADO."""
        
        return prompt
    
    def _parse_gemini_response(self, text: str) -> Dict[str, Any]:
        """Parseia a resposta do Gemini extraindo JSON com validação rigorosa"""
        import json
        import re
        
        # Limpar texto: remover markdown code blocks se existirem
        text = re.sub(r'```json\s*', '', text)
        text = re.sub(r'```\s*', '', text)
        text = text.strip()
        
        # Método 1: Tentar parsear o texto completo diretamente
        try:
            schema = json.loads(text)
            if isinstance(schema, dict) and "input_structure" in schema:
                logger.debug('JSON parseado diretamente do texto completo')
                return schema
        except json.JSONDecodeError:
            pass
        
        # Método 2: Extrair JSON usando contagem de chaves balanceadas (mais robusto)
        def extract_json_balanced(text: str) -> Optional[str]:
            """Extrai JSON balanceado do texto"""
            start = text.find('{')
            if start == -1:
                return None
            
            depth = 0
            in_string = False
            escape_next = False
            
            for i in range(start, len(text)):
                char = text[i]
                
                if escape_next:
                    escape_next = False
                    continue
                
                if char == '\\':
                    escape_next = True
                    continue
                
                if char == '"' and not escape_next:
                    in_string = not in_string
                    continue
                
                if not in_string:
                    if char == '{':
                        depth += 1
                    elif char == '}':
                        depth -= 1
                        if depth == 0:
                            return text[start:i+1]
            
            return None
        
        json_str = extract_json_balanced(text)
        if json_str:
            try:
                schema = json.loads(json_str)
                # Validar estrutura básica
                if not isinstance(schema, dict):
                    raise ValueError('Resposta não é um objeto JSON')
                if "input_structure" not in schema:
                    raise ValueError('Resposta não contém "input_structure"')
                logger.debug('JSON extraído usando contagem de chaves balanceadas')
                return schema
            except json.JSONDecodeError as e:
                logger.warning(f'Erro ao parsear JSON extraído: {e}')
                logger.warning(f'📝 JSON extraído (primeiros 500 chars): {json_str[:500]}...')
                logger.debug(f'JSON extraído completo: {json_str}')
        
        # Método 3: Tentar regex simples como último recurso
        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', text, re.DOTALL)
        if json_match:
            json_str = json_match.group(0)
            try:
                schema = json.loads(json_str)
                if isinstance(schema, dict) and "input_structure" in schema:
                    logger.debug('JSON extraído usando regex simples')
                    return schema
            except json.JSONDecodeError:
                pass
        
        # Se não encontrar JSON válido, lançar erro
        logger.warning(f'❌ JSON válido não encontrado na resposta do Gemini')
        logger.warning(f'📝 Texto recebido (primeiros 1000 chars): {text[:1000]}...')
        raise ValueError(f'JSON válido não encontrado na resposta do Gemini. Texto recebido: {text[:200]}...')
    
    def _parse_text_response(
        self,
        text: str,
        statement: str,
        example_input: Optional[str]
    ) -> Dict[str, Any]:
        """Parseia resposta de texto quando JSON não está disponível"""
        # Análise básica baseada em padrões comuns
        schema = {
            "input_structure": {
                "lines": [],
                "total_lines": 1
            },
            "constraints": {},
            "algorithm_type": "default"
        }
        
        # Detectar se deve usar apenas 'B' e 'G' no statement
        statement_lower = statement.lower() if statement else ""
        has_b_g_pattern = (
            ('b' in statement_lower and 'g' in statement_lower) and
            (
                'boy' in statement_lower or 'girl' in statement_lower or
                'menino' in statement_lower or 'menina' in statement_lower or
                'meninos' in statement_lower or 'meninas' in statement_lower
            )
        )
        explicit_bg_pattern = (
            'apenas' in statement_lower and 
            ('b' in statement_lower or 'g' in statement_lower) and
            ('g' in statement_lower or 'b' in statement_lower) and
            ('letra' in statement_lower or 'caractere' in statement_lower or 'letter' in statement_lower or 'character' in statement_lower)
        )
        should_use_bg_only = has_b_g_pattern or explicit_bg_pattern
        
        # Se há exemplo de entrada, tentar analisar
        if example_input:
            lines = example_input.strip().split('\n')
            schema["input_structure"]["total_lines"] = len(lines)
            
            for i, line in enumerate(lines):
                line = line.strip()
                if line.isdigit():
                    schema["input_structure"]["lines"].append({
                        "type": "integer",
                        "variable": f"n{i+1}",
                        "description": f"Linha {i+1}",
                        "constraints": {}
                    })
                elif line:
                    # Tentar detectar array
                    if ' ' in line:
                        schema["input_structure"]["lines"].append({
                            "type": "array",
                            "variable": f"arr{i+1}",
                            "description": f"Linha {i+1}",
                            "constraints": {}
                        })
                    else:
                        # É uma string
                        constraints = {}
                        # Se detectou padrão B/G, adicionar allowed_chars
                        if should_use_bg_only:
                            constraints["allowed_chars"] = "BG"
                            logger.info(f'Fallback manual: Detectado allowed_chars="BG" para linha {i+1} (string)')
                        
                        schema["input_structure"]["lines"].append({
                            "type": "string",
                            "variable": f"s{i+1}",
                            "description": f"Linha {i+1}",
                            "constraints": constraints
                        })
        
        return schema
    
    async def _try_rest_api_async(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Tenta usar a API REST diretamente (versão async)"""
        try:
            if not self.api_key:
                logger.warning('API key não disponível para API REST')
                return None
            
            # Tentar primeiro com v1 (mais recente), depois v1beta como fallback
            api_versions = ["v1", "v1beta"]
            
            headers = {
                "Content-Type": "application/json",
            }
            params = {
                "key": self.api_key
            }
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": 0.0,  # Temperatura zero para reduzir alucinações
                    "topP": 0.8,  # Reduzido para ser mais determinístico
                    "topK": 20,  # Reduzido para ser mais focado
                    "maxOutputTokens": 4000  # Aumentado para evitar truncamento
                }
            }
            
            # Timeout aumentado para 180 segundos para permitir geração de código complexo
            async with httpx.AsyncClient(timeout=180.0) as client:
                for api_version in api_versions:
                    try:
                        url = f"https://generativelanguage.googleapis.com/{api_version}/models/{self.model_name}:generateContent"
                        
                        logger.debug(f'Tentando API REST {api_version} com modelo {self.model_name}')
                        response = await client.post(url, headers=headers, params=params, json=payload)
                        
                        if response.status_code == 404:
                            logger.debug(f'Modelo {self.model_name} não encontrado na API {api_version}, tentando próximo...')
                            continue
                        
                        response.raise_for_status()
                        data = response.json()
                        
                        # Extrair texto da resposta
                        if "candidates" in data and len(data["candidates"]) > 0:
                            candidate = data["candidates"][0]
                            if "content" in candidate and "parts" in candidate["content"]:
                                parts = candidate["content"]["parts"]
                                if len(parts) > 0 and "text" in parts[0]:
                                    text = parts[0]["text"].strip()
                                    
                                    # Parsear resposta
                                    try:
                                        schema = self._parse_gemini_response(text)
                                        logger.info(f'✅ Formato inferido com sucesso usando API REST ({api_version})')
                                        logger.info(f'📋 Resposta completa do Gemini (JSON): {json.dumps(schema, indent=2, ensure_ascii=False)}')
                                        return schema
                                    except (json.JSONDecodeError, ValueError) as e:
                                        logger.warning(f'Erro ao parsear resposta da API REST: {e}')
                                        logger.warning(f'📝 Resposta completa do Gemini (primeiros 1000 chars): {text[:1000]}...')
                                        logger.debug(f'Resposta recebida (completa): {text}')
                                        continue
                        
                        logger.warning(f'Resposta da API REST ({api_version}) não contém texto válido')
                        continue
                        
                    except httpx.HTTPStatusError as e:
                        if e.response.status_code == 404:
                            logger.debug(f'API {api_version} não disponível para modelo {self.model_name}, tentando próxima versão...')
                            continue
                        else:
                            error_detail = e.response.text[:200] if e.response.text else str(e)
                            logger.warning(f'Erro HTTP {e.response.status_code} ao usar API REST ({api_version}): {error_detail}')
                            continue
                    except Exception as e:
                        logger.debug(f'Erro ao usar API REST ({api_version}): {e}, tentando próxima versão...')
                        continue
            
            # Se chegou aqui, nenhuma versão da API funcionou
            logger.warning('Nenhuma versão da API REST funcionou')
            return None
                
        except Exception as e:
            logger.error(f'Erro ao usar API REST do Gemini: {e}')
            return None
    
    def _try_rest_api(self, prompt: str) -> Optional[Dict[str, Any]]:
        """Versão síncrona para compatibilidade (deprecated, usar _try_rest_api_async)"""
        import asyncio
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
        return loop.run_until_complete(self._try_rest_api_async(prompt))
    
    async def generate_content(
        self,
        prompt: str,
        temperature: float = 0.3,
        max_tokens: int = 8000
    ) -> str:
        """
        Gera conteúdo usando Gemini (método genérico)
        
        Args:
            prompt: Prompt para o LLM
            temperature: Temperatura (0.0-1.0)
            max_tokens: Número máximo de tokens
        
        Returns:
            Texto gerado pelo LLM
        """
        try:
            # Priorizar Vertex AI SDK se estiver configurado
            if self.use_vertex_ai and self.client:
                try:
                    logger.info(f'🚀 Usando Vertex AI SDK para geração de conteúdo (modelo: {self.model_name})')
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=prompt,
                        config=types.GenerateContentConfig(
                            temperature=temperature,
                            top_p=0.8,
                            top_k=20,
                            max_output_tokens=max_tokens
                        )
                    )
                    
                    if response and hasattr(response, 'text'):
                        text = response.text.strip()
                        logger.debug(f'✅ Conteúdo gerado com sucesso usando Vertex AI SDK')
                        return text
                    else:
                        raise ValueError("Resposta do Vertex AI não contém texto válido")
                        
                except Exception as e:
                    logger.warning(f'⚠️ Erro ao usar Vertex AI SDK: {e}')
                    logger.info('Tentando fallback para API REST...')
            
            # Fallback: usar API REST (Google AI Studio ou quando Vertex AI SDK falhar)
            if not self.api_key:
                raise ValueError("GEMINI_API_KEY não configurada e Vertex AI SDK falhou")
            
            logger.info('Usando API REST do Gemini (Google AI Studio)')
            
            headers = {
                "Content-Type": "application/json",
            }
            api_keys = [self.api_key] if self.api_key else []
            if self.fallback_api_key:
                api_keys.append(self.fallback_api_key)
            if not api_keys:
                raise ValueError("Nenhuma chave da API Gemini disponível")
            payload = {
                "contents": [{
                    "parts": [{
                        "text": prompt
                    }]
                }],
                "generationConfig": {
                    "temperature": temperature,
                    "topP": 0.8,
                    "topK": 20,
                    "maxOutputTokens": max_tokens
                }
            }
            
            # Timeout aumentado para 180 segundos (3 minutos) para permitir geração de código complexo
            async with httpx.AsyncClient(timeout=180.0) as client:
                last_error: Optional[Exception] = None
                for key_index, current_key in enumerate(api_keys):
                    key_label = "principal" if key_index == 0 else "alternativa"
                    logger.info(f'Uso da chave {key_label} do Gemini')
                    params = {"key": current_key}
                    exhausted_due_to_429 = False
                    
                    for api_version in ["v1", "v1beta"]:
                        max_retries = 5
                        retry_delay = 2  # segundos
                        
                        for attempt in range(max_retries):
                            try:
                                url = f"https://generativelanguage.googleapis.com/{api_version}/models/{self.model_name}:generateContent"
                                response = await client.post(url, headers=headers, params=params, json=payload)
                                
                                if response.status_code == 404:
                                    logger.debug(f'API {api_version} não disponível para modelo {self.model_name}, tentando próxima versão...')
                                    break
                                
                                if response.status_code == 429:
                                    logger.warning(f'Erro HTTP 429 (Too Many Requests) com chave {key_label} usando API REST ({api_version}).')
                                    exhausted_due_to_429 = True
                                    break
                                
                                if response.status_code == 503:
                                    logger.warning(f'Erro HTTP 503 (Service Unavailable) ao usar API REST ({api_version}), tentativa {attempt + 1}/{max_retries}. Aguardando {retry_delay}s...')
                                    if attempt < max_retries - 1:
                                        await asyncio.sleep(retry_delay)
                                        retry_delay = min(retry_delay * 2, 30)
                                        continue
                                    break
                                
                                response.raise_for_status()
                                data = response.json()
                                
                                if "candidates" in data and len(data["candidates"]) > 0:
                                    candidate = data["candidates"][0]
                                    if "content" in candidate and "parts" in candidate["content"]:
                                        parts = candidate["content"]["parts"]
                                        if len(parts) > 0 and "text" in parts[0]:
                                            text = parts[0]["text"].strip()
                                            logger.debug(f'Conteúdo gerado com sucesso usando API REST ({api_version})')
                                            return text
                                
                                logger.warning(f'Resposta da API REST ({api_version}) não contém texto válido')
                                break
                            
                            except httpx.HTTPStatusError as e:
                                status = e.response.status_code
                                if status == 404:
                                    logger.debug(f'API {api_version} retornou 404, tentando próxima versão...')
                                    break
                                if status == 429:
                                    logger.warning(f'Erro HTTP 429 (Too Many Requests) com chave {key_label} ao usar API REST ({api_version}).')
                                    exhausted_due_to_429 = True
                                    break
                                if status == 503 and attempt < max_retries - 1:
                                    logger.warning(f'Erro HTTP 503 (Service Unavailable) ao usar API REST ({api_version}), tentativa {attempt + 1}/{max_retries}. Aguardando {retry_delay}s...')
                                    await asyncio.sleep(retry_delay)
                                    retry_delay = min(retry_delay * 2, 30)
                                    continue
                                logger.warning(f'Erro HTTP {status} ao usar API REST ({api_version}): {e}')
                                last_error = e
                                break
                            except Exception as e:
                                logger.debug(f'Erro ao usar API REST ({api_version}): {e}')
                                last_error = e
                                break
                        
                        if exhausted_due_to_429:
                            break
                    
                    if exhausted_due_to_429:
                        if key_index == len(api_keys) - 1:
                            raise ValueError("Todas as chaves do Gemini devolveram 429 (limite atingido)")
                        logger.info('Tentando chave alternativa do Gemini após erro 429 na chave atual (aguardando 5s)')
                        await asyncio.sleep(5)
                        continue
                
                if last_error:
                    raise last_error
                raise ValueError("Nenhuma versão da API REST funcionou após todas as tentativas")
                
        except Exception as e:
            logger.error(f'Erro ao gerar conteúdo com Gemini: {e}')
            raise
    
    def _default_schema(self) -> Dict[str, Any]:
        """Retorna esquema padrão quando Gemini não está disponível"""
        return {
            "input_structure": {
                "lines": [
                    {
                        "type": "integer",
                        "variable": "n",
                        "description": "Primeira linha - número de elementos",
                        "constraints": {
                            "min": 1,
                            "max": 100000
                        }
                    }
                ],
                "total_lines": 1
            },
            "constraints": {
                "n": {
                    "min": 1,
                    "max": 100000,
                    "type": "integer"
                }
            },
            "algorithm_type": "default"
        }




