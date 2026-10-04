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
    let file;
    fs.readFile("assets/poem.txt", { encoding: "utf8" }, (err, data) => {
        file = data;
    });
    return file;
}