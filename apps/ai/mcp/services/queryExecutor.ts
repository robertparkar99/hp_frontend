import { pool } from "../datasource/mariadb";

export async function executeQuery(sql: string) {

  const conn = await pool.getConnection();

  try {
    return await conn.query(sql);
  } finally {
    conn.release();
  }
}