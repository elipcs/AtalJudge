"""Configuração de logging"""
import logging
import sys
from datetime import datetime

# Configurar formato de log
LOG_FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
DATE_FORMAT = '%Y-%m-%d %H:%M:%S'

# Criar logger
logger = logging.getLogger('test_case_generator')
logger.setLevel(logging.INFO)

# Handler para console
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)
console_handler.setFormatter(formatter)

# Adicionar handler ao logger
if not logger.handlers:
    logger.addHandler(console_handler)


































