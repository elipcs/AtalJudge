# 🐳 AtalJudge Docker Hub Images

Official Docker images for AtalJudge online judge platform.

## 📦 Available Images

### Frontend
**Image:** `elipcs/ataljudge-frontend`
- **Base:** Node.js 20 Alpine
- **Size:** ~150 MB (compressed)
- **Port:** 3000
- **Framework:** Next.js 15

**Tags:**
- `latest` - Latest stable release
- `1.0.0`, `1.0`, `1` - Specific versions

**Docker Hub:** https://hub.docker.com/r/elipcs/ataljudge-frontend

### Backend
**Image:** `elipcs/ataljudge-backend`
- **Base:** Node.js 20 Alpine
- **Size:** ~120 MB (compressed)
- **Port:** 3333
- **Framework:** Express + TypeScript + TypeORM

**Tags:**
- `latest` - Latest stable release
- `1.0.0`, `1.0`, `1` - Specific versions

**Docker Hub:** https://hub.docker.com/r/elipcs/ataljudge-backend

### Test Case Manager
**Image:** `elipcs/ataljudge-test-case-manager`
- **Base:** Python 3.11 Slim
- **Size:** ~200 MB (compressed)
- **Port:** 8000
- **Framework:** FastAPI + Google Gemini

**Tags:**
- `latest` - Latest stable release
- `1.0.0`, `1.0`, `1` - Specific versions

**Docker Hub:** https://hub.docker.com/r/elipcs/ataljudge-test-case-manager

## 🚀 Quick Start

### 1. Minimal Setup (3 commands)

```bash
# Download template
curl -o docker-compose.yml https://raw.githubusercontent.com/elipcs/AtalJudge/main/docker-compose.prod.yml.template

# Create .env (edit with your values!)
curl -o .env https://raw.githubusercontent.com/elipcs/AtalJudge/main/.env.example

# Start
docker-compose up -d
```

### 2. One-Line Deploy

```bash
wget -qO- https://raw.githubusercontent.com/elipcs/AtalJudge/main/scripts/quick-deploy.sh | bash
```

## ⚙️ Configuration

### Required Environment Variables

| Variable | Description | How to Get |
|----------|-------------|-----------|
| `DB_PASSWORD` | PostgreSQL password | Generate: `openssl rand -base64 32` |
| `SECRET_KEY` | App secret key | Generate: `openssl rand -base64 32` |
| `JWT_SECRET` | JWT signing key | Generate: `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Google Gemini key | Get from https://makersuite.google.com/app/apikey |

### Example .env

```env
# Database
DB_USERNAME=ataljudge
DB_PASSWORD=your_secure_password
DB_DATABASE=ataljudge

# Security
SECRET_KEY=your_secret_key_here
JWT_SECRET=your_jwt_secret_here

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api

# Judge0
JUDGE0_DB_USER=judge0
JUDGE0_DB_PASSWORD=judge0_secure_password
```

## 📊 Resource Usage

### Default Limits

```yaml
Frontend:          512 MB RAM
Backend:           512 MB RAM
Test Case Manager: 2 GB RAM
Databases (2x):    1 GB RAM
Redis (2x):        512 MB RAM
Judge0:            2 GB RAM
----------------------------------
TOTAL:             ~6.5 GB RAM
```

### Minimum Server Requirements

- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disk:** 40 GB
- **Network:** 10 Mbps

## 🔧 Usage Examples

### Pull Specific Version

```bash
docker pull elipcs/ataljudge-frontend:1.0.0
docker pull elipcs/ataljudge-backend:1.0.0
docker pull elipcs/ataljudge-test-case-manager:1.0.0
```

### Run Frontend Only

```bash
docker run -d \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3333 \
  -e NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api \
  --name ataljudge-frontend \
  elipcs/ataljudge-frontend:latest
```

### Run Backend Only

```bash
docker run -d \
  -p 3333:3333 \
  -e DB_HOST=your-db-host \
  -e DB_PASSWORD=your-password \
  -e SECRET_KEY=your-secret \
  -e JWT_SECRET=your-jwt-secret \
  --name ataljudge-backend \
  elipcs/ataljudge-backend:latest
```

### Custom docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    image: elipcs/ataljudge-frontend:latest
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:3333
      - NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api

  backend:
    image: elipcs/ataljudge-backend:latest
    ports:
      - "3333:3333"
    environment:
      - DB_HOST=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - SECRET_KEY=${SECRET_KEY}
      - JWT_SECRET=${JWT_SECRET}
```

## 🔒 Security Best Practices

### 1. Change Default Passwords

```bash
# Generate strong passwords
openssl rand -base64 32
```

### 2. Use Secrets Management

```bash
# Docker Swarm secrets
echo "my_secret" | docker secret create db_password -

# Docker Compose v2 secrets
services:
  backend:
    secrets:
      - db_password
```

### 3. Network Isolation

```yaml
services:
  backend:
    networks:
      - internal
  
networks:
  internal:
    internal: true
```

### 4. Read-Only Filesystem

```yaml
services:
  frontend:
    read_only: true
    tmpfs:
      - /tmp
```

## 🆙 Updates

### Update to Latest

```bash
# Pull latest images
docker-compose pull

# Restart services
docker-compose up -d
```

### Update to Specific Version

```bash
# Edit docker-compose.yml to use version tags
# image: elipcs/ataljudge-frontend:1.0.0

docker-compose up -d
```

## 🐛 Troubleshooting

### Check Image Version

```bash
docker inspect elipcs/ataljudge-frontend:latest | grep -i version
```

### View Logs

```bash
docker logs ataljudge-frontend
docker logs ataljudge-backend
docker logs ataljudge-test-case-manager
```

### Reset Everything

```bash
docker-compose down -v
docker-compose pull
docker-compose up -d
```

## 📦 Multi-Architecture Support

All images support:
- `linux/amd64` (Intel/AMD)
- `linux/arm64` (Apple Silicon, ARM servers)

Docker automatically pulls the correct architecture.

## 📝 Version History

### v1.0.0 (Latest)
- Initial Docker Hub release
- Complete frontend, backend, and test case manager
- AI-powered test case generation
- Multi-language code execution
- Production-ready

## 🔗 Links

- **Source Code:** https://github.com/elipcs/AtalJudge
- **Documentation:** https://github.com/elipcs/AtalJudge/blob/main/README.md
- **Deployment Guide:** https://github.com/elipcs/AtalJudge/blob/main/DEPLOYMENT.md
- **Issues:** https://github.com/elipcs/AtalJudge/issues

## 📄 License

See [LICENSE](https://github.com/elipcs/AtalJudge/blob/main/LICENSE)

---

**Built with ❤️ for programming education**
