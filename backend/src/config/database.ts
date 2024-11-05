import { Pool } from "pg";

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

const connect = async (): Promise<boolean> => {
  try {
    const client = await pool.connect();
    console.log("Connected to the database");
    client.release();
    return true;
  } catch (error) {
    console.error("Error connecting to the database:", error);
    return false;
  }
};

export { pool, connect };
