# Projeto-PEF3208---2026

Monorepo de aplicações web para a disciplina PEF3208 (2026).

## Estrutura

```
.
├── apps/
│   └── web/          # Aplicação web principal (Vite + React + TypeScript)
├── packages/
│   ├── ui/           # Biblioteca de componentes React compartilhados
│   └── utils/        # Utilitários TypeScript compartilhados
├── package.json      # Workspaces npm + scripts raiz
├── turbo.json        # Configuração do Turborepo
└── tsconfig.json     # Configuração TypeScript base
```

## Tecnologias

- **[Turborepo](https://turbo.build/repo)** — orquestração de builds no monorepo
- **[npm Workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)** — gerenciamento de pacotes
- **[React 19](https://react.dev/)** + **[Vite 6](https://vite.dev/)** — aplicação web
- **[TypeScript 5](https://www.typescriptlang.org/)** — tipagem estática

## Pré-requisitos

- Node.js ≥ 18
- npm ≥ 10

## Como usar

### Instalar dependências

```bash
npm install
```

### Iniciar em modo desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
```

### Verificação de tipos

```bash
npm run type-check
```

## Pacotes

### `@repo/utils`

Funções utilitárias reutilizáveis (formatação de datas, capitalização, etc.).

### `@repo/ui`

Componentes React compartilhados (`Button`, `Card`) prontos para uso em qualquer aplicação do monorepo.

### `@repo/web`

Aplicação web principal construída com React e Vite, consumindo `@repo/ui` e `@repo/utils`.
