import { Router } from "express";
import { uploadConfig } from "../config/upload.config";
import { download } from "../controllers/download.controller";
import { getStatus } from "../controllers/status.controller";
import { upload } from "../controllers/upload.controller";

const router = Router();

router.post("/upload", uploadConfig.single("file"), upload);
router.get("/status/:processId", getStatus);
router.get("/download/:processId", download);

export { router as csvRoutes };
