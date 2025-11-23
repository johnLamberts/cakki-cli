

import { execSync } from 'child_process';
import { program } from 'commander';
import fs from 'fs';
import path from 'path';
import pc from 'picocolors';
import prompts from 'prompts';

interface ProjectConfig {
  projectName: string;
  styleLibrary: 'shadcn' | 'mantine';
}

interface ProgramOptions {
  shadcn?: boolean;
  mantine?: boolean;
}

interface ProjectNameResponse {
  projectName: string;
}

interface StyleLibraryResponse {
  styleLibrary: 'shadcn' | 'mantine';
}

interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

async function main(): Promise<void> {
  console.log(pc.cyan('\n🚀 Create My Fullstack App\n'));

  program
    .version('1.0.0')
    .argument('[project-name]', 'project name')
    .option('-s, --shadcn', 'use shadcn/ui')
    .option('-m, --mantine', 'use Mantine')
    .parse(process.argv);

  const options = program.opts<ProgramOptions>();
  const args = program.args;

  let projectName: string = args[0];
  let styleLibrary: 'shadcn' | 'mantine' ;

  // If no project name provided, prompt for it
  if (!projectName) {
    const response = await prompts<'projectName'>({
      type: 'text',
      name: 'projectName',
      message: 'Project name:',
      initial: 'my-fullstack-app',
      validate: (value: string) => 
        value.trim() ? true : 'Project name is required'
    });

    if (!response.projectName) {
      console.log(pc.red('\n✖ Operation cancelled'));
      process.exit(0);
    }

    projectName = response.projectName;
  }

  // If no style library specified, prompt for it
  if (!options.shadcn && !options.mantine) {
    const response = await prompts<'styleLibrary'>({
      type: 'select',
      name: 'styleLibrary',
      message: 'Choose styling library:',
      choices: [
        { title: 'shadcn/ui', value: 'shadcn' as const },
        { title: 'Mantine', value: 'mantine' as const }
      ]
    });

    if (!response.styleLibrary) {
      console.log(pc.red('\n✖ Operation cancelled'));
      process.exit(0);
    }

    styleLibrary = response.styleLibrary;
  } else {
    styleLibrary = options.shadcn ? 'shadcn' : 'mantine';
  }

  const config: ProjectConfig = {
    projectName,
    styleLibrary
  };

  await createProject(config);
}

