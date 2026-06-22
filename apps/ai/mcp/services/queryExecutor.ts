import { dbQuery } from "../datasource/mariadb";

export async function executeQuery(sql: string) {
  return dbQuery(sql);
}
