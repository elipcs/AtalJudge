# 🏆 AtalJudge

> A modern, AI-powered online judge platform for competitive programming education

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.1-blue?style=flat&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=flat&logo=node.js)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.10+-yellow?style=flat&logo=python)](https://www.python.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat&logo=docker)](https://www.docker.com/)

[![Docker Hub Frontend](https://img.shields.io/docker/v/elipcs/ataljudge-frontend?label=frontend&logo=docker)](https://hub.docker.com/r/elipcs/ataljudge-frontend)
[![Docker Hub Backend](https://img.shields.io/docker/v/elipcs/ataljudge-backend?label=backend&logo=docker)](https://hub.docker.com/r/elipcs/ataljudge-backend)

AtalJudge is a comprehensive online judge platform designed for educational institutions. It combines powerful code execution, intelligent test case generation using AI, and a modern user interface to create an exceptional learning experience for competitive programming.

## ✨ Key Features

### 🎯 Core Functionality
- **Multi-Language Support** - Execute code in 60+ programming languages via Judge0
- **Real-Time Judging** - Instant feedback on code submissions with detailed results
- **Test Case Management** - Create and manage test cases with JSON/CSV import support
- **Local Execution** - Run code locally for testing before submission

### 👥 User Management
- **Role-Based Access Control** - Three user roles: Student, Assistant, and Professor
- **Class Organization** - Create and manage classes with student enrollments
- **Invite System** - Secure invite codes for class enrollment
- **IP Whitelisting** - Restrict access during exams for academic integrity

### 📝 Question Management
- **Rich Text Editor** - Create questions with markdown, LaTeX math support, and code highlighting
- **Question Lists** - Organize questions into assignments and problem sets
- **Flexible Test Cases** - Support for multiple test cases with input/output validation
- **Grading System** - Automatic and manual grading with detailed feedback

### 📊 Analytics & Tracking
- **Submission History** - Complete tracking of all student submissions
- **Performance Metrics** - Analyze student performance and progress
- **Leaderboards** - Track rankings within classes
- **Detailed Results** - View execution time, memory usage, and test case results

## 🏗️ Architecture

AtalJudge consists of three main components:

```
┌─────────────────┐      ┌─────────────────┐
│                 │      │                 │
│    Frontend     │◄────►│    Backend      │
│   (Next.js)     │      │   (Express)     │
│   Port: 3000    │      │   Port: 3333    │
│                 │      │                 │
└─────────────────┘      └────────┬────────┘
                                  │
                                  │
                         ┌────────▼────────┐
                         │                 │
                         │     Judge0      │
                         │ (Code Execution)│
                         │   Port: 2358    │
                         │                 │
                         └─────────────────┘
```

### Components

1. **Frontend** (Next.js 15 + React 19 + TypeScript)
   - Modern, responsive UI with Tailwind CSS
   - Rich text editor with TipTap
   - LaTeX math rendering with KaTeX
   - Real-time submission tracking

2. **Backend** (Node.js 20 + Express + TypeScript)
   - RESTful API with JWT authentication
   - PostgreSQL database with TypeORM
   - Dedicated Redis for caching and queues
   - Email notifications

3. **Judge0** (Ruby + Docker)
   - Multi-language code execution engine
   - Secure sandboxed environment
   - Resource limit enforcement
   - Support for 60+ programming languages

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose** (recommended)
- **Node.js 20+** (for local development)
- **PostgreSQL 13+** (if not using Docker)
- **Redis 6+** (included in Docker setup)

### Installation

#### Option 1: Docker Hub Images (Fastest! ⚡)

Deploy in 3 commands using pre-built images:

```bash
# 1. Download deployment files
curl -o docker-compose.yml https://raw.githubusercontent.com/elipcs/AtalJudge/main/docker-compose.prod.yml.template
curl -o .env https://raw.githubusercontent.com/elipcs/AtalJudge/main/.env.example

# 2. Edit .env with your configuration
nano .env  # Set passwords and Gemini API key

# 3. Start services
docker-compose up -d
```

**OR use the quick-deploy script:**

```bash
wget -qO- https://raw.githubusercontent.com/elipcs/AtalJudge/main/scripts/quick-deploy.sh | bash
```

Access at: http://localhost:3000

📚 Full guide: [DEPLOYMENT.md](./DEPLOYMENT.md)  
🐳 Docker Hub: [DOCKER_HUB.md](./DOCKER_HUB.md)

---

#### Option 2: Build from Source (Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/elipcs/AtalJudge.git
   cd AtalJudge
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   
   Edit `.env` and set the required variables:
   ```env
   # Backend Database
   DB_USERNAME=ataljudge
   DB_PASSWORD=your_secure_password
   DB_DATABASE=ataljudge
   
   # Security
   SECRET_KEY=your_secret_key_here
   JWT_SECRET=your_jwt_secret_here
   
   # Google Gemini (for AI features)
   GEMINI_API_KEY=your_gemini_api_key
   
   # Frontend URLs
   NEXT_PUBLIC_API_URL=http://localhost:3333
   NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api
   
   # Judge0 Database
   JUDGE0_DB_USER=judge0
   JUDGE0_DB_PASSWORD=judge0_secure_password
   ```

4. **Generate secure secrets**
   ```bash
   # Generate JWT_SECRET
   openssl rand -base64 32
   
   # Generate SECRET_KEY
   openssl rand -base64 32
   ```

5. **Get Gemini API Key**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Add it to your `.env` file

6. **Start all services**
   ```bash
   docker-compose up -d
   ```

7. **Wait for services to be ready** (30-60 seconds)
   ```bash
   docker-compose ps
   ```

8. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3333
   - Judge0: http://localhost:2358

#### Option 2: Local Development

<details>
<summary>Click to expand local development instructions</summary>

1. **Clone and setup**
   ```bash
   git clone https://github.com/elipcs/AtalJudge.git
   cd AtalJudge
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Configure .env with your database credentials
   npm run migration:run
   npm run dev
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   # Configure .env with backend URL
   npm run dev
   ```



4. **Setup Judge0**
   - Follow the [Judge0 installation guide](https://github.com/judge0/judge0/blob/master/CHANGELOG.md)

</details>

### First Run Setup

1. **Create admin user**
   
   Once the backend is running, create your first admin user:
   ```bash
   curl -X POST http://localhost:3333/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@example.com",
       "password": "secure_password",
       "firstName": "Admin",
       "lastName": "User",
       "role": "PROFESSOR"
     }'
   ```

2. **Login**
   
   Visit http://localhost:3000 and login with your credentials

3. **Start creating content**
   - Create your first class
   - Add questions
   - Generate test cases
   - Invite students

## 📖 Usage Guide

### For Professors

#### Creating a Question

1. Navigate to **Questions** → **Create New**
2. Fill in the question details:
   - Title and description (supports Markdown and LaTeX)
   - Difficulty level
   - Time and memory limits
3. Add test cases:
   - **Manual**: Enter input/output pairs directly
   - **JSON/CSV Import**: Import test cases from files
4. Save and publish

#### Managing Classes

1. Go to **Classes** → **Create Class**
2. Set class name, description, and settings
3. Generate invite codes for students
4. Create question lists (assignments)
5. Monitor student submissions and grades

#### Grading

- **Automatic**: Code is automatically graded against test cases
- **Manual**: Override automatic grades when needed
- **Feedback**: Provide detailed feedback on submissions

### For Students

#### Submitting a Solution

1. Navigate to your class
2. Open a question from the assignment
3. Write your solution in the code editor
4. **Test Locally**: Run against sample inputs first
5. **Submit**: Submit for grading when ready
6. View results and feedback

#### Tracking Progress

- View your submission history
- See which test cases passed/failed
- Check your grades and rankings
- Review feedback from instructors

### For Assistants

- Help manage classes
- Grade submissions
- Provide feedback to students
- Monitor class progress

## 🔧 Configuration

### Environment Variables

#### Backend (`backend/.env`)

```env
# Server
PORT=3333
NODE_ENV=production

# Database
DB_HOST=backend-db
DB_PORT=5432
DB_USERNAME=ataljudge
DB_PASSWORD=your_password
DB_DATABASE=ataljudge

# Security
SECRET_KEY=your_secret_key
JWT_SECRET=your_jwt_secret

# Services
JUDGE0_API_URL=http://judge0-server:2358

# Backend Redis
REDIS_HOST=backend-redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

#### Frontend (`frontend/.env`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3333
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333/api
```



### Supported Programming Languages

AtalJudge supports 60+ languages via Judge0, including:

- C, C++, C#
- Java, Kotlin, Scala
- Python 2, Python 3
- JavaScript, TypeScript, Node.js
- Ruby, PHP, Perl
- Go, Rust, Swift
- Haskell, Erlang, Elixir
- And many more!

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test
npm run test:coverage
```

### Frontend Tests

```bash
cd frontend
npm test
```



## 📚 API Documentation

### Authentication

All API endpoints (except public routes) require JWT authentication:

```bash
# Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

# Response
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": { ... }
}

# Use token in subsequent requests
Authorization: Bearer <accessToken>
```

### Main Endpoints

#### Questions
- `GET /api/questions` - List all questions
- `GET /api/questions/:id` - Get question details
- `POST /api/questions` - Create new question
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

#### Submissions
- `GET /api/submissions` - List submissions
- `POST /api/submissions` - Submit code
- `GET /api/submissions/:id` - Get submission details
- `POST /api/submissions/:id/rerun` - Rerun submission

#### Classes
- `GET /api/classes` - List classes
- `GET /api/classes/:id` - Get class details
- `POST /api/classes` - Create class
- `PUT /api/classes/:id` - Update class
- `POST /api/classes/:id/enroll` - Enroll student

#### Test Cases
- `POST /api/test-cases/generate` - Generate test cases with AI
- `POST /api/test-cases/import` - Import from dataset
- `POST /api/test-cases/search-dataset` - Search dataset

For complete API documentation, see the [API Reference](docs/API.md) (when available).

## 🔒 Security

### Authentication & Authorization

- JWT-based authentication with access and refresh tokens
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Token expiration and refresh mechanism

### Code Execution Security

- Sandboxed execution environment (Judge0)
- Resource limits (CPU time, memory)
- Network isolation
- Input validation and sanitization

### Data Security

- SQL injection prevention via TypeORM
- XSS protection with input sanitization
- CSRF protection
- CORS configuration
- Rate limiting on API endpoints

### Production Recommendations

1. **Use HTTPS** - Deploy behind a reverse proxy with SSL/TLS
2. **Change Default Passwords** - Update all default credentials
3. **Enable Rate Limiting** - Protect against abuse
4. **Regular Backups** - Backup database regularly
5. **Monitor Logs** - Set up logging and monitoring
6. **Update Dependencies** - Keep all packages up to date
7. **Use Secrets Management** - Store secrets securely (AWS Secrets Manager, Vault, etc.)

## 🐳 Docker Deployment

### Production Docker Compose

For production deployment, use the production configuration:

```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Health Checks

All services include health checks:

```bash
# Check all services
docker-compose ps

# View logs
docker-compose logs -f

# Check specific service
docker-compose logs -f backend
```

### Scaling

Scale services horizontally:

```bash
# Scale backend workers
docker-compose up -d --scale backend=3

# Scale judge0 workers
docker-compose up -d --scale judge0-workers=5
```

## 📊 Monitoring

### Service Health

- Backend: `http://localhost:3333/health`
- Judge0: `http://localhost:2358/`

### Database

```bash
# Connect to backend database
docker-compose exec backend-db psql -U ataljudge

# Connect to judge0 database
docker-compose exec judge0-db psql -U judge0

# Connect to backend Redis
docker-compose exec backend-redis redis-cli -a your_redis_password

# Connect to judge0 Redis
docker-compose exec judge0-redis redis-cli
```

### Logs

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f backend

# Export logs
docker-compose logs --no-color > logs.txt
```

## 🛠️ Development

### Project Structure

```
AtalJudge/
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/              # App router pages
│   │   ├── components/       # React components
│   │   ├── contexts/         # React contexts
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API services
│   │   └── utils/            # Utilities
│   ├── public/               # Static files
│   └── package.json
│
├── backend/                   # Express backend
│   ├── src/
│   │   ├── controllers/      # HTTP handlers
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Data access
│   │   ├── models/           # TypeORM entities
│   │   ├── middlewares/      # Request middleware
│   │   ├── dtos/             # Data validation
│   │   ├── migrations/       # Database migrations
│   │   └── utils/            # Utilities
│   └── package.json
│

│
├── judge0-minimal/            # Judge0 setup
│   └── Dockerfile
│
├── docker-compose.yml         # Docker orchestration
└── README.md                  # This file
```

### Adding New Features

1. **Frontend**: Add components in `frontend/src/components/`
2. **Backend**: Add controllers, services, and repositories
3. **Database**: Create migrations with `npm run migration:generate`
4. **API**: Update controllers and add corresponding services

### Database Migrations

```bash
cd backend

# Generate migration from entity changes
npm run migration:generate -- src/migrations/YourMigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- **TypeScript**: Follow ESLint rules
- **Python**: Follow PEP 8
- **Commits**: Use conventional commits
- **Tests**: Add tests for new features

## 🙏 Acknowledgments

- [Judge0](https://judge0.com/) - Code execution engine
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI test case generation
- [Code-Contests-Plus](https://huggingface.co/datasets/ByteDance-Seed/code-contests-plus) - Test case dataset
- [TypeORM](https://typeorm.io/) - Database ORM
- [Next.js](https://nextjs.org/) - React framework
- [FastAPI](https://fastapi.tiangolo.com/) - Python API framework

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/elipcs/AtalJudge/issues)
- **Discussions**: [GitHub Discussions](https://github.com/elipcs/AtalJudge/discussions)
- **Email**: support@ataljudge.com (if available)

## 🗺️ Roadmap

### Current Version (v1.0)
- ✅ Multi-language code execution
- ✅ AI-powered test case generation
- ✅ Dataset integration
- ✅ Class management
- ✅ Grading system

### Future Plans
- [ ] Real-time collaborative coding
- [ ] Contest mode with leaderboards
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Plagiarism detection
- [ ] Code review features
- [ ] Integration with LMS (Canvas, Moodle)
- [ ] Multi-tenant support
- [ ] Advanced caching with Redis
- [ ] Kubernetes deployment support

---

**Built with ❤️ for programming education**
