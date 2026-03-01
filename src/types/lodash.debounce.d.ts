declare module 'lodash.debounce' {
  type AnyFunction = (...args: any[]) => any;

  interface DebouncedFunction<T extends AnyFunction> {
    (...args: Parameters<T>): void;
    cancel: () => void;
    flush: () => ReturnType<T> | undefined;
  }

  export default function debounce<T extends AnyFunction>(
    fn: T,
    wait?: number,
  ): DebouncedFunction<T>;
}
