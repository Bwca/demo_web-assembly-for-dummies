import { ASUtil } from "assemblyscript/lib/loader";

export interface WasmModule extends ASUtil {
    wasmFibonacci: (n: number) => number;
}