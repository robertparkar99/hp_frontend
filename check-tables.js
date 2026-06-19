require('dotenv').config({path: '.env.local'});
const mariadb = require('mariadb');
const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

pool.getConnection().then(conn => {
  conn.query("SHOW TABLES LIKE '%leave%'").then(r => {
    console.log('Leave tables:', r);
    conn.release();
    pool.end();
  }).catch(e => {
    console.error('Query error:', e);
    conn.release();
    pool.end();
  });
}).catch(e => {
  console.error('Connection failed:', e);
  process.exit(1);
});