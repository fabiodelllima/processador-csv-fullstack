import { Router } from "express";
import { uploadConfig } from "../config/multer.config";
import {
  getProcessingStatus,
  uploadCsv,
} from "../controllers/csvController.controller";

const router = Router();

router.post("/upload", uploadConfig.single("file"), uploadCsv);
router.get("/status/:processId", getProcessingStatus);

export { router as csvRoutes };
