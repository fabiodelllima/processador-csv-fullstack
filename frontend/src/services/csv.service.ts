import { ResultData } from "../interfaces/csv.interface";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000"\;

export const csvService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/api/csv/upload`, {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  checkStatus: async (processId: string) => {
    const response = await fetch(
      `${API_URL}/api/csv/status/${processId}`
    );
    return response.json();
  },

  getResults: async (processId: string): Promise<ResultData> => {
    const response = await fetch(
      `${API_URL}/api/csv/download/${processId}`
    );
    return response.json();
  },
};
