"""
Oracle Code Analyzer Service

Analisa código oráculo (Python) para extrair automaticamente informações
sobre o formato de input esperado, eliminando necessidade de intervenção manual.

Usa análise híbrida:
1. Gemini LLM (análise inteligente, profunda)
2. Regex (fallback rápido se Gemini falhar)
"""

import re
import logging
from typing import Dict, List, Optional, Any
from app.services.gemini_service import GeminiService

logger = logging.getLogger(__name__)


class OracleAnalyzerService:
    """Serviço para análise de código oráculo Python"""
    
    def __init__(self, gemini_service: Optional[GeminiService] = None):
        self.gemini_service = gemini_service or GeminiService()
        self.patterns = self._initialize_patterns()
    
    def _initialize_patterns(self) -> Dict[str, re.Pattern]:
        """Inicializa padrões regex para detecção"""
        return {
            # Múltiplos test cases
            'multiple_tests_loop': re.compile(r'for\s+\w+\s+in\s+range\s*\(\s*(?:int\s*\(\s*input\s*\(\s*\)\s*\)|[tT])\s*\)'),
            'test_count_var': re.compile(r'([tT])\s*=\s*int\s*\(\s*input\s*\(\s*\)\s*\)'),
            
            # Input patterns
            'single_int': re.compile(r'int\s*\(\s*input\s*\(\s*\)\s*\)'),
            'multiple_ints': re.compile(r'(\w+(?:\s*,\s*\w+)+)\s*=\s*map\s*\(\s*int\s*,\s*input\s*\(\s*\)\s*\.split\s*\(\s*\)\s*\)'),
            'int_array': re.compile(r'(?:list\s*\(\s*)?map\s*\(\s*int\s*,\s*input\s*\(\s*\)\s*\.split\s*\(\s*\)\s*\)'),
            'string_input': re.compile(r'input\s*\(\s*\)(?:\.strip\s*\(\s*\))?(?!\s*\.split)'),
            
            # Array size relationships
            'array_with_size': re.compile(r'for\s+\w+\s+in\s+range\s*\(\s*(\w+)\s*\)'),
        }
    
    async def analyze_with_gemini(self, oracle_code: str) -> Optional[Dict[str, Any]]:
        """
        Analisa código oráculo usando Gemini para extração inteligente
        
        Args:
            oracle_code: Código Python do oráculo
            
        Returns:
            Dict com análise detalhada ou None se falhar
        """
        logger.info("🤖 Analisando oráculo com Gemini para extração inteligente...")
        
        prompt = f"""Analyze this Python solution code and extract the INPUT FORMAT information.

ORACLE CODE:
```python
{oracle_code}
```

Extract and provide in this EXACT format:

MULTIPLE_TEST_CASES: yes/no
TEST_COUNT_VARIABLE: <variable name or "none">
INPUT_STRUCTURE:
- Line 1: <description> (e.g., "single integer n", "three integers a b c", "array of n integers")
- Line 2: <description>
- Line 3: <description>
...

VARIABLE_RELATIONSHIPS:
- <relationship> (e.g., "n determines array size", "a + b must equal k")

SPECIAL_NOTES:
- <any special format notes> (e.g., "last line has no trailing newline", "values must be space-separated")

Be concise and precise. Focus ONLY on INPUT format, not on solution logic."""

        try:
            response = await self.gemini_service.generate_content(
                prompt,
                temperature=0.2,  # Mais determinístico
                max_tokens=1000
            )
            
            # Parsear resposta
            analysis = self._parse_gemini_analysis(response)
            if analysis:
                logger.info(f"✓ Gemini extraiu {len(analysis.get('input_lines', []))} linhas de input")
                return analysis
            else:
                logger.warning("⚠️ Não foi possível parsear resposta do Gemini")
                return None
                
        except Exception as e:
            logger.warning(f"⚠️ Erro ao analisar com Gemini: {e}")
            return None
    
    def _parse_gemini_analysis(self, response: str) -> Optional[Dict[str, Any]]:
        """Parseia resposta do Gemini"""
        try:
            analysis = {
                'has_multiple_tests': False,
                'test_count_variable': None,
                'input_lines': [],
                'variable_relationships': [],
                'special_notes': [],
                'format_description': []
            }
            
            # Detectar múltiplos test cases
            if 'MULTIPLE_TEST_CASES: yes' in response.lower():
                analysis['has_multiple_tests'] = True
                
                # Extrair variável
                var_match = re.search(r'TEST_COUNT_VARIABLE:\s*(\w+)', response)
                if var_match and var_match.group(1).lower() != 'none':
                    analysis['test_count_variable'] = var_match.group(1)
            
            # Extrair estrutura de input
            input_section = re.search(r'INPUT_STRUCTURE:(.*?)(?:VARIABLE_RELATIONSHIPS:|SPECIAL_NOTES:|$)', response, re.DOTALL)
            if input_section:
                lines = input_section.group(1).strip().split('\n')
                for line in lines:
                    line = line.strip()
                    if line.startswith('- Line'):
                        # Extrair descrição
                        desc_match = re.search(r'Line \d+:\s*(.+)', line)
                        if desc_match:
                            desc = desc_match.group(1).strip()
                            analysis['input_lines'].append({'description': desc})
            
            # Extrair relacionamentos
            rel_section = re.search(r'VARIABLE_RELATIONSHIPS:(.*?)(?:SPECIAL_NOTES:|$)', response, re.DOTALL)
            if rel_section:
                lines = rel_section.group(1).strip().split('\n')
                for line in lines:
                    line = line.strip()
                    if line.startswith('-'):
                        analysis['variable_relationships'].append(line[1:].strip())
            
            # Extrair notas especiais
            notes_section = re.search(r'SPECIAL_NOTES:(.*?)$', response, re.DOTALL)
            if notes_section:
                lines = notes_section.group(1).strip().split('\n')
                for line in lines:
                    line = line.strip()
                    if line.startswith('-'):
                        analysis['special_notes'].append(line[1:].strip())
            
            # Gerar descrição de formato
            desc = []
            if analysis['has_multiple_tests']:
                test_var = analysis['test_count_variable'] or 't'
                desc.append(f"Multiple test cases (first line: {test_var} = number of test cases)")
            else:
                desc.append("Single test case")
            
            desc.append(f"Input has {len(analysis['input_lines'])} lines per test case")
            for i, line_info in enumerate(analysis['input_lines'][:5], 1):
                desc.append(f"  Line {i}: {line_info['description']}")
            
            if analysis['variable_relationships']:
                desc.append("\nVariable relationships:")
                for rel in analysis['variable_relationships'][:3]:
                    desc.append(f"  - {rel}")
            
            if analysis['special_notes']:
                desc.append("\nSpecial format notes:")
                for note in analysis['special_notes'][:3]:
                    desc.append(f"  - {note}")
            
            analysis['format_description'] = desc
            
            return analysis if analysis['input_lines'] else None
            
        except Exception as e:
            logger.warning(f"Erro ao parsear resposta: {e}")
            return None
    
    async def analyze_input_format(self, oracle_code: str, use_gemini: bool = True) -> Dict[str, Any]:
        """
        Analisa código oráculo e extrai informações de formato
        
        Usa Gemini primeiro para análise inteligente, fallback para regex se falhar.
        
        Args:
            oracle_code: Código Python do oráculo
            use_gemini: Se True, tenta usar Gemini primeiro
            
        Returns:
            Dicionário com informações de formato
        """
        logger.info("Analisando código oráculo para extrair formato de input...")
        
        # Tentar Gemini primeiro
        if use_gemini:
            gemini_analysis = await self.analyze_with_gemini(oracle_code)
            if gemini_analysis:
                logger.info("✅ Usando análise do Gemini (mais completa)")
                return gemini_analysis
            else:
                logger.info("⚠️ Fallback para análise regex")
        
        # Fallback: análise regex
        return self._analyze_with_regex(oracle_code)
    
    def _analyze_with_regex(self, oracle_code: str) -> Dict[str, Any]:
        """Análise com regex (fallback)"""
        analysis = {
            'has_multiple_tests': False,
            'test_count_variable': None,
            'input_lines': [],
            'approximate_line_count': 0,
            'has_arrays': False,
            'format_description': []
        }
        
        # Detectar múltiplos test cases
        test_loop_match = self.patterns['multiple_tests_loop'].search(oracle_code)
        test_var_match = self.patterns['test_count_var'].search(oracle_code)
        
        if test_loop_match or test_var_match:
            analysis['has_multiple_tests'] = True
            if test_var_match:
                analysis['test_count_variable'] = test_var_match.group(1)
            logger.info("✓ Detectado: múltiplos test cases")
        
        # Contar inputs
        input_count = oracle_code.count('input()')
        analysis['approximate_line_count'] = input_count
        logger.info(f"✓ Detectado: aproximadamente {input_count} linhas de input")
        
        # Analisar cada linha de input
        lines = oracle_code.split('\n')
        for i, line in enumerate(lines):
            line = line.strip()
            
            # Detectar tipo de input
            if 'input()' in line:
                input_info = self._analyze_input_line(line)
                if input_info:
                    analysis['input_lines'].append(input_info)
                    
                    if input_info['type'] == 'array':
                        analysis['has_arrays'] = True
        
        # Gerar descrição de formato
        analysis['format_description'] = self._generate_format_description(analysis)
        
        logger.info(f"Análise completa: {len(analysis['input_lines'])} linhas identificadas")
        return analysis
    
    def _analyze_input_line(self, line: str) -> Optional[Dict[str, Any]]:
        """Analisa uma linha individual de input"""
        
        # Multiple integers (a, b, c = map(int, input().split()))
        mult_int_match = self.patterns['multiple_ints'].search(line)
        if mult_int_match:
            vars_str = mult_int_match.group(1)
            var_names = [v.strip() for v in vars_str.split(',')]
            return {
                'type': 'multiple_integers',
                'count': len(var_names),
                'variables': var_names,
                'format': 'space-separated integers'
            }
        
        # Integer array (list(map(int, input().split())))
        if self.patterns['int_array'].search(line):
            # Tentar extrair nome da variável
            var_match = re.match(r'(\w+)\s*=', line)
            var_name = var_match.group(1) if var_match else 'array'
            return {
                'type': 'array',
                'element_type': 'integer',
                'variable': var_name,
                'format': 'space-separated integers'
            }
        
        # Single integer (n = int(input()))
        if self.patterns['single_int'].search(line):
            var_match = re.match(r'(\w+)\s*=', line)
            var_name = var_match.group(1) if var_match else 'value'
            return {
                'type': 'single_integer',
                'variable': var_name,
                'format': 'single integer'
            }
        
        # String (s = input() ou word = input().strip())
        if self.patterns['string_input'].search(line):
            var_match = re.match(r'(\w+)\s*=', line)
            var_name = var_match.group(1) if var_match else 'text'
            return {
                'type': 'string',
                'variable': var_name,
                'format': 'single line of text'
            }
        
        return None
    
    def _generate_format_description(self, analysis: Dict) -> List[str]:
        """Gera descrição legível do formato"""
        
        desc = []
        
        if analysis['has_multiple_tests']:
            test_var = analysis['test_count_variable'] or 't'
            desc.append(f"Multiple test cases (first line contains {test_var} = number of test cases)")
        else:
            desc.append("Single test case")
        
        if analysis['input_lines']:
            desc.append(f"Input contains {len(analysis['input_lines'])} distinct input operations")
            
            for i, line_info in enumerate(analysis['input_lines'][:5], 1):  # Primeiras 5
                if line_info['type'] == 'multiple_integers':
                    vars_str = ', '.join(line_info['variables'])
                    desc.append(f"  Line {i}: {line_info['count']} integers ({vars_str}), {line_info['format']}")
                elif line_info['type'] == 'array':
                    desc.append(f"  Line {i}: Array of integers (variable: {line_info['variable']}), {line_info['format']}")
                elif line_info['type'] == 'single_integer':
                    desc.append(f"  Line {i}: Single integer (variable: {line_info['variable']})")
                elif line_info['type'] == 'string':
                    desc.append(f"  Line {i}: String (variable: {line_info['variable']})")
        
        if analysis['has_arrays']:
            desc.append("Contains integer arrays (use space-separated values)")
        
        return desc
    
    async def generate_format_hints(self, oracle_code: str) -> str:
        """
        Gera hints de formato para incluir no prompt do LLM
        
        Args:
            oracle_code: Código Python do oráculo
            
        Returns:
            String formatada com hints para o LLM
        """
        analysis = await self.analyze_input_format(oracle_code)
        
        hints = ["ORACLE CODE ANALYSIS (Expected Input Format):", ""]
        
        # Adicionar descrições
        for desc in analysis['format_description']:
            hints.append(desc)
        
        hints.append("")
        hints.append("Your generated code MUST produce inputs matching this format exactly.")
        
        return '\n'.join(hints)
    
    async def get_structural_hints(self, oracle_code: str) -> Dict[str, Any]:
        """
        Retorna dicas estruturais específicas para geração
        
        Returns:
            Dict com dicas estruturais
        """
        analysis = await self.analyze_input_format(oracle_code)
        
        return {
            'multiple_tests': analysis['has_multiple_tests'],
            'has_arrays': analysis.get('has_arrays', False),
            'line_count': analysis.get('approximate_line_count', len(analysis['input_lines'])),
            'input_types': [line.get('type', line.get('description')) for line in analysis['input_lines']]
        }
