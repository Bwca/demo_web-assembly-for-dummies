import { ElementIds } from './enums/element-ids.enum';
import { WasmModule } from './models/wasm-module.model';
import { instantiateBuffer } from "assemblyscript/lib/loader";
import { getElapsedMiliSeconds, javascriptFibonacci, getInputValue, getResultString, outputResult } from './functions/index';

let wasmModule: WasmModule;

const wasmModuleURL = '/wasm/optimized.wasm';

const imports = {
    env: {
        abort(_msg, _file, line, column) {
            console.error("abort called at index.ts:" + line + ":" + column);
        },
        logToConsole(n: number): void {
            console.log(`wasm output: ${n}`);
        }
    }
};

loadWasmModule();

document.addEventListener('DOMContentLoaded', () => {

    document.getElementById(ElementIds.SubmitButton).addEventListener('click', () => {
        calculateFibonacciNumber(javascriptFibonacci, ElementIds.JSResultParagraph);

        calculateFibonacciNumber(wasmModule.wasmFibonacci, ElementIds.WasmResultParagraph);
    });

});

function calculateFibonacciNumber(fibonacciFunc: Function, outputId: ElementIds): void {
    const inputValue = getInputValue(ElementIds.NumberInput);
    let startTime: number;
    let elapsedTime: string

    startTime = Date.now();
    
    const fib = fibonacciFunc(inputValue);

    elapsedTime = getElapsedMiliSeconds(startTime);

    const result = getResultString(fib, elapsedTime);

    outputResult(outputId, result);
}

function loadWasmModule(): void {
    fetch(wasmModuleURL)
        .then(response => response.arrayBuffer())
        .then(bytes => instantiateBuffer(new Uint8Array(bytes), imports))
        .then(bytes => {
            wasmModule = <unknown>bytes as WasmModule;
        });
}
