# Teste Técnico - Desenvolvedor Fullstack TypeScript


## Como Executar o Teste

Você terá liberdade total para escolher suas tecnologias e arquitetura, desde que utilize TypeScript tanto no frontend quanto no backend.

1. Faça um fork deste repositório
2. Crie um arquivo `README.md` na raiz do projeto contendo:
- **Arquitetura:** Explique brevemente as decisões arquiteturais que tomou
- **Tecnologias:** Liste todas as tecnologias, bibliotecas e ferramentas utilizadas
- **Como executar:** Instruções passo a passo para rodar a aplicação localmente
- **Decisões de Design:** Explique escolhas importantes (por que escolheu X tecnologia, como estruturou o projeto, etc.)
3. Faça a gravação da sua jornada e disponibilize no YouTube (como não listado), ao final, responda o e-mail que foi enviado para você com o link do vídeo.

**IMPORTANTE:** Permitimos o uso de IA Generativa. No entanto, você DEVE documentar:
- **Quando você usou IA:** Liste todas as situações em que utilizou IA Generativa
- **Por que você usou:** Explique o motivo do uso da IA Generativa.
- **Honestidade:** Seja transparente - não há problema em usar IA, mas é essencial que você compreenda o código que entregou

---

## História de Usuário

### Como um usuário, eu quero gerenciar minhas tarefas pessoais

**Contexto:**
Você precisa desenvolver uma aplicação web completa que permita aos usuários criar, visualizar, editar e excluir tarefas pessoais. As tarefas devem ter título, descrição, status (pendente/concluída) e data de criação.

**Requisitos Funcionais:**

1. **Autenticação de Usuário**
   - O usuário deve poder se cadastrar com email e senha
   - O usuário deve poder fazer login
   - O usuário deve poder fazer logout
   - As rotas devem ser protegidas (apenas usuários autenticados podem acessar)

2. **Gerenciamento de Tarefas**
   - Listar todas as tarefas do usuário logado
   - Criar nova tarefa (título obrigatório, descrição opcional)
   - Editar tarefa existente
   - Excluir tarefa
   - Marcar tarefa como concluída/pendente

3. **Interface do Usuário**
   - Interface moderna e responsiva
   - Validação de formulários no frontend

**Requisitos Técnicos:**

- **Backend:**
  - API RESTful em TypeScript
  - Banco de dados (sua escolha: PostgreSQL, MongoDB, SQLite, etc.)
  - Autenticação JWT
  - Validação de dados de entrada
  - Tratamento de erros adequado

- **Frontend:**
  - Aplicação em TypeScript 
  - Consumo da API REST
  - Gerenciamento de estado
  - Roteamento
  - Resposividade

---

Boa sorte!