import { pathToFileURL } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  DEFAULT_AGENT_KEY,
  DEFAULT_API_BASE_URL,
  SERVER_NAME,
  SERVER_VERSION,
} from "./constants.js";
import { registerTrestaPrompts } from "./prompts.js";
import { registerTrestaResources } from "./resources.js";
import { TrestaClient } from "./tresta-client.js";
import { registerTrestaTools } from "./tools.js";

export function createTrestaMcpServer(client = createDefaultClient()) {
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        "Use scoped Tresta agent-key APIs to inspect and manage safe project workflows. Never rewrite original feedback, reveal secrets, manage billing, or change organization membership.",
    },
  );

  registerTrestaTools(server, client);
  registerTrestaResources(server, client);
  registerTrestaPrompts(server);

  return server;
}

async function main() {
  const server = createTrestaMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

function createDefaultClient() {
  return new TrestaClient({
    baseUrl: DEFAULT_API_BASE_URL,
    agentKey: DEFAULT_AGENT_KEY,
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
