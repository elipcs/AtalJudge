"""Serviço de templates de prompts para geração de casos de teste"""
from typing import List, Dict, Optional, Any
from app.utils.logger import logger


class PromptTemplateService:
    """
    Serviço centralizado para gerenciar todos os prompts do sistema de geração de casos de teste.
    Baseado no pacote completo de prompts em português para geração totalmente automática.
    """
    
    @staticmethod
    def build_format_inference_prompt(
        statement: str,
        examples: Optional[List[Dict[str, str]]] = None,
        constraints: Optional[str] = None
    ) -> str:
        """
        🟩 PROMPT 1 — INFERÊNCIA DE FORMATO
        Extração semântica avançada baseada em CodeContests+
        """
        
        examples_text = ""
        if examples:
            examples_text = "\n\n**EXEMPLOS FORNECIDOS:**\n"
            for i, ex in enumerate(examples, 1):
                examples_text += f"\nExemplo {i}:\n"
                if ex.get('input'):
                    examples_text += f"Entrada:\n```\n{ex['input']}\n```\n"
                if ex.get('output'):
                    examples_text += f"Saída:\n```\n{ex['output']}\n```\n"
        
        constraints_text = f"\n\n**CONSTRAINTS ADICIONAIS:**\n{constraints}" if constraints else ""
        
        prompt = f"""Você é um especialista em inferência do formato de entrada para problemas de programação competitiva.

Sua tarefa é analisar completamente a afirmação e os exemplos fornecidos e extrair a estrutura total de entrada, incluindo tipos, quantidades, relações e restrições explícitas e implícitas no texto.

Retorne **só JSON válido**.

🔥 **REGRAS CRÍTICAS**

1. **Leia e interprete tudo**
   - Leia todo o enunciado
   - Use os exemplos para validar hipóteses sobre a estrutura

2. **Extrair todas as constraints**
   Incluindo:
   - Limites mínimo e máximo
   - Dependências (por exemplo, "n seguido de n inteiros")
   - Estruturas complexas (grafos, árvores, DAGs, matrizes)
   - Relações semânticas:
     * Grafo deve ser acíclico?
     * Deve estar conectado?
     * A permutação deve ser 1..n?
     * Existem caracteres específicos permitidos?

3. **Detectar tipos estruturais**
   Para cada linha identifique uma das categorias:
   - `integer` (um único inteiro)
   - `two_integers` (dois inteiros na mesma linha)
   - `three_integers` (três inteiros na mesma linha)
   - `array` (n inteiros em uma linha)
   - `string` (uma string)
   - `matrix` (múltiplas linhas de arrays)
   - `edge` (aresta de grafo: dois inteiros)
   - `graph_edges` (múltiplas arestas)

4. **Restrições Especiais em JSON**
   Se for grafo, inclua:
   ```json
   "graph": {{
     "directed": true/false,
     "acyclic": true/false,
     "connected": true/false,
     "is_tree": true/false,
     "num_nodes_var": "n",
     "num_edges_var": "m"
   }}
   ```

5. **Múltiplos casos de teste**
   Marque:
   ```json
   "has_test_count": true,
   "test_count_variable": "t"
   ```

6. **Converta potências**
   - 10^5 → 100000
   - 10^6 → 1000000

**ENUNCIADO DO PROBLEMA:**
{statement}{examples_text}{constraints_text}

🔥 **ESTRUTURA FINAL DE SAÍDA (obrigatória)**

Retorne APENAS o JSON, sem markdown, sem explicações:

{{
  "has_test_count": false,
  "test_count_variable": null,
  "input_structure": {{
    "lines": [
      {{
        "line_number": 1,
        "type": "two_integers",
        "variable_names": ["n", "m"],
        "constraints": {{
          "n": {{"min": 1, "max": 100000}},
          "m": {{"min": 0, "max": 100000}}
        }}
      }}
    ],
    "total_lines": 1,
    "is_variable_length": false
  }},
  "semantic_constraints": {{}},
  "algorithm_type": "default"
}}

**IMPORTANTE:** Retorne APENAS o JSON válido, sem blocos de código markdown (```json), sem explicações adicionais.
"""
        return prompt
    
    @staticmethod
    def build_generator_prompt(
        statement: str,
        examples: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        """
        A — Prompt strict para o Generator
        """
        
        examples_text = ""
        if examples:
            for i, ex in enumerate(examples, 1):
                examples_text += f"\n--- Exemplo {i} ---\n"
                if ex.get('input'):
                    examples_text += f"Entrada:\n{ex['input']}\n"
                if ex.get('output'):
                    examples_text += f"Saída:\n{ex['output']}\n"
        
        prompt = f"""[INSTRUÇÕES IMPORTANTES — LEIA ANTES]

Você é um gerador de casos de teste profissional.  
Gerar APENAS UM ARQUIVO C++ COMPLETO E COMPILÁVEL que usa testlib.h.

LEIA: {statement}
EXEMPLOS DE ENTRADA: {examples_text}

REQUISITOS MANDATÓRIOS (siga à risca):
1) RETORNE APENAS O CÓDIGO-FONTE C++ ENTRE OS MARCADORES:
   <<CODE>>
   ...código C++ completo...
   <<ENDCODE>>
   NADA FORA DESSA FAIXA — sem texto, sem explicações, sem comentários sobre processo.

2) O CÓDIGO DEVE:
   - Ser compilável com: g++ -std=gnu++17 -O2 generator.cpp -o gen
   - Incluir `#include "testlib.h"` e `#include <bits/stdc++.h>`
   - Ter função `int main(int argc, char* argv[])` com `registerGen(argc, argv, 1);`
   - Ler parâmetros via `opt<T>("name", default)`
   - Usar **apenas** `rnd.next()` (testlib) para aleatoriedade
   - Ser determinístico: mesma linha de comando -> mesma saída
   - Evitar self-loops e arestas duplicadas (use set/unordered_set)
   - Para TREE: garantir exatamente m = n-1 e conexidade
   - Para DAG: gerar permutação topológica e só adicionar arestas forward (pos[u] < pos[v])
   - Para undirected simple: assegurar m <= n*(n-1)/2
   - Gerar pelo menos 20 comandos de exemplo (veja formato abaixo)

3) FORMATO DE SAÍDA do generator:
   Primeira linha: "n m" (ou outro formato conforme enunciado) — siga o exemplo do enunciado. Depois as m linhas das arestas.

4) Ao final do código, inclua (EXATAMENTE) uma **lista de comandos** (comentada **apenas** entre /* COMMANDS: ... */ dentro do código) com ~20 execuções, por ex:
   /* COMMANDS:
   ./gen -n 1 -type tree
   ./gen -n 10 -type tree
   ...
   */

5) NÃO explique, não anote, não envie trechos só de função. Somente o bloco <<CODE>>...<<ENDCODE>>.

Parâmetros de geração LLM:
temperature=0.2
max_tokens=8000
top_p=0.8

Agora, gere o gerador C++ completo entre os marcadores. <<CODE>>"""
        return prompt

    @staticmethod
    def build_fallback_generator_prompt(partial_code: str) -> str:
        """
        B — Prompt strict para o Fallback (se o LLM retornar só funções — wrapper automático)
        """
        prompt = f"""O LLM anterior retornou apenas funções auxiliares (sem main()). Sua tarefa é **ENCAPSULAR** o código parcial abaixo em um arquivo C++ completo compilável.

Regras:
1) Insira o trecho {{PARTIAL}} no lugar apropriado.
2) Crie `int main(int argc, char* argv[]) {{ registerGen(argc, argv, 1); /* parse opt() */ /* chame funções auxiliares */ }}`.
3) Garanta uso de `rnd.next()` e que exista tratamento para parâmetros `-n`, `-m`, `-type`.
4) Evite duplicatas (usar unordered_set) e assegure determinismo.
5) Retorne APENAS o arquivo fonte entre <<CODE>> ... <<ENDCODE>> (sem explicações).

<<CODE>>
{partial_code}
"""
        return prompt
    
    @staticmethod
    def build_validator_prompt(
        statement: str,
        examples: Optional[List[Dict[str, str]]] = None,
        constraints: Optional[str] = None,
        format_schema: Optional[Dict[str, Any]] = None,
        oracle_code: Optional[str] = None
    ) -> str:
        """
        Prompt para gerar Validador C++ (Template F)
        """
        examples_text = ""
        if examples:
            examples_text = "\n\n**EXEMPLOS FORNECIDOS (estes são inputs VÁLIDOS que o validador DEVE aceitar):**\n"
            for i, ex in enumerate(examples, 1):
                examples_text += f"\nExemplo {i}:\n"
                if ex.get('input'):
                    input_val = ex['input']
                    examples_text += f"Entrada (texto):\n```\n{input_val}\n```\n"
                    examples_text += f"Entrada (repr): {repr(input_val)}\n"
        
        constraints_text = f"\n\n**CONSTRAINTS:**\n{constraints}" if constraints else ""
        
        prompt = f"""Você é o Validator Agent.
Escreva um validador completo em C++ usando testlib.h.

**PROBLEMA:**
{statement}{examples_text}{constraints_text}

🔥 **REGRAS OBRIGATÓRIAS (Template F)**

1. **Usar testlib.h**
   - `registerValidation(argc, argv);` no início do main
   - Ler tudo com `inf.readInt`, `inf.readLong`, `inf.readToken`, etc.
   - Terminar com `inf.readEof();`

2. **Validar TODAS constraints**
   - Número de vértices/arestas
   - Ranges de valores
   - Ausência de loops/multiarestas (se aplicável)
   - Conexidade/Aciclicidade (se aplicável)

3. **Usar ensuref()**
   Exemplo: `ensuref(x >= 1 && x <= n, "x fora do intervalo [1, n]");`

4. **Testar com exemplos do enunciado**
   - Os exemplos do problema são SEMPRE válidos.

5. **Formato de saída**
   - Após validar tudo: `inf.readEof();` seguido de `return 0;`
   - **NÃO use `quitf(_ok, ...)`**

**EXEMPLO DE ESTRUTURA (Template F):**

```cpp
#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;
using pii = pair<int,int>;

int main(int argc, char* argv[]) {{
    registerValidation(argc, argv);
    
    int n = inf.readInt(1, 100000, "n");
    inf.readEoln();
    
    // Validações...
    
    inf.readEof();
    return 0;
}}
```

**CRÍTICO - Formato de newlines:**
- Se o exemplo termina COM newline (repr mostra '\\n' no final): use `readEoln()` antes de `readEof()`
- Se o exemplo termina SEM newline: use `readEof()` diretamente após ler o último valor

Forneça APENAS o código em um bloco ```cpp, sem explicações.
"""
        return prompt

    @staticmethod
    def build_generator_review_prompt(
        current_code: str,
        error_log: str
    ) -> str:
        """
        C — Prompt de Revisão (quando houver erro de compilação / validação)
        """
        
        prompt = f"""Você é um consertador de geradores. Recebe o gerador C++ abaixo e o log de compilação/validação. Corrija o código e retorne UM arquivo C++ completo, compilável e que passe no validador.

GENERATOR SOURCE:
{current_code}

ERROR LOG:
{error_log}

Regras:
- Corrija erros de compilação e warnings críticos.
- Se houver erros lógicos (ex.: duplicate edges, self-loops, ciclo no DAG), corrija a lógica.
- NÃO adicione explicações. Retorne somente o código entre <<CODE>>...<<ENDCODE>>.
- Preserve parâmetros opt<>() e a lista de /* COMMANDS: */.
<<CODE>>"""
        return prompt
    
    @staticmethod
    def build_validator_review_prompt(
        statement: str,
        current_code: str,
        sample_inputs: List[str],
        validation_outputs: List[str],
        compilation_errors: Optional[str] = None
    ) -> str:
        """
        🟦 PROMPT 5 — REVISÃO DO VALIDADOR
        Supervisão profissional
        """
        
        samples_text = "\n**INPUTS DE TESTE E RESULTADOS:**\n"
        for i, (inp, out) in enumerate(zip(sample_inputs, validation_outputs), 1):
            samples_text += f"\n--- Exemplo {i} ---\n"
            samples_text += f"Input (texto):\n```\n{inp}\n```\n"
            samples_text += f"Input (repr): {repr(inp)}\n"
            samples_text += f"Resultado do validador:\n{out}\n\n"
        
        compilation_text = ""
        if compilation_errors:
            compilation_text = f"\n**ERROS DE COMPILAÇÃO:**\n```\n{compilation_errors}\n```\n"
        
        prompt = f"""Você é o Validator Reviewer Agent.

Sua tarefa é corrigir o validador usando os exemplos oficiais e mensagens de erro.

**PROBLEMA:**
{statement}

**CÓDIGO VALIDADOR ATUAL:**
```cpp
{current_code}
```
{samples_text}{compilation_text}

⚠️ **REGRAS DE CORREÇÃO**

1. **Os exemplos oficiais DEVEM passar SEMPRE**
   - Se um exemplo oficial falhou → validador está errado ou muito restritivo

2. **Verifique retorno de `readEoln()` vs `readEof()`**
   - Se input termina com '\\n' (veja o repr): use `readEoln()` antes de `readEof()`
   - Se input NÃO termina com '\\n': use `readEof()` diretamente

3. **Corrija ranges incorretos**
   - Verifique limites min/max de todas as variáveis

4. **Use sempre `ensuref()` com mensagens claras**
   - Exemplo: `ensuref(n >= 1 && n <= 100000, "n must be in [1, 100000]");`

5. **CRÍTICO - Inicialização do testlib:**
   - **SEMPRE coloque `registerValidation(argc, argv);` no INÍCIO do main()**
   - Sem isso, o validador crashará com segmentation fault

6. **Formato de sucesso:**
   - Após `inf.readEof()`, simplesmente: `return 0;`
   - **NÃO use `quitf(_ok, ...)` - não funciona corretamente em validadores**

7. **Não use métodos inexistentes:**
   - **NÃO use `inf.curLine()` - esse método não existe**
   - Se precisar de número de linha, mantenha um contador manual

**EXEMPLO DE VALIDADOR CORRETO:**

```cpp
#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {{
    registerValidation(argc, argv);
    
    int n = inf.readInt(1, 100000, "n");
    inf.readEoln();
    
    // ... validações ...
    
    inf.readEof();
    return 0;
}}
```

Retorne APENAS o código corrigido:

```cpp
[CÓDIGO VALIDADOR CORRIGIDO]
```
"""
        return prompt
    
    @staticmethod
    def build_checker_prompt(
        statement: str,
        examples: Optional[List[Dict[str, str]]] = None,
        has_multiple_answers: bool = True
    ) -> str:
        """
        🟦 PROMPT 6 (OPCIONAL) — CHECKER AGENT
        Para problemas com múltiplas respostas válidas
        """
        
        examples_text = ""
        if examples:
            examples_text = "\n\n**EXEMPLOS:**\n"
            for i, ex in enumerate(examples, 1):
                examples_text += f"\nExemplo {i}:\n"
                if ex.get('input'):
                    examples_text += f"Input:\n```\n{ex['input']}\n```\n"
                if ex.get('output'):
                    examples_text += f"Output:\n```\n{ex['output']}\n```\n"
        
        prompt = f"""Você é o Checker Agent.

Sua tarefa é analisar o problema e determinar se:
- Existe apenas 1 resposta válida → usar checker padrão (wcmp - word comparison)
- Existem várias respostas válidas → gerar um checker personalizado

**PROBLEMA:**
{statement}{examples_text}

**CHECKLIST para checker personalizado:**

Tipos de problemas que necessitam checker personalizado:
- ✅ Ordenação topológica (qualquer ordem topológica válida)
- ✅ Matching em grafos (qualquer matching máximo)
- ✅ Árvore geradora (qualquer spanning tree válida)
- ✅ Particionamento (várias formas de particionar)
- ✅ Caminhos com mesmo custo (vários caminhos ótimos)
- ❌ Problema com resposta única (valor exato, string específica)

**SE NECESSITAR CHECKER PERSONALIZADO:**

Escreva um checker C++ completo que:

1. **Leia a entrada** (`inf` stream)
2. **Leia a resposta do juiz** (`ans` stream) - se existir
3. **Leia a resposta do competidor** (`ouf` stream)
4. **Verifique validade estrutural:**
   - Ordenação topológica é válida?
   - Matching é válido?
   - Rota é válida?
   - etc.
5. **Ignore espaços extras e quebras de linha**
6. **Retorne resultado:**
   - `quitf(_ok, "message")` se resposta correta
   - `quitf(_wa, "message")` se resposta errada
   - `quitf(_pe, "message")` se erro de formato

**EXEMPLO DE CHECKER (ordenação topológica):**

```cpp
#include "testlib.h"
#include <bits/stdc++.h>
using namespace std;

int main(int argc, char* argv[]) {{
    registerTestlibCmd(argc, argv);
    
    // Ler entrada original
    int n = inf.readInt();
    int m = inf.readInt();
    
    vector<pair<int,int>> edges(m);
    for (int i = 0; i < m; i++) {{
        edges[i].first = inf.readInt();
        edges[i].second = inf.readInt();
    }}
    
    // Ler resposta do participante
    vector<int> order(n);
    for (int i = 0; i < n; i++) {{
        order[i] = ouf.readInt(1, n);
    }}
    
    // Validar se é permutação válida
    set<int> seen(order.begin(), order.end());
    if (seen.size() != n) {{
        quitf(_wa, "Not a valid permutation");
    }}
    
    // Validar ordem topológica
    map<int, int> pos;
    for (int i = 0; i < n; i++) {{
        pos[order[i]] = i;
    }}
    
    for (auto [u, v] : edges) {{
        if (pos[u] >= pos[v]) {{
            quitf(_wa, "Edge %d->%d violates topological order", u, v);
        }}
    }}
    
    quitf(_ok, "Valid topological order");
    return 0;
}}
```

**SE NÃO NECESSITAR CHECKER PERSONALIZADO:**

Retorne simplesmente:
```
CHECKER_TYPE: wcmp
```

Analise o problema e retorne ou o código do checker ou "CHECKER_TYPE: wcmp".
"""
        return prompt


# Logger quando o serviço é importado
logger.info("✅ PromptTemplateService carregado com 6 prompts profissionais")
