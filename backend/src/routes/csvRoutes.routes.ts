import { Router } from "express";
import { uploadConfig } from "../config/multer.config";

const csvRoutes = Router();

csvRoutes.post("/upload", uploadConfig.single("file"), (req, res) => {
  res.json({ message: "File received" });
});

csvRoutes.get("/status/:id", (req, res) => {
  res.json({ status: "Processing..." });
});

export { csvRoutes };
