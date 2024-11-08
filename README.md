### CSV Processor

> Uma aplicação para processamento e validação de arquivos CSV com validações específicas para documentos (CPF/CNPJ), contratos e prestações.

<br>

## Configurações

### Backend

1. Navegue até a pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie um arquivo `.env` na raiz do projeto backend baseado no `.env.example`:

```env
PORT=3000
NODE_ENV=development
UPLOAD_FOLDER=./uploads

DB_HOST=localhost
DB_PORT=5432
DB_NAME=seu_banco
DB_USER=seu_usuario
DB_PASS=sua_senha
```

4. Inicie o servidor em modo de desenvolvimento:

```bash
npm run dev
```

O backend estará rodando em `http://localhost:3000`

### Frontend

1. Em outro terminal, navegue até a pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará acessível em `http://localhost:5173`

## Uso

1. Acesse a aplicação pelo navegador em `http://localhost:5173`
2. Faça upload de um arquivo CSV
3. Aguarde o processamento
4. Visualize os resultados na tabela com as validações

## Estrutura do CSV

O arquivo CSV deve conter as seguintes colunas:

```
nrInst - Número da Instituição
nrAgencia - Número da Agência
cdClient - Código do Cliente
nmClient - Nome do Cliente
nrCpfCnpj - CPF/CNPJ
nrContrato - Número do Contrato
dtContrato - Data do Contrato
qtPrestacoes - Quantidade de Prestações
vlTotal - Valor Total
cdProduto - Código do Produto
dsProduto - Descrição do Produto
cdCarteira - Código da Carteira
dsCarteira - Descrição da Carteira
nrProposta - Número da Proposta
nrPresta - Número da Prestação
tpPresta - Tipo da Prestação
nrSeqPre - Número Sequencial da Prestação
dtVctPre - Data de Vencimento da Prestação
vlPresta - Valor da Prestação
vlMora - Valor da Mora
vlMulta - Valor da Multa
vlOutAcr - Outros Acréscimos
vlIof - Valor do IOF
vlDescon - Valor do Desconto
vlAtual - Valor Atual
idSituac - Situação
idSitVen - Situação de Vencimento
```

## Validações

- CPF/CNPJ: Verifica se o documento é válido
- Contrato: Valida número do contrato, data e valores
- Prestações: Valida valores e quantidades

Os resultados são exibidos através de indicadores visuais na interface:

- 🟢 Verde: Validação passou
- 🔴 Vermelho: Validação falhou
