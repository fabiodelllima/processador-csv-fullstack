import dotenv from "dotenv";

if (!dotenv.config().parsed) {
  throw new Error("Environment file (.env) not found");
}

const requiredEnvs = [
  "PORT",
  "NODE_ENV",
  "UPLOAD_FOLDER",
  "DB_HOST",
  "DB_PORT",
  "DB_NAME",
  "DB_USER",
  "DB_PASS",
];

for (const env of requiredEnvs) {
  if (!process.env[env]) {
    throw new Error(`Environment variable ${env} not defined`);
  }
}

const UPLOAD_CONSTANTS = {
  MAX_FILE_SIZE: 30 * 1024 * 1024,
  ALLOWED_MIMETYPES: ["text/csv", "application/vnd.ms-excel"],
} as const;

export const env = {
  server: {
    port: Number(process.env.PORT),
    nodeEnv: process.env.NODE_ENV,
  },
  upload: {
    folder: process.env.UPLOAD_FOLDER,
    maxSize: UPLOAD_CONSTANTS.MAX_FILE_SIZE,
    allowedMimetypes: UPLOAD_CONSTANTS.ALLOWED_MIMETYPES,
  },
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
  },
};
