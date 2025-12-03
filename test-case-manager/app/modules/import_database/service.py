"""Serviço de Import - Camada de aplicação do módulo import_database

Fornece operações de alto nível para importação, busca e gerenciamento
do dataset Code-Contests-Plus.
"""
import os
import sys
from typing import List, Dict, Optional
from app.utils.logger import logger

# Adicionar diretório de scripts ao path
script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..', 'scripts', 'import_dataset'))
if script_path not in sys.path:
    sys.path.insert(0, script_path)

try:
    from dataset_import_batch import BatchDatasetImporter
except ImportError:
    logger.warning("Dataset import module não encontrado. Funcionalidade de import desabilitada.")
    BatchDatasetImporter = None


class ImportService:
    """Serviço de aplicação para o módulo de import"""
    
    def __init__(self):
        """Inicializar serviço"""
        self._importers: Dict[str, BatchDatasetImporter] = {}
        logger.info("ImportService inicializado")
    
    def _get_importer(self, config: str = "1x") -> Optional[BatchDatasetImporter]:
        """Obter ou criar importer para configuração"""
        if BatchDatasetImporter is None:
            logger.error("BatchDatasetImporter não está disponível")
            return None
        
        if config not in self._importers:
            self._importers[config] = BatchDatasetImporter(
                config=config,
                db_path=os.path.join(script_path, f"dataset_{config}.db")
            )
        
        return self._importers[config]
    
    async def search_dataset(
        self,
        query: str,
        limit: int = 20,
        config: str = "1x"
    ) -> List[Dict]:
        """
        Buscar problemas no dataset
        
        Args:
            query: Termo de busca
            limit: Máximo de resultados
            config: Configuração do dataset
        
        Returns:
            Lista de problemas encontrados
        """
        try:
            logger.info(f"[IMPORT] Buscando: '{query}' (config={config})")
            
            importer = self._get_importer(config)
            if not importer:
                raise ValueError("Dataset import não está configurado")
            
            # Verificar status
            status = importer.get_import_status()
            if not status or status['status'] != 'completed':
                logger.error("Dataset não foi importado")
                raise ValueError(
                    "Dataset não foi importado. Execute: "
                    "python scripts/import_dataset/run_import.py --config 1x"
                )
            
            # Buscar
            results = importer.search_local(query, limit)
            logger.info(f"[IMPORT] ✅ Encontrados {len(results)} problemas")
            
            return results
        
        except Exception as e:
            logger.error(f"[IMPORT] ❌ Erro na busca: {str(e)}")
            raise
    
    async def get_problem_details(
        self,
        problem_id: str,
        config: str = "1x"
    ) -> Optional[Dict]:
        """
        Obter detalhes de um problema
        
        Args:
            problem_id: ID do problema
            config: Configuração do dataset
        
        Returns:
            Detalhes do problema ou None
        """
        try:
            logger.info(f"[IMPORT] Obtendo detalhes: {problem_id}")
            
            importer = self._get_importer(config)
            if not importer:
                raise ValueError("Dataset import não está configurado")
            
            problem = importer.get_problem_by_id(problem_id)
            if problem:
                logger.info(f"[IMPORT] ✅ Problema encontrado: {problem.get('title', '')}")
            
            return problem
        
        except Exception as e:
            logger.error(f"[IMPORT] ❌ Erro ao obter detalhes: {str(e)}")
            raise
    
    async def get_test_cases(
        self,
        problem_id: str,
        limit: Optional[int] = None,
        config: str = "1x"
    ) -> List[Dict]:
        """
        Obter casos de teste de um problema
        
        Args:
            problem_id: ID do problema
            limit: Máximo de casos (None = todos)
            config: Configuração do dataset
        
        Returns:
            Lista de casos de teste
        """
        try:
            logger.info(f"[IMPORT] Obtendo casos: {problem_id} (limit={limit})")
            
            importer = self._get_importer(config)
            if not importer:
                raise ValueError("Dataset import não está configurado")
            
            test_cases = importer.get_test_cases(problem_id)
            if limit:
                test_cases = test_cases[:limit]
            
            logger.info(f"[IMPORT] ✅ {len(test_cases)} casos obtidos")
            
            return test_cases
        
        except Exception as e:
            logger.error(f"[IMPORT] ❌ Erro ao obter casos: {str(e)}")
            raise
    
    async def get_import_status(self, config: str = "1x") -> Dict:
        """
        Obter status do import
        
        Args:
            config: Configuração do dataset
        
        Returns:
            Status do import
        """
        try:
            importer = self._get_importer(config)
            if not importer:
                return {
                    "status": "unavailable",
                    "message": "Dataset import não está configurado"
                }
            
            status = importer.get_import_status()
            if not status:
                return {
                    "status": "not_imported",
                    "config": config,
                    "message": "Dataset não foi importado"
                }
            
            return {
                "status": status['status'],
                "config": status['config'],
                "total_problems": status['total_problems'],
                "total_test_cases": status['total_test_cases'],
                "last_import": status['last_import']
            }
        
        except Exception as e:
            logger.error(f"[IMPORT] ❌ Erro ao obter status: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }
