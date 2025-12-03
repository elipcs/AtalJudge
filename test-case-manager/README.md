# Microsserviço Test Case Manager para AtalJudge

Microsserviço unificado em Python/FastAPI que automatiza **geração e import** de casos de teste para problemas de programação competitiva, integrando com o AtalJudge via API REST e utilizando Google Gemini para inferência inteligente do formato de entrada.

## Visão Geral

Este microsserviço gerencia casos de teste automaticamente para questões de programação competitiva com **duas funcionalidades principais**:

### 🔧 Geração Inteligente
- **Google Gemini**: Infere o formato de entrada a partir do enunciado e exemplo
- **Validação**: Verifica se as entradas geradas seguem o formato esperado
- **Geração variada**: Cria casos edge, aleatórios e de limite
- **Execução segura**: Executa o código base Python para obter saídas esperadas

### 📥 Import do Dataset
- **Code-Contests-Plus**: Importa casos de teste do dataset da ByteDance
- **Cache Local**: Armazena em SQLite para queries rápidas
- **Busca**: Encontra problemas por palavra-chave
- **Batch Import**: Importa múltiplos casos de uma só vez

## Arquitetura

```
AtalJudge Backend (TypeScript, porta 3333)
    ↓ API REST (JWT)
Test Case Manager (Python/FastAPI, porta 8000)
    ├─ GERAÇÃO
    │   ├─ Gemini API (Inferência de formato)
    │   ├─ Validação de entradas
    │   ├─ Geração de casos (edge cases, aleatórios, limites)
    │   └─ Execução segura de código base (Python subprocess)
    │
    └─ IMPORT
        ├─ Dataset Service (scripts/import_dataset)
        ├─ SQLite Cache (dataset_*.db)
        └─ Hugging Face (ByteDance Code-Contests-Plus)
```

## Funcionalidades

### Geração 🔧
- ✅ Inferência automática de formato de entrada usando Gemini
- ✅ Geração de casos de teste variados (edge cases, aleatórios, limites)
- ✅ Validação de entradas geradas
- ✅ Execução segura de código Python com timeout
- ✅ Integração com API do AtalJudge
- ✅ Salvamento automático de casos de teste no AtalJudge

### Import 📥
- ✅ Busca no dataset Code-Contests-Plus
- ✅ Cache local em SQLite (muito mais rápido)
- ✅ Import em lote de casos de teste
- ✅ Suporte a múltiplas configurações (1x-5x)
- ✅ Integração direta com AtalJudge

## Pré-requisitos

- Python 3.10 ou superior
- Conta no Google AI Studio (para API key do Gemini)
- AtalJudge backend rodando (porta 3333)
- JWT token válido do AtalJudge (opcional)

## Instalação

### 1. Clonar o repositório

```bash
cd test-case-
```

### 2. Criar ambiente virtual

```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# ou
venv\Scripts\activate  # Windows
```

### 3. Instalar dependências

```bash
pip install -r requirements.txt
```

### 4. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Servidor
HOST=0.0.0.0
PORT=8000
DEBUG=False
# Auto-reload: ativo por padrão (True), reinicia automaticamente quando há mudanças no código
# Desative com AUTO_RELOAD=false para produção
AUTO_RELOAD=True

# AtalJudge API
ATALJUDGE_API_URL=http://localhost:3333/api

# JWT Configuration (mesmo secret do AtalJudge)
JWT_SECRET=your_jwt_secret_from_ataljudge
# ou
ATALJUDGE_JWT_SECRET=your_jwt_secret_from_ataljudge

# Google Gemini
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash

# Execução de código
CODE_TIMEOUT_SECONDS=5
MAX_TEST_CASES=50

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3333
```

### 5. Obter API key do Gemini

1. Acesse [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crie uma nova API key
3. Adicione a key no arquivo `.env`

## Uso

### Executar o servidor

```bash
python run.py
```

O servidor estará disponível em `http://localhost:8000`

### Usar com Docker

```bash
docker-compose up -d
```

## API Endpoints

### 🔧 GERAÇÃO

#### POST /api/generate

Gera casos de teste para uma questão.

**Headers:**
- `Authorization: Bearer <jwt-token>` (obrigatório)

