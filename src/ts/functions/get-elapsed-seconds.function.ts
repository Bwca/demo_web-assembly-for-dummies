export function getElapsedMiliSeconds(start: number): string {
    const now = Date.now();
    let elapsed = now - start;
    return `${elapsed} miliseconds`;
}
