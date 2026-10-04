import fs from "fs";

export function executeToolHandler(functionName, functionParameters){
    switch(functionName){
        case "Read":
            return executeReadHandler(functionParameters);
        default:
            return executeReadHandler(functionParameters);
    }
}

function executeReadHandler(functionParameters){
    const PATH = functionParameters.file_path;
    let file;
    fs.readFile(PATH, { encoding: "utf8" }, (err, data) => {
        file = data;
    });
    return file;
}