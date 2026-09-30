import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { verifyToken } from "@shsuman/api/content/tokens";
import { createMcpServer } from "@shsuman/api/mcp/tools";
import express, { type Request, type Response, Router } from "express";

import { db } from "./services";
import { saveUpload } from "./upload";

/**
 * Content MCP endpoint (Streamable HTTP, stateless).
 * Auth: `Authorization: Bearer <token>` with a token created in the dashboard.
 */
export const mcpRouter = Router();

// Room for base64 media in upload_media (20 MB file ≈ 27 MB encoded).
mcpRouter.use(express.json({ limit: "30mb" }));

mcpRouter.post("/", async (req: Request, res: Response) => {
  const header = req.headers.authorization ?? "";
  const secret = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  const owner = secret ? await verifyToken(db, secret) : null;
  if (!owner) {
    res
      .status(401)
      .set("WWW-Authenticate", 'Bearer realm="shsuman-content"')
      .json({ jsonrpc: "2.0", error: { code: -32001, message: "Invalid or missing MCP token" }, id: null });
    return;
  }

  const server = createMcpServer({ db, actor: { email: owner.email }, storeFile: saveUpload });
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on("close", () => {
    void transport.close();
    void server.close();
  });

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
    }
  }
});

// Stateless server: no SSE stream or session teardown.
const methodNotAllowed = (_req: Request, res: Response) => {
  res.status(405).set("Allow", "POST").json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null });
};
mcpRouter.get("/", methodNotAllowed);
mcpRouter.delete("/", methodNotAllowed);
