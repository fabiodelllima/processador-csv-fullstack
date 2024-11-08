interface StatusDotsProps {
  documentValid: boolean;
  contractValid: boolean;
  installmentValid: boolean;
}

export const StatusDots = ({
  documentValid,
  contractValid,
  installmentValid,
}: StatusDotsProps) => (
  <div
    className="flex justify-center gap-1"
    title="Documento | Contrato | Prestações"
  >
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        documentValid ? "bg-green-500" : "bg-red-500"
      }`}
    />
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        contractValid ? "bg-green-500" : "bg-red-500"
      }`}
    />
    <span
      className={`inline-block w-2 h-2 rounded-full ${
        installmentValid ? "bg-green-500" : "bg-red-500"
      }`}
    />
  </div>
);
