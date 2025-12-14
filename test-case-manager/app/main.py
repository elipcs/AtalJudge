"""FastAPI app principal"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import config
from app.modules.generator import router as generator_router
# from app.modules.import_database import router as import_router
from app.routers.import_router import router as bulk_import_router
from app.utils.logger import logger


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciador de ciclo de vida da aplicação"""
    logger.info("="*80)
    logger.info("🚀 Iniciando Test Case Manager")
    logger.info("="*80)
    logger.info(f"Servidor rodando em {config.HOST}:{config.PORT}")
    logger.info(f"AtalJudge API URL: {config.ATALJUDGE_API_URL}")
    logger.info(f"JWT Secret configurado: {bool(config.JWT_SECRET)}")
    
    # Verificar disponibilidade do Gemini (Vertex AI ou Google AI Studio)
    gemini_available = config.USE_VERTEX_AI or (config.GEMINI_API_KEY != '')
    logger.info(f"Gemini disponível: {gemini_available}")
    if config.USE_VERTEX_AI:
        logger.info(f"  → Via Vertex AI (Projeto: {config.VERTEX_AI_PROJECT_ID})")
    elif config.GEMINI_API_KEY:
        logger.info(f"  → Via Google AI Studio")
    
    logger.info("="*80)
    logger.info("📦 MÓDULOS CARREGADOS:")
    logger.info("  🔧 Generator   - Geração inteligente com Gemini")
    logger.info("  📥 Import DB   - Import do dataset Code-Contests-Plus")
    logger.info("="*80)
    
    yield
    
    # Shutdown
    logger.info("Encerrando Test Case Manager...")


# Criar aplicação FastAPI
app = FastAPI(
    title="Test Case Manager",
    description="Microsserviço unificado de geração e import de casos de teste para AtalJudge",
    version="2.0.0",
    lifespan=lifespan
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Adicionar middleware de autenticação (para rotas protegidas)
# Nota: A autenticação também é feita via Depends nas rotas específicas
# Este middleware pode ser usado para logging ou outras operações

# Registrar rotas dos módulos
app.include_router(generator_router)
# app.include_router(import_router)  # Deprecated: using bulk_import_router instead
app.include_router(bulk_import_router)


@app.get("/")
async def root():
    """Endpoint raiz"""
    return {
        "service": "test-case-manager",
        "version": "2.0.0",
        "status": "running",
        "modules": {
            "generator": "/api/generator/health",
            "import": "/api/import/health"
        },
        "docs": "/docs"
    }

