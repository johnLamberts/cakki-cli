import pc from 'picocolors';

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, ...args: any[]): void {
    console.log(pc.blue(`[${this.context}]`), message, ...args);
  }

  error(message: string, error?: Error | any): void {
    console.error(pc.red(`[${this.context}]`), message, error);
  }

  warn(message: string, ...args: any[]): void {
    console.warn(pc.yellow(`[${this.context}]`), message, ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(pc.green(`[${this.context}]`), message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(pc.gray(`[${this.context}]`), message, ...args);
    }
  }
}
