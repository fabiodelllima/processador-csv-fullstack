import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { csvRoutes } from "./routes/csv.route";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { env } from "./config/env.config";

dotenv.config();

const app: Express = express();

app.use(
  cors({
    origin: env.cors.origin === "*" ? "*" : env.cors.origin.split(","),
  }),
);

app.use(express.json());

app.use("/api/csv", csvRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
