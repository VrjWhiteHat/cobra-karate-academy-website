import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { storagePut } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  app.put("/api/coach-upload", express.raw({ limit: "100mb", type: "*/*" }), async (req, res) => {
    try {
      const context = await createContext({ req, res, info: {} as any });
      if (!context.isCoach && context.user?.role !== "admin") return res.status(403).json({ message: "Coach access required." });
      if (!Buffer.isBuffer(req.body) || req.body.length === 0) return res.status(400).json({ message: "File is required." });
      const rawName = String(req.headers["x-file-name"] ?? "upload.bin");
      const safeName = rawName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
      const kind = String(req.headers["x-media-kind"] ?? "media").replace(/[^a-zA-Z0-9_-]/g, "-");
      const upload = await storagePut(`cobra/${kind}/${Date.now()}-${safeName}`, req.body, String(req.headers["content-type"] ?? "application/octet-stream"));
      return res.json(upload);
    } catch (error) {
      console.error("[Coach Upload] Failed:", error);
      return res.status(500).json({ message: "Upload failed." });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
