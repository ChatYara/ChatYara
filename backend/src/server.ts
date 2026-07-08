import { env, validateEnvironment } from "./config/env";
import { createApp } from "./app";
import { runMigrations } from "./db/schema";
import { validatePersistenceConfiguration } from "./services/persistenceService";

async function bootstrap() {
  validateEnvironment();
  validatePersistenceConfiguration();
  runMigrations();

  const app = createApp();

  app.listen(env.apiPort, "0.0.0.0", () => {
    console.log(`YARA AI backend online em http://localhost:${env.apiPort}`);
  });
}

bootstrap().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