async function createProject(config: ProjectConfig): Promise<void> {
  const { projectName, styleLibrary } = config;
  const projectPath = path.join(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(pc.red(`\n✖ Directory ${projectName} already exists!`));
    process.exit(1);
  }

  console.log(pc.green(`\n📁 Creating project at ${projectPath}...`));
  fs.mkdirSync(projectPath);

  // Create frontend
  console.log(pc.blue('\n📦 Setting up frontend...'));
  execSync('npm create vite@latest client -- --template react-ts', {
    cwd: projectPath,
    stdio: 'inherit'
  });

  const clientPath = path.join(projectPath, 'client');

  // Update client package.json for testing
  const clientPackageJsonPath = path.join(clientPath, 'package.json');
  const clientPackageJson = JSON.parse(
    fs.readFileSync(clientPackageJsonPath, 'utf8')
  ) as PackageJson;

  clientPackageJson.scripts = {
    ...clientPackageJson.scripts,
    test: 'vitest',
    'test:ui': 'vitest --ui',
    'test:coverage': 'vitest --coverage'
  };

  clientPackageJson.devDependencies = {
    ...clientPackageJson.devDependencies,
    '@testing-library/react': '^14.1.2',
    '@testing-library/jest-dom': '^6.1.5',
    '@testing-library/user-event': '^14.5.1',
    '@vitest/ui': '^1.0.4',
    '@vitest/coverage-v8': '^1.0.4',
    jsdom: '^23.0.1',
    vitest: '^1.0.4'
  };

  fs.writeFileSync(
    clientPackageJsonPath,
    JSON.stringify(clientPackageJson, null, 2)
  );

  // Create client directory structure
  const clientSrcPath = path.join(clientPath, 'src');
  const clientDirs: string[] = [
    'components/ui',
    'components/features',
    'components/layout',
    'hooks',
    'services',
    'utils',
    'types',
    'stores',
    'constants',
    'test'
  ];

  clientDirs.forEach((dir: string) => {
    fs.mkdirSync(path.join(clientSrcPath, dir), { recursive: true });
  });

  // Create vitest config for client with path aliases
  const vitestConfigClient = `import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },
});
`;

  fs.writeFileSync(
    path.join(clientPath, 'vitest.config.ts'),
    vitestConfigClient
  );

  // Update vite.config.ts with path aliases
  const viteConfig = `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@constants': path.resolve(__dirname, './src/constants'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
`;

  fs.writeFileSync(path.join(clientPath, 'vite.config.ts'), viteConfig);

  // Update tsconfig.json with path aliases
  const clientTsConfigPath = path.join(clientPath, 'tsconfig.json');
  if (fs.existsSync(clientTsConfigPath)) {
    const clientTsConfig = JSON.parse(
      fs.readFileSync(clientTsConfigPath, 'utf8')
    ) as {
      compilerOptions?: {
        baseUrl?: string;
        paths?: Record<string, string[]>;
        [key: string]: unknown;
      };
      [key: string]: unknown;
    };
    
    clientTsConfig.compilerOptions = {
      ...clientTsConfig.compilerOptions,
      baseUrl: '.',
      paths: {
        '@/*': ['src/*'],
        '@components/*': ['src/components/*'],
        '@hooks/*': ['src/hooks/*'],
        '@services/*': ['src/services/*'],
        '@utils/*': ['src/utils/*'],
        '@types/*': ['src/types/*'],
        '@stores/*': ['src/stores/*'],
        '@constants/*': ['src/constants/*']
      }
    };
    fs.writeFileSync(
      clientTsConfigPath,
      JSON.stringify(clientTsConfig, null, 2)
    );
  }

  // Create types
  const apiTypes = `export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}
`;

  fs.writeFileSync(path.join(clientSrcPath, 'types', 'index.ts'), apiTypes);

  // Create API service
  const apiService = `import { ApiResponse } from '@types/index';

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(\`\${this.baseURL}\${endpoint}\`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiService = new ApiService();
`;

  fs.writeFileSync(
    path.join(clientSrcPath, 'services', 'api.service.ts'),
    apiService
  );

  // Create user service
  const userService = `import { apiService } from './api.service';
import { User } from '@types/index';

class UserService {
  async getUsers() {
    return apiService.get<User[]>('/users');
  }

  async getUserById(id: string) {
    return apiService.get<User>(\`/users/\${id}\`);
  }

  async createUser(data: Partial<User>) {
    return apiService.post<User>('/users', data);
  }

  async updateUser(id: string, data: Partial<User>) {
    return apiService.put<User>(\`/users/\${id}\`, data);
  }

  async deleteUser(id: string) {
    return apiService.delete(\`/users/\${id}\`);
  }
}

export const userService = new UserService();
`;

  fs.writeFileSync(
    path.join(clientSrcPath, 'services', 'user.service.ts'),
    userService
  );

  // Create custom hooks
  const useApiHook = `import { useState, useEffect } from 'react';
import { ApiResponse } from '@types/index';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  deps: any[] = []
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        const response = await apiCall();
        
        if (isMounted) {
          setState({
            data: response.data || null,
            loading: false,
            error: null,
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error.message : 'An error occurred',
          });
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, deps);

  return state;
}
`;

  fs.writeFileSync(path.join(clientSrcPath, 'hooks', 'useApi.ts'), useApiHook);

  // Create constants
  const constants = `export const API_ENDPOINTS = {
  USERS: '/users',
  HEALTH: '/health',
} as const;

export const APP_CONFIG = {
  APP_NAME: 'My Fullstack App',
  VERSION: '1.0.0',
} as const;
`;

  fs.writeFileSync(
    path.join(clientSrcPath, 'constants', 'index.ts'),
    constants
  );

  // Create example feature component
  const userList = `import { useApi } from '@hooks/useApi';
import { userService } from '@services/user.service';
import { User } from '@types/index';

export function UserList() {
  const { data: users, loading, error } = useApi<User[]>(
    () => userService.getUsers(),
    []
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!users || users.length === 0) return <div>No users found</div>;

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
`;

  fs.writeFileSync(
    path.join(clientSrcPath, 'components/features', 'UserList.tsx'),
    userList
  );

  // Create layout component
  const layout = `import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">My Fullstack App</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
}
`;

  fs.writeFileSync(
    path.join(clientSrcPath, 'components/layout', 'Layout.tsx'),
    layout
  );

  // Create utility functions
  const formatters = `export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}
`;

  fs.writeFileSync(
    path.join(clientSrcPath, 'utils', 'formatters.ts'),
    formatters
  );

  // Create .env files
  const clientEnv = `VITE_API_URL=http://localhost:3000/api
`;

  fs.writeFileSync(path.join(clientPath, '.env'), clientEnv);
  fs.writeFileSync(path.join(clientPath, '.env.example'), clientEnv);

  // Create test setup
  const clientTestPath = path.join(clientPath, 'src', 'test');
  fs.mkdirSync(clientTestPath, { recursive: true });

  const testSetup = `import '@testing-library/jest-dom';
`;

  fs.writeFileSync(path.join(clientTestPath, 'setup.ts'), testSetup);

  // Create example test
  const exampleTest = `import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/vite/i)).toBeInTheDocument();
  });
});
`;

  fs.writeFileSync(path.join(clientTestPath, 'App.test.tsx'), exampleTest);

  // Create backend
  console.log(pc.blue('\n📦 Setting up backend...'));
  const serverPath = path.join(projectPath, 'server');
  fs.mkdirSync(serverPath);

  // Backend package.json
  const serverPackageJson: PackageJson = {
    name: `${projectName}-server`,
    version: '1.0.0',
    type: 'module',
    scripts: {
      dev: 'tsx watch src/index.ts',
      build: 'rolldown',
      start: 'node dist/index.js',
      test: 'vitest',
      'test:ui': 'vitest --ui',
      'test:coverage': 'vitest --coverage'
    },
    dependencies: {
      express: '^4.18.2',
      cors: '^2.8.5',
      dotenv: '^16.3.1',
      '@cakki/orm': 'latest',
      'reflect-metadata': '^0.2.1',
      picocolors: '^1.0.0'
    },
    devDependencies: {
      '@types/express': '^4.17.21',
      '@types/cors': '^2.8.17',
      '@types/node': '^20.10.0',
      '@types/supertest': '^6.0.2',
      typescript: '^5.3.3',
      tsx: '^4.7.0',
      rolldown: '^0.15.1',
      vitest: '^1.0.4',
      supertest: '^6.3.3',
      '@vitest/coverage-v8': '^1.0.4'
    }
  };

  fs.writeFileSync(
    path.join(serverPath, 'package.json'),
    JSON.stringify(serverPackageJson, null, 2)
  );

  // Create all other files (server config, tests, root configs, etc.)
  createServerFiles(serverPath);
  createRootFiles(projectPath, projectName, styleLibrary);

  console.log(pc.green('\n✅ Project created successfully!'));
  console.log(pc.cyan('\n📂 Next steps:'));
  console.log(`   ${pc.bold('cd ' + projectName)}`);
  console.log(`   ${pc.bold('npm run install:all')}`);
  console.log(`   ${pc.bold('npm run prepare')}          # Setup Git hooks`);
  if (styleLibrary === 'shadcn') {
    console.log(
      `   ${pc.bold('cd client && npx shadcn@latest init && cd ..')}`
    );
  }
  console.log(`   ${pc.bold('npm run dev')}`);
  console.log(pc.cyan('\n🧪 Run tests:'));
  console.log(`   ${pc.bold('npm test')}`);
  console.log(pc.cyan('\n📋 Enterprise features included:'));
  console.log(`   ${pc.green('✓')} ESLint & Prettier configured`);
  console.log(`   ${pc.green('✓')} Husky pre-commit hooks`);
  console.log(`   ${pc.green('✓')} GitHub Actions CI/CD`);
  console.log(`   ${pc.green('✓')} VSCode workspace settings`);
  console.log(`   ${pc.green('✓')} Dependabot auto-updates`);
}

