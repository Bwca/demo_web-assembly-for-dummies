export function wasmFibonacci(n: i32): i32 {
  if (n == 1) return 1;
  if (n == 2) return 1;
  return wasmFibonacci(n - 1) + wasmFibonacci(n - 2);
}

export function replaceString(src: string, find: string, replace: string): string {
  return src.replaceAll(find, replace);
}

@external("env", "logToConsole")
declare function exportLogToConsole(n: i32): void;
