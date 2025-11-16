import mysql, { Pool } from 'mysql2/promise';

const config = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
};

if (!config.password) {
    console.error("FATAL: DB_PASSWORD not set in .env file.");
    process.exit(1);
}

/**
 * Global MySQL connection pool.
 */
export const dbPool: Pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

console.log(`[DB] Connected to MySQL database: ${config.database}`);