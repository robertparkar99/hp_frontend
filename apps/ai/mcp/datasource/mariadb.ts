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

const DEFAULT_POOL_CONFIG = {
  connectionLimit: 25,
  acquireTimeout: 15000,
  connectTimeout: 15000,
} as const;

const requiredEnvKeys = ["DB_HOST", "DB_PORT", "DB_USER", "DB_PASSWORD", "DB_NAME"] as const;

function parseNumber(value: string | undefined, fallback: number) {
  if (!value) return fallback;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseBoolean(value: string | undefined) {
  if (value === undefined) return undefined;

  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

function buildSslConfig() {
  if (process.env.DB_SSL === undefined && process.env.DB_SSL_REJECT_UNAUTHORIZED === undefined) {
    return undefined;
  }

  const enabled = parseBoolean(process.env.DB_SSL);
  if (!enabled) {
    return undefined;
  }

  const rejectUnauthorized = parseBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED);

  return {
    rejectUnauthorized: rejectUnauthorized ?? true,
  };
}

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
const poolConfig = {
  connectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT, DEFAULT_POOL_CONFIG.connectionLimit),
  acquireTimeout: parseNumber(process.env.DB_ACQUIRE_TIMEOUT, DEFAULT_POOL_CONFIG.acquireTimeout),
  connectTimeout: parseNumber(process.env.DB_CONNECT_TIMEOUT, DEFAULT_POOL_CONFIG.connectTimeout),
  resetAfterUse: true,
  ssl: buildSslConfig(),
  socketPath: process.env.DB_SOCKET_PATH || undefined,
} as const;

function logDbConfig(prefix: string) {
  console.info(prefix, {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database,
    connectionLimit: poolConfig.connectionLimit,
    acquireTimeout: poolConfig.acquireTimeout,
    connectTimeout: poolConfig.connectTimeout,
    sslEnabled: Boolean(poolConfig.ssl),
    socketPath: Boolean(poolConfig.socketPath),
    nodeEnv: process.env.NODE_ENV,
  });
}

export const pool = mariadb.createPool({
  ...dbConfig,
  ...poolConfig,
});

if (process.env.NODE_ENV !== "production") {
  logDbConfig("[mariadb] Using database config:");
}

function isTransientConnectionError(error: any) {
  const code = String(error?.code || "");
  const errno = Number(error?.errno);

  return (
    code === "POOL_EMPTY" ||
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "EHOSTUNREACH" ||
    code === "ENETUNREACH" ||
    errno === 45028 ||
    errno === 2002 ||
    errno === 2003
  );
}

function summarizeDbError(error: any) {
  return {
    message: error?.message,
    code: error?.code,
    errno: error?.errno,
    sqlState: error?.sqlState,
    fatal: error?.fatal,
  };
}

function classifyConnectionFailure(error: any) {
  const code = String(error?.code || "");
  const errno = Number(error?.errno);

  if (code === "ER_ACCESS_DENIED_ERROR" || errno === 1045) {
    return "auth";
  }

  if (code === "ER_BAD_DB_ERROR" || errno === 1049) {
    return "database";
  }

  if (
    code === "ETIMEDOUT" ||
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "EHOSTUNREACH" ||
    code === "ENETUNREACH" ||
    errno === 45028 ||
    errno === 2002 ||
    errno === 2003
  ) {
    return "network";
  }

  return "unknown";
}

function buildConnectionDiagnostics(error: any) {
  return {
    target: `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
    user: dbConfig.user,
    connectionLimit: poolConfig.connectionLimit,
    acquireTimeout: poolConfig.acquireTimeout,
    connectTimeout: poolConfig.connectTimeout,
    sslEnabled: Boolean(poolConfig.ssl),
    socketPath: poolConfig.socketPath || null,
    nodeEnv: process.env.NODE_ENV || "unknown",
    error: summarizeDbError(error),
  };
}

function wrapConnectionError(error: any, scope: "query" | "transaction") {
  const diagnostics = buildConnectionDiagnostics(error);
  const message = [
    `MariaDB connection unavailable during ${scope}.`,
    `Target: ${diagnostics.target}.`,
    `Check live firewall/IP allowlist, DB credentials, and TLS settings.`,
    `Underlying error: ${diagnostics.error.code || "unknown"} (${diagnostics.error.errno ?? "n/a"})`,
  ].join(" ");

  const wrapped = new Error(message);
  (wrapped as Error & { cause?: unknown }).cause = error;
  (wrapped as Error & { diagnostics?: unknown }).diagnostics = diagnostics;
  return wrapped;
}

export async function checkMariaDbHealth() {
  const startedAt = Date.now();
  let conn: any;

  try {
    conn = await pool.getConnection();
    await conn.query("SELECT 1 AS ok");

    return {
      ok: true,
      target: `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
      user: dbConfig.user,
      durationMs: Date.now() - startedAt,
      connectionLimit: poolConfig.connectionLimit,
      sslEnabled: Boolean(poolConfig.ssl),
      socketPath: poolConfig.socketPath || null,
    };
  } catch (error) {
    return {
      ok: false,
      target: `${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
      user: dbConfig.user,
      durationMs: Date.now() - startedAt,
      failureType: classifyConnectionFailure(error),
      diagnostics: buildConnectionDiagnostics(error),
    };
  } finally {
    if (conn) {
      conn.release?.();
    }
  }
}

async function acquireConnection() {
  const maxAttempts = 2;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await pool.getConnection();
    } catch (error) {
      lastError = error;

      console.error("[mariadb] Failed to acquire database connection", {
        attempt,
        maxAttempts,
        db: {
          host: dbConfig.host,
          port: dbConfig.port,
          database: dbConfig.database,
          user: dbConfig.user,
        },
        pool: {
          connectionLimit: poolConfig.connectionLimit,
          acquireTimeout: poolConfig.acquireTimeout,
          connectTimeout: poolConfig.connectTimeout,
          sslEnabled: Boolean(poolConfig.ssl),
          socketPath: Boolean(poolConfig.socketPath),
        },
        error: summarizeDbError(error),
      });

      if (attempt < maxAttempts && isTransientConnectionError(error)) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
        continue;
      }

      throw error;
    }
  }

  throw lastError;
}

/**
 * BEST PRACTICE WRAPPER:
 * This ensures connections are safely checked out and ALWAYS returned to the pool,
 * completely eliminating connection leaks.
 */
export async function dbQuery<T = any>(sql: string, params?: any[]): Promise<T> {
  let conn;
  try {
    conn = await acquireConnection();
    const result = await conn.query(sql, params);
    return result as T;
  } catch (error) {
    console.error(`[Database Error] Failed executing query: ${sql}`, error);
    if (error && typeof error === "object" && "sqlState" in error) {
      throw wrapConnectionError(error, "query");
    }

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
    conn = await acquireConnection();
    await conn.beginTransaction();
    
    const result = await callback(conn);
    
    await conn.commit();
    return result;
  } catch (error) {
    if (conn) await conn.rollback();
    console.error("[Database Transaction Error] Transaction rolled back.", error);
    if (error && typeof error === "object" && "sqlState" in error) {
      throw wrapConnectionError(error, "transaction");
    }

    throw error;
  } finally {
    if (conn) conn.release();
  }
}
