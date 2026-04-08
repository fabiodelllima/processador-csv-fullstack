CREATE TABLE IF NOT EXISTS processings (
  id VARCHAR(50) PRIMARY KEY,
  status VARCHAR(20) NOT NULL DEFAULT 'processing',
  error TEXT,
  total_records INTEGER NOT NULL DEFAULT 0,
  valid_records INTEGER NOT NULL DEFAULT 0,
  invalid_records INTEGER NOT NULL DEFAULT 0,
  processing_time VARCHAR(20),
  total_value NUMERIC(15, 2) NOT NULL DEFAULT 0,
  start_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS records (
  id SERIAL PRIMARY KEY,
  processing_id VARCHAR(50) NOT NULL REFERENCES processings(id) ON DELETE CASCADE,
  nr_inst VARCHAR(50),
  nr_agencia VARCHAR(50),
  cd_client VARCHAR(50),
  nm_client VARCHAR(255),
  nr_cpf_cnpj VARCHAR(20),
  nr_contrato VARCHAR(50),
  dt_contrato VARCHAR(10),
  qt_prestacoes INTEGER,
  vl_total NUMERIC(15, 2),
  cd_produto VARCHAR(50),
  ds_produto VARCHAR(255),
  cd_carteira VARCHAR(50),
  ds_carteira VARCHAR(255),
  nr_proposta VARCHAR(50),
  nr_presta INTEGER,
  tp_presta VARCHAR(10),
  nr_seq_pre VARCHAR(50),
  dt_vct_pre VARCHAR(10),
  vl_presta NUMERIC(15, 2),
  vl_mora NUMERIC(15, 2),
  vl_multa NUMERIC(15, 2),
  vl_out_acr NUMERIC(15, 2),
  vl_iof NUMERIC(15, 2),
  vl_descon NUMERIC(15, 2),
  vl_atual NUMERIC(15, 2),
  id_situac VARCHAR(10),
  id_sit_ven VARCHAR(10),
  cpf_cnpj_valido BOOLEAN NOT NULL DEFAULT FALSE,
  contrato_valido BOOLEAN NOT NULL DEFAULT FALSE,
  prestacao_valida BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS processing_errors (
  id SERIAL PRIMARY KEY,
  processing_id VARCHAR(50) NOT NULL REFERENCES processings(id) ON DELETE CASCADE,
  line INTEGER NOT NULL,
  field VARCHAR(50) NOT NULL,
  value TEXT,
  error TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS processing_successes (
  id SERIAL PRIMARY KEY,
  processing_id VARCHAR(50) NOT NULL REFERENCES processings(id) ON DELETE CASCADE,
  line INTEGER NOT NULL,
  field VARCHAR(50) NOT NULL,
  value TEXT,
  message TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_records_processing_id ON records(processing_id);
CREATE INDEX IF NOT EXISTS idx_errors_processing_id ON processing_errors(processing_id);
CREATE INDEX IF NOT EXISTS idx_successes_processing_id ON processing_successes(processing_id);
