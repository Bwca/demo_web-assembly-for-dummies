export function javascriptFibonacci(n: number): number {
  if (n === 1) return 1;
  if (n === 2) return 1;
  return javascriptFibonacci(n - 1) + javascriptFibonacci(n - 2);
}
