import OpenAI from "openai";
import { executeToolHandler } from "./toolHandler.js";

async function main() {
  const [, , flag, prompt] = process.argv;
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL =
      process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not set");
  }
  if (flag !== "-p" || !prompt) {
    throw new Error("error: -p flag is required");
  }

  const client = new OpenAI({
    apiKey: apiKey,
    baseURL: baseURL,
  });

  const tools = [
        {
          "type": "function",
          "function": {
            "name": "Read",
            "description": "Read and return the contents of a file",
            "parameters": {
              "type": "object",
              "properties": {
                "file_path": {
                  "type": "string",
                  "description": "The path to the file to read"
                }
              },
              "required": ["file_path"]
            }
          }
        }
      ];

  const messages = [{ role: "user", content: prompt }];

  await get_response(model, messages, tools);

  async function get_response(model, messages, tools){

    const response = await client.chat.completions.create({
      model: model,
      messages: messages,
      tools: tools,
    });

    //check choices
    if (!response.choices || response.choices.length === 0) {
      throw new Error("no choices in response");
    }

    const assistant_message = response.choices[0].message;
    const tool_calls = assistant_message.tool_calls;


    //starts loop
    if (tool_calls?.length) { //there are tool calls
      for(const x in tool_calls){
        const functionName = x.function.name;
        const functionParameters = JSON.parse(x.function.arguments);
        const file_content = await executeToolHandler(functionName, functionParameters);
        messages.push(assistant_message,{ role: "tool", tool_call_id: x.id, content: file_content });
        await get_response(model, messages, tools);
      }
    } else { //no tool calls
      messages.push({ role: "user", content: response.choices[0].message.content });
    }

  }

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");
}

main();
