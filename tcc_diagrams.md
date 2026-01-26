# Diagramas de Arquitetura - AtalJudge

## Diagrama de Container (C4 Model)

Este diagrama detalha os contêineres que compõem o sistema AtalJudge, suas responsabilidades e tecnologias.

```mermaid
C4Container
    title Diagrama de Container - Sistema AtalJudge

    Person(student, "Estudante", "Submete soluções para problemas de programação.")
    Person(professor, "Professor", "Gerencia questões, turmas e visualiza relatórios.")
    Person(monitor, "Monitor", "Auxilia no acompanhamento das turmas.")

    System_Boundary(ataljudge, "AtalJudge System") {
        Container(webapp, "Aplicação Web / Frontend", "Next.js, React, TypeScript", "Interface do usuário para navegação, editor de código e dashboards.")
        Container(api, "API Backend", "Node.js, Express, TypeScript", "Gerencia regras de negócio, autenticação e orquestração de submissões.")
        
        ContainerDb(database, "Banco de Dados Principal", "PostgreSQL", "Armazena usuários, questões, submissões e resultados.")
        ContainerDb(cache, "Redis (Fila & Cache)", "Redis", "Gerencia a fila de processamento (BullMQ) e cache de sessões.")
        
        System_Boundary(judge0_cluster, "Subsistema Judge0 (Execução)") {
            Container(judge0_api, "Judge0 Server", "C++, Go", "API de execução de código sandboxed.")
            Container(judge0_worker, "Judge0 Workers", "Docker", "Processa as execuções de código de forma isolada.")
            ContainerDb(judge0_db, "Judge0 DB", "PostgreSQL", "Armazena dados internos do Judge0.")
            ContainerDb(judge0_redis, "Judge0 Cache", "Redis", "Fila interna do Judge0.")
        }
    }

    Rel(student, webapp, "Acessa via HTTPS", "Browser")
    Rel(professor, webapp, "Acessa via HTTPS", "Browser")
    Rel(monitor, webapp, "Acessa via HTTPS", "Browser")

    Rel(webapp, api, "Requisições JSON/HTTPS", "API REST")
    
    Rel(api, database, "Leitura/Escrita", "TypeORM/TCP")
    Rel(api, cache, "Enfileira Jobs / Cache", "Redis Protocol")
    
    Rel(api, judge0_api, "Envia código para execução", "HTTP/JSON")
    Rel(judge0_api, judge0_worker, "Distribui tarefas", "Interno")
    Rel(judge0_api, judge0_db, "Persiste metadados", "SQL")
    Rel(judge0_api, judge0_redis, "Coordenação", "Redis Protocol")
```

## Versão Compatível com Draw.io

Para editar este diagrama no **Draw.io**:
1. Abra o [draw.io](https://app.diagrams.net/).
2. Vá em **Arrange > Insert > Advanced > Mermaid**.
3. Cole o código abaixo (esta versão usa sintaxe padrão `graph TD` que é 100% suportada, ao contrário da sintaxe C4 que pode exigir plugins).

```mermaid
graph TD
    %% Estilos de Cores (C4 Like)
    classDef person fill:#08427b,stroke:#052e56,color:white,stroke-width:2px;
    classDef container fill:#1168bd,stroke:#0b4884,color:white,stroke-width:2px;
    classDef database fill:#2f95c7,stroke:#20688c,color:white,stroke-width:2px;
    classDef component fill:#85bbf0,stroke:#5d82a8,color:black,stroke-width:2px;

    %% Atores
    Student((Estudante)):::person
    Professor((Professor)):::person
    Monitor((Monitor)):::person

    %% Container Principal
    subgraph AtalJudge ["AtalJudge System"]
        direction TB
        WebApp["Aplicação Web<br/>[Next.js, React]"]:::container
        API["API Backend<br/>[Node.js, Express]"]:::container
        
        DB[("Banco de Dados<br/>[PostgreSQL]")]:::database
        Cache[("Redis<br/>[Fila & Cache]")]:::database
        
        %% Subsistema
        subgraph Judge0Cluster ["Subsistema Judge0"]
            direction TB
            J_API["Judge0 Server<br/>[C++, Go]"]:::component
            J_Worker["Judge0 Workers<br/>[Docker]"]:::component
            J_DB[("Judge0 DB")]:::component
            J_Redis[("Judge0 Cache")]:::component
        end
    end

    %% Relacionamentos
    Student -->|HTTPS| WebApp
    Professor -->|HTTPS| WebApp
    Monitor -->|HTTPS| WebApp
    
    WebApp -->|JSON/HTTPS| API
    
    API -->|TypeORM| DB
    API -->|BullMQ| Cache
    
    API -->|HTTP/JSON| J_API
    J_API -.->|Distribui Tarefa| J_Worker
    J_API -.->|Persiste| J_DB
    J_API -.->|Coordena| J_Redis
```

### Decisões Arquiteturais Relevantes

1. **Separação Frontend/Backend**: O Frontend em **Next.js** atua como uma SPA (Single Page Application) focada na experiência do usuário, enquanto o Backend em **Node.js/Express** centraliza a lógica de negócios.
2. **Processamento Assíncrono**: A comunicação entre a API e o Judge0 não é direta/bloqueante para o cliente final. A API utiliza uma fila **Redis (BullMQ)** para gerenciar picos de carga, garantindo que o servidor não trave mesmo com múltiplas submissões simultâneas.
3. **Isolamento de Execução**: O subsistema **Judge0** roda isolado, com seu próprio banco de dados e Redis, garantindo que falhas na execução de código (ex: loops infinitos, estourar memória) não afetem o banco de dados principal da aplicação.