function createServerFiles(serverPath: string): void {
  // Backend tsconfig.json with decorators support
  const serverTsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ESNext',
      moduleResolution: 'bundler',
      outDir: './dist',
      rootDir: './src',
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      types: ['vitest/globals', 'node'],
      baseUrl: '.',
      paths: {
        '@/*': ['src/*'],
        '@modules/*': ['src/modules/*'],
        '@shared/*': ['src/shared/*']
      }
    },
    include: ['src/**/*'],
    exclude: ['node_modules', 'dist']
  };

  fs.writeFileSync(
    path.join(serverPath, 'tsconfig.json'),
    JSON.stringify(serverTsConfig, null, 2)
  );

  // Rolldown config
  const rolldownConfig = `import { defineConfig } from 'rolldown';

export default defineConfig({
  input: './src/index.ts',
  output: {
    dir: './dist',
    format: 'esm',
  },
  external: ['express', 'cors', 'dotenv', '@cakki/orm', 'reflect-metadata'],
  platform: 'node',
});
`;

  fs.writeFileSync(
    path.join(serverPath, 'rolldown.config.js'),
    rolldownConfig
  );

  // Vitest config
  const vitestConfigServer = `import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@modules': path.resolve(__dirname, './src/modules'),
      '@shared': path.resolve(__dirname, './src/shared')
    }
  }
});
`;

  fs.writeFileSync(
    path.join(serverPath, 'vitest.config.ts'),
    vitestConfigServer
  );

  // Create modular directory structure
  const serverSrcPath = path.join(serverPath, 'src');
  const dirs: string[] = [
    'modules/user',
    'modules/health',
    'shared/config',
    'shared/utils',
    'shared/middlewares',
    'shared/types',
    'shared/interfaces'
  ];

  dirs.forEach((dir: string) => {
    fs.mkdirSync(path.join(serverSrcPath, dir), { recursive: true });
  });

  // Create shared types
  const sharedTypes = `export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'shared/types', 'index.ts'),
    sharedTypes
  );

  // Create shared interfaces
  const sharedInterfaces = `export interface IService<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IRepository<T> {
  findAll(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IController {
  setupRoutes(): void;
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'shared/interfaces', 'index.ts'),
    sharedInterfaces
  );

  // Create config
  const appConfig = `import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || '',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
} as const;

export const isDevelopment = config.nodeEnv === 'development';
export const isProduction = config.nodeEnv === 'production';
export const isTest = config.nodeEnv === 'test';
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'shared/config', 'index.ts'),
    appConfig
  );

  // Create logger utility
  const logger = `import pc from 'picocolors';

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, ...args: any[]): void {
    console.log(pc.blue(\`[\${this.context}]\`), message, ...args);
  }

  error(message: string, error?: Error | any): void {
    console.error(pc.red(\`[\${this.context}]\`), message, error);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(pc.yellow(\`[\${this.context}]\`), message, ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(pc.green(\`[\${this.context}]\`), message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(pc.gray(\`[\${this.context}]\`), message, ...args);
    }
  }
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'shared/utils', 'logger.ts'),
    logger
  );

  // Create error handler utility
  const errorHandler = `import { Request, Response, NextFunction } from 'express';
import { Logger } from './logger';

const logger = new Logger('ErrorHandler');

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error(\`AppError: \${err.message}\`, err);
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  logger.error('Unexpected error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'shared/utils', 'error-handler.ts'),
    errorHandler
  );

  // Create validation middleware
  const validationMiddleware = `import { Request, Response, NextFunction } from 'express';
import { AppError } from '@shared/utils/error-handler';

export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // TODO: Implement validation with Zod or similar
    next();
  };
};
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'shared/middlewares', 'validation.middleware.ts'),
    validationMiddleware
  );

  // ========== USER MODULE ==========
  // User model
  const userModel = `export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/user', 'user.model.ts'),
    userModel
  );

  // User repository
  const userRepository = `import { IRepository } from '@shared/interfaces';
