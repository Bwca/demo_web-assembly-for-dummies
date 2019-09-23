export function getInputValue(inputId: string): number {
    return Number((<HTMLInputElement>document.getElementById(inputId)).value);
}
