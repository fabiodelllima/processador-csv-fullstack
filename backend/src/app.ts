import cors from "cors";
import dotenv from "dotenv";
import express, { type Express, type NextFunction, type Request, type Response } from "express";
import { env } from "./config/env.config";
import { errorHandler } from "./middlewares/errorHandler.middleware";
import { csvRoutes } from "./routes/csv.route";

dotenv.config();

const app: Express = express();

app.use(
  cors({
    origin: env.cors.origin.split(",").map((o) => o.trim()),
  }),
);

app.use(express.json());
app.use("/api/csv", csvRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