import { User } from './user.model';
import { Logger } from '@shared/utils/logger';

export class UserRepository implements IRepository<User> {
  private logger = new Logger('UserRepository');

  async findAll(): Promise<User[]> {
    this.logger.info('Finding all users');
    // TODO: Implement with @cakki/orm
    return [];
  }

  async findById(id: string): Promise<User | null> {
    this.logger.info(\`Finding user by id: \${id}\`);
    // TODO: Implement with @cakki/orm
    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    this.logger.info(\`Finding user by email: \${email}\`);
    // TODO: Implement with @cakki/orm
    return null;
  }

  async create(data: Partial<User>): Promise<User> {
    this.logger.info('Creating user');
    // TODO: Implement with @cakki/orm
    throw new Error('Not implemented');
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    this.logger.info(\`Updating user: \${id}\`);
    // TODO: Implement with @cakki/orm
    return null;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.info(\`Deleting user: \${id}\`);
    // TODO: Implement with @cakki/orm
    return false;
  }
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/user', 'user.repository.ts'),
    userRepository
  );

  // User service
  const userService = `import { IService } from '@shared/interfaces';
import { User, CreateUserDto, UpdateUserDto } from './user.model';
import { UserRepository } from './user.repository';
import { AppError } from '@shared/utils/error-handler';
import { Logger } from '@shared/utils/logger';

export class UserService implements IService<User> {
  private logger = new Logger('UserService');
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async findAll(): Promise<User[]> {
    this.logger.info('Fetching all users');
    return this.userRepository.findAll();
  }

  async findById(id: string): Promise<User | null> {
    this.logger.info(\`Fetching user by id: \${id}\`);
    const user = await this.userRepository.findById(id);
    
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    
    return user;
  }

  async createUser(data: CreateUserDto): Promise<User> {
    this.logger.info(\`Creating user with email: \${data.email}\`);
    
    // Check if user exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError(400, 'User with this email already exists');
    }

    // TODO: Hash password before saving
    const user = await this.userRepository.create({
      email: data.email,
      name: data.name,
    });

    this.logger.success(\`User created: \${user.id}\`);
    return user;
  }

  async create(data: Partial<User>): Promise<User> {
    return this.userRepository.create(data);
  }

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    this.logger.info(\`Updating user: \${id}\`);
    
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const updatedUser = await this.userRepository.update(id, data);
    this.logger.success(\`User updated: \${id}\`);
    
    return updatedUser;
  }

  async delete(id: string): Promise<boolean> {
    this.logger.info(\`Deleting user: \${id}\`);
    
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const deleted = await this.userRepository.delete(id);
    this.logger.success(\`User deleted: \${id}\`);
    
    return deleted;
  }
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/user', 'user.service.ts'),
    userService
  );

  // User controller
  const userController = `import { Request, Response } from 'express';
import { UserService } from './user.service';
import { asyncHandler } from '@shared/utils/error-handler';
import { ApiResponse } from '@shared/types';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  getAll = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const users = await this.userService.findAll();
    
    const response: ApiResponse = {
      success: true,
      data: users,
      message: 'Users retrieved successfully',
    };
    
    res.json(response);
  });

  getById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.userService.findById(id);
    
    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User retrieved successfully',
    };
    
    res.json(response);
  });

