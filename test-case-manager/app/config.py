"""Configurações do microsserviço"""
import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    """Configurações base da aplicação"""
    
    # Servidor
    HOST = os.getenv('HOST', '0.0.0.0')
    PORT = int(os.getenv('PORT', 8000))
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    # Auto-reload: ativo por padrão em desenvolvimento, pode ser desativado com AUTO_RELOAD=false
    AUTO_RELOAD = os.getenv('AUTO_RELOAD', 'True').lower() == 'true'
    
    # AtalJudge API
    ATALJUDGE_API_URL = os.getenv('ATALJUDGE_API_URL', 'http://localhost:3333/api')
    
    # Security Keys (devem ser os mesmos do backend AtalJudge)
    SECRET_KEY = os.getenv('SECRET_KEY', 'dev-secret-key-not-for-production')
    
    # JWT Configuration (mesmo secret do AtalJudge)
    # IMPORTANTE: Use o mesmo JWT_SECRET do backend AtalJudge
    JWT_SECRET = os.getenv('JWT_SECRET', os.getenv('ATALJUDGE_JWT_SECRET', 'dev-jwt-secret-not-for-production'))
    JWT_ISSUER = 'ataljudge'
    JWT_AUDIENCE = 'ataljudge-api'
    JWT_ALGORITHM = 'HS256'
    
    # Google Gemini / Vertex AI
    # Vertex AI (recomendado para produção - mais estável)
    USE_VERTEX_AI = os.getenv('USE_VERTEX_AI', 'False').lower() == 'true'
    VERTEX_AI_PROJECT_ID = os.getenv('VERTEX_AI_PROJECT_ID', '')
    VERTEX_AI_LOCATION = os.getenv('VERTEX_AI_LOCATION', 'us-central1')  # ou 'us-east1', 'europe-west1', etc.
    
    # Google AI Studio (fallback se Vertex AI não estiver configurado)
    GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')
    GEMINI_FALLBACK_API_KEY = os.getenv('GEMINI_FALLBACK_API_KEY', 'AIzaSyCMS6AGam3GdyWuaik8gFXj0jKlRtY9EG4')
    GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3-pro-preview')  # Modelo padrão: gemini-3-pro-preview (mais recente)
    
    # Execução de código
    CODE_TIMEOUT_SECONDS = int(os.getenv('CODE_TIMEOUT_SECONDS', 5))
    MAX_TEST_CASES = int(os.getenv('MAX_TEST_CASES', 50))
    
    # CORS
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://localhost:3333').split(',')


config = Config()