**Request:**
```json
{
  "question_id": "uuid-da-questao",
  "oracle_code": "n = int(input())\nprint(n * 2)",
  "count": 20,
  "use_gemini": true
}
```

**Response:**
```json
{
  "test_cases": [
    {
      "input": "5",
      "output": "10"
    },
    {
      "input": "10",
      "output": "20"
    }
  ],
  "total_generated": 20,
  "algorithm_type": "default",
  "format_schema": {...}
}
```

### 📥 IMPORT

#### POST /api/import

Importa casos de teste do dataset Code-Contests-Plus.

**Headers:**
- `Authorization: Bearer <jwt-token>` (obrigatório)

**Request:**
```json
{
  "question_id": "uuid-da-questao",
  "dataset_problem_id": "problem_123",
  "test_cases_count": 20,
  "config": "1x"
}
```

**Response:**
```json
{
  "test_cases": [
    {
      "input": "5 10",
      "output": "15"
    }
  ],
  "total_imported": 20,
  "dataset_source": "Code-Contests-Plus",
  "message": "20 casos importados com sucesso"
}
```

#### POST /api/search-dataset

Busca problemas no dataset.

**Headers:**
- `Authorization: Bearer <jwt-token>` (obrigatório)

**Query Parameters:**
- `query`: Termo de busca (ex: "graph")
- `limit`: Máximo de resultados (padrão: 20)
- `config`: Configuração do dataset (padrão: "1x")

**Response:**
```json
{
  "status": "success",
  "results": [
    {
      "id": "problem_123",
      "title": "Graph Traversal",
      "description": "...",
      "difficulty": "Medium",
      "test_case_count": 25
    }
  ],
  "total_found": 5,
  "config": "1x"
}
```

#### GET /api/dataset-status

Obtém status do dataset importado.

**Headers:**
- `Authorization: Bearer <jwt-token>` (obrigatório)

**Query Parameters:**
- `config`: Configuração do dataset (padrão: "1x")

**Response:**
```json
{
  "status": "completed",
  "config": "1x",
  "total_problems": 13542,
  "total_test_cases": 324156,
  "last_import": "2024-12-03T10:30:45"
}
```

### Utilidade

#### GET /health

Health check do microsserviço.

**Response:**
```json
{
  "status": "healthy",
  "service": "test-case-manager",
  "version": "2.0.0"
}
```

## Exemplos de Uso

### Exemplo 1: Gerar casos de teste

```bash
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-jwt-token-do-ataljudge" \
  -d '{
    "question_id": "123e4567-e89b-12d3-a456-426614174000",
    "oracle_code": "n = int(input())\nprint(n * 2)",
    "count": 10,
    "use_gemini": true
  }'
```

### Exemplo 2: Buscar problemas no dataset

```bash
curl -X POST "http://localhost:8000/api/search-dataset?query=graph&limit=5" \
  -H "Authorization: Bearer seu-jwt-token-do-ataljudge"
```

### Exemplo 3: Importar casos de teste do dataset

```bash
curl -X POST http://localhost:8000/api/import \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-jwt-token-do-ataljudge" \
  -d '{
    "question_id": "123e4567-e89b-12d3-a456-426614174000",
    "dataset_problem_id": "problem_123",
    "test_cases_count": 20,
    "config": "1x"
  }'
```

### Exemplo 4: Verificar status do dataset

```bash
curl "http://localhost:8000/api/dataset-status?config=1x" \
  -H "Authorization: Bearer seu-jwt-token-do-ataljudge"
```

## Documentação

Para informações detalhadas sobre as abordagens teóricas e práticas de geração de casos de teste implementadas neste projeto, consulte:

- **[Abordagens da Literatura para Geração de Casos de Teste](docs/LITERATURE_APPROACHES.md)**: Documentação completa sobre técnicas acadêmicas e práticas para geração de casos de teste, incluindo:
  - Abordagens já implementadas no projeto
  - Técnicas da literatura (Boundary Value Analysis, Equivalence Partitioning, Metamorphic Testing, etc.)
  - Comparação e recomendações de uso
  - Referências bibliográficas

## Estrutura do Projeto

