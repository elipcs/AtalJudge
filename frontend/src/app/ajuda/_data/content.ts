export const helpContent = {
  students: {
    title: "Guia para Alunos",
    description: "Aprenda a usar a plataforma AtalJudge para resolver exercícios e acompanhar seu desempenho",
    sections: [
      {
        id: "submissoes",
        title: "Submeter Soluções",
        description: "Como enviar suas respostas de programação",
        content: `
A plataforma AtalJudge permite que você submeta soluções para os exercícios propostos pelos professores.

## Como Submeter uma Solução:

1. **Acesse uma Lista de Exercícios**: Vá até a seção "Listas" e selecione a lista que deseja resolver.

2. **Escolha uma Questão**: Clique em uma questão para visualizar seu enunciado e exemplos de entrada/saída.

3. **Escreva seu Código**: Cole ou escreva seu código no editor de texto fornecido.

4. **Escolha a Linguagem**: Selecione a linguagem de programação que você está usando (C++, Python, Java, etc).

5. **Envie sua Submissão**: Clique em "Submeter" para enviar sua solução ao sistema de avaliação.

6. **Visualize o Resultado**: Você receberá um feedback imediato indicando se sua solução está correta ou se contém erros.

## Linguagens Suportadas:
- C++ (G++ 11.2)
- Python 3 (3.11.2)
- Java (OpenJDK 11)
- JavaScript (Node.js 14)
- e outras...

## Dicas Importantes:
- Teste seu código localmente antes de submeter
- Preste atenção aos limites de tempo e memória
- Leia cuidadosamente o enunciado e os exemplos
- Você pode submeter quantas vezes quiser
        `,
      },
      {
        id: "notas",
        title: "Acompanhar Notas e Desempenho",
        description: "Visualize suas notas e acompanhe seu progresso",
        content: `
A página inicial e a seção de "Listas" mostram seu desempenho atual.

## Dashboard Pessoal:

Na página "Home", você verá:
- **Resumo Geral**: Estatísticas de quantos exercícios você resolveu
- **Listas Recentes**: As listas que você acessou recentemente
- **Submissões**: Histórico das suas submissões mais recentes

## Detalhes de Desempenho:

Em cada lista, você pode:
1. Visualizar quantas questões você já resolveu (com a marca de visto ✓)
2. Acompanhar sua pontuação em cada questão
3. Ver se atingiu as metas propostas pelo professor

## Submissões:

Na seção "Submissões":
- Veja o histórico completo de todas as suas submissões
- Filtre por lista, questão ou data
- Revise o código de submissões anteriores
- Acesse logs de execução detalhados

## Interpretando os Status:

- ✓ **Correto**: Sua solução passou em todos os testes
- ✗ **Errado**: Sua solução não passou em alguns testes
- ⚡ **Erro de Compilação**: Seu código não compilou
- ⏱ **Erro de Tempo**: Seu programa demorou muito
- 💾 **Erro de Memória**: Seu programa usou muita memória
        `,
      },
      {
        id: "cronograma",
        title: "Entender Cronograma e Prazos",
        description: "Como funcionam os prazos das listas de exercícios",
        content: `
Cada lista de exercícios tem um cronograma que você precisa respeitar.

## Status das Listas:

**📅 Futuras (Não Abertas)**
- Ainda não estão disponíveis para resolver
- Você pode visualizar o enunciado, mas não pode submeter

**🟢 Abertas**
- Você pode submeter soluções normalmente
- Há um prazo até o qual pode submeter

**📕 Fechadas**
- O prazo para submeter já acabou
- Você pode visualizar suas submissões passadas, mas não pode submeter mais

## Prazos:

Cada lista mostra:
- Data de abertura
- Data de fechamento
- Tempo restante para resolver

Procure resolver os exercícios **antes da data de fechamento** para não perder pontos.

## Dicas:

- 🔔 Comece com antecedência
- 📱 Acompanhe os prazos no calendário
- ⏰ Deixe tempo para testes e debugging
- 🙋 Tire dúvidas com o professor ou monitor antes do prazo
        `,
      },
      {
        id: "duvidas",
        title: "Perguntas Frequentes (FAQ)",
        description: "Respostas para dúvidas comuns de alunos",
        content: `
FAQ para alunos - será exibida em componente de accordion
        `,
      },
    ],
  },

  professors: {
    title: "Guia para Professores",
    description: "Gerencie suas turmas, crie exercícios e acompanhe o desempenho dos alunos",
    sections: [
      {
        id: "turmas",
        title: "Gerenciar Turmas",
        description: "Como criar e administrar suas turmas",
        content: `
As turmas são a base da organização na plataforma AtalJudge. Cada turma representa uma sala de aula ou grupo de alunos.

## Criar uma Nova Turma:

1. Vá até a seção "Turmas"
2. Clique em "Nova Turma"
3. Preencha os dados:
   - **Nome da Turma**: Ex: "Programação I - 2024.1"
   - **Código**: Código único da turma (Ex: "PROG-I-2024")
   - **Descrição**: Informações sobre a turma
   - **Semestre/Período**: Quando a turma é ofertada

4. Clique em "Criar Turma"

## Adicionar Alunos e Monitores:

### Usando Convites:

1. Abra a turma
2. Vá até "Gerenciar Membros" ou "Convites"
3. Gere um **Convite de Aluno** ou **Convite de Monitor**
4. Compartilhe o código com os alunos/monitores
5. Eles acessam "Convites" e usam o código para entrar

### Convites Diretos por Email (se disponível):

1. Insira o email do aluno
2. Um convite é enviado automaticamente

## Configurações da Turma:

- **Restrições de IP**: Controle quem pode acessar as listas
- **Modo de Pontuação**: Escolha como calcular pontos (todas as tentativas, melhor tentativa, etc)
- **Descrição e Informações**: Personalize a turma

## Remover Membros:

1. Acesse a lista de membros da turma
2. Clique em remover ao lado do aluno/monitor
3. Confirme a ação
        `,
      },
      {
        id: "listas",
        title: "Criar e Gerenciar Listas de Exercícios",
        description: "Prepare exercícios para seus alunos",
        content: `
Listas de exercícios são coleções de questões que você propõe aos alunos.

## Criar uma Nova Lista:

1. Na sua turma, vá até "Listas" ou "Gerenciar Listas"
2. Clique em "Nova Lista"
3. Configure:
   - **Título**: Nome descritivo (Ex: "Lista 1 - Estruturas de Controle")
   - **Descrição**: Informações gerais
   - **Data de Abertura**: Quando os alunos podem começar
   - **Data de Fechamento**: Deadline para submissões
   - **Modo de Pontuação**:
     - Primeira Submissão: Apenas a primeira submissão conta
     - Melhor Submissão: A melhor nota entre todas as tentativas
     - Todas as Submissões: Média de todas as tentativas

4. Clique em "Criar"

## Adicionar Questões à Lista:

1. Na lista, clique em "Adicionar Questão"
2. Escolha as questões que deseja adicionar
3. Clique em "Salvar"



## Editar e Remover Questões:

- Clique no ícone de edição para modificar uma questão
- Clique em remover para deletar (cuidado: submissões serão afetadas)

## Dicas Importantes:

- ✍️ Escreva enunciados claros e detalhados
- 📝 Forneça exemplos de entrada/saída
- ⏱️ Defina limites de tempo realistas
- 🧪 Teste seus casos de teste antes de liberar
- 📅 Dê tempo suficiente aos alunos
        `,
      },
      {
        id: "convites",
        title: "Gerar e Gerenciar Convites",
        description: "Convide alunos e monitores para suas turmas",
        content: `
Os convites são a forma principal de adicionar membros às turmas.

## Tipos de Convites:

**1. Convite de Aluno**
- Concede acesso de visualização e submissão de exercícios
- Alunos veem apenas suas próprias submissões

**2. Convite de Monitor**
- Acesso gerencial limitado
- Pode visualizar submissões de alunos
- Pode ajudar na gestão, mas não alterar configurações principais

**3. Convite de Professor** (se você for admin)
- Acesso total ao sistema

## Como Gerar um Convite:

1. Abra a turma desejada
2. Vá até "Gerenciar Membros" → "Gerar Convites"
3. Selecione o tipo (Aluno/Monitor)
4. Escolha:
   - **Convite Único**: Para uma pessoa específica
   - **Convite em Lote**: Para múltiplas pessoas
   
5. Clique em "Gerar"
6. Compartilhe o código com os alunos/monitores

## Como os Alunos Usam o Convite:

1. Aluno acessa "Convites" no menu
2. Insere o código de convite
3. É adicionado à turma automaticamente

## Gerenciar Convites Ativos:

- Visualize todos os convites gerados
- Veja quantas vezes foram usados
- Revogue convites quando necessário
- Exporte relatórios de convites

## Segurança:

- Códigos expiram após 30 dias (configurável)
- Cada convite pode ser usado uma única vez ou múltiplas (ajustável)
- Você pode cancelar convites a qualquer momento
        `,
      },
      {
        id: "submissoes",
        title: "Visualizar e Avaliar Submissões",
        description: "Acompanhe o trabalho dos seus alunos",
        content: `
A visualização de submissões permite que você acompanhe o progresso e avalie o trabalho dos alunos.

## Acessar Submissões:

1. Na turma, vá até "Submissões" ou "Resultados"
2. Você verá uma tabela com todas as submissões dos alunos
3. Filtros disponíveis:
   - Por aluno
   - Por questão
   - Por lista
   - Por data
   - Por status (Correto, Errado, Compilação, etc)

## Analisar Uma Submissão:

1. Clique em uma submissão para abrir os detalhes
2. Você verá:
   - **Código Enviado**: O código-fonte do aluno
   - **Resultado**: Status (Correto/Errado)
   - **Tempo de Execução**: Quanto tempo levou
   - **Uso de Memória**: Quanto foi consumido
   - **Saída Esperada vs Saída do Aluno**: Comparação
   - **Log de Execução**: Detalhes técnicos

3. Se necessário, adicione comentários ou feedback

## Gerar Relatórios:

1. Vá até "Relatórios" ou "Estatísticas"
2. Escolha o tipo:
   - Relatório por aluno: Mostra desempenho individual
   - Relatório por questão: Quais questões foram mais difíceis
   - Estatísticas gerais: Visão geral da turma

3. Exporte em PDF ou CSV

## Entender os Status:

- ✓ **Correto (AC)**: Passou em todos os testes
- ✗ **Apresentação Errada (WA)**: Saída diferente
- ⚡ **Erro de Compilação (CE)**: Código não compilou
- ⏱ **Limite de Tempo Excedido (TLE)**: Demorou muito
- 💾 **Limite de Memória Excedido (MLE)**: Usou muita memória
- 🔄 **Runtime Error (RE)**: Erro durante execução
        `,
      },
      {
        id: "configuracoes",
        title: "Configurações Avançadas",
        description: "Ajustes técnicos da plataforma",
        content: `
## Restrições de IP:

Se você quer garantir que alunos resolvam exercícios apenas no campus, configure:

1. Vá para "Configurações da Turma"
2. "Segurança" → "Restrições de IP"
3. Adicione os IPs ou faixas de IP permitidas
4. Alunos fora dessa faixa não conseguem submeter

## Modo de Pontuação:

Configure como calcular a nota final:
- **Primeira Submissão**: Nota da primeira tentativa
- **Melhor Submissão**: Melhor nota entre todas
- **Média Aritmética**: Média de todas as submissões
- **Média Ponderada**: Com pesos customizados

## Backup e Exportação:

1. Em "Configurações da Turma", clique em "Exportar Dados"
2. Escolha o formato (JSON, CSV)
3. Inclua: turma, alunos, questões, submissões
4. Faça backup regularmente

## Resetar Dados:

⚠️ **Cuidado!** Esta ação é irreversível.

1. Vá para "Configurações Avançadas"
2. Clique em "Resetar Dados da Turma"
3. Escolha o que resetar:
   - Apenas submissões dos alunos
   - Turma inteira (membros, listas, tudo)

4. Confirme digitando o nome da turma
5. Clique em "Deletar"
        `,
      },
      {
        id: "faq",
        title: "Perguntas Frequentes (FAQ)",
        description: "Respostas para dúvidas comuns de professores",
        content: `
FAQ para professores - será exibida em componente de accordion
        `,
      },
    ],
  },

  assistants: {
    title: "Guia para Monitores",
    description: "Auxiliar na gestão de turmas e no suporte aos alunos",
    sections: [
      {
        id: "acesso",
        title: "Acessar Turmas e Dados",
        description: "Como monitores acessam as informações da turma",
        content: `
Como monitor, você tem acesso limitado às informações da turma para ajudar no suporte.

## Acesso Inicial:

1. Você recebe um **Convite de Monitor** de um professor
2. Vá até a seção "Convites" ou use o link direto
3. Insira o código de convite
4. Você é adicionado à turma como monitor

## Permissões de um Monitor:

✅ Pode:
- Visualizar todas as submissões dos alunos
- Ver dados de desempenho da turma
- Acessar histórico de submissões
- Ver comentários e feedback
- Consultar estatísticas gerais

❌ Não pode:
- Criar ou editar listas de exercícios
- Alterar datas ou prazos
- Remover alunos
- Gerar ou revogar convites
- Modificar configurações da turma
- Deletar submissões

## Navegação:

No dashboard, você terá acesso a:
- **Home**: Resumo da turma
- **Turmas**: Ver suas turmas como monitor
- **Submissões**: Visualizar todas as submissões
- **Relatórios**: Análises de desempenho
- **Membros**: Ver alunos da turma
        `,
      },
      {
        id: "submissoes",
        title: "Analisar Submissões de Alunos",
        description: "Como revisar e fornecer feedback",
        content: `
Uma das principais responsabilidades do monitor é ajudar alunos analisando suas submissões.

## Acessar Submissões:

1. Vá até "Submissões" na turma
2. Você verá uma tabela com todas as submissões
3. Filtre por:
   - Aluno específico
   - Questão
   - Data
   - Status (Correto, Errado, etc)

## Revisar Uma Submissão:

1. Clique na submissão para abrir detalhes
2. Você verá:
   - Código do aluno
   - Resultado da avaliação
   - Tempo e memória utilizados
   - Saída esperada vs saída recebida

3. Analise se há:
   - Erros lógicos
   - Problemas de implementação
   - Oportunidades de otimização

## Fornecer Feedback:

1. Na página de detalhes da submissão, procure a seção "Comentários"
2. Clique em "Adicionar Comentário"
3. Escreva feedback construtivo:
   - Aponte o que está errado
   - Sugira melhorias
   - Dê dicas de otimização

4. Clique em "Enviar"

## Suporte Direto:

Se um aluno tirar dúvida com você:
- Revise o código juntos
- Explique conceitos
- Sugira recursos de aprendizado
- Direcione para o professor se necessário

## Exemplo de Feedback Útil:

❌ Ruim: "Seu código está errado"

✅ Bom: "Sua lógica está correta, mas há um erro no tratamento de casos limite. Quando a entrada é vazia, o programa deveria retornar 0, não gerar exceção. Tente validar a entrada antes de processar."
        `,
      },
      {
        id: "desempenho",
        title: "Acompanhar Desempenho da Turma",
        description: "Gere relatórios e identifique alunos que precisam de ajuda",
        content: `
Monitores devem acompanhar o desempenho geral para identificar alunos que precisam de suporte.

## Dashboard de Desempenho:

Na home da turma como monitor, você vê:
- **Estatísticas Gerais**:
  - Total de alunos
  - Média de exercícios resolvidos
  - Taxa de sucesso geral

- **Topo Desempenho**: Alunos com melhor desempenho
- **Alunos com Dificuldades**: Quem está atrasado

## Visualizar Relatórios:

1. Acesse "Relatórios" da turma
2. Escolha o tipo:
   - **Por Aluno**: Mostra taxa de acerto de cada um
   - **Por Questão**: Qual exercício é mais difícil
   - **Tendência**: Desempenho ao longo do tempo

3. Exporte em PDF/CSV se necessário

## Identificar Alunos em Dificuldade:

Preste atenção em:
- Alunos com submissões muito incorretas
- Quem não está entregando no prazo
- Padrão de sempre usar linguagens "mais fáceis"
- Muitos erros de compilação

## Ações Recomendadas:

Quando você identifica um aluno em dificuldade:

1. **Oferça suporte**: "Percebi que você está com dificuldade em recursão. Posso ajudar?"
2. **Indique recursos**: Links para tutoriais, explicações
3. **Organize sessão de ajuda**: Com o professor se necessário
4. **Acompanhe progresso**: Veja se melhorou após o suporte

## Comunicação com Professor:

Se notar problemas sistêmicos (ex: toda turma com dificuldade):
- Reportar ao professor
- Sugerir revisão de conteúdo
- Indicar necessidade de mais exercícios
        `,
      },
      {
        id: "gerenciamento",
        title: "Gerenciar Convites e Membros",
        description: "Auxiliar na gestão de turmas",
        content: `
Dependendo das permissões, monitores podem ajudar no gerenciamento de turmas.

## Visualizar Membros:

1. Abra a turma
2. Vá até "Membros" ou "Gerenciar Turma"
3. Você verá:
   - Todos os alunos cadastrados
   - Monitores ativos
   - Professor(es) responsável(is)

## Convites (Se Autorizado):

Alguns professores permitem que monitores:
- Visualizem convites gerados
- Vejam quantas pessoas usaram cada convite
- Rastreiem novos alunos adicionados

Se você tiver essa permissão:
1. Vá até "Gerenciar Convites"
2. Visualize o status de cada convite
3. Reporte ao professor se um convite não está funcionando

## Dados Exportados:

Você pode exportar dados da turma (se permitido):
- Lista de alunos
- Histórico de submissões
- Relatórios de desempenho

Esses dados ajudam na comunicação com o professor e em planejar suporte.

## Boas Práticas:

- 📋 Mantenha registro de interações com alunos
- 📧 Comunique-se regularmente com o professor
- 📊 Use dados para identificar padrões
- ⏰ Respeite prazos e horários
- 🤝 Seja justo e imparcial com todos os alunos
        `,
      },
      {
        id: "comunicacao",
        title: "Comunicação e Boas Práticas",
        description: "Como ser um bom monitor",
        content: `
Além de funcionalidades técnicas, um monitor eficaz precisa de boas práticas de comunicação.

## Princípios de um Bom Monitor:

### 1️⃣ Acessibilidade
- Esteja disponível nos horários combinados
- Responda perguntas em tempo razoável
- Use múltiplos canais (chat, email, presencial)

### 2️⃣ Paciência
- Alunos têm diferentes níveis de compreensão
- Repita explicações quando necessário
- Não se irrite com dúvidas "óbvias"

### 3️⃣ Clareza
- Explique conceitos de forma simples
- Use exemplos práticos
- Mostre no código quando possível

### 4️⃣ Imparcialidade
- Trate todos os alunos igualmente
- Não favoreça nem discrimine ninguém
- Mantenha sigilo sobre informações

### 5️⃣ Profissionalismo
- Use linguagem apropriada
- Respeite horários
- Seja organizado e documentado

## Exemplos de Interação Eficaz:

❌ Ruim:
Aluno: "Não entendi recursão"
Monitor: "É simples, só decorar a fórmula"

✅ Bom:
Aluno: "Não entendi recursão"
Monitor: "Recursão é quando uma função chama a si mesma. Deixa eu te mostrar com um exemplo simples - factorial(5) chama factorial(4), que chama factorial(3), e assim até o caso base. Quer que eu mostre no código?"

## Sinais de Que Você Está Ajudando:

- Alunos buscam sua ajuda com frequência
- Desempenho melhora após interações
- Feedback positivo de alunos e professor
- Redução de dúvidas repetidas

## Limitações do Monitor:

Saiba o que você NÃO pode fazer:
- Não altere notas ou resultados
- Não dê respostas prontas para exercícios
- Não modifique código de alunos
- Não ignore reporte de problemas técnicos

Se encontrar problemas técnicos ou solicitações fora do escopo, reporte ao professor.
        `,
      },
      {
        id: "faq",
        title: "Perguntas Frequentes (FAQ)",
        description: "Respostas para dúvidas comuns de monitores",
        content: `
FAQ para monitores - será exibida em componente de accordion
        `,
      },
    ],
  },

  faqContent: {
    students: [
      {
        question: "Quantas vezes posso submeter uma solução?",
        answer:
          "Você pode submeter quantas vezes desejar até o prazo de fechamento da lista. Não há limite de tentativas. O professor pode configurar se a nota final é da primeira tentativa, da melhor tentativa ou a média.",
      },
      {
        question: "Posso submeter de qualquer lugar?",
        answer:
          "Geralmente sim, mas alguns professores podem configurar restrições de IP para garantir que submissões sejam feitas apenas no campus. Verifique as instruções da sua turma.",
      },
      {
        question: "O que significa 'Presentation Error'?",
        answer:
          "Significa que seu código compilou e rodou, mas a saída não corresponde à saída esperada. Geralmente pode ser espaços em branco extras, quebras de linha incorretas ou diferenças na formatação.",
      },
      {
        question: "Como vejo meu histórico de submissões?",
        answer:
          "Acesse a seção 'Submissões' no menu. Você verá todas as suas submissões com datas, questões e resultados. Clique em uma para ver detalhes completos incluindo código e logs.",
      },
      {
        question: "Posso recuperar uma submissão antiga?",
        answer:
          "Sim! Na seção de Submissões, clique em uma submissão anterior para ver o código. Você pode copiá-lo de volta para o editor se quiser.",
      },
      {
        question: "O professor pode ver meu código?",
        answer:
          "Sim, o professor e monitores autorizado podem visualizar seu código em qualquer momento para ajudá-lo ou avaliar. Portanto, sempre envie código do qual você entende.",
      },
    ],
    professors: [
      {
        question:
          "Como garantir que alunos resolvem exercícios apenas no campus?",
        answer:
          "Configure Restrições de IP nas Configurações da Turma. Adicione os IPs ou faixas de IP do campus. Alunos tentando acessar fora dessa faixa receberão erro de acesso.",
      },
      {
        question: "Como faço backup das minhas turmas?",
        answer:
          "Na seção Configurações da Turma, clique em 'Exportar Dados'. Escolha o formato (JSON ou CSV) e faça download. Isso inclui turma, alunos, questões e submissões.",
      },
      {
        question: "Posso modificar uma questão após os alunos iniciarem?",
        answer:
          "Você pode editar questões, mas isso pode afetar submissões já feitas. Se fizer mudanças significativas, considere comunicar aos alunos ou criar uma questão nova em sua lista.",
      },
      {
        question: "Como identificar alunos que estão copiando respostas?",
        answer:
          "A plataforma oferece ferramentas de análise de similaridade de código (se disponível). Você também pode revisar os tempos de submissão e conversar com alunos suspeitos para entender sua solução.",
      },
      {
        question:
          "Qual é o limite de alunos que posso ter em uma turma?",
        answer:
          "Não há limite técnico, mas é recomendado ter suporte (monitores) se a turma for muito grande (100+ alunos).",
      },
    ],
    assistants: [
      {
        question: "Como ajo se um aluno não consigo ajudar?",
        answer:
          "Se um aluno tem dúvida que vai além do escopo de monitor (conceitos avançados, mudanças no sistema, etc), reporte ao professor responsável. Você pode marcar a dúvida como 'Escalada para Professor'.",
      },
      {
        question: "Posso deletar uma submissão de aluno?",
        answer:
          "Não, monitores não têm permissão para deletar submissões. Isso é restrito ao professor para manter auditoria. Se houver um erro, reporte ao professor.",
      },
      {
        question: "Como comunico com o professor sobre problemas?",
        answer:
          "Use o canal de comunicação definido pelo professor (email, Slack, Teams, etc). Sempre reporte questões técnicas, suspeitas de cópia ou alunos com desempenho crítico.",
      },
      {
        question: "Posso ver informações sensíveis dos alunos?",
        answer:
          "Você tem acesso apenas a informações acadêmicas (submissões, notas, dados de desempenho). Informações pessoais como email pessoal ou endereço geralmente não são visíveis a monitores.",
      },
      {
        question:
          "Qual é meu horário de disponibilidade como monitor?",
        answer:
          "Isso é definido entre você e o professor. Geralmente, você tem horários específicos (ex: terças e quintas 10-12). Comunique aos alunos quando estará disponível.",
      },
    ],
  },
};
