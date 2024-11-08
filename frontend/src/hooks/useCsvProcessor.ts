import { useState } from "react";
import { ResultData } from "../interfaces/csv.interface";
import { csvService } from "../services/csv.service";

export const useCsvProcessor = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile?.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
      setResult(null);
      setStatus(null);
      setProcessId(null);
    } else {
      setError("Please select a valid CSV file");
      setFile(null);
    }
  };

  const processFile = async () => {
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const uploadResponse = await csvService.upload(file);

      if (uploadResponse.data?.processId) {
        setProcessId(uploadResponse.data.processId);
        console.log(processId);
        await checkStatus(uploadResponse.data.processId);
      } else {
        throw new Error("No process ID received");
      }
    } catch (err) {
      console.error("Process file error:", err);
      setError("Failed to process file");
    } finally {
      setIsUploading(false);
    }
  };

  const checkStatus = async (id: string) => {
    try {
      const statusResponse = await csvService.checkStatus(id);

      setStatus(statusResponse.status);

      if (statusResponse.data.status === "processing") {
        setTimeout(() => checkStatus(id), 1000);
      } else if (statusResponse.data.status === "completed") {
        await fetchResult(id);
      } else if (statusResponse.data.status === "failed") {
        setError("Processing failed");
      }
    } catch (err) {
      console.error("Check status error:", err);
      setError("Error checking status");
    }
  };

  const fetchResult = async (id: string) => {
    try {
      const response = await csvService.getResults(id);

      if (response.status === "success" && response.data) {
        setResult(response);
      } else {
        throw new Error("Invalid response data");
      }
    } catch (err) {
      console.error("Fetch result error:", err);
      setError("Error fetching results");
    }
  };

  return {
    file,
    isUploading,
    status,
    error,
    result,
    handleFileSelect,
    processFile,
  };
};
