import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "node:path";
import { env } from "./config/env";
import { authRoutes } from "./routes/authRoutes";
import { chatRoutes } from "./routes/chatRoutes";
import { systemRoutes } from "./routes/systemRoutes";
import { workspaceRoutes } from "./routes/workspaceRoutes";
import { renderLandingPage } from "./views/landingPage";
import { renderPlatformPage } from "./views/platformPage";

export function createApp() {
  const app = express();
  const publicDir = path.resolve(__dirname, "..", "public");

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'"],
          "style-src": ["'self'", "'unsafe-inline'"]
        }
      }
    })
  );
  app.use(
    cors({
      origin: env.clientOrigin === "*" ? true : env.clientOrigin,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(morgan("dev"));
  app.use("/assets", express.static(path.join(publicDir, "assets")));
  app.use(express.static(publicDir, { index: false }));

  app.get("/favicon.ico", (_req, res) => {
    res.type("png").sendFile(path.join(publicDir, "assets", "favicon.png"));
  });

  app.get("/", (_req, res) => {
    res.type("html").send(renderLandingPage());
  });

  app.get("/app", (_req, res) => {
    res.type("html").send(renderPlatformPage());
  });

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
