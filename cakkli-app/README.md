# cakkli-app

Full-stack TypeScript application with **modular architecture**.

## 📁 Project Structure

### Backend - Modular Architecture (server/)

```
server/
├── src/
│   ├── modules/              # Feature modules (self-contained)
│   │   ├── user/             # User module
│   │   │   ├── user.model.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── user.service.ts
│   │   │   ├── user.controller.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   ├── health/           # Health check module
│   │   │   ├── health.controller.ts
│   │   │   ├── health.routes.ts
│   │   │   └── index.ts
│   │   └── [feature]/        # Add more modules here
│   │
│   ├── shared/               # Shared resources
│   │   ├── config/           # App configuration
│   │   ├── utils/            # Utilities (Logger, ErrorHandler)
│   │   ├── middlewares/      # Express middlewares
│   │   ├── types/            # Shared TypeScript types
│   │   └── interfaces/       # Shared interfaces
│   │
│   ├── app.ts                # Express app setup
│   └── index.ts              # Entry point
└── package.json
```

### Frontend - Feature-Based Architecture (client/)

```
client/
├── src/
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   ├── features/         # Feature-specific components
│   │   └── layout/           # Layout components
│   ├── hooks/                # Custom React hooks
│   ├── services/             # API service classes
│   ├── stores/               # State management
│   ├── utils/                # Utility functions
│   ├── types/                # TypeScript types
│   ├── constants/            # App constants
│   └── test/                 # Test setup
└── package.json
```

## 🚀 Tech Stack

### Backend
- **Node.js 20+** with TypeScript
- **Express.js** with class-based controllers
- **Modular architecture** (feature-based modules)
- **@cakki/orm** for database operations
- **Rolldown** for optimized bundling
- **Vitest + Supertest** for testing
- **Path aliases**: `@modules`, `@shared`

### Frontend
- **React 18+** with TypeScript
- **Vite** for fast development
- **shadcn/ui** for UI components
- **Vitest + Testing Library** for testing
- **Path aliases**: `@components`, `@services`, etc.

## 📦 Getting Started

```bash
# Install dependencies
npm run install:all

# Setup environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files

# Start development
npm run dev
```

### shadcn/ui Setup
```bash
cd client && npx shadcn@latest init && cd ..
```


## 🛠️ Available Scripts

```bash
npm run dev              # Run both servers
npm run dev:client       # Frontend only (http://localhost:5173)
npm run dev:server       # Backend only (http://localhost:3000)

npm test                 # Run all tests
npm run lint             # Lint code
npm run format           # Format code
```

## 📝 License

MIT
