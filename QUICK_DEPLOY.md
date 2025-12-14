# 🚀 AtalJudge - Deploy Rápido

## Deploy com Um Único Comando

As imagens do AtalJudge estão disponíveis no Docker Hub e podem ser deployadas juntas com um único script!

### Linux/Mac

```bash
./scripts/quick-deploy.sh
```

### Windows (PowerShell)

```powershell
.\scripts\quick-deploy.ps1
```

## O Que o Script Faz

1. ✅ Puxa as últimas imagens do Docker Hub:
   - `elipcs/ataljudge-frontend:latest`
   - `elipcs/ataljudge-backend:latest`

2. ✅ Cria o arquivo `docker-compose.prod.yml` se não existir

3. ✅ Sobe todos os serviços:
   - Frontend (porta 3000)
   - Backend (porta 3333)
   - PostgreSQL (backend)
   - Redis (backend)
   - Judge0 (servidor + workers + DB + Redis)

4. ✅ Verifica o status dos serviços

## Acessando a Aplicação

Após o deploy:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3333
- **Health Check**: http://localhost:3333/health

## Comandos Úteis

### Ver logs em tempo real
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Ver logs de um serviço específico
```bash
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f backend
```

### Parar todos os serviços
```bash
docker-compose -f docker-compose.prod.yml down
```

### Parar e remover volumes (⚠️ apaga dados)
```bash
docker-compose -f docker-compose.prod.yml down -v
```

### Reiniciar um serviço
```bash
docker-compose -f docker-compose.prod.yml restart frontend
docker-compose -f docker-compose.prod.yml restart backend
```

### Atualizar para última versão
```bash
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Configuração

### Arquivo .env (Opcional)

Crie um arquivo `.env` na raiz do projeto para customizar as configurações:

```env
# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api

# Backend Database
DB_USERNAME=ataljudge
DB_PASSWORD=sua_senha_segura
DB_DATABASE=ataljudge

# Backend Security
SECRET_KEY=sua_chave_secreta_aqui
JWT_SECRET=sua_jwt_secret_aqui

# Redis
REDIS_PASSWORD=sua_senha_redis

# Judge0 Database
JUDGE0_DB_USER=judge0
JUDGE0_DB_PASSWORD=sua_senha_judge0
JUDGE0_DB_NAME=judge0

# CORS
ALLOWED_ORIGINS=*
```

## Imagens no Docker Hub

- Frontend: https://hub.docker.com/r/elipcs/ataljudge-frontend
- Backend: https://hub.docker.com/r/elipcs/ataljudge-backend

### Tags Disponíveis

Cada imagem tem as seguintes tags:
- `latest` - Última versão
- `1.0.0` - Versão específica
- `1.0` - Versão minor
- `1` - Versão major

## Deploy em Produção

Para produção, recomendamos:

1. **Definir senhas fortes** no arquivo `.env`
2. **Configurar CORS** adequadamente (não usar `*`)
3. **Usar HTTPS** com reverse proxy (nginx/traefik)
4. **Configurar backups** dos volumes de dados
5. **Monitorar** os health checks

## Troubleshooting

### Porta já em uso
```bash
# Ver processos usando a porta
lsof -i :3000
lsof -i :3333

# Ou mudar a porta no docker-compose.prod.yml
ports:
  - "8080:3000"  # Frontend na porta 8080
```

### Serviços não iniciam
```bash
# Ver logs detalhados
docker-compose -f docker-compose.prod.yml logs

# Verificar recursos
docker stats

# Reiniciar do zero
docker-compose -f docker-compose.prod.yml down -v
./scripts/quick-deploy.sh
```

### Problemas com Judge0
```bash
# Judge0 pode demorar até 2 minutos para iniciar
docker-compose -f docker-compose.prod.yml logs -f judge0-server
```

## Desenvolvimento Local

Para desenvolvimento, use o `docker-compose.yml` normal:

```bash
docker-compose up -d
```

Isso vai **construir** as imagens localmente ao invés de puxar do Docker Hub.
