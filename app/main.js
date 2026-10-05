import OpenAI from "openai";
import { executeToolHandler } from "./toolHandler.js";
import { skillHandler } from "./skillHandler.js";

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
  const model = "anthropic/claude-haiku-4.5";
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
        },
        {
          "type": "function",
          "function": {
            "name": "Write",
            "description": "Write content to a file",
            "parameters": {
              "type": "object",
              "required": ["file_path", "content"],
              "properties": {
                "file_path": {
                  "type": "string",
                  "description": "The path of the file to write to"
                },
                "content": {
                  "type": "string",
                  "description": "The content to write to the file"
                }
              }
            }
          }
        },
        {
          "type": "function",
          "function": {
            "name": "Bash",
            "description": "Execute a shell command",
            "parameters": {
              "type": "object",
              "required": ["command"],
              "properties": {
                "command": {
                  "type": "string",
                  "description": "The command to execute"
                }
              }
            }
          }
        }
      ];

  const { systemPrompt, resolvedPrompt } = skillHandler(prompt);

  const messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: resolvedPrompt },
  ];

  while (true) {
    const response = await client.chat.completions.create({
      model,
      messages,
      tools,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("no choices in response");
    }

    const assistantMessage = response.choices[0].message;
    messages.push(assistantMessage);

    const toolCalls = assistantMessage.tool_calls;

    if (!toolCalls?.length) {
      console.log(assistantMessage.content);
      break;
    }

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;
      const functionParameters = JSON.parse(toolCall.function.arguments);

      let result;
      try {
        result = await executeToolHandler(functionName, functionParameters);
      } catch (e) {
        result = `Error: ${e.message}`;
      }

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: String(result ?? ""),
      });
    }
  }

  // You can use print statements as follows for debugging, they'll be visible when running tests.
  console.error("Logs from your program will appear here!");
}

main();
