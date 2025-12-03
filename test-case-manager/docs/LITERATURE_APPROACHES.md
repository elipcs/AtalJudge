# Abordagens da Literatura para Geração de Casos de Teste

## Índice

1. [Introdução](#introdução)
2. [Abordagens Implementadas no Projeto](#abordagens-implementadas-no-projeto)
3. [Abordagens Disponíveis na Literatura](#abordagens-disponíveis-na-literatura)
4. [Comparação e Recomendações](#comparação-e-recomendações)
5. [Referências Bibliográficas](#referências-bibliográficas)

---

## Introdução

Este documento apresenta as principais abordagens acadêmicas e práticas para geração de casos de teste, com foco especial em sua aplicação ao contexto de **programação competitiva** e **judges online**.

### Contexto do Projeto

O **AtalJudge Test Case Generator** é um microsserviço que automatiza a geração de casos de teste para problemas de programação competitiva. O sistema integra-se com o AtalJudge via API REST e utiliza técnicas de inferência de formato (Google Gemini) combinadas com estratégias de geração inteligente de casos de teste.

### Importância das Abordagens

Diferentes abordagens da literatura oferecem diversas vantagens:

- **Cobertura**: Garantir que diferentes partes do código sejam testadas
- **Eficiência**: Reduzir o número de casos de teste mantendo alta qualidade
- **Robustez**: Detectar bugs que casos simples não encontram
- **Sistematicidade**: Aplicar técnicas comprovadas em vez de geração ad-hoc

### Organização do Documento

Este documento está organizado em:
1. **Abordagens Implementadas**: Técnicas já presentes no código atual
2. **Abordagens da Literatura**: Descrições detalhadas de técnicas acadêmicas
3. **Comparação e Recomendações**: Guia para escolher a melhor abordagem
4. **Referências**: Fontes acadêmicas e práticas para aprofundamento

---

## Abordagens Implementadas no Projeto

O projeto atual já implementa parcialmente várias técnicas importantes da literatura. Esta seção documenta o que já está funcionando.

### 1. Boundary Value Analysis (BVA) - Implementado Parcialmente

**Status**: ✅ **Parcialmente Implementado**

**Localização no Código**: `app/services/test_case_generator.py`

**Implementação Atual**:
- Geração de valores mínimos (`min_val`)
- Geração de valores máximos (`max_val`)
- Valores próximos aos limites (70% a 100% do range para alta complexidade)
- Casos edge para arrays (valores mínimos/máximos em todos os elementos)

**Exemplo de Uso**:
```python
# Em _generate_integer_by_complexity
if complexity == "low":
    # Inclui valores mínimos
    return min_val
elif complexity == "high":
    # Inclui valores máximos
    return max_val
```

**O que Falta**:
- Geração sistemática de valores adjacentes aos limites (min+1, max-1)
- Combinação de múltiplos parâmetros em seus limites simultaneamente
- Detecção automática de todas as fronteiras (não apenas min/max)

### 2. Random Testing - Implementado

**Status**: ✅ **Implementado**

**Localização no Código**: `app/services/test_case_generator.py`, métodos `_generate_random_*`

**Implementação Atual**:
- Geração aleatória de inteiros, arrays e strings dentro dos constraints
- Validação das entradas geradas antes de retornar
- Distribuição uniforme de valores aleatórios

**Exemplo de Uso**:
```python
def _generate_random_integer(self, constraints: Dict[str, Any]) -> int:
    min_val = constraints.get("min", 1)
    max_val = constraints.get("max", 100000)
    return random.randint(min_val, max_val)
```

**Características**:
- Útil para descobrir casos não previstos
- Complementa casos sistemáticos
- Pode ser ineficiente sem otimização

### 3. Complexidade Crescente - Implementado

**Status**: ✅ **Implementado**

**Localização no Código**: `app/services/test_case_generator.py`, método `generate()`

**Implementação Atual**:
- Distribuição de casos por níveis de complexidade:
  - **30% baixa**: Valores pequenos, edge cases simples
  - **40% média**: Valores médios, aleatórios
  - **30% alta**: Valores próximos dos constraints máximos

**Estratégia**:
```python
# Primeiros 30%: Complexidade baixa
low_count = max(1, int(count * 0.3))
# Meio 40%: Complexidade média
medium_count = max(1, int(count * 0.4))
# Últimos 30%: Complexidade alta
high_count = count - low_count - medium_count
```

**Vantagens**:
- Garante progressão de casos simples para complexos
- Facilita debugging (casos simples primeiro)
- Melhora cobertura gradualmente

### 4. Geração Especializada por Tipo - Implementado

**Status**: ✅ **Implementado**

**Localização no Código**:
- `app/services/graph_generator.py` - Grafos e árvores
- `app/services/matrix_generator.py` - Matrizes
- `app/services/multiple_test_case_generator.py` - Múltiplos casos

**Tipos de Grafos Gerados**:
- Árvores (árvore geradora)
- Caminhos lineares
- Grafos estrela
- Grafos completos
- Grafos esparsos
- Grafos aleatórios

**Tipos de Matrizes Geradas**:
- Matrizes mínimas (1x1)
- Matrizes quadradas
- Matrizes de zeros/uns
- Matrizes com valores mínimos/máximos
- Matrizes aleatórias

**Vantagens**:
- Gera estruturas de dados válidas e significativas
- Testa algoritmos específicos de forma eficiente
- Respeita propriedades estruturais (ex: árvores têm n-1 arestas)

### 5. Validação de Constraints - Implementado

**Status**: ✅ **Implementado**

**Localização no Código**: `app/services/input_validator.py`

**Implementação Atual**:
- Validação de tipos (integer, array, string)
- Validação de ranges (min/max)
- Validação de tamanhos
- Validação de formatos especiais (lowercase_only, etc)

**Características**:
- Garante que casos gerados estão dentro dos constraints do problema
- Rejeita casos inválidos antes de executar o código
- Reduz desperdício de recursos computacionais

---

## Abordagens Disponíveis na Literatura

Esta seção apresenta abordagens da literatura que podem ser aplicadas ao projeto, incluindo aquelas ainda não implementadas.

### 1. Boundary Value Analysis (BVA)

**Definição**: Técnica de teste de caixa-preta que foca nos valores nos limites (fronteiras) das partições de equivalência. O princípio é que muitos erros ocorrem nos limites das classes de equivalência.

**Teoria**:
- Para um range [a, b], testar: a-1, a, a+1, (a+b)/2, b-1, b, b+1
- Para arrays de tamanho n, testar: n=0, n=1, n=máximo
- Combinar limites de múltiplos parâmetros

**Aplicação em Programação Competitiva**:
- Problemas com constraints numéricos claros (1 ≤ n ≤ 10⁵)
- Arrays com tamanhos variáveis
- Strings com limites de tamanho
- Valores extremos que podem causar overflow/underflow

**Exemplo Prático**:
```python
# Caso de teste: problema com constraint 1 ≤ n ≤ 100
# Valores a gerar:
boundary_values = [
    1,      # mínimo
    2,      # mínimo + 1
    50,     # médio
    99,     # máximo - 1
    100,    # máximo
]

# Para array de tamanho n:
array_boundaries = [
    [],           # n = 0 (se permitido)
    [val],        # n = 1
    [val] * 100,  # n = máximo
]
```

**Status no Projeto**: ⚠️ **Parcialmente Implementado**
- Implementado: valores min/max
- Não implementado: valores adjacentes sistemáticos (min+1, max-1)
- Não implementado: combinação de múltiplos limites

**Referências**:
- Beizer, B. (1990). "Software Testing Techniques"

---

### 2. Equivalence Partitioning (EP)

**Definição**: Técnica que divide o espaço de entrada em classes de equivalência, onde todos os valores em uma classe devem ser tratados da mesma forma pelo programa. Testa um representante de cada classe.

**Teoria**:
- Identificar classes de equivalência para cada variável
- Cada classe representa um conjunto de valores que devem produzir o mesmo comportamento
- Reduz número de testes mantendo cobertura

**Aplicação em Programação Competitiva**:
- **Valores positivos/negativos/zero**: Comportamentos diferentes
- **Pares/ímpares**: Algoritmos podem tratar diferente
- **Números primos/não-primos**: Para problemas matemáticos
- **Strings vazias/não-vazias**: Edge cases comuns
- **Arrays ordenados/não-ordenados**: Diferentes algoritmos

**Exemplo Prático**:
```python
# Para uma função que processa arrays:
equivalence_classes = {
    "array_vazio": [],
    "array_unico_elemento": [5],
    "array_ordenado": [1, 2, 3, 4, 5],
    "array_reverso": [5, 4, 3, 2, 1],
    "array_com_duplicatas": [1, 2, 2, 3, 3],
    "array_com_negativos": [-5, -2, 0, 3],
    "array_com_valores_maximos": [10**9] * 10
}
```

**Implementação Sugerida**:
```python
class EquivalencePartitionGenerator:
    def generate_from_classes(self, classes: Dict[str, List[Any]]) -> List[str]:
        """Gera um caso de cada classe de equivalência"""
        cases = []
        for class_name, representative_values in classes.items():
            case = self._generate_case(representative_values)
            cases.append(case)
        return cases
```

**Status no Projeto**: ❌ **Não Implementado**

**Referências**:
- Myers, G. J., Sandler, C., & Badgett, T. (2011). "The Art of Software Testing"

---

### 3. Combinatorial Testing

**Definição**: Técnica que gera casos de teste combinando valores de diferentes parâmetros de forma sistemática, garantindo cobertura de interações entre parâmetros.

**Tipos**:
- **Pairwise (2-wise)**: Testa todas as combinações de pares de parâmetros
- **t-wise**: Testa todas as combinações de t parâmetros
- **Orthogonal Arrays**: Matrizes que garantem cobertura sistemática

**Teoria**:
- Muitos bugs são causados por interações entre 2-3 parâmetros
- Testar todas as combinações é impossível (explosão combinatória)
- Pairwise testing cobre ~80% dos bugs com poucos casos

**Aplicação em Programação Competitiva**:
- Problemas com múltiplos parâmetros independentes
- Exemplo: problema com `(n, m, k)` onde cada um tem diferentes valores possíveis
- Grafos com diferentes propriedades (direcionado/não-direcionado, ponderado/não-ponderado)

**Exemplo Prático**:
```python
# Parâmetros: n ∈ [1, 10, 100], m ∈ [0, 5, 10], direcionado ∈ [True, False]
# Pairwise testing gera:
pairwise_cases = [
    (1, 0, True),   # n min, m min, direcionado
    (1, 10, False), # n min, m max, não-direcionado
    (100, 0, False), # n max, m min, não-direcionado
    (100, 10, True), # n max, m max, direcionado
    (10, 5, True),   # n médio, m médio, direcionado
    (10, 5, False),  # n médio, m médio, não-direcionado
]
# Cobre todas as interações entre pares com apenas 6 casos
```

**Status no Projeto**: ❌ **Não Implementado**

**Ferramentas Existentes**:
- Python: `allpairspy`, `itertools.product`
- Algoritmos: AETG, IPO, PICT

**Referências**:
- Kuhn, D. R., & Reilly, M. J. (2002). "An Investigation of the Applicability of Design of Experiments to Software Testing"

---

### 4. Property-Based Testing

**Definição**: Técnica onde se especificam **propriedades** que devem sempre ser verdadeiras, e o framework gera entradas aleatórias tentando violar essas propriedades.

**Teoria**:
- Especifica invariantes e propriedades matemáticas
- Gera entradas automaticamente procurando contra-exemplos
- Útil quando o resultado exato é difícil de obter

**Aplicação em Programação Competitiva**:
- **Propriedades matemáticas**: Após ordenar array, `a[i] ≤ a[i+1]`
- **Invariantes de algoritmo**: Soma de prefixos nunca negativa
- **Propriedades estruturais**: Árvore tem exatamente n-1 arestas
- **Propriedades de transformação**: Operação reversível produz resultado original

**Exemplo Prático**:
```python
# Propriedade: Ordenação preserva soma total
def test_sort_preserves_sum():
    # Gera arrays aleatórios
    for _ in range(100):
        arr = generate_random_array()
        original_sum = sum(arr)
        sorted_arr = sorted(arr)
        assert sum(sorted_arr) == original_sum

# Propriedade: BFS visita todos os nós
def test_bfs_visits_all_nodes():
    for _ in range(50):
        graph = generate_random_graph()
        visited = bfs(graph)
        assert len(visited) == graph.num_nodes()
```

**Status no Projeto**: ⚠️ **Parcialmente Implementado**
- Implementado: Geração aleatória
- Não implementado: Verificação automática de propriedades

**Ferramentas Existentes**:
- Python: `hypothesis`
- Haskell: `QuickCheck`
- C++: `rapidcheck`

**Referências**:
- Claessen, K., & Hughes, J. (2000). "QuickCheck: A Lightweight Tool for Random Testing"

---

### 5. Metamorphic Testing

**Definição**: Técnica que testa programas usando **relações de transformação** (metamorfoses) entre múltiplas execuções. Se uma transformação é aplicada à entrada, o resultado deve seguir uma relação previsível.

**Teoria**:
- Não precisa do resultado esperado exato
- Usa relações entre resultados de múltiplas execuções
- Útil quando o oracle (resultado esperado) é difícil de obter

**Metamorfoses Comuns**:
- **Aditividade**: `f(x) + f(y) = f(x + y)`
- **Multiplicatividade**: `f(k * x) = k * f(x)`
- **Idempotência**: `f(f(x)) = f(x)`
- **Comutatividade**: `f(x, y) = f(y, x)`
- **Monotonicidade**: Se `x ≤ y`, então `f(x) ≤ f(y)`

**Aplicação em Programação Competitiva**:
- **Ordenação**: Aplicar ordenação duas vezes não muda resultado (idempotência)
- **Soma de prefixos**: `prefix_sum(arr) + prefix_sum(arr2) = prefix_sum(arr + arr2)` (aditividade)
- **Multiplicação**: Multiplicar entrada por k multiplica saída por k (multiplicatividade)
- **Simetria**: Rotacionar entrada rotaciona saída (para problemas simétricos)

**Exemplo Prático**:
```python
def test_sort_idempotence():
    """Ordenar duas vezes produz mesmo resultado"""
    arr = generate_random_array()
    sorted_once = sort(arr)
    sorted_twice = sort(sorted_once)
    assert sorted_once == sorted_twice

def test_sum_monotonicity():
    """Soma é monotônica (mais elementos ≥ menor soma)"""
    arr1 = generate_random_array()
    arr2 = generate_random_array()
    if len(arr1) >= len(arr2):
        assert sum(arr1) >= sum(arr2) - tolerance

def test_reverse_symmetry():
    """Reversão é simétrica"""
    arr = generate_random_array()
    reversed_arr = reverse(arr)
    double_reversed = reverse(reversed_arr)
    assert arr == double_reversed
```

**Status no Projeto**: ❌ **Não Implementado**

**Vantagens**:
- Não precisa de resultado esperado exato
- Descobre bugs sutis em relações entre entradas/saídas
- Funciona bem para problemas matemáticos/algorítmicos

**Referências**:
- Chen, T. Y., et al. (2018). "Metamorphic Testing: A Review of Challenges and Opportunities"

---

### 6. Search-Based Test Generation

**Definição**: Usa algoritmos de busca e otimização (algoritmos genéticos, hill climbing, simulated annealing) para encontrar casos de teste que otimizam critérios como cobertura de código, descoberta de bugs, ou tempo de execução.

**Teoria**:
- Define função objetivo (fitness) baseada em critérios de qualidade
- Usa algoritmo de otimização para encontrar casos que maximizam fitness
- Iterativamente refina casos de teste

**Critérios de Fitness**:
- **Cobertura de código**: Branch coverage, statement coverage
- **Descoberta de bugs**: Casos que fazem programa falhar
- **Cobertura estrutural**: Exercitar diferentes caminhos
- **Cobertura de constraints**: Explorar limites e fronteiras

**Aplicação em Programação Competitiva**:
- Otimizar conjunto de casos de teste para máxima cobertura
- Encontrar casos que exercitam código específico
- Descobrir casos que violam constraints ou causam timeouts
- Balancear casos simples/complexos automaticamente

**Exemplo Prático**:
```python
class SearchBasedGenerator:
    def fitness_function(self, test_case):
        """Calcula qualidade do caso de teste"""
        score = 0
        
        # Cobertura de código
        coverage = measure_code_coverage(test_case)
        score += coverage * 100
        
        # Complexidade (diversidade)
        complexity = calculate_complexity(test_case)
        score += complexity * 10
        
        # Descoberta de bugs
        if causes_failure(test_case):
            score += 1000
        
        return score
    
    def generate_optimized(self, initial_population=100, generations=50):
        """Gera casos usando algoritmo genético"""
        population = generate_initial_population(initial_population)
        
        for generation in range(generations):
            # Avaliar fitness
            fitness_scores = [self.fitness_function(c) for c in population]
            
            # Seleção, crossover, mutação
            population = evolve_population(population, fitness_scores)
        
        return select_best_cases(population)
```

**Status no Projeto**: ❌ **Não Implementado**

**Ferramentas Existentes**:
- Python: `deap` (algoritmos evolutivos), `scipy.optimize`
- Frameworks: EvoSuite (Java), ManyBugs

**Referências**:
- Harman, M., & McMinn, P. (2010). "A Theoretical and Empirical Study of Search-Based Testing"

---

### 7. Symbolic Execution

**Definição**: Técnica que executa o programa **simbolicamente**, usando símbolos ao invés de valores concretos, construindo fórmulas que representam condições de caminhos de execução.

**Teoria**:
- Representa variáveis como símbolos
- Constrói path conditions (condições de caminho) como fórmulas lógicas
- Usa solvers (SAT/SMT) para encontrar valores que satisfazem condições

**Aplicação em Programação Competitiva**:
- Encontrar casos que exercitam caminhos específicos do código
- Garantir cobertura de todos os branches
- Descobrir casos que violam assertions ou constraints
- Otimizar geração para cobrir código difícil de alcançar

**Exemplo Prático**:
```python
# Código a testar:
def example(x, y):
    if x > 10:
        if y < 5:
            return "path1"
        else:
            return "path2"
    else:
        return "path3"

# Symbolic execution encontra casos para cada caminho:
# Path 1: x > 10 AND y < 5  → Solver: x=11, y=4
# Path 2: x > 10 AND y >= 5 → Solver: x=11, y=5
# Path 3: x <= 10           → Solver: x=10, y=0
```

**Status no Projeto**: ❌ **Não Implementado**

**Complexidade**:
- Requer análise estática do código
- Solvers podem ser lentos para programas grandes
- Path explosion para programas com muitos branches

**Ferramentas Existentes**:
- Python: `pyexz3`, `angr`
- C/C++: KLEE, SAGE
- Java: Symbolic PathFinder

**Referências**:
- King, J. C. (1976). "Symbolic Execution and Program Testing"

---

### 8. Mutation Testing

**Definição**: Técnica que avalia qualidade de casos de teste criando versões mutadas do programa (mutantes) e verificando se os testes conseguem distinguir (matar) os mutantes do programa original.

**Teoria**:
- Cria mutantes aplicando operadores de mutação (trocar + por -, inverter condições, etc)
- Bom conjunto de testes deve "matar" todos os mutantes válidos
- Mutantes que sobrevivem indicam gaps na cobertura de testes

**Operadores de Mutação**:
- **Aritméticos**: `+` → `-`, `*` → `/`
- **Relacionais**: `>` → `<`, `>=` → `<=`
- **Lógicos**: `AND` → `OR`, `NOT` → remover
- **Condicionais**: Inverter condições de `if`

**Aplicação em Programação Competitiva**:
- Avaliar qualidade de casos de teste gerados
- Identificar quais casos são mais importantes
- Otimizar conjunto de testes para máxima eficácia

**Exemplo Prático**:
```python
# Código original:
def max_value(arr):
    max_val = arr[0]
    for val in arr:
        if val > max_val:  # Mutação: > → >=
            max_val = val
    return max_val

# Mutante:
def max_value_mutant(arr):
    max_val = arr[0]
    for val in arr:
        if val >= max_val:  # Mutado
            max_val = val
    return max_val

# Teste que mata mutante:
arr = [1, 2, 2]  # Caso com valores duplicados
assert max_value(arr) == 2
# Original retorna 2, mutante também retorna 2, mas comportamento difere internamente
```

**Status no Projeto**: ❌ **Não Implementado**

**Uso Recomendado**:
- Como ferramenta de **avaliação** de qualidade de testes, não geração
- Pode ser usado para otimizar conjunto existente de testes

**Ferramentas Existentes**:
- Python: `mutmut`, `mutpy`
- Java: PIT, MuJava

**Referências**:
- Jia, Y., & Harman, M. (2011). "An Analysis and Survey of the Development of Mutation Testing"

---

### 9. Constraint-Based Generation

**Definição**: Usa solvers de constraints (SAT/SMT) para gerar casos de teste que satisfazem um conjunto de restrições especificadas.

**Teoria**:
- Modela constraints do problema como fórmulas lógicas
- Usa solver para encontrar valores que satisfazem todas as constraints
- Permite especificar propriedades complexas dos casos de teste

**Aplicação em Programação Competitiva**:
- Gerar casos que satisfazem múltiplas constraints simultaneamente
- Encontrar casos específicos (ex: array ordenado com soma = X)
- Combinar constraints numéricas e estruturais
- Garantir propriedades matemáticas específicas

**Exemplo Prático**:
```python
from z3 import *

def generate_constrained_array():
    """Gera array com constraints: soma = 100, tamanho = 10, todos > 0"""
    solver = Solver()
    
    # Variáveis
    arr = [Int(f'x_{i}') for i in range(10)]
    
    # Constraints
    solver.add(Sum(arr) == 100)  # Soma = 100
    for val in arr:
        solver.add(val > 0)      # Todos positivos
        solver.add(val <= 50)    # Máximo 50
    
    # Resolver
    if solver.check() == sat:
        model = solver.model()
        return [model[val].as_long() for val in arr]
    return None
```

**Status no Projeto**: ⚠️ **Parcialmente Implementado**
- Implementado: Validação de constraints
- Não implementado: Geração baseada em solvers

**Ferramentas Existentes**:
- Python: `z3`, `python-constraint`
- Outras: MiniSat, CVC4

**Referências**:
- De Moura, L., & Bjørner, N. (2008). "Z3: An Efficient SMT Solver"

---

### 10. Fuzzing

**Definição**: Técnica que fornece entradas aleatórias, malformadas ou inesperadas ao programa, monitorando seu comportamento para identificar falhas, crashes ou comportamentos incorretos.

**Tipos**:
- **Dumb Fuzzing**: Entradas completamente aleatórias
- **Smart Fuzzing**: Usa conhecimento sobre formato de entrada
- **Coverage-Guided Fuzzing**: Otimiza para máxima cobertura de código
- **Grammar-Based Fuzzing**: Gera entradas válidas usando gramática

**Aplicação em Programação Competitiva**:
- Encontrar casos que causam runtime errors
- Descobrir violações de constraints não verificadas
- Testar robustez do código do problema
- Identificar casos que causam timeouts

**Exemplo Prático**:
```python
class CompetitiveFuzzer:
    def fuzz_input(self, problem_constraints):
        """Gera entradas fuzzed baseadas em constraints"""
        fuzzed_cases = []
        
        # Valores extremos
        fuzzed_cases.append(generate_max_values(problem_constraints))
        fuzzed_cases.append(generate_min_values(problem_constraints))
        
        # Valores malformados (se possível)
        fuzzed_cases.append(generate_edge_formatting())
        
        # Valores que quebram suposições
        fuzzed_cases.append(generate_unexpected_patterns())
        
        return fuzzed_cases
```

**Status no Projeto**: ⚠️ **Parcialmente Implementado**
- Implementado: Geração aleatória (dumb fuzzing básico)
- Não implementado: Coverage-guided, grammar-based

**Ferramentas Existentes**:
- Python: `python-afl`, `boofuzz`
- Outras: AFL, libFuzzer, American Fuzzy Lop

**Referências**:
- Miller, B. P., et al. (1990). "An Empirical Study of the Reliability of UNIX Utilities"

---

### 11. Model-Based Testing (MBT)

**Definição**: Técnica que gera casos de teste a partir de modelos formais ou semi-formais que descrevem o comportamento esperado do sistema.

**Tipos de Modelos**:
- **State Machines**: Modela estados e transições
- **Decision Tables**: Tabelas de decisão com condições e ações
- **UML Diagrams**: Diagramas de sequência, atividade, etc.
- **Formal Specifications**: Especificações matemáticas formais

**Aplicação em Programação Competitiva**:
- Modelar especificação do problema como autômato finito
- Gerar casos que cobrem todas as transições
- Especificar comportamento esperado formalmente
- Garantir cobertura de todos os cenários descritos

**Exemplo Prático**:
```python
# Modelo: Autômato finito para problema de validação
class ProblemModel:
    states = ['INIT', 'PROCESSING', 'VALID', 'INVALID']
    transitions = [
        ('INIT', 'read_input', 'PROCESSING'),
        ('PROCESSING', 'validate', 'VALID'),
        ('PROCESSING', 'invalidate', 'INVALID'),
    ]
    
    def generate_test_cases(self):
        """Gera casos que cobrem todas as transições"""
        cases = []
        for transition in self.transitions:
            case = self.generate_case_for_transition(transition)
            cases.append(case)
        return cases
```

**Status no Projeto**: ❌ **Não Implementado**

**Complexidade**:
- Requer modelagem do problema
- Útil para problemas complexos com múltiplos estados
- Pode ser overkill para problemas simples

**Ferramentas Existentes**:
- Python: `graphwalker`, modelos customizados
- Outras: SpecExplorer, Conformiq

**Referências**:
- Utting, M., & Legeard, B. (2006). "Practical Model-Based Testing"

---

### 12. Coverage-Based Testing

**Definição**: Técnica que gera casos de teste focando em maximizar métricas de cobertura de código (statement coverage, branch coverage, path coverage, etc.).

**Métricas de Cobertura**:
- **Statement Coverage**: Percentual de linhas executadas
- **Branch Coverage**: Percentual de branches (if/else) testados
- **Path Coverage**: Percentual de caminhos de execução testados
- **Condition Coverage**: Todas as condições booleanas testadas

**Aplicação em Programação Competitiva**:
- Garantir que todos os branches do código são testados
- Identificar código nunca executado (dead code)
- Otimizar conjunto de testes para máxima cobertura
- Combinar com outras técnicas (search-based) para otimizar

**Exemplo Prático**:
```python
import coverage

def generate_coverage_based_tests(code, current_tests):
    """Gera casos adicionais para cobrir código não coberto"""
    cov = coverage.Coverage()
    cov.start()
    
    # Executar testes existentes
    for test in current_tests:
        execute_test(code, test)
    
    cov.stop()
    missing_branches = cov.get_missing_branches()
    
    # Gerar casos para branches não cobertos
    new_tests = []
    for branch in missing_branches:
        test = generate_test_for_branch(branch)
        new_tests.append(test)
    
    return new_tests
```

**Status no Projeto**: ❌ **Não Implementado**

**Limitações**:
- Requer acesso ao código do problema (nem sempre disponível)
- Alta cobertura não garante ausência de bugs
- Pode ser enganoso (código coberto mas não testado adequadamente)

**Ferramentas Existentes**:
- Python: `coverage.py`, `pytest-cov`
- Outras: JaCoCo (Java), gcov (C/C++)

**Referências**:
- Zhu, H., et al. (1997). "Software Unit Test Coverage and Adequacy"

---

## Comparação e Recomendações

### Tabela Comparativa

| Abordagem | Complexidade | Eficiência | Cobertura | Implementação | Prioridade |
|-----------|--------------|------------|-----------|---------------|------------|
| **Boundary Value Analysis** | Baixa | Alta | Média | Fácil | ⭐⭐⭐ Alta |
| **Equivalence Partitioning** | Baixa | Alta | Média | Fácil | ⭐⭐⭐ Alta |
| **Random Testing** | Baixa | Média | Baixa | Fácil | ✅ Implementado |
| **Combinatorial Testing** | Média | Alta | Alta | Média | ⭐⭐ Média |
| **Property-Based Testing** | Média | Média | Alta | Média | ⭐⭐ Média |
| **Metamorphic Testing** | Média | Alta | Alta | Média | ⭐⭐⭐ Alta |
| **Search-Based** | Alta | Média | Muito Alta | Difícil | ⭐ Baixa |
| **Symbolic Execution** | Muito Alta | Baixa | Muito Alta | Muito Difícil | ⭐ Baixa |
| **Mutation Testing** | Alta | Baixa | Alta | Média | ⭐ Baixa* |
| **Constraint-Based** | Alta | Média | Alta | Difícil | ⭐⭐ Média |
| **Fuzzing** | Média | Baixa | Baixa | Média | ⭐ Baixa |
| **Model-Based Testing** | Muito Alta | Alta | Muito Alta | Muito Difícil | ⭐ Baixa |
| **Coverage-Based** | Média | Média | Média | Difícil** | ⭐ Baixa |

\* Mutation testing é melhor como ferramenta de avaliação, não geração  
\** Requer acesso ao código do problema

### Recomendações de Uso

#### Para Problemas Simples (aritmética básica, arrays simples)
- ✅ **Boundary Value Analysis**: Valores mínimos, máximos, adjacentes
- ✅ **Equivalence Partitioning**: Classes de valores (positivo/negativo/zero)
- ✅ **Random Testing**: Complemento para descobrir casos inesperados

#### Para Problemas com Múltiplos Parâmetros
- ✅ **Combinatorial Testing**: Garantir interações entre parâmetros
- ✅ **Boundary Value Analysis**: Combinar limites de múltiplos parâmetros

#### Para Problemas Matemáticos/Algorítmicos
- ✅ **Metamorphic Testing**: Usar relações matemáticas (aditividade, simetria)
- ✅ **Property-Based Testing**: Verificar invariantes matemáticas

#### Para Problemas com Estruturas Complexas (grafos, árvores)
- ✅ **Geração Especializada**: Já implementado (GraphGenerator, MatrixGenerator)
- ✅ **Property-Based Testing**: Verificar propriedades estruturais
- ⚠️ **Combinatorial Testing**: Combinar diferentes tipos de estruturas

#### Para Otimização de Conjunto de Testes
- ✅ **Search-Based**: Otimizar para máxima cobertura/eficiência
- ⚠️ **Mutation Testing**: Avaliar qualidade de testes existentes

#### Para Problemas com Constraints Complexos
- ✅ **Constraint-Based Generation**: Usar solvers para satisfazer constraints
- ✅ **Boundary Value Analysis**: Explorar limites dos constraints

### Roadmap de Implementação Futura

#### Fase 1: Melhorias Imediatas (Alto Impacto, Baixa Complexidade)
1. ✅ **Completar Boundary Value Analysis**
   - Adicionar valores adjacentes (min+1, max-1) sistematicamente
   - Implementar combinação de múltiplos limites

2. ✅ **Implementar Equivalence Partitioning**
   - Identificar classes de equivalência automaticamente
   - Gerar representante de cada classe

#### Fase 2: Abordagens Avançadas (Alto Impacto, Média Complexidade)
3. ✅ **Implementar Metamorphic Testing**
   - Definir metamorfoses comuns para tipos de problemas
   - Validar relações entre entradas/saídas

4. ✅ **Implementar Combinatorial Testing**
   - Adicionar suporte para pairwise testing
   - Gerar combinações sistemáticas de parâmetros

#### Fase 3: Otimização (Médio Impacto, Alta Complexidade)
5. ⚠️ **Search-Based Generation (Opcional)**
   - Implementar algoritmos genéticos básicos
   - Otimizar conjunto de testes para cobertura

6. ⚠️ **Constraint-Based Generation (Opcional)**
   - Integrar solvers (Z3) para casos complexos
   - Especificar constraints avançadas

### Quando Usar Cada Abordagem

#### Problemas com Constraints Numéricos Claros
→ **Boundary Value Analysis** + **Equivalence Partitioning**

#### Problemas com Múltiplos Parâmetros Independentes
→ **Combinatorial Testing** (pairwise)

#### Problemas Matemáticos (somas, produtos, ordenação)
→ **Metamorphic Testing** + **Property-Based Testing**

#### Problemas com Estruturas de Dados
→ **Geração Especializada** (já implementado) + **Property-Based**

#### Otimização de Conjunto Existente
→ **Search-Based** ou **Mutation Testing** (avaliação)

#### Problemas com Constraints Complexos
→ **Constraint-Based Generation**

#### Descoberta de Bugs Não Previstos
→ **Random Testing** + **Fuzzing**

---

## Referências Bibliográficas

### Livros Fundamentais

1. **Beizer, B.** (1990). *Software Testing Techniques* (2nd ed.). Van Nostrand Reinhold.
   - Clássico sobre técnicas de teste, incluindo BVA e Equivalence Partitioning

2. **Myers, G. J., Sandler, C., & Badgett, T.** (2011). *The Art of Software Testing* (3rd ed.). John Wiley & Sons.
   - Introdução abrangente a técnicas de teste de software

3. **Utting, M., & Legeard, B.** (2006). *Practical Model-Based Testing: A Tools Approach*. Morgan Kaufmann.
   - Guia prático para Model-Based Testing

### Artigos Acadêmicos Principais

#### Boundary Value Analysis e Equivalence Partitioning
- **White, L. J., & Cohen, E. I.** (1980). "A domain strategy for computer program testing". *IEEE Transactions on Software Engineering*, 6(3), 247-257.

#### Combinatorial Testing
- **Kuhn, D. R., & Reilly, M. J.** (2002). "An Investigation of the Applicability of Design of Experiments to Software Testing". *27th Annual NASA Goddard/IEEE Software Engineering Workshop*.

- **Kuhn, D. R., Kacker, R. N., & Lei, Y.** (2008). "Introduction to Combinatorial Testing". *NIST Special Publication 800-142*.

#### Metamorphic Testing
- **Chen, T. Y., Cheung, S. C., & Yiu, S. M.** (1998). "Metamorphic Testing: A New Approach for Generating Next Test Cases". *Technical Report HKUST-CS98-01*.

- **Chen, T. Y., et al.** (2018). "Metamorphic Testing: A Review of Challenges and Opportunities". *ACM Computing Surveys*, 51(1), 1-27.

#### Property-Based Testing
- **Claessen, K., & Hughes, J.** (2000). "QuickCheck: A Lightweight Tool for Random Testing of Haskell Programs". *ICFP '00*.

#### Search-Based Testing
- **Harman, M., & McMinn, P.** (2010). "A Theoretical and Empirical Study of Search-Based Testing: Local, Global, and Hybrid Search". *IEEE Transactions on Software Engineering*, 36(2), 226-247.

#### Symbolic Execution
- **King, J. C.** (1976). "Symbolic Execution and Program Testing". *Communications of the ACM*, 19(7), 385-394.

- **Cadar, C., & Sen, K.** (2013). "Symbolic Execution for Software Testing: Three Decades Later". *Communications of the ACM*, 56(2), 82-90.

#### Mutation Testing
- **Jia, Y., & Harman, M.** (2011). "An Analysis and Survey of the Development of Mutation Testing". *IEEE Transactions on Software Engineering*, 37(5), 649-678.

#### Constraint-Based Generation
- **De Moura, L., & Bjørner, N.** (2008). "Z3: An Efficient SMT Solver". *TACAS '08*.

#### Fuzzing
- **Miller, B. P., et al.** (1990). "An Empirical Study of the Reliability of UNIX Utilities". *Communications of the ACM*, 33(12), 32-44.

#### Coverage-Based Testing
- **Zhu, H., Hall, P. A. V., & May, J. H. R.** (1997). "Software Unit Test Coverage and Adequacy". *ACM Computing Surveys*, 29(4), 366-427.

### Recursos Online

- **NIST - Combinatorial Testing**: https://csrc.nist.gov/projects/automated-combinatorial-testing-for-software
- **Metamorphic Testing Repository**: https://www.metamorphictesting.org/
- **Search-Based Software Engineering**: http://crest.cs.ucl.ac.uk/sbst/
- **Z3 Solver Documentation**: https://github.com/Z3Prover/z3
- **Hypothesis (Property-Based Testing)**: https://hypothesis.works/

### Ferramentas e Bibliotecas

#### Python
- **hypothesis**: Property-based testing
- **allpairspy**: Combinatorial testing (pairwise)
- **z3-solver**: Constraint solving
- **mutmut**: Mutation testing
- **coverage.py**: Code coverage measurement

#### Outras Linguagens
- **QuickCheck** (Haskell): Property-based testing original
- **AFL** (C/C++): Coverage-guided fuzzing
- **KLEE** (C/C++): Symbolic execution
- **EvoSuite** (Java): Search-based test generation

---

## Conclusão

Este documento apresentou as principais abordagens da literatura para geração de casos de teste, com foco em sua aplicação ao contexto de programação competitiva.

**Principais Pontos**:
- O projeto já implementa parcialmente várias técnicas importantes (BVA, Random Testing, Complexidade Crescente)
- Existem oportunidades de melhoria imediata (completar BVA, adicionar Equivalence Partitioning)
- Abordagens avançadas (Metamorphic Testing, Combinatorial Testing) podem trazer grande valor
- Técnicas mais complexas (Symbolic Execution, Search-Based) podem ser implementadas posteriormente

**Próximos Passos Sugeridos**:
1. Completar implementação de Boundary Value Analysis
2. Implementar Equivalence Partitioning básico
3. Adicionar suporte para Metamorphic Testing em problemas matemáticos
4. Considerar Combinatorial Testing para problemas com múltiplos parâmetros

---

**Última Atualização**: 2024  
**Versão do Documento**: 1.0  
**Autor**: AtalJudge Team

