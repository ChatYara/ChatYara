import cors from "cors";
import express from "express";
import helmet from "helmet";
import path from "node:path";
import { env } from "./config/env";
import { csrfProtection, rateLimit, securityHeaders } from "./middleware/security";
import { authRoutes } from "./routes/authRoutes";
import { agentRoutes } from "./routes/agentRoutes";
import { aiRoutes } from "./routes/aiRoutes";
import { automationRoutes } from "./routes/automationRoutes";
import { calendarRoutes } from "./routes/calendarRoutes";
import { chatRoutes } from "./routes/chatRoutes";
import { documentRoutes } from "./routes/documentRoutes";
import { fileRoutes } from "./routes/fileRoutes";
import { graphRoutes } from "./routes/graphRoutes";
import { imageRoutes } from "./routes/imageRoutes";
import { integrationRoutes } from "./routes/integrationRoutes";
import { memoryRoutes } from "./routes/memoryRoutes";
import { pluginRoutes } from "./routes/pluginRoutes";
import { profileRoutes } from "./routes/profileRoutes";
import { productionRoutes } from "./routes/productionRoutes";
import { projectMemoryRoutes } from "./routes/projectMemoryRoutes";
import { searchRoutes } from "./routes/searchRoutes";
import { systemRoutes } from "./routes/systemRoutes";
import { systemsRoutes } from "./routes/systemsRoutes";
import { technicalProjectRoutes } from "./routes/technicalProjectRoutes";
import { uploadRoutes } from "./routes/uploadRoutes";
import { userRoutes } from "./routes/userRoutes";
import { workspaceRoutes } from "./routes/workspaceRoutes";
import { renderLandingPage } from "./views/landingPage";
import { renderPlatformPage } from "./views/platformPage";
import { startAutomationScheduler } from "./services/automationService";
import { startBackupScheduler } from "./services/backupService";
import { structuredLog } from "./services/loggerService";

export function createApp() {
  const app = express();
  const publicDir = path.resolve(__dirname, "..", "public");

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          "script-src": ["'self'", "'unsafe-inline'"],
          "style-src": ["'self'", "'unsafe-inline'"],
          "img-src": ["'self'", "data:", "blob:"],
          "connect-src": ["'self'"]
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
  app.use(securityHeaders);
  app.use(rateLimit({ windowMs: 60_000, max: 240, keyPrefix: "global" }));
  app.use(express.json({ limit: "1mb" }));
  app.use((req, res, next) => {
    const started = Date.now();
    res.once("finish", () => {
      const level: "info" | "warn" | "error" = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";
      structuredLog(level, "http", `${req.method} ${req.path}`, {
        status: res.statusCode,
        durationMs: Date.now() - started
      });
    });
    next();
  });
  app.use(csrfProtection);
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
  app.use("/api", rateLimit({ windowMs: 60_000, max: 180, keyPrefix: "api" }));
  app.use("/api/system", systemRoutes);
  app.use("/api", productionRoutes);
  app.use("/api", projectMemoryRoutes);
  app.use("/api", agentRoutes);
  app.use("/api", aiRoutes);
  app.use("/api", automationRoutes);
  app.use("/api", userRoutes);
  app.use("/api", uploadRoutes);
  app.use("/api", fileRoutes);
  app.use("/api", graphRoutes);
  app.use("/api", documentRoutes);
  app.use("/api", imageRoutes);
  app.use("/api", integrationRoutes);
  app.use("/api", memoryRoutes);
  app.use("/api", pluginRoutes);
  app.use("/api", profileRoutes);
  app.use("/api", calendarRoutes);
  app.use("/api", chatRoutes);
  app.use("/api", searchRoutes);
  app.use("/api", systemsRoutes);
  app.use("/api", technicalProjectRoutes);
  app.use("/api", workspaceRoutes);

  app.use((req, res) => {
    structuredLog("warn", "http", "Rota não encontrada.", { path: req.path, method: req.method });
    res.status(404).json({ error: { message: "Rota nao encontrada." } });
  });

  startAutomationScheduler();
  startBackupScheduler();

  return app;
}
