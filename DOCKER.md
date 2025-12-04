# 🐳 Docker Hub - AtalJudge

## Available Images

- `your-username/ataljudge-backend:latest` - Backend API (Express + TypeScript)
- `your-username/ataljudge-frontend:latest` - Frontend (Next.js)
- `your-username/ataljudge-test-case-manager:latest` - Test Case Manager (FastAPI)

## Quickstart

```bash
# Clone the repository
git clone https://github.com/yourusername/ataljudge.git
cd ataljudge

# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## Health Checks

Check service status:

```bash
# Backend
curl http://localhost:3333/health

# Frontend
curl http://localhost:3000

# Test Case Manager
curl http://localhost:8000/api/health

# Judge0
curl http://localhost:2358
```

## Credentials and Security

### Changing Passwords in Production

1. **Judge0 Database**:
   ```env
   JUDGE0_DB_USER=your_username
   JUDGE0_DB_PASSWORD=your_secure_password_here
   ```

2. **JWT Secret** (highly recommended):
   ```bash
   openssl rand -base64 32
   # Copy the result to JWT_SECRET in .env
   ```

3. **Secret Key**:
   ```bash
   openssl rand -base64 32
   # Copy the result to SECRET_KEY in .env
   ```

4. **Google Credentials** (if using Vertex AI):
   ```bash
   mkdir credentials
   cp /path/to/your/service-account-key.json credentials/
   
   # Uncomment in docker-compose.yml:
   # volumes:
   #   - ./credentials/service-account-key.json:/app/credentials/service-account-key.json:ro
   ```

## Database Configuration

### Local PostgreSQL (default)

Using the included docker-compose:
```yaml
# docker-compose.yml already includes judge0-db (PostgreSQL)
```

### External PostgreSQL

```env
DATABASE_URL=postgresql://user:password@your-db-host:5432/ataljudge
DB_HOST=your-db-host
DB_PORT=5432
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=ataljudge
```

## Environment Variables

See `.env.example` for all options.

### Essential

- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `SECRET_KEY` - Generate with: `openssl rand -base64 32`
- `JUDGE0_DB_PASSWORD` - Change from default
- `GEMINI_API_KEY` - Get from https://ai.google.dev/

### Recommended

- `NODE_ENV=production`
- `LOG_LEVEL=info`
- `ALLOWED_ORIGINS` - Set to your domain
- `REDIS_PASSWORD` - Set in production

## Troubleshooting

### "Connection refused"
- Wait 30-40 seconds for services to start
- Check: `docker-compose ps`

### "Database locked"
- Restart services: `docker-compose restart`

### Memory issues
- Increase limits in docker-compose.yml
- Check: `docker stats`

### Credential issues
- Check .json file path
- Verify permissions: `chmod 400 credentials.json`

### Health checks failing
- Check logs: `docker-compose logs service-name`
- Wait for startup period (start_period)

## Production Deployment

### Recommendations

1. Use versioned image tags: `ataljudge-backend:v1.0.0`
2. Configure **all** passwords in `.env`
3. Use a reverse proxy (Nginx, Traefik)
4. Configure SSL/TLS (Let's Encrypt)
5. Set up automatic database backups
6. Monitor with Prometheus/Grafana
7. Configure rate limiting
8. Enable structured logging (JSON)
9. Disable `privileged: true` if possible
10. Use signed images when possible

### Docker Hub

```bash
# Login
docker login

# Build and tag
docker-compose build
docker tag ataljudge-backend yourusername/ataljudge-backend:v1.0.0
docker tag ataljudge-frontend yourusername/ataljudge-frontend:v1.0.0
docker tag ataljudge-test-case-manager yourusername/ataljudge-test-case-manager:v1.0.0

# Push
docker push yourusername/ataljudge-backend:v1.0.0
docker push yourusername/ataljudge-frontend:v1.0.0
docker push yourusername/ataljudge-test-case-manager:v1.0.0

# Tag as latest
docker tag yourusername/ataljudge-backend:v1.0.0 yourusername/ataljudge-backend:latest
docker push yourusername/ataljudge-backend:latest
```

## Project Structure

```
ataljudge/
├── backend/               # Express.js API
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── frontend/              # Next.js
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── test-case-manager/     # FastAPI Python
│   ├── app/
│   ├── requirements.txt
│   └── Dockerfile
├── judge0-minimal/        # Judge0 Server
│   └── Dockerfile
├── docker-compose.yml     # Orchestration
├── .env.example           # Example variables
└── README.md              # Documentation
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| Frontend | 3000 | Next.js Application |
| Backend | 3333 | Express API |
| Test Case Manager | 8000 | FastAPI Generator |
| Judge0 Server | 2358 | Code Execution Engine |
| Backend PostgreSQL | 5432 | Backend Database (internal) |
| Backend Redis | 6379 | Backend Cache & Queues (internal) |
| Judge0 PostgreSQL | 5432 | Judge0 Database (internal) |
| Judge0 Redis | 6379 | Judge0 Cache & Queues (internal) |

## Support

- Issues: https://github.com/elipcs/ataljudge/issues
- Discussions: https://github.com/elipcs/ataljudge/discussions
