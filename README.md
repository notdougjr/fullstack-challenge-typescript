# Arquitetura

Após a leitura das instruções em [README_INSTRUCTIONS.md](./README_INSTRUCTIONS.md), decidi optar por uma infraestrutura Monorepo - no mesmo repositório irei compartilhar configurações entre front e back, por ser uma estrutura simples e ao mesmo tempo robusta, que irá me permitir ter uma visão compacta do código.

## Tecnologias

Configurei com pnpm workspace e turbo repo. As tecnologias do front serão - Next, Zustand, Tailwind, Shadcn. As tecnologias do back serão - Nestjs, Postgres, TypeORM para migrations... zod para ambos.

## Modelagem do Banco de Dados

Para a modelagem do banco pensei no seguinte:

### Entidades

**User** e **Tasks**

### Entidade: User

| Campo       | Tipo      | Constraint              |
| ----------- | --------- | ----------------------- |
| `id`        | UUID      | PRIMARY KEY, NOT NULL   |
| `email`     | String    | UNIQUE, NOT NULL        |
| `password`  | String    | NOT NULL                |
| `name`      | String    | NULL                    |
| `role`      | String    | NULL                    |
| `createdAt` | Timestamp | NOT NULL, DEFAULT NOW() |

### Entidade: Tasks

| Campo           | Tipo      | Constraint                      |
| --------------- | --------- | ------------------------------- |
| `id`            | UUID      | PRIMARY KEY, NOT NULL           |
| `createdBy`     | UUID      | FOREIGN KEY (User.id), NOT NULL |
| `assignedTo`    | UUID      | FOREIGN KEY (User.id), NULL     |
| `parentId`      | UUID      | FOREIGN KEY (Tasks.id), NULL    |
| `title`         | String    | NOT NULL                        |
| `status`        | Enum      | NOT NULL, DEFAULT 'PENDING'     |
| `dueDate`       | Date      | NULL                            |
| `startDate`     | Date      | NULL                            |
| `description`   | Text      | NULL                            |
| `type`          | Enum      | NOT NULL, DEFAULT 'TASK'        |
| `createdAt`     | Timestamp | NOT NULL, DEFAULT NOW()         |
| `updatedAt`     | Timestamp | NULL                            |
| `updatedLastBy` | UUID      | FOREIGN KEY (User.id), NULL     |

## Design do Frontend

Para o design do front pensei em algo parecido com Jira na visualização drag and drop e listagem de subtarefas.

## Divisão de Tarefas

Dividi as seguintes tarefas:

### EPIC - SETUP

- Fork repo de instrução
- Setup monorepo
- Setup front
- Setup back

### EPIC - BACK

- Configurar libs back
- Configurar migrations back
- CRUD User
- Criar lógicas de autenticação
- CRUD TASKS

### EPIC - FRONT

- Configurar libs front
- Configurar stores User e Task
- Criar layout padrão
- Criar tela de Registro
- Criar tela de Login
- Criar tela de listagem - Blocos de tarefas por status e drag and drop entre os status
- Criar modal de visualização de task
- Criar listagem de subtarefas dentro de tarefa
- Criar tela de visualização de task separada

---

## Desenvolvimento

Irei utilizar o Cursor para o desenvolvimento.

---

### Utilizações de IA Generativa

1 - Estou escrevendo neste documento de forma livre, ao final de cada vez que escrever irei solicitar para apenas organizar e formatar em markdown, mantendo exatamente o que escrevi.
2 - Solicitei auxílio para configurar o devcontainer deste projeto. Ainda não tenho total domínio na criação e para não demandar tanto tempo preferi solicitar à IA.
3 - Encontrei problemas ao executar os scripts de migration no monorepo com pnpm. Os scripts estavam configurados para ambientes com npm e não-monorepo, resultando em erro de duplicidade de `--` ao passar argumentos. A solução foi criar um script shell [`migration-generate.sh`](./apps/api/scripts/migration-generate.sh) que repassa corretamente os argumentos para o TypeORM CLI.
4 - Solicitei a criação de testes e2e para a api
