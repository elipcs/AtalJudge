"""Serviço para importação de casos de teste do dataset Code-Contests-Plus"""
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


class DatasetImportService:
    """Serviço para gerenciar importação de casos de teste"""
    
    def __init__(self):
        """Inicializar serviço"""
        self._importers: Dict[str, BatchDatasetImporter] = {}
        logger.info("DatasetImportService inicializado")
    
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
    
    async def import_test_cases(
        self,
        question_id: str,
        dataset_problem_id: str,
        token: str,
        count: int = 20,
        config: str = "1x"
    ) -> Dict:
        """
        Importar casos de teste do dataset
        
        Args:
            question_id: ID da questão no AtalJudge
            dataset_problem_id: ID do problema no dataset
            token: Token JWT do usuário
            count: Número de casos a importar
            config: Configuração do dataset (1x, 2x, etc)
        
        Returns:
            Dicionário com casos importados e metadata
        """
        try:
            logger.info(f"Iniciando import: question_id={question_id}, dataset_problem_id={dataset_problem_id}")
            
            importer = self._get_importer(config)
            if not importer:
                raise ValueError("Dataset import não está configurado")
            
            # Verificar se dataset foi importado
            status = importer.get_import_status()
            if not status or status['status'] != 'completed':
                logger.error("Dataset não foi importado. Execute run_import.py primeiro.")
                raise ValueError(
                    "Dataset não foi importado. Execute: "
                    "python scripts/import_dataset/run_import.py --config 1x"
                )
            
            # Buscar problema no dataset
            problem = importer.get_problem_by_id(dataset_problem_id)
            if not problem:
                logger.error(f"Problema {dataset_problem_id} não encontrado no dataset")
                raise ValueError(f"Problema '{dataset_problem_id}' não encontrado no dataset")
            
            # Obter casos de teste
            test_cases = importer.get_test_cases(dataset_problem_id)
            if not test_cases:
                raise ValueError(f"Nenhum caso de teste encontrado para {dataset_problem_id}")
            
            # Limitar à quantidade solicitada
            test_cases_limited = test_cases[:count]
            
            logger.info(f"✅ Importados {len(test_cases_limited)} casos de teste")
            
            return {
                "test_cases": test_cases_limited,
                "total_imported": len(test_cases_limited),
                "dataset_source": "Code-Contests-Plus",
                "problem_title": problem.get('title', ''),
                "problem_difficulty": problem.get('difficulty', ''),
                "config": config
            }
        
        except Exception as e:
            logger.error(f"Erro ao importar casos: {str(e)}")
            raise
    
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
            logger.info(f"Buscando no dataset: query={query}, config={config}")
            
            importer = self._get_importer(config)
            if not importer:
                raise ValueError("Dataset import não está configurado")
            
            # Verificar status
            status = importer.get_import_status()
            if not status or status['status'] != 'completed':
                logger.error("Dataset não foi importado")
                raise ValueError("Dataset não foi importado. Execute: python scripts/import_dataset/run_import.py")
            
            # Buscar
            results = importer.search_local(query, limit)
            logger.info(f"Encontrados {len(results)} problemas")
            
            return results
        
        except Exception as e:
            logger.error(f"Erro ao buscar no dataset: {str(e)}")
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
            logger.error(f"Erro ao obter status: {str(e)}")
            return {
                "status": "error",
                "message": str(e)
            }


# Singleton instance
_dataset_import_service: Optional[DatasetImportService] = None

def get_dataset_import_service() -> DatasetImportService:
    """Get or create the service singleton"""
    global _dataset_import_service
    if _dataset_import_service is None:
        _dataset_import_service = DatasetImportService()
    return _dataset_import_service
