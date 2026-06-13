import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env";
import { authRoutes } from "./routes/authRoutes";
import { chatRoutes } from "./routes/chatRoutes";
import { systemRoutes } from "./routes/systemRoutes";
import { workspaceRoutes } from "./routes/workspaceRoutes";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigin === "*" ? true : env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, name: "YARA AI API" });
  });

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, name: "YARA AI API" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/system", systemRoutes);
  app.use("/api", chatRoutes);
  app.use("/api", workspaceRoutes);

  app.use((_req, res) => {
    res.status(404).json({ error: { message: "Rota nao encontrada." } });
  });

  return app;
}
