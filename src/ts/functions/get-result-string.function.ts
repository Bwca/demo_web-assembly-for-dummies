export function getResultString(result:number | string, elapsedTime: string): string{
    let resultString = `elapsed time: ${elapsedTime}`;
    if(result){
        resultString = `result: ${result}\n` + resultString;
    }
    return resultString;
}
