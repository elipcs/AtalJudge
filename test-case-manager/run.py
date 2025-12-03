"""Script para executar o servidor"""
import uvicorn
from app.config import config

if __name__ == "__main__":
    # Usar AUTO_RELOAD se configurado, caso contrário usar DEBUG como fallback
    # Por padrão, AUTO_RELOAD está ativo para facilitar desenvolvimento
    reload_enabled = config.AUTO_RELOAD if hasattr(config, 'AUTO_RELOAD') else config.DEBUG
    
    uvicorn.run(
        "app.main:app",
        host=config.HOST,
        port=config.PORT,
        reload=reload_enabled,
        reload_dirs=["app"] if reload_enabled else None,  # Monitorar apenas o diretório app
        log_level="info",
        timeout_keep_alive=300,  # 5 minutos - manter conexão viva durante geração longa
        timeout_graceful_shutdown=30  # 30 segundos para shutdown graceful
    )



