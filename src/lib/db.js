import mysql from "mysql2/promise";

/**
 * @file db.js
 * @description Database connection configuration using MySQL2 connection pool.
 * Establishes a reusable pool of connections to the database to handle concurrent requests efficiently.
 */
const db = await mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "stitch",
  connectionLimit: 10,
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});
console.log("✅ MySQL connected.");
export default db;
