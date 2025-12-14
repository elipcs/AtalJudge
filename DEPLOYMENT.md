# 🚀 AtalJudge Deployment Guide

Complete guide for deploying AtalJudge in production using Docker Hub images.

## 📋 Table of Contents

- [System Requirements](#system-requirements)
- [Quick Start](#quick-start)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Troubleshooting](#troubleshooting)
- [Monitoring](#monitoring)
- [Backup and Maintenance](#backup-and-maintenance)

## 💻 System Requirements

### Minimum Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | 4 cores | 8+ cores |
| **RAM** | 8 GB | 16+ GB |
| **Storage** | 40 GB | 100+ GB SSD |
| **Network** | 10 Mbps | 100+ Mbps |

### Software Requirements

- **Docker**: 20.10+ ([Install](https://docs.docker.com/get-docker/))
- **Docker Compose**: 2.0+ ([Install](https://docs.docker.com/compose/install/))
- **OS**: Linux (Ubuntu 20.04+, Debian 11+, CentOS 8+) or macOS

### Storage Breakdown

| Service | Storage Used | Purpose |
|---------|--------------|---------|
| PostgreSQL (Backend) | ~2-10 GB | User data, submissions, questions |
| PostgreSQL (Judge0) | ~1-5 GB | Judge0 metadata |
| Redis | ~500 MB - 2 GB | Caching, queues |
| Docker Images | ~600 MB | All 3 services (compressed) |
| Judge0 | ~200 MB | Code execution engine |
| Logs | ~1-5 GB/month | Application logs |
| **Total** | **~40 GB+** | With growth buffer |

### Memory Allocation

Default memory limits (can be adjusted in docker-compose):

```
Frontend:           512 MB
Backend:            512 MB
Backend DB:         512 MB
Backend Redis:      256 MB
Test Case Manager:  2 GB
Judge0 Server:      1 GB
Judge0 Workers:     1 GB
Judge0 DB:          512 MB
Judge0 Redis:       256 MB
----------------------------------
TOTAL:             ~6.5 GB
```

### Network Requirements

- **Inbound Ports:**
  - `3000` - Frontend (HTTP)
  - `3333` - Backend API (HTTP)
  - Optional: `443` - HTTPS (with reverse proxy)

- **Outbound:**
  - Port `443` - Google Gemini API
  - Port `443` - Docker Hub (for pulls)
  - Port `25/587` - SMTP (for emails, optional)

## 🚀 Quick Start

### Option 1: Using Docker Hub Images (Recommended)

1. **Clone repository for configuration files**
   ```bash
   git clone https://github.com/elipcs/AtalJudge.git
   cd AtalJudge
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure essential variables in `.env`**
   ```env
   # Database passwords
   DB_PASSWORD=YOUR_SECURE_PASSWORD_HERE
   JUDGE0_DB_PASSWORD=YOUR_JUDGE0_PASSWORD_HERE
   
   # Security keys (generate with: openssl rand -base64 32)
   SECRET_KEY=YOUR_SECRET_KEY_HERE
   JWT_SECRET=YOUR_JWT_SECRET_HERE
   
   # Google Gemini API (get from https://makersuite.google.com/app/apikey)
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY
   
   # Frontend URL (adjust for your domain)
   NEXT_PUBLIC_API_URL=http://your-domain.com:3333
   NEXT_PUBLIC_API_BASE_URL=http://your-domain.com:3333/api
   ```

4. **Download docker-compose.prod.yml template**
   ```bash
   curl -o docker-compose.prod.yml https://raw.githubusercontent.com/elipcs/AtalJudge/main/docker-compose.prod.yml.template
   ```

5. **Start services**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

6. **Wait for services to be ready** (~2-5 minutes)
   ```bash
   docker-compose -f docker-compose.prod.yml ps
   ```

7. **Access the application**
   - Open http://your-server-ip:3000

### Option 2: Build from Source

See [DOCKER.md](./DOCKER.md) for building images locally.

## 🏭 Production Deployment

### Pre-Deployment Checklist

- [ ] Server meets minimum requirements
- [ ] Docker and Docker Compose installed
- [ ] Firewall configured (ports 3000, 3333 open)
- [ ] Domain/subdomain configured (optional but recommended)
- [ ] SSL certificate ready (with reverse proxy)
- [ ] Backup strategy defined
- [ ] Monitoring solution ready

### Step-by-Step Production Setup

#### 1. Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

#### 2. Application Setup

```bash
# Create application directory
mkdir -p /opt/ataljudge
cd /opt/ataljudge

# Download configuration files
git clone https://github.com/elipcs/AtalJudge.git .

# Create .env from template
cp .env.example .env
```

#### 3. Configure Environment

Edit `.env` with production values:

```bash
nano .env
```

**Critical settings for production:**

```env
# Production mode
NODE_ENV=production

# Strong passwords (use: openssl rand -base64 32)
DB_PASSWORD=<STRONG_PASSWORD>
REDIS_PASSWORD=<STRONG_PASSWORD>
JUDGE0_DB_PASSWORD=<STRONG_PASSWORD>
SECRET_KEY=<STRONG_SECRET>
JWT_SECRET=<STRONG_SECRET>

# Domain configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api
ALLOWED_ORIGINS=https://yourdomain.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Gemini API
GEMINI_API_KEY=your-gemini-key
```

#### 4. Deploy Services

```bash
# Pull latest images
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

#### 5. Verify Deployment

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Test services
curl http://localhost:3333/health  # Backend
curl http://localhost:3000         # Frontend
curl http://localhost:8000/health  # Test Case Manager
```

#### 6. Create First Admin User

```bash
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "name": "Admin",
    "role": "PROFESSOR"
  }'
```

### 🔒 Production Security Hardening

#### 1. Use Reverse Proxy (Nginx/Traefik)

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    # API
    location /api {
        proxy_pass http://localhost:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### 2. Firewall Configuration

```bash
# Using UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

#### 3. Docker Security

```bash
# Run Docker rootless (optional)
dockerd-rootless-setuptool.sh install

# Regular security updates
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 📋 Environment Configuration

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_PASSWORD` | PostgreSQL password | `SecurePass123!` |
| `SECRET_KEY` | App secret key | `openssl rand -base64 32` |
| `JWT_SECRET` | JWT signing key | `openssl rand -base64 32` |
| `GEMINI_API_KEY` | Google Gemini key | `AIza...` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SMTP_HOST` | Email server | - |
| `REDIS_PASSWORD` | Redis password | (empty) |
| `CODE_TIMEOUT_SECONDS` | Code execution timeout | `5` |
| `MAX_TEST_CASES` | Max test cases per generation | `50` |

### Complete .env Example

See [`.env.example`](./env.example) for a complete template.

## 🔧 Troubleshooting

### Common Issues

#### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check specific service
docker-compose -f docker-compose.prod.yml logs backend

# Restart services
docker-compose -f docker-compose.prod.yml restart
```

#### Database Connection Errors

```bash
# Check database status
docker-compose -f docker-compose.prod.yml exec backend-db pg_isready

# Reset database (CAUTION: deletes all data)
docker-compose -f docker-compose.prod.yml down -v
docker-compose -f docker-compose.prod.yml up -d
```

#### Out of Memory

```bash
# Check memory usage
docker stats

# Increase swap
sudo fallocate -l 4G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

#### Port Already in Use

```bash
# Find process using port
sudo lsof -i :3000

# Kill process or change port in docker-compose.prod.yml
```

## 📊 Monitoring

### Health Checks

```bash
# All services
make health

# Or manually
curl http://localhost:3333/health
curl http://localhost:3000
curl http://localhost:8000/health
```

### Resource Monitoring

```bash
# Real-time stats
docker stats

# Disk usage
docker system df

# Clean up
docker system prune -a
```

### Logs

```bash
# View all logs
docker-compose -f docker-compose.prod.yml logs -f

# Export logs
docker-compose -f docker-compose.prod.yml logs --no-color > ataljudge.log
```

## 💾 Backup and Maintenance

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/ataljudge"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup backend database
docker-compose -f docker-compose.prod.yml exec -T backend-db \
  pg_dump -U ataljudge ataljudge > "$BACKUP_DIR/backend_db_$DATE.sql"

# Backup judge0 database
docker-compose -f docker-compose.prod.yml exec -T judge0-db \
  pg_dump -U judge0 judge0 > "$BACKUP_DIR/judge0_db_$DATE.sql"

# Compress
gzip "$BACKUP_DIR"/*.sql

# Keep only last 7 days
find $BACKUP_DIR -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/backup_$DATE.sql.gz"
```

### Restore from Backup

```bash
# Restore backend
gunzip < backend_db_20240101.sql.gz | \
docker-compose -f docker-compose.prod.yml exec -T backend-db \
  psql -U ataljudge ataljudge
```

### Update Procedure

```bash
# 1. Backup first!
./backup.sh

# 2. Pull new images
docker-compose -f docker-compose.prod.yml pull

# 3. Restart with new images
docker-compose -f docker-compose.prod.yml up -d

# 4. Verify
docker-compose -f docker-compose.prod.yml ps
```

## 🎯 Performance Tuning

### Database Optimization

```sql
-- Connect to database
docker-compose -f docker-compose.prod.yml exec backend-db psql -U ataljudge

-- Vacuum and analyze
VACUUM ANALYZE;

-- Check slow queries
SELECT query, mean_exec_time 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;
```

### Scaling Services

```bash
# Scale backend horizontally
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Scale judge0 workers
docker-compose -f docker-compose.prod.yml up -d --scale judge0-workers=5
```

## 📞 Support

- **Documentation**: [README.md](./README.md)
- **Issues**: [GitHub Issues](https://github.com/elipcs/AtalJudge/issues)
- **Docker Hub**: 
  - [elipcs/ataljudge-frontend](https://hub.docker.com/r/elipcs/ataljudge-frontend)
  - [elipcs/ataljudge-backend](https://hub.docker.com/r/elipcs/ataljudge-backend)
  - [elipcs/ataljudge-test-case-manager](https://hub.docker.com/r/elipcs/ataljudge-test-case-manager)

---

**Built with ❤️ for programming education**
