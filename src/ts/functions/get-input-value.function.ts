export function getNumberFromInput(inputId: string): number {
    return Number((<HTMLInputElement>document.getElementById(inputId)).value);
}
