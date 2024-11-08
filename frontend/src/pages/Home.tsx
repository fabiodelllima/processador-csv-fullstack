import { StatusDots } from "../components/StatusDots";
import { Loader } from "../components/Loader";
import { useCsvProcessor } from "../hooks/useCsvProcessor";

const translateStatus = (status: string) => {
  const translations: Record<string, string> = {
    success: "Sucesso",
    processing: "Processando",
    failed: "Falha",
    error: "Erro",
  };
  return translations[status] || status;
};

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

  const isButtonDisabled =
    !file || isUploading || (file && file.type !== "text/csv");
  const showLoader =
    status === "processing" || (status === "success" && !result);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <h1 className="text-2xl font-bold mb-6 text-center sm:text-left">
          Processador CSV
        </h1>
        <div className="mb-8 p-4 sm:p-6 border border-gray-700 rounded-lg bg-gray-800/50 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="relative group">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="sr-only peer"
                />
                <span
                  className="flex items-center justify-center w-full h-12 cursor-pointer rounded-lg 
                             bg-gray-700/50 text-gray-300 border border-gray-600/50
                             group-hover:bg-gray-600/50 peer-focus:ring-2 
                             peer-focus:ring-blue-500/50 transition-all duration-200"
                >
                  Procurar arquivo...
                </span>
              </label>
              {file && (
                <div className="text-sm text-gray-400 px-1 truncate">
                  Arquivo selecionado: {file.name}
                </div>
              )}
            </div>
            <button
              onClick={processFile}
              disabled={isButtonDisabled}
              className={`h-12 bg-blue-600/90 text-gray-100 rounded-lg transition-all duration-200
                        ${
                          isButtonDisabled
                            ? "opacity-50 cursor-default"
                            : "hover:bg-blue-700/90 cursor-pointer"
                        }`}
            >
              {isUploading ? "Enviando..." : "Enviar arquivo"}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-lg border border-red-700/50">
              {error}
            </div>
          )}
        </div>

        {status && (
          <div className="mb-8 p-4 sm:p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              Status do Processamento
            </h2>
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
              <span className="capitalize pb-0.5">
                {translateStatus(status)}
              </span>
            </div>
          </div>
        )}

        {showLoader && (
          <div className="mb-8">
            <Loader />
          </div>
        )}

        {result?.data && !showLoader && (
          <div className="p-4 sm:p-6 border border-gray-700 rounded-lg bg-gray-800 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Resultados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-400">Total de Registros</p>
                <p className="text-2xl font-semibold">
                  {result.data.summary.totalRecords}
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-400">Registros Válidos</p>
                <p className="text-2xl font-semibold">
                  {result.data.summary.validRecords}
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-400">Registros Inválidos</p>
                <p className="text-2xl font-semibold">
                  {result.data.summary.invalidRecords}
                </p>
              </div>
              <div className="p-4 bg-gray-700 rounded-md">
                <p className="text-sm text-gray-400">Valor Total</p>
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
                    <th className="p-3 text-left whitespace-nowrap">Cliente</th>
                    <th className="p-3 text-left whitespace-nowrap">
                      CPF/CNPJ
                    </th>
                    <th className="p-3 text-left whitespace-nowrap">
                      Contrato
                    </th>
                    <th className="p-3 text-right whitespace-nowrap">
                      Valor Total
                    </th>
                    <th className="p-3 text-center whitespace-nowrap">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {result.data.data.map((record, index) => (
                    <tr key={index} className="hover:bg-gray-700/50">
                      <td className="p-3 whitespace-nowrap">
                        {record.nmClient}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {record.nrCpfCnpj}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        {record.nrContrato}
                      </td>
                      <td className="p-3 text-right whitespace-nowrap">
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
