import { Request, Response } from "express";

export const uploadCsv = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    if (req.file.mimetype !== "text/csv") {
      res
        .status(400)
        .json({ error: "Invalid file type. Only CSV files are allowed." });
      return;
    }

    const processId = `${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    res.status(202).json({
      message: "File uploaded successfully. Processing...",
      processId,
      fileName: req.file.filename,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProcessingStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { processId } = req.params;

    res.json({
      processId,
      status: "Completed",
      result: {
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        processingTime: "0s",
      },
    });
  } catch (error) {
    console.error("Error getting processing status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