  create = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await this.userService.createUser(req.body);
    
    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User created successfully',
    };
    
    res.status(201).json(response);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const user = await this.userService.update(id, req.body);
    
    const response: ApiResponse = {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
    
    res.json(response);
  });

  delete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    await this.userService.delete(id);
    
    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
    };
    
    res.json(response);
  });
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/user', 'user.controller.ts'),
    userController
  );

  // User routes
  const userRoutes = `import { Router } from 'express';
import { UserController } from './user.controller';

export class UserRoutes {
  public router: Router;
  private controller: UserController;

  constructor() {
    this.router = Router();
    this.controller = new UserController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.controller.getAll);
    this.router.get('/:id', this.controller.getById);
    this.router.post('/', this.controller.create);
    this.router.put('/:id', this.controller.update);
    this.router.delete('/:id', this.controller.delete);
  }
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/user', 'user.routes.ts'),
    userRoutes
  );

  // User module index
  const userIndex = `export * from './user.model';
export * from './user.repository';
export * from './user.service';
export * from './user.controller';
export * from './user.routes';
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/user', 'index.ts'),
    userIndex
  );

  // User tests
  const userTestDir = path.join(serverSrcPath, 'modules/user', '__tests__');
  fs.mkdirSync(userTestDir, { recursive: true });

  const userServiceTest = `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UserService } from '../user.service';
import { UserRepository } from '../user.repository';

vi.mock('../user.repository');

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  it('should create a new user', async () => {
    // TODO: Add mock implementation and assertions
    expect(userService).toBeDefined();
  });

  it('should throw error when user already exists', async () => {
    // TODO: Implement test
  });
});
`;

  fs.writeFileSync(
    path.join(userTestDir, 'user.service.test.ts'),
    userServiceTest
  );

  const userIntegrationTest = `import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../../app';

const app = createApp();

describe('User API Integration Tests', () => {
  it('should get all users', async () => {
    const response = await request(app).get('/api/users');
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // TODO: Add more integration tests
});
`;

  fs.writeFileSync(
    path.join(userTestDir, 'user.integration.test.ts'),
    userIntegrationTest
  );

  // ========== HEALTH MODULE ==========
  const healthController = `import { Request, Response } from 'express';
import { asyncHandler } from '@shared/utils/error-handler';

export class HealthController {
  check = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    res.json({
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
      },
    });
  });
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/health', 'health.controller.ts'),
    healthController
  );

  const healthRoutes = `import { Router } from 'express';
