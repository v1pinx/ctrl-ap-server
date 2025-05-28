import { Pool } from "pg";
import { configDotenv } from "dotenv";
import { logger } from "../utils/logger.js";
configDotenv();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  logger.info("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  logger.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query in ${duration}ms: ${text}`);
    return res;
  } catch (error) {
    logger.error("Database query error:", error);
    throw error;
  }
};

// Helper function to get a client for transactions
const getClient = async () => {
  const client = await pool.connect();
  return client;
};

export { query, getClient, pool };
