import { useState } from "react";
import { ResultData } from "../../../backend/src/interfaces/csv/result.interface";

export default function CsvProcessor() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [processId, setProcessId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ResultData | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError("Please select a valid CSV file");
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:3000/api/csv/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Upload response:", data);

      if (response.ok) {
        setProcessId(data.data.processId);
        checkStatus(data.data.processId);
      } else {
        setError(data.message || "Error uploading file");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to connect to server");
    } finally {
      setIsUploading(false);
    }
  };

  const checkStatus = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/csv/status/${id}`
      );
      const data = await response.json();
      console.log("Status response:", data);

      setStatus(data.status);

      if (data.status === "processing") {
        setTimeout(() => checkStatus(id), 1000);
      } else if (data.status === "success") {
        fetchResult(id);
      } else {
        setError(data.message || "Processing error");
      }
    } catch (err) {
      console.error("Status check error:", err);
      setError("Error checking status");
    }
  };

  const fetchResult = async (id: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/csv/download/${id}`
      );
      const data = await response.json();
      console.log("Result data:", data);

      if (response.ok) {
        setResult({
          status: data.status,
          result: {
            data: data.data.data,
            summary: data.data.summary,
            errors: [],
            successes: data.data.successes,
          },
        });
      } else {
        setError(data.message || "Error downloading results");
      }
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download results");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">CSV Processor</h1>

      <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload File"}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
      </div>

      {status && (
        <div className="mb-8 p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Processing Status</h2>
          <div className="flex items-center gap-2">
            <div
              className={`h-3 w-3 rounded-full ${
                status === "processing"
                  ? "bg-yellow-500"
                  : status === "success"
                  ? "bg-green-500"
                  : "bg-red-500"
              }`}
            />
            <span className="capitalize">{status}</span>
          </div>
        </div>
      )}

      {result?.result && (
        <div className="p-6 border rounded-lg bg-white shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Results</h2>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Total Records</p>
              <p className="text-2xl font-semibold">
                {result.result.summary.totalRecords}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Valid Records</p>
              <p className="text-2xl font-semibold">
                {result.result.summary.validRecords}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Invalid Records</p>
              <p className="text-2xl font-semibold">
                {result.result.summary.invalidRecords}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-semibold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(result.result.summary.totalValue)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3 text-left">Client</th>
                  <th className="p-3 text-left">CPF/CNPJ</th>
                  <th className="p-3 text-left">Contract</th>
                  <th className="p-3 text-right">Total Value</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {result.result.data.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-3">{record.nmClient}</td>
                    <td className="p-3">{record.nrCpfCnpj}</td>
                    <td className="p-3">{record.nrContrato}</td>
                    <td className="p-3 text-right">
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(record.vlTotal)}
                    </td>
                    <td className="p-3">
                      <div
                        className="flex justify-center gap-1"
                        title="Document | Contract | Installment"
                      >
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            record.cpfCnpjValido ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            record.contratoValido
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            record.prestacaoValida
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
