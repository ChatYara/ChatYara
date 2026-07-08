import { validatePersistenceConfiguration } from "../services/persistenceService";
import { runMigrations } from "./schema";

validatePersistenceConfiguration();
runMigrations();
console.log("YARA AI database ready.");
