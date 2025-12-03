"""Utilitários de segurança (validação de JWT do AtalJudge)"""
from typing import Optional
import jwt
from app.config import config
from app.utils.logger import logger


def validate_jwt_token(token: str) -> Optional[dict]:
    """
    Valida um token JWT do AtalJudge
    
    Args:
        token: Token JWT a ser validado
    
    Returns:
        Payload do token se válido, None caso contrário
    """
    try:
        payload = jwt.decode(
            token,
            config.JWT_SECRET,
            algorithms=[config.JWT_ALGORITHM],
            issuer=config.JWT_ISSUER,
            audience=config.JWT_AUDIENCE
        )
        
        # Verificar se o token tem o tipo correto (access token)
        if payload.get('tokenType') and payload.get('tokenType') != 'access':
            logger.warning(f'Token tipo inválido: {payload.get("tokenType")}')
            return None
        
        # Verificar se tem subject (sub)
        if not payload.get('sub'):
            logger.warning('Token sem subject (sub)')
            return None
        
        return payload
        
    except jwt.ExpiredSignatureError:
        logger.warning('Token JWT expirado')
        return None
    except jwt.InvalidIssuerError:
        logger.warning(f'Token com issuer inválido. Esperado: {config.JWT_ISSUER}')
        return None
    except jwt.InvalidAudienceError:
        logger.warning(f'Token com audience inválido. Esperado: {config.JWT_AUDIENCE}')
        return None
    except jwt.InvalidTokenError as e:
        logger.warning(f'Token JWT inválido: {e}')
        return None
    except Exception as e:
        logger.error(f'Erro ao validar token: {e}')
        return None


def extract_bearer_token(authorization: Optional[str]) -> Optional[str]:
    """
    Extrai o token Bearer do header Authorization
    
    Args:
        authorization: Header Authorization
    
    Returns:
        Token JWT se encontrado, None caso contrário
    """
    if not authorization:
        return None
    
    if not authorization.startswith('Bearer '):
        return None
    
    return authorization.replace('Bearer ', '').strip()