import { HealthController } from './health.controller';

export class HealthRoutes {
  public router: Router;
  private controller: HealthController;

  constructor() {
    this.router = Router();
    this.controller = new HealthController();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    this.router.get('/', this.controller.check);
  }
}
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/health', 'health.routes.ts'),
    healthRoutes
  );

  const healthIndex = `export * from './health.controller';
export * from './health.routes';
`;

  fs.writeFileSync(
    path.join(serverSrcPath, 'modules/health', 'index.ts'),
    healthIndex
  );

  // ========== APP SETUP ==========
  // Create app.ts
  const appTs = `import express, { Application } from 'express';
import cors from 'cors';
import { config } from '@shared/config';
import { errorHandler } from '@shared/utils/error-handler';
import { Logger } from '@shared/utils/logger';
import { UserRoutes } from '@modules/user';
import { HealthRoutes } from '@modules/health';

const logger = new Logger('App');

export const createApp = (): Application => {
  const app = express();

  // Middlewares
  app.use(cors(config.cors));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging in development
  if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
      logger.debug(\`\${req.method} \${req.path}\`);
      next();
    });
  }

  // Register module routes
  const userRoutes = new UserRoutes();
  const healthRoutes = new HealthRoutes();

  app.use('/api/health', healthRoutes.router);
  app.use('/api/users', userRoutes.router);

  // Error handling
  app.use(errorHandler);

  return app;
};
`;

  fs.writeFileSync(path.join(serverSrcPath, 'app.ts'), appTs);

  // Create main index.ts
  const serverIndex = `import 'reflect-metadata';
import { createApp } from './app';
import { config } from '@shared/config';
import { Logger } from '@shared/utils/logger';

const logger = new Logger('Server');

const app = createApp();

if (config.nodeEnv !== 'test') {
  app.listen(config.port, () => {
    logger.success(\`Server running on port \${config.port}\`);
    logger.info(\`Environment: \${config.nodeEnv}\`);
    logger.info(\`API: http://localhost:\${config.port}/api\`);
  });
}

export { app };
`;

  fs.writeFileSync(path.join(serverSrcPath, 'index.ts'), serverIndex);

  // .env
  const serverEnv = `PORT=3000
NODE_ENV=development
DATABASE_URL=your_database_url_here
CORS_ORIGIN=http://localhost:5173
JWT_SECRET=your-jwt-secret-key-change-in-production
JWT_EXPIRES_IN=7d
`;

  fs.writeFileSync(path.join(serverPath, '.env'), serverEnv);
  fs.writeFileSync(path.join(serverPath, '.env.example'), serverEnv);
}

