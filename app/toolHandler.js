import fs from "fs/promises";

export async function executeToolHandler(functionName, functionParameters) {
    switch (functionName) {
        case "Read":
            return await executeReadHandler(functionParameters);
        default:
            throw new Error(`Unknown tool: ${functionName}`);
    }
}

async function executeReadHandler({ file_path }) {
    return await fs.readFile(file_path, { encoding: "utf8" });
}


