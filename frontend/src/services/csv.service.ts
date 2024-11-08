import { ResultData } from "../interfaces/csv.interface";

export const csvService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("http://localhost:3000/api/csv/upload", {
      method: "POST",
      body: formData,
    });
    return response.json();
  },

  checkStatus: async (processId: string) => {
    const response = await fetch(
      `http://localhost:3000/api/csv/status/${processId}`
    );
    return response.json();
  },

  getResults: async (processId: string): Promise<ResultData> => {
    const response = await fetch(
      `http://localhost:3000/api/csv/download/${processId}`
    );
    return response.json();
  },
};
