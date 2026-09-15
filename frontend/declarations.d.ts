// Ambient type fallbacks for IDE before node_modules are installed via `npm install`
declare module 'react' {
  export = React;
  export as namespace React;
}

declare namespace React {
  export type ReactNode = any;
  export type FC<T = any> = (props: T) => any;
  export function useState<T>(init: T | (() => T)): [T, (val: T | ((prev: T) => T)) => void];
  export function useEffect(fn: () => any, deps?: any[]): void;
  export function useRef<T>(init?: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: any[]): T;
  export type FormEvent<T = any> = any;
  export type ChangeEvent<T = any> = any;
  export type DragEvent<T = any> = any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  type Element = any;
}

declare module 'react-dom' {
  export = ReactDOM;
  export as namespace ReactDOM;
}
declare namespace ReactDOM {}

declare module 'next/navigation' {
  export function useRouter(): {
    push(url: string): void;
    replace(url: string): void;
    back(): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): {
    get(name: string): string | null;
  };
  export function useParams(): Record<string, string | string[]>;
  export function notFound(): never;
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'lucide-react' {
  export type LucideIcon = any;
  export const ArrowLeft: any;
  export const ShieldCheck: any;
  export const CreditCard: any;
  export const Download: any;
  export const FileText: any;
  export const Check: any;
  export const Copy: any;
  export const Maximize2: any;
  export const X: any;
  export const Search: any;
  export const ChevronLeft: any;
  export const ChevronRight: any;
  export const RotateCw: any;
  export const CheckCircle2: any;
  export const XCircle: any;
  export const Slash: any;
  export const Calendar: any;
  export const Building2: any;
  export const Mail: any;
  export const Phone: any;
  export const GraduationCap: any;
  export const Layers: any;
  export const Upload: any;
  export const Sparkles: any;
  export const Zap: any;
  export const Camera: any;
  export const RefreshCw: any;
  export const AlertCircle: any;
  export const ArrowRight: any;
  export const UserPlus: any;
  export const ExternalLink: any;
  export const CheckCircle: any;
  export const Loader2: any;
  export const Shield: any;
  export const User: any;
  export const LayoutDashboard: any;
  export const Users: any;
  export const FileClock: any;
  export const LogOut: any;
  export const ShieldAlert: any;
  export const Clock: any;
  export const AlertOctagon: any;
  export const Home: any;
  export const Filter: any;
  export const Eye: any;
  export const ZoomIn: any;
  export const ZoomOut: any;
  export const RotateCcw: any;
  export const Move: any;
  export const UserCheck: any;
  export const Crop: any;
}

declare module 'react-hook-form' {
  export function useForm<T = any>(opts?: any): {
    register: any;
    handleSubmit: any;
    formState: { errors: any; isSubmitting: boolean };
    setValue: any;
    reset: any;
  };
}

declare module 'clsx' {
  export type ClassValue = any;
  export function clsx(...args: any[]): string;
}

declare module 'tailwind-merge' {
  export function twMerge(...args: any[]): string;
}
