import app from "./app";
import { env } from "./config/env.config";
import { connect } from "./config/database.config";

const start = async () => {
  const dbConnected = await connect();
  if (!dbConnected) {
    console.error("Failed to connect to database. Exiting.");
    process.exit(1);
  }

  app.listen(env.server.port, () => {
    console.log(`Server running on port ${env.server.port}`);
  });
};

void start();
