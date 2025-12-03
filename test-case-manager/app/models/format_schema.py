"""Modelos Pydantic para schema de formato de entrada inferido"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any, Literal


class GraphConstraints(BaseModel):
    """Constraints específicas para grafos"""
    directed: bool = Field(description="Se o grafo é direcionado")
    acyclic: bool = Field(default=False, description="Se o grafo deve ser acíclico (DAG)")
    connected: bool = Field(default=False, description="Se o grafo deve ser conexo")
    is_tree: bool = Field(default=False, description="Se o grafo é uma árvore")
    num_nodes_var: str = Field(description="Nome da variável para número de nós (ex: 'n')")
    num_edges_var: str = Field(description="Nome da variável para número de arestas (ex: 'm')")
    

class PermutationConstraints(BaseModel):
    """Constraints específicas para permutações"""
    is_permutation: bool = Field(default=True, description="Se é uma permutação válida")
    range_start: int = Field(default=1, description="Início do range (geralmente 1)")
    range_var: str = Field(description="Variável que define o tamanho (ex: 'n')")


class ArrayConstraints(BaseModel):
    """Constraints específicas para arrays"""
    size_var: Optional[str] = Field(default=None, description="Variável que define o tamanho")
    min_value: Optional[int] = Field(default=None, description="Valor mínimo dos elementos")
    max_value: Optional[int] = Field(default=None, description="Valor máximo dos elementos")
    is_sorted: bool = Field(default=False, description="Se o array deve ser ordenado")
    is_unique: bool = Field(default=False, description="Se os elementos devem ser únicos")


class InputLine(BaseModel):
    """Descrição de uma linha de entrada"""
    line_number: int = Field(description="Número da linha (1-indexed)")
    type: Literal[
        "integer",
        "two_integers", 
        "three_integers",
        "array",
        "string",
        "matrix",
        "edge",
        "graph_edges",
        "custom"
    ] = Field(description="Tipo de dados nesta linha")
    count: Optional[str] = Field(
        default=None, 
        description="Expressão para quantidade de elementos (ex: 'n', 'n-1', 'm')"
    )
    variable_names: Optional[List[str]] = Field(
        default=None,
        description="Nomes das variáveis lidas nesta linha (ex: ['n', 'm'])"
    )
    constraints: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Constraints adicionais específicas desta linha"
    )


class InputStructure(BaseModel):
    """Estrutura completa da entrada"""
    lines: List[InputLine] = Field(description="Lista de linhas de entrada")
    total_lines: int = Field(description="Número total de linhas (pode ser variável)")
    is_variable_length: bool = Field(
        default=False,
        description="Se o número de linhas depende de variáveis de entrada"
    )


class FormatSchema(BaseModel):
    """Schema completo do formato de entrada inferido"""
    has_test_count: bool = Field(
        default=False,
        description="Se há múltiplos casos de teste com contador inicial"
    )
    test_count_variable: Optional[str] = Field(
        default=None,
        description="Nome da variável de contagem de testes (ex: 't')"
    )
    input_structure: InputStructure = Field(description="Estrutura da entrada")
    semantic_constraints: Dict[str, Any] = Field(
        default_factory=dict,
        description="Constraints semânticas (graph, permutation, etc.)"
    )
    algorithm_type: str = Field(
        default="default",
        description="Tipo de algoritmo sugerido (dp, graph, greedy, etc.)"
    )
    
    @property
    def has_graph(self) -> bool:
        """Retorna True se o problema envolve grafo"""
        return "graph" in self.semantic_constraints
    
    @property
    def graph_constraints(self) -> Optional[GraphConstraints]:
        """Retorna constraints do grafo se existirem"""
        if self.has_graph:
            return GraphConstraints(**self.semantic_constraints["graph"])
        return None
    
    @property
    def has_permutation(self) -> bool:
        """Retorna True se o problema envolve permutação"""
        return "permutation" in self.semantic_constraints
    
    @property
    def permutation_constraints(self) -> Optional[PermutationConstraints]:
        """Retorna constraints da permutação se existirem"""
        if self.has_permutation:
            return PermutationConstraints(**self.semantic_constraints["permutation"])
        return None