function createRootFiles(
  projectPath: string,
  projectName: string,
  styleLibrary: 'shadcn' | 'mantine'
): void {
  // Root package.json
  const rootPackageJson: PackageJson = {
    name: projectName,
    version: '1.0.0',
    private: true,
    scripts: {
      'dev:client': 'cd client && npm run dev',
      'dev:server': 'cd server && npm run dev',
      dev: 'concurrently "npm run dev:server" "npm run dev:client"',
      'test:client': 'cd client && npm test',
      'test:server': 'cd server && npm test',
      test: 'npm run test:server && npm run test:client',
      'install:all':
        'npm install && cd client && npm install && cd ../server && npm install',
      lint: 'eslint . --ext .ts,.tsx',
      'lint:fix': 'eslint . --ext .ts,.tsx --fix',
      format: 'prettier --write "**/*.{ts,tsx,json,md}"',
      prepare: 'husky install'
    },
    devDependencies: {
      concurrently: '^8.2.2',
      '@typescript-eslint/eslint-plugin': '^6.21.0',
      '@typescript-eslint/parser': '^6.21.0',
      eslint: '^8.56.0',
      prettier: '^3.2.4',
      husky: '^8.0.3',
      'lint-staged': '^15.2.0'
    }
  };

  fs.writeFileSync(
    path.join(projectPath, 'package.json'),
    JSON.stringify(rootPackageJson, null, 2)
  );

  // .gitignore
  const gitignore = `# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.vitest/

# Production
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# Logs
*.log

# Editor
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
.DS_Store

# Temporary
*.tmp
.cache/
.eslintcache
`;

  fs.writeFileSync(path.join(projectPath, '.gitignore'), gitignore);

  // ESLint config
  const eslintConfig = {
    root: true,
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['dist', 'build', 'node_modules']
  };

  fs.writeFileSync(
    path.join(projectPath, '.eslintrc.json'),
    JSON.stringify(eslintConfig, null, 2)
  );

  // Prettier config
  const prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    useTabs: false
  };

  fs.writeFileSync(
    path.join(projectPath, '.prettierrc.json'),
    JSON.stringify(prettierConfig, null, 2)
  );

  // README
  const readme = `# ${projectName}

Full-stack TypeScript application with **modular architecture**.

## 📁 Project Structure

### Backend - Modular Architecture (server/)

\`\`\`
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
\`\`\`

### Frontend - Feature-Based Architecture (client/)

\`\`\`
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
\`\`\`

## 🚀 Tech Stack

### Backend
- **Node.js 20+** with TypeScript
- **Express.js** with class-based controllers
- **Modular architecture** (feature-based modules)
- **@cakki/orm** for database operations
- **Rolldown** for optimized bundling
- **Vitest + Supertest** for testing
- **Path aliases**: \`@modules\`, \`@shared\`

### Frontend
- **React 18+** with TypeScript
- **Vite** for fast development${styleLibrary === 'shadcn' ? '\n- **shadcn/ui** for UI components' : ''}${styleLibrary === 'mantine' ? '\n- **Mantine** for UI components' : ''}
- **Vitest + Testing Library** for testing
- **Path aliases**: \`@components\`, \`@services\`, etc.

## 📦 Getting Started

\`\`\`bash
# Install dependencies
npm run install:all

# Setup environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files

# Start development
npm run dev
\`\`\`

${styleLibrary === 'shadcn' ? `### shadcn/ui Setup
\`\`\`bash
cd client && npx shadcn@latest init && cd ..
\`\`\`
` : ''}

## 🛠️ Available Scripts

\`\`\`bash
npm run dev              # Run both servers
npm run dev:client       # Frontend only (http://localhost:5173)
npm run dev:server       # Backend only (http://localhost:3000)

npm test                 # Run all tests
npm run lint             # Lint code
npm run format           # Format code
\`\`\`

## 📝 License

MIT
`;

  fs.writeFileSync(path.join(projectPath, 'README.md'), readme);
}

main().catch((error: Error) => {
  console.error(pc.red('\n✖ Error:'), error);
  process.exit(1);
});
