import { StatusDots } from "../components/StatusDots";
import { useCsvProcessor } from "../hooks/useCsvProcessor";

export const Home = () => {
  const {
    file,
    isUploading,
    status,
    error,
    result,
    handleFileSelect,
    processFile,
  } = useCsvProcessor();

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">CSV Processor</h1>

        <div className="mb-8 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-sm">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="mb-4 block w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 
                     file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600"
          />

          <button
            onClick={processFile}
            disabled={!file || isUploading}
            className="bg-blue-600 text-gray-100 px-4 py-2 rounded-md hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? "Uploading..." : "Upload File"}
          </button>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700">
              {error}
            </div>
          )}
        </div>

        {status && (
          <div className="mb-8 p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-sm">
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

        {result?.data && (
          <div className="p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Results</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-400">Total Records</p>
                <p className="text-2xl font-semibold">
                  {result.data.summary.totalRecords}
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-400">Valid Records</p>
                <p className="text-2xl font-semibold">
                  {result.data.summary.validRecords}
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-400">Invalid Records</p>
                <p className="text-2xl font-semibold">
                  {result.data.summary.invalidRecords}
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-400">Total Value</p>
                <p className="text-2xl font-semibold">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(result.data.summary.totalValue)}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-700">
              <table className="w-full text-sm">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="p-3 text-left">Client</th>
                    <th className="p-3 text-left">CPF/CNPJ</th>
                    <th className="p-3 text-left">Contract</th>
                    <th className="p-3 text-right">Total Value</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {result.data.data.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-700/50">
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
                        <StatusDots
                          documentValid={record.cpfCnpjValido}
                          contractValid={record.contratoValido}
                          installmentValid={record.prestacaoValida}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
