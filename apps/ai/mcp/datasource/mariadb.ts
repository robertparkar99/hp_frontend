import path from "node:path";
import dotenv from "dotenv";
import * as mariadb from "mariadb";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config({ path: path.resolve(process.cwd(), "../.env") });

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "hp_erp",
};

const missingDbConfig = Object.entries({
  DB_HOST: dbConfig.host,
  DB_PORT: process.env.DB_PORT,
  DB_USER: dbConfig.user,
  DB_PASSWORD: dbConfig.password,
  DB_NAME: dbConfig.database,
}).filter(([, value]) => value === undefined || value === null || value === "");

if (missingDbConfig.length > 0) {
  throw new Error(
    `Missing database configuration: ${missingDbConfig.map(([key]) => key).join(", ")}`
  );
}

export const pool = mariadb.createPool({
  ...dbConfig,
  connectionLimit: 10
});
