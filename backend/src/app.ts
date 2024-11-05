import express, { Express } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { csvRoutes } from "./routes/csvRoutes.routes";

dotenv.config();

const app: Express = express();

app.use(cors());
app.use(express.json());

app.use("/api/csv", csvRoutes);

app.get("/", (req, res) => {
  res.json({ message: "API is running successfully" });
});

export default app;
