import mysql from 'mysql2/promise';

const globalForDb = globalThis;

export const db = globalForDb.__schoolhubDb || mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

if (process.env.NODE_ENV !== 'production') globalForDb.__schoolhubDb = db;
