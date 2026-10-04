import fs from "fs/promises"
import path from "path";

export async function executeToolHandler(functionName, functionParameters) {
    switch (functionName) {
        case "Read":
            return await executeReadHandler(functionParameters);
        case "Write":
            return await executeWriteHandler(functionParameters);
        default:
            throw new Error(`Unknown tool: ${functionName}`);
    }
}

async function executeReadHandler({ file_path }) {
    return await fs.readFile(file_path, { encoding: "utf8" });
}

async function executeWriteHandler({ file_path, content }) {
    const dir = path.dirname(file_path);
    await fs.mkdir(dir, { recursive: true });
    return await fs.writeFile(file_path, content);
}