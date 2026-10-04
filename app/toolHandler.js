import fs from "fs";

export function executeToolHandler(functionName, functionParameters){
    switch(functionName){
        case "Read":
        return executeReadHandler(functionParameters);
        break;
        default: break;
    }
}

function executeReadHandler(functionParameters){
    const PATH = functionParameters[0];
    return fs.readFile(PATH);
}