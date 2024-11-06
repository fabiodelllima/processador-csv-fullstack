import { Router } from "express";
import { uploadConfig } from "../config/upload.config";
import { upload } from "../controllers/upload.controller";
import { getStatus } from "../controllers/status.controller";
import { download } from "../controllers/download.controller";

const router = Router();

router.post("/csv/upload", uploadConfig.single("file"), upload);
router.get("/csv/status/:processId", getStatus);
router.get("/csv/download/:processId", download);

export { router as csvRoutes };
