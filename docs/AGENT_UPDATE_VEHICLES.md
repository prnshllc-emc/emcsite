# Instrução de Atualização: Inclusão de Veículos via Array `vehicles[]`

O sistema agora suporta **múltiplos veículos por BL** através do array `vehicles[]` dentro do objeto `bl`. Cada veículo pode ter seu próprio cliente (CPF).

---

## Endpoint: `POST /api/agent/ingest`

### Autenticação

```
X-Agent-Api-Key: rVUiEEzPhVT3eTBlXO5D3Zc3W4l2ESxoEIfOSN_zfA8lvZ6EpYl8G3zNsGFfOHDx
```

### Base URL

```
https://enviandomeucarro.com/api/agent
```

---

## Formato do Payload com Veículos

```json
{
  "bl": {
    "blNumber": "MAEU265399692",
    "vehicles": [
      {
        "vin": "WP0AB2A95LS123456",
        "make": "Porsche",
        "model": "911 Carrera S",
        "year": 2024,
        "color": "Branco",
        "customerCpf": "11122233344",
        "customerName": "Pedro Almeida",
        "customerEmail": "pedro@email.com",
        "customerPhone": "+5511999998888",
        "position": 1,
        "notes": "DU-E 2026/001234"
      },
      {
        "vin": "WBS8M9C50J5K98765",
        "make": "BMW",
        "model": "M3 Competition",
        "year": 2023,
        "color": "Preto",
        "customerCpf": "55566677788",
        "customerName": "Maria Santos",
        "position": 2
      }
    ]
  },
  "trackingEvents": [],
  "generateTrackingCode": false
}
```

---

## Comportamento

- O sistema **auto-resolve** clientes por CPF (cria se não existir)
- O sistema **auto-resolve** veículos por VIN (cria se não existir)
- Cada veículo é vinculado ao BL na tabela `bl_vehicles` (relação N:N)
- Se o veículo já estiver vinculado, atualiza os dados (customer, position, notes)
- O campo `vehicles` é **cumulativo** — chamar novamente com novos veículos adiciona sem remover os existentes

---

## Campos do Array `vehicles[]`

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `vin` | Sim | VIN do veículo (até 17 caracteres) |
| `make` | Não | Marca (ex: "Ford", "BMW") |
| `model` | Não | Modelo (ex: "Mustang GT") |
| `year` | Não | Ano (1900-2100) |
| `color` | Não | Cor |
| `customerCpf` | Não | CPF do dono DESTE veículo (11 dígitos) |
| `customerName` | Não | Nome do dono |
| `customerEmail` | Não | Email do dono |
| `customerPhone` | Não | Telefone do dono |
| `position` | Não | Posição no container (1, 2, 3...) |
| `notes` | Não | Notas (ex: número DU-E) |

---

## Verificação Após Inclusão

```
GET /api/agent/bl/MAEU265399692
```

A resposta incluirá o array `vehicles` com todos os veículos vinculados:

```json
{
  "bl": { "id": 3, "blNumber": "MAEU265399692", "status": "in_transit", "..." },
  "events": [],
  "codes": [],
  "vehicles": [
    {
      "id": 1,
      "blId": 3,
      "vehicleId": 5,
      "customerId": 2,
      "position": 1,
      "notes": "DU-E 2026/001234",
      "createdAt": "2026-03-11T..."
    },
    {
      "id": 2,
      "blId": 3,
      "vehicleId": 6,
      "customerId": 3,
      "position": 2,
      "notes": null,
      "createdAt": "2026-03-11T..."
    }
  ]
}
```

---

## Exemplo Completo: BL com 4 Veículos

```json
{
  "bl": {
    "blNumber": "MAEU265399692",
    "containerNumber": "MSKU5815003",
    "vehicleDescription": "4 veículos — Porsche 911, BMW M3, Mercedes C63, Audi RS6",
    "originPort": "Port Newark, NJ, USA",
    "destinationPort": "Porto de Santos, SP, Brasil",
    "status": "in_transit",
    "vehicles": [
      {
        "vin": "WP0AB2A95LS123456",
        "make": "Porsche",
        "model": "911 Carrera S",
        "year": 2024,
        "color": "Branco",
        "customerCpf": "11122233344",
        "customerName": "Pedro Almeida",
        "position": 1
      },
      {
        "vin": "WBS8M9C50J5K98765",
        "make": "BMW",
        "model": "M3 Competition",
        "year": 2023,
        "color": "Preto",
        "customerCpf": "55566677788",
        "customerName": "Maria Santos",
        "position": 2
      },
      {
        "vin": "WDDWF8EB1LA654321",
        "make": "Mercedes-Benz",
        "model": "C63 AMG",
        "year": 2024,
        "color": "Cinza",
        "customerCpf": "99988877766",
        "customerName": "Carlos Mendes",
        "position": 3
      },
      {
        "vin": "WUAASAF47KA012345",
        "make": "Audi",
        "model": "RS6 Avant",
        "year": 2023,
        "color": "Verde",
        "customerCpf": "11122233344",
        "customerName": "Pedro Almeida",
        "notes": "Segundo veículo do mesmo cliente",
        "position": 4
      }
    ]
  },
  "trackingEvents": [
    {
      "blNumber": "MAEU265399692",
      "eventType": "info",
      "title": "Veículos vinculados ao BL",
      "description": "4 veículos adicionados ao BL via processamento de email. Porsche 911, BMW M3, Mercedes C63, Audi RS6.",
      "location": "Port Newark, NJ, USA",
      "eventDate": "2026-03-11T00:00:00Z"
    }
  ],
  "generateTrackingCode": false
}
```

> **Nota:** O mesmo cliente (Pedro Almeida, CPF 111.222.333-44) pode ter múltiplos veículos no mesmo BL. O sistema cria o cliente uma vez e vincula ambos os veículos a ele.

---

## Resumo dos Endpoints Relevantes

| Método | Endpoint | Uso |
|--------|----------|-----|
| `POST` | `/api/agent/ingest` | Ingestão completa com `vehicles[]` |
| `POST` | `/api/agent/bl` | Criar/atualizar BL com `vehicles[]` |
| `GET` | `/api/agent/bl/{blNumber}` | Consultar BL com veículos vinculados |
| `POST` | `/api/agent/generate-code` | Gerar código de rastreamento por CPF |
| `GET` | `/api/agent/health` | Verificar disponibilidade da API |
| `GET` | `/api/agent/stats` | Estatísticas do sistema |
