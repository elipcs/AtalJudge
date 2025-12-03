"""Middleware de autenticação JWT do AtalJudge"""
from typing import Optional
from fastapi import Request, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from app.config import config
from app.utils.logger import logger


class JWTBearer(HTTPBearer):
    """Classe para autenticação JWT via Bearer token"""
    
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)
    
    async def __call__(self, request: Request) -> HTTPAuthorizationCredentials:
        """Valida o token JWT e retorna as credenciais"""
        logger.info(f'🔐 Auth middleware called for {request.url.path}')
        credentials: HTTPAuthorizationCredentials = await super(JWTBearer, self).__call__(request)
        
        if credentials:
            if not credentials.scheme == "Bearer":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Esquema de autenticação inválido. Use Bearer."
                )
            
            payload = self.verify_token(credentials.credentials)
            if payload is None:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Token inválido ou expirado."
                )
            
            # Armazenar payload e token no request state para uso posterior
            request.state.user = payload
            request.state.token = credentials.credentials
            
            return credentials
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Credenciais de autenticação inválidas."
            )
    
    def verify_token(self, token: str) -> Optional[dict]:
        """Verifica e valida o token JWT"""
        try:
            # Validar token JWT
            # Desabilitar validação de iat para evitar problemas com clock skew
            # Ainda validamos exp, issuer, audience e assinatura
            payload = jwt.decode(
                token,
                config.JWT_SECRET,
                algorithms=[config.JWT_ALGORITHM],
                issuer=config.JWT_ISSUER,
                audience=config.JWT_AUDIENCE,
                options={
                    "verify_signature": True,
                    "verify_exp": True,
                    "verify_iat": False,  # Desabilitar validação de iat (clock skew)
                    "verify_nbf": False,
                    "require_exp": True,
                    "require_iat": False
                }
            )
            
            # Validação manual de exp (necessário quando verify_iat=False)
            # O PyJWT pode não validar exp corretamente quando iat está desabilitado
            # Verificar exp ANTES de qualquer outra validação
            import time
            current_time = int(time.time())
            if 'exp' in payload:
                exp_time = payload['exp']
                if exp_time < current_time:
                    logger.warning(f'Token expirado (exp={exp_time}, now={current_time}, diff={current_time - exp_time}s)')
                    raise jwt.ExpiredSignatureError('Token expirado')
            else:
                logger.warning('Token sem campo exp')
                return None
            
            # Verificar se o token tem o tipo correto (access token)
            if payload.get('tokenType') and payload.get('tokenType') != 'access':
                logger.warning(f'Token tipo inválido: {payload.get("tokenType")}')
                return None
            
            # Verificar se tem subject (sub)
            if not payload.get('sub'):
                logger.warning('Token sem subject (sub)')
                return None
            
            logger.info(f'Token validado para usuário: {payload.get("sub")}')
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
            logger.error(f'Erro ao verificar token: {e}')
            return None


# Instância global do JWTBearer
jwt_bearer = JWTBearer()


def get_current_user(request: Request) -> dict:
    """Obtém o usuário atual do request state (após validação JWT)"""
    if not hasattr(request.state, 'user'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não autenticado"
        )
    return request.state.user


def get_current_token(request: Request) -> str:
    """Obtém o token atual do request state (após validação JWT)"""
    if not hasattr(request.state, 'token'):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token não disponível"
        )
    return request.state.token
