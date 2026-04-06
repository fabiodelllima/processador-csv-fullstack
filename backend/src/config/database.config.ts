import { Pool } from "pg";
import { env } from "./env.config";

const pool = new Pool({
  host: env.database.host,
  port: env.database.port,
  database: env.database.name,
  user: env.database.user,
  password: env.database.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const connect = async (): Promise<boolean> => {
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

export { pool };
