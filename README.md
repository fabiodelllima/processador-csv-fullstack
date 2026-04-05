# Processador CSV

Desafio técnico fullstack para processamento e validação de grandes volumes de dados financeiros em CSV (~30 GB). A aplicação lê registros de contratos via streaming, valida o CPF/CNPJ com algoritmo próprio (sem bibliotecas externas), verifica a consistência entre valor total e prestações, e formata valores monetários em BRL — exibindo os resultados em uma interface web com indicadores visuais por registro.

---

## Sumário

- [O Problema](#o-problema)
- [A Solução](#a-solução)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Estrutura do CSV](#estrutura-do-csv)
- [Stack](#stack)
- [Uso](#uso)

---

## O Problema

O desafio propunha a construção de uma aplicação capaz de processar aproximadamente **30 GB** de dados financeiros em formato CSV — registros de contratos com campos como CPF/CNPJ, valores totais, prestações, mora, multa, IOF e descontos. Cada registro deveria ser validado individualmente, e os resultados deveriam ser apresentados em uma interface web ao final do processamento.

Parte dos dados é intencionalmente inválida: CPFs e CNPJs gerados por um script com dígitos verificadores incorretos, valores de prestação inconsistentes com o total do contrato e campos financeiros em formato bruto que exigem conversão monetária. O objetivo era avaliar a construção de uma solução capaz de lidar com esse volume sem comprometer a memória, mantendo validações rigorosas e retorno visual claro para o usuário.

### Restrições do Desafio

- **Processamento em larga escala:** ~30 GB de dados sem estouro de memória — leitura obrigatoriamente via streaming, sem carregamento integral.
- **Validação de CPF/CNPJ sem bibliotecas externas:** algoritmo próprio que implementa o cálculo dos dígitos verificadores conforme regras da Receita Federal, tanto para o CPF (11 dígitos) quanto para o CNPJ (14 dígitos). O objetivo era avaliar o raciocínio algorítmico, não o uso de dependências.
- **Formatação monetária:** todos os campos financeiros (`vlTotal`, `vlPresta`, `vlMora`, `vlMulta`, `vlOutAcr`, `vlIof`, `vlDescon`, `vlAtual`) convertidos para Real Brasileiro (BRL) com `Intl.NumberFormat`.
- **Verificação de consistência contratual:** divisão de `vlTotal` por `qtPrestacoes` e comparação com `vlPresta` para cada registro, garantindo que os valores de prestação sejam matematicamente coerentes com o valor total do contrato.
- **Critérios de avaliação:** tratamento de dados em larga escala, comunicação assíncrona, gerenciamento de estado, escolha adequada de tecnologias e boas práticas de desenvolvimento.

---

## A Solução

### Backend

O servidor é construído em **Node.js com TypeScript** e processa os arquivos CSV via streaming com `fs` (File System) e `csv-parser`, convertendo cada linha em um objeto JavaScript sem carregar o arquivo inteiro em memória. Essa abordagem permite que a aplicação suporte arquivos de dezenas de gigabytes sem degradação de desempenho, processando registro por registro em um fluxo assíncrono.

A arquitetura separa responsabilidades em camadas bem definidas: os controllers recebem as requisições HTTP (upload, download, status), delegam ao serviço de processamento que orquestra as validações, e cada tipo de validação reside em seu próprio módulo com interface tipada:

```
backend/src/
├── controllers/                      # Upload, download, status de processamento
├── services/
│   ├── csv.service.ts                # Orquestração do fluxo de processamento
│   └── validations/
│       ├── document.validation.ts    # CPF/CNPJ (algoritmo próprio)
│       ├── contract.validation.ts    # Consistência contratual
│       ├── installment.validation.ts # Verificação de prestações
│       └── file.validation.ts        # Validação de formato do CSV
├── interfaces/                       # Tipagem TypeScript (records, results, errors)
├── errors/                           # Hierarquia de erros (AppError, ValidationError, etc.)
├── middlewares/                      # Error handler global, upload handler (multer)
├── config/                           # Database, variáveis de ambiente, upload
├── utils/                            # Formatação monetária (BRL)
└── routes/                           # Endpoints REST
```

A validação de documentos implementa, do zero, o algoritmo de dígitos verificadores da Receita Federal. Para o **CPF**, os multiplicadores [10,9,8…2] geram o primeiro dígito verificador e [11,10,9…2] geram o segundo, com resto de divisão por 11 determinando o dígito esperado. Para o **CNPJ**, a mesma lógica se aplica com multiplicadores [5,4,3,2,9,8,7,6,5,4,3,2] e [6,5,4,3,2,9,8,7,6,5,4,3,2]. Ambos os algoritmos tratam os casos limite definidos pela Receita — sequências repetidas (111.111.111-11), restos iguais a zero e restos iguais a um.

O sistema persiste os resultados de cada validação em **PostgreSQL**, permitindo que o frontend consulte o status e os resultados de processamentos anteriores sem reprocessar o arquivo.

### Frontend

A interface consiste em uma **SPA construída com React 18 e TypeScript**, com build gerenciado pelo **Vite** e estilização via **Tailwind CSS**. O usuário faz upload de um arquivo CSV e acompanha o processamento em tempo real. Ao final, os resultados aparecem em uma tabela com indicadores visuais de aprovação ou reprovação para cada validação — documento válido/inválido, prestação consistente/inconsistente, formatação aplicada.

O gerenciamento de estado do processamento está encapsulado no hook `useCsvProcessor`, que abstrai as chamadas à API e expõe estados de carregamento, progresso e resultados para os componentes de apresentação.

```
frontend/src/
├── components/         # Loader, StatusDots (indicadores visuais por validação)
├── hooks/              # useCsvProcessor (estado do processamento)
├── pages/              # Home (upload + tabela de resultados)
├── services/           # Comunicação com a API backend
└── interfaces/         # Tipagem compartilhada com o backend
```

---

## Estrutura do CSV

Os arquivos de entrada contêm registros de contratos financeiros com as seguintes colunas:

| Campo | Descrição |
|-------|-----------|
| `nrInst` | Número da Instituição |
| `nrAgencia` | Número da Agência |
| `cdClient` / `nmClient` | Código e nome do cliente |
| `nrCpfCnpj` | CPF ou CNPJ (alvo de validação) |
| `nrContrato` / `dtContrato` | Número e data do contrato |
| `qtPrestacoes` | Quantidade de prestações |
| `vlTotal` | Valor total do contrato |
| `vlPresta` | Valor da prestação (comparado com `vlTotal / qtPrestacoes`) |
| `vlMora`, `vlMulta`, `vlOutAcr`, `vlIof`, `vlDescon` | Componentes financeiros (mora, multa, outros acréscimos, IOF, desconto) |
| `vlAtual` | Valor atual |
| `idSituac` / `idSitVen` | Situação e situação de vencimento |

---

## Stack

| Camada | Tecnologias |
|--------|-------------|
| Backend | Node.js, TypeScript, Express, csv-parser, PostgreSQL |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS |
| Infra | Docker (opcional), dotenv |

---

## Uso

### Backend

```bash
cd backend
cp .env.example .env    # Configurar credenciais PostgreSQL
npm install
npm run dev             # http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

1. Acesse `http://localhost:5173`
2. Faça upload de um arquivo CSV
3. Aguarde o processamento
4. Visualize os resultados na tabela de validações
