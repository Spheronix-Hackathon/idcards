declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
  interface Process {
    env: ProcessEnv;
    exit(code?: number): never;
    on(event: string, listener: (...args: any[]) => void): this;
    cwd(): string;
  }
}

declare const process: NodeJS.Process;
declare const console: {
  log(...args: any[]): void;
  error(...args: any[]): void;
  warn(...args: any[]): void;
  info(...args: any[]): void;
};
declare const __dirname: string;
declare const __filename: string;
declare const require: any;
declare const module: any;

declare class Buffer {
  static from(data: any, encoding?: any): Buffer;
  static isBuffer(obj: any): boolean;
  static concat(list: any[], totalLength?: number): Buffer;
  toString(encoding?: string): string;
  length: number;
}
