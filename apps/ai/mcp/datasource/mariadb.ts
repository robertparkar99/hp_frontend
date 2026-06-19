import path from "node:path";
import dotenv from "dotenv";
import * as mariadb from "mariadb";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const DEFAULT_DB_CONFIG = {
  host: "128.199.17.97",
  port: 3306,
  user: "dev_db",
  password: "dev@sql",
  database: "hp_erp",
} as const;

const dbConfig = {
  host: process.env.DB_HOST || DEFAULT_DB_CONFIG.host,
  port: Number(process.env.DB_PORT || DEFAULT_DB_CONFIG.port),
  user: process.env.DB_USER || DEFAULT_DB_CONFIG.user,
  password: process.env.DB_PASSWORD || DEFAULT_DB_CONFIG.password,
  database: process.env.DB_NAME || DEFAULT_DB_CONFIG.database,
};

const resolvedMissingDbConfig = Object.entries({
  DB_HOST: dbConfig.host,
  DB_PORT: dbConfig.port,
  DB_USER: dbConfig.user,
  DB_PASSWORD: dbConfig.password,
  DB_NAME: dbConfig.database,
}).filter(([, value]) => value === undefined || value === null || value === "");

if (resolvedMissingDbConfig.length > 0) {
  console.warn(
    "[mariadb] Using fallback database config with missing values:",
    resolvedMissingDbConfig.map(([key]) => key).join(", ")
  );
}

export const pool = mariadb.createPool({
  ...dbConfig,
  connectionLimit: 10
});