```
test-case-generator/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app unificado
│   ├── config.py               # Configurações
│   ├── models/
│   │   ├── request.py          # DTOs de requisição (geração + import)
│   │   └── response.py         # DTOs de resposta
│   ├── services/
│   │   ├── ataljudge_client.py      # Cliente HTTP para AtalJudge
│   │   ├── gemini_service.py        # Integração com Gemini
│   │   ├── format_inference.py      # Inferência de formato
│   │   ├── input_validator.py       # Validação de entradas
│   │   ├── test_case_generator.py   # Geração de casos
│   │   ├── code_executor.py         # Execução de código
│   │   ├── test_case_service.py     # Serviço de geração
│   │   └── dataset_import_service.py # Serviço de import (novo!)
│   ├── routers/
│   │   └── manager.py          # Rotas unificadas (novo!)
│   └── utils/
│       ├── logger.py           # Logging
│       └── security.py         # Segurança
├── docs/
│   └── LITERATURE_APPROACHES.md # Documentação sobre abordagens da literatura
├── tests/
│   └── test_generator.py       # Testes
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Fluxo de Execução

1. Cliente chama `POST /api/generate` com `question_id` e `oracle_code`
2. Microsserviço busca questão no AtalJudge via API REST
3. Gemini infere formato de entrada a partir do enunciado + exemplo
4. Gerador cria entradas variadas (edge cases + aleatórios)
5. Validador verifica se entradas seguem o formato
6. Executor roda código base para cada entrada válida
7. Retorna pares `{input, output}` em JSON

## Testes

Execute os testes:

```bash
pytest
```

Com cobertura:

```bash
pytest --cov=app tests/
```

## Segurança

- Execução de código isolada (subprocess com timeout)
- Validação de entradas antes de executar
- Sem acesso ao sistema de arquivos
- CORS configurado
- Rate limiting (opcional)

## Autenticação

Todas as rotas (exceto `/health` e `/`) requerem autenticação JWT do AtalJudge.

### Configuração JWT

1. **Obter JWT_SECRET do AtalJudge:**
   - O mesmo `JWT_SECRET` usado no backend TypeScript do AtalJudge
   - Configurar no arquivo `.env`:
     ```env
     JWT_SECRET=seu_jwt_secret_do_ataljudge
     ```

2. **Formato do Token:**
   - Issuer: `ataljudge`
   - Audience: `ataljudge-api`
   - Algoritmo: `HS256`
   - Tipo: `access`

3. **Uso do Token:**
   - Enviar no header: `Authorization: Bearer <token>`
   - Token deve ser válido e não expirado

### Obter Token JWT

1. Fazer login no AtalJudge via API:
   ```bash
   curl -X POST http://localhost:3333/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "seu-email@example.com",
       "password": "sua-senha"
     }'
   ```

2. Usar o `accessToken` retornado nas requisições ao microsserviço

## Troubleshooting

### Erro: "GEMINI_API_KEY não configurada"

Certifique-se de que a variável `GEMINI_API_KEY` está configurada no arquivo `.env`.

### Erro: "Token não fornecido" ou "Token inválido"

Verifique se:
- O header `Authorization: Bearer <token>` está presente
- O token JWT é válido e não expirado
- O `JWT_SECRET` está configurado corretamente (mesmo do AtalJudge)
- O token tem issuer `ataljudge` e audience `ataljudge-api`

### Erro: "Erro ao buscar questão no AtalJudge"

Verifique se:
- O AtalJudge backend está rodando na porta 3333
- A URL `ATALJUDGE_API_URL` está correta
- O JWT token está válido e não expirado

### Erro: "Timeout na execução do código"

Aumente o valor de `CODE_TIMEOUT_SECONDS` no arquivo `.env`.

## Próximos Passos

### Setup do Dataset Import
Antes de usar a funcionalidade de import, execute uma vez:

```powershell
cd ..\scripts\import_dataset
python run_import.py --config 1x
```

Isso baixa e cria cache do dataset (demora ~10-15 minutos na primeira vez).

## Expansões Futuras

- Suporte a múltiplas linguagens (C++, Java)
- Cache de inferências do Gemini
- Fila de geração assíncrona (Redis/BullMQ)
- Webhooks para notificações
- Interface web (Streamlit)
- Integração com mais datasets

## Licença

MIT

## Autor

AtalJudge Team











