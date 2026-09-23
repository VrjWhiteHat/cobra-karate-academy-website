import express, { type Express } from "express";
import path from "node:path";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";
import { storagePut } from "./storage";

export function createApp(): Express {
  const app = express();
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
  app.use("/api/trpc", createExpressMiddleware({ router: appRouter, createContext }));
  if (process.env.VERCEL) {
    const publicDir = path.resolve(process.cwd(), "public");
    app.use(express.static(publicDir, { index: "index.html" }));
    app.get("*", (_req, res) => res.sendFile(path.join(publicDir, "index.html")));
  }
  return app;
}
