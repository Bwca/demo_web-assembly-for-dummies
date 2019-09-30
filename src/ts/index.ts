import { ElementIds } from './enums/element-ids.enum';
import { WasmModule } from './models/wasm-module.model';
import { instantiateBuffer } from "assemblyscript/lib/loader";
import { getElapsedMiliSeconds, javascriptFibonacci, getNumberFromInput, getResultString, outputResult } from './functions/index';

let wasmModule: WasmModule;

let jsWarAndPeaceText: string;
let wasmWarAndPeaceText: number;

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

    document.getElementById(ElementIds.FibSubmitButton).addEventListener('click', () => {
        calculateFibonacciNumber(javascriptFibonacci, ElementIds.JSFibResultParagraph);

        calculateFibonacciNumber(wasmModule.wasmFibonacci, ElementIds.WasmFibResultParagraph);
    });

    document.getElementById(ElementIds.WarSubmitButton).addEventListener('click', () => {
        const search = (<HTMLInputElement>document.getElementById(ElementIds.SearchStringInput)).value;
        const replace = (<HTMLInputElement>document.getElementById(ElementIds.ReplaceStringInput)).value;
        let startTime: number;
        let elapsedTime: string;
        let result: string

        startTime = Date.now();
        const re = new RegExp(search, 'g')
        const jsResultString = jsWarAndPeaceText.replace(re, replace);
        elapsedTime = getElapsedMiliSeconds(startTime);
        result = getResultString(null, elapsedTime);
        outputResult(ElementIds.JSWarResultParagraph, result);
        
        startTime = Date.now();
        const wasmResult = wasmModule.replaceString(
            wasmWarAndPeaceText,
            wasmModule.__allocString(search),
            wasmModule.__allocString(replace)
             );
        
        elapsedTime = getElapsedMiliSeconds(startTime);
        result = getResultString(null, elapsedTime);
        outputResult(ElementIds.WasmWarResultParagraph, result);

        /* const wasmResultAsString = wasmModule.__getString(wasmResult);
        console.log(wasmResultAsString); */
    })

});

function loadWasmModule(): void {
    const url = '/wasm/optimized.wasm';

    fetch(url)
        .then(response => response.arrayBuffer())
        .then(bytes => instantiateBuffer(new Uint8Array(bytes), imports))
        .then(bytes =>  wasmModule = <unknown>bytes as WasmModule)
        .then( _ => {
            loadWarAndPeace(); 
        });
}

function loadWarAndPeace():void{
    const url = 'https://www.gutenberg.org/files/2600/2600-0.txt';
    
    fetch(url)
    .then(response => response.text())
    .then(text => {
        jsWarAndPeaceText = text;
        wasmWarAndPeaceText = wasmModule.__retain( wasmModule.__allocString(text));
    });
}

function calculateFibonacciNumber(fibonacciFunc: Function, outputId: ElementIds): void {
    const inputValue = getNumberFromInput(ElementIds.NumberInput);
    let startTime: number;
    let elapsedTime: string

    startTime = Date.now();

    const fib = fibonacciFunc(inputValue);

    elapsedTime = getElapsedMiliSeconds(startTime);

    const result = getResultString(fib, elapsedTime);

    outputResult(outputId, result);
}
