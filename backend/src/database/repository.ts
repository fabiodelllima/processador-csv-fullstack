import { pool } from "../config/database.config";
import type { RecordData } from "../interfaces/csv/record.interface";
import type { ErrorData } from "../interfaces/csv/error.interface";
import type { SuccessData } from "../interfaces/csv/success.interface";

export const createProcessing = async (id: string): Promise<void> => {
  await pool.query(
    "INSERT INTO processings (id, status, start_time) VALUES ($1, $2, NOW())",
    [id, "processing"],
  );
};

export const completeProcessing = async (
  id: string,
  summary: {
    totalRecords: number;
    validRecords: number;
    invalidRecords: number;
    processingTime: string;
    totalValue: number;
  },
): Promise<void> => {
  await pool.query(
    `UPDATE processings
     SET status = 'completed', total_records = $2, valid_records = $3,
         invalid_records = $4, processing_time = $5, total_value = $6, end_time = NOW()
     WHERE id = $1`,
    [id, summary.totalRecords, summary.validRecords, summary.invalidRecords, summary.processingTime, summary.totalValue],
  );
};

export const failProcessing = async (id: string, error: string): Promise<void> => {
  await pool.query(
    "UPDATE processings SET status = 'failed', error = $2, end_time = NOW() WHERE id = $1",
    [id, error],
  );
};

export const insertRecords = async (processingId: string, records: RecordData[]): Promise<void> => {
  if (records.length === 0) return;

  const values: unknown[] = [];
  const placeholders: string[] = [];
  let idx = 1;

  for (const r of records) {
    placeholders.push(
      `($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`,
    );
    values.push(
      processingId, r.nrInst, r.nrAgencia, r.cdClient, r.nmClient,
      r.nrCpfCnpj, r.nrContrato, r.dtContrato, r.qtPrestacoes, r.vlTotal,
      r.cdProduto, r.dsProduto, r.cdCarteira, r.dsCarteira, r.nrProposta,
      r.nrPresta, r.tpPresta, r.nrSeqPre, r.dtVctPre, r.vlPresta,
      r.vlMora, r.vlMulta, r.vlOutAcr, r.vlIof, r.vlDescon, r.vlAtual,
      r.cpfCnpjValido, r.contratoValido, r.prestacaoValida,
    );
  }

  await pool.query(
    `INSERT INTO records (
      processing_id, nr_inst, nr_agencia, cd_client, nm_client,
      nr_cpf_cnpj, nr_contrato, dt_contrato, qt_prestacoes, vl_total,
      cd_produto, ds_produto, cd_carteira, ds_carteira, nr_proposta,
      nr_presta, tp_presta, nr_seq_pre, dt_vct_pre, vl_presta,
      vl_mora, vl_multa, vl_out_acr, vl_iof, vl_descon, vl_atual,
      cpf_cnpj_valido, contrato_valido, prestacao_valida
    ) VALUES ${placeholders.join(", ")}`,
    values,
  );
};

export const insertErrors = async (processingId: string, errors: ErrorData[]): Promise<void> => {
  if (errors.length === 0) return;

  const values: unknown[] = [];
  const placeholders: string[] = [];
  let idx = 1;

  for (const e of errors) {
    placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    values.push(processingId, e.line, e.field, e.value, e.error);
  }

  await pool.query(
    `INSERT INTO processing_errors (processing_id, line, field, value, error)
     VALUES ${placeholders.join(", ")}`,
    values,
  );
};

export const insertSuccesses = async (processingId: string, successes: SuccessData[]): Promise<void> => {
  if (successes.length === 0) return;

  const values: unknown[] = [];
  const placeholders: string[] = [];
  let idx = 1;

  for (const s of successes) {
    placeholders.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
    values.push(processingId, s.line, s.field, s.value, s.message);
  }

  await pool.query(
    `INSERT INTO processing_successes (processing_id, line, field, value, message)
     VALUES ${placeholders.join(", ")}`,
    values,
  );
};

export const getProcessingStatus = async (id: string) => {
  const { rows } = await pool.query("SELECT * FROM processings WHERE id = $1", [id]);
  return rows[0] ?? null;
};

export const getProcessingRecords = async (id: string): Promise<RecordData[]> => {
  const { rows } = await pool.query("SELECT * FROM records WHERE processing_id = $1", [id]);
  return rows.map((r) => ({
    nrInst: r.nr_inst,
    nrAgencia: r.nr_agencia,
    cdClient: r.cd_client,
    nmClient: r.nm_client,
    nrCpfCnpj: r.nr_cpf_cnpj,
    nrContrato: r.nr_contrato,
    dtContrato: r.dt_contrato,
    qtPrestacoes: r.qt_prestacoes,
    vlTotal: Number(r.vl_total),
    cdProduto: r.cd_produto,
    dsProduto: r.ds_produto,
    cdCarteira: r.cd_carteira,
    dsCarteira: r.ds_carteira,
    nrProposta: r.nr_proposta,
    nrPresta: r.nr_presta,
    tpPresta: r.tp_presta,
    nrSeqPre: r.nr_seq_pre,
    dtVctPre: r.dt_vct_pre,
    vlPresta: Number(r.vl_presta),
    vlMora: Number(r.vl_mora),
    vlMulta: Number(r.vl_multa),
    vlOutAcr: Number(r.vl_out_acr),
    vlIof: Number(r.vl_iof),
    vlDescon: Number(r.vl_descon),
    vlAtual: Number(r.vl_atual),
    idSituac: r.id_situac,
    idSitVen: r.id_sit_ven,
    cpfCnpjValido: r.cpf_cnpj_valido,
    contratoValido: r.contrato_valido,
    prestacaoValida: r.prestacao_valida,
  }));
};

export const getProcessingErrors = async (id: string): Promise<ErrorData[]> => {
  const { rows } = await pool.query("SELECT * FROM processing_errors WHERE processing_id = $1", [id]);
  return rows.map((r) => ({
    line: r.line,
    field: r.field,
    value: r.value,
    error: r.error,
  }));
};

export const getProcessingSuccesses = async (id: string): Promise<SuccessData[]> => {
  const { rows } = await pool.query("SELECT * FROM processing_successes WHERE processing_id = $1", [id]);
  return rows.map((r) => ({
    line: r.line,
    field: r.field,
    value: r.value,
    message: r.message,
  }));
};
