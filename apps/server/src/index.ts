import { OpenAPIHandler } from "@orpc/openapi/node";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/node";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { appRouter } from "@shsuman/api/routers/index";
import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import { initLogger } from "evlog";
import { createAxiomDrain } from "evlog/axiom";
import { createAuthMiddleware, type BetterAuthInstance } from "evlog/better-auth";
import { evlog, useLogger } from "evlog/express";
import express from "express";

import { createContext } from "./context";
import { mcpRouter } from "./mcp";
import { uploadRouter, uploadsDir } from "./upload";
import { ENV } from "./env.server";
import { auth } from "./services";

initLogger({
  env: { service: "shsuman-server" },
});

const identifyUser = createAuthMiddleware(auth as BetterAuthInstance, {
  exclude: ["/api/auth/**"],
  maskEmail: true,
});

const app = express();

app.use(evlog({ drain: createAxiomDrain() }));
app.use(async (req, _res, next) => {
  await identifyUser(useLogger(), req.headers, req.path);
  next();
});

app.use(
  cors({
    origin: ENV.CORS_ORIGIN,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Serve static uploads
app.use("/uploads", express.static(uploadsDir));

app.all("/api/auth{/*path}", toNodeHandler(auth));
app.use("/api/upload", uploadRouter);
app.use("/mcp", mcpRouter);

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});
const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use(async (req, res, next) => {
  const rpcResult = await rpcHandler.handle(req, res, {
    prefix: "/rpc",
    context: await createContext({ req }),
  });
  if (rpcResult.matched) return;

  const apiResult = await apiHandler.handle(req, res, {
    prefix: "/api-reference",
    context: await createContext({ req }),
  });
  if (apiResult.matched) return;

  next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
