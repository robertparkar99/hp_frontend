import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import * as mariadb from "mariadb";

function loadEnvFile(filePath: string) {
  if (!existsSync(filePath)) {
    return false;
  }

  const result = dotenv.config({ path: filePath });
  if (result.error) {
    console.warn("[mariadb] Failed to load env file:", filePath, result.error);
    return false;
  }

  return true;
}

function loadDatabaseEnvironment() {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "..", ".env.local"),
    path.resolve(process.cwd(), "..", ".env"),
    path.resolve(moduleDir, "..", "..", "..", "..", ".env.local"),
    path.resolve(moduleDir, "..", "..", "..", "..", ".env"),
  ];

  const visited = new Set<string>();

  for (const candidate of candidates) {
    if (visited.has(candidate)) {
      continue;
    }

    visited.add(candidate);
    loadEnvFile(candidate);
  }
}

loadDatabaseEnvironment();

const DEFAULT_DB_CONFIG = {
  host: "128.199.17.97",
  port: 3306,
  user: "dev_db",
  password: "dev@sql",
  database: "hp_erp",
} as const;

const requiredEnvKeys = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;

function getDbConfig() {
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined;
  const missingKeys = requiredEnvKeys.filter((key) => {
    const value = process.env[key];
    return value === undefined || value === null || value === "";
  });

  if (process.env.NODE_ENV === "production") {
    if (missingKeys.length > 0) {
      throw new Error(
        `Missing database environment variables in production: ${missingKeys.join(", ")}`
      );
    }

    if (!port || Number.isNaN(port)) {
      throw new Error("DB_PORT must be a valid number in production");
    }

    return {
      host: process.env.DB_HOST as string,
      port,
      user: process.env.DB_USER as string,
      password: process.env.DB_PASSWORD as string,
      database: process.env.DB_NAME as string,
    };
  }

  if (missingKeys.length > 0) {
    console.warn(
      "[mariadb] DB env vars missing, using fallback development database config:",
      missingKeys.join(", ")
    );
  }

  return {
    host: process.env.DB_HOST || DEFAULT_DB_CONFIG.host,
    port: port && !Number.isNaN(port) ? port : DEFAULT_DB_CONFIG.port,
    user: process.env.DB_USER || DEFAULT_DB_CONFIG.user,
    password: process.env.DB_PASSWORD || DEFAULT_DB_CONFIG.password,
    database: process.env.DB_NAME || DEFAULT_DB_CONFIG.database,
  };
}

const dbConfig = getDbConfig();

if (process.env.NODE_ENV !== "production") {
  console.info("[mariadb] Using database config:", {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
  });
}

// 1. Raised pool limit slightly for an ERP framework context to prevent choking
export const pool = mariadb.createPool({
  ...dbConfig,
  connectionLimit: 25, 
  acquireTimeout: 15000,
  connectTimeout: 15000,
  resetAfterUse: true,
});

/**
 * BEST PRACTICE WRAPPER:
 * This ensures connections are safely checked out and ALWAYS returned to the pool,
 * completely eliminating connection leaks.
 */
export async function dbQuery<T = any>(sql: string, params?: any[]): Promise<T> {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.query(sql, params);
    return result as T;
  } catch (error) {
    console.error(`[Database Error] Failed executing query: ${sql}`, error);
    throw error;
  } finally {
    if (conn) conn.release(); // Guaranteed to execute & save pool space
  }
}

/**
 * TRANSACTION WRAPPER:
 * For multi-query sequential tasks (like complex leave calculations) that need 
 * to either succeed together or completely rollback.
 */
export async function dbTransaction<T>(
  callback: (conn: mariadb.Connection) => Promise<T>
): Promise<T> {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();
    
    const result = await callback(conn);
    
    await conn.commit();
    return result;
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("[Database Transaction Error] Transaction rolled back.", error);
    throw error;
  } finally {
    if (conn) conn.release();
  }
}