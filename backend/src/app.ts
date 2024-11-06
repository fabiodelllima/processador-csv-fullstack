import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { csvRoutes } from "./routes/csv.route";
import { errorHandler } from "./middlewares/errorHandler.middleware";

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/csv", csvRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running successfully" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  errorHandler(err, req, res, next);
});

export default app;
