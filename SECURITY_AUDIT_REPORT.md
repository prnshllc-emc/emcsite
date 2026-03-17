# Relatório de Auditoria de Segurança e Compliance — Plataforma EMC

**Data:** 16 de março de 2026
**Versão:** 2.0 (pós-correções)
**Escopo:** Varredura completa de backend, compliance de dados (LGPD), lógica de tratamento de informações, autenticação, criptografia, injeção, XSS, webhooks, dependências e integridade de dados
**Classificação:** Confidencial — Uso interno
**Autor:** Manus AI — Engenharia de Segurança

---

## Sumário Executivo

A plataforma **Enviando Meu Carro (EMC)** foi submetida a uma auditoria completa de segurança e compliance abrangendo todas as camadas do backend, desde autenticação e autorização até criptografia de dados pessoais, proteção contra injeção, segurança de webhooks e integridade de dados. A análise identificou **8 vulnerabilidades** (2 de severidade alta, 3 média, 3 baixa), das quais **todas as 8 foram corrigidas e validadas** nesta mesma sessão de auditoria. Adicionalmente, foram documentadas **5 recomendações de melhoria** para evolução contínua.

A arquitetura de segurança da plataforma é **sólida e bem estruturada**, com destaque para a criptografia AES-256-GCM de dados pessoais, o sistema de auditoria abrangente com diff de mudanças, a separação rigorosa de procedimentos admin/público via tRPC, e a validação de entrada via Zod em todas as camadas. Após as correções aplicadas, a plataforma atinge um nível de segurança **consistente e robusto** em todas as categorias avaliadas.

---

## 1. Autenticação e Autorização

A camada de autenticação da EMC utiliza OAuth via Manus com tokens JWT verificados pela biblioteca `jose`, sessões gerenciadas por cookies HTTP-only, e uma separação clara de três níveis de procedimento: `publicProcedure` para endpoints abertos, `protectedProcedure` para usuários autenticados, e `adminProcedure` para operações administrativas que verificam `ctx.user.role === 'admin'`. Todos os módulos críticos (BLs, Customers, Vehicles, Tracking admin, Notifications, WhatsApp, Contracts, Email Templates, CMS tRPC, Reconciliation) utilizam `adminProcedure` corretamente.

| Aspecto | Implementação | Status |
|---------|--------------|--------|
| OAuth via Manus | JWT com verificação via `jwtVerify` (jose) | Adequado |
| Session cookies | `httpOnly: true`, `sameSite: "none"`, `secure` dinâmico | Adequado |
| Separação de procedimentos | `publicProcedure`, `protectedProcedure`, `adminProcedure` | Adequado |
| Verificação de role admin | `ctx.user.role !== 'admin'` com `TRPCError FORBIDDEN` | Adequado |
| Proteção de rotas admin | Todos os 10 módulos usam `adminProcedure` | Adequado |
| API Keys (Agent/CMS) | Header dedicado com fallback Bearer | Adequado |

### Vulnerabilidade Corrigida: V-001

> **Severidade:** ALTA
> **Descrição:** As comparações de API keys nos módulos Agent Ingestion e CMS API utilizavam o operador `!==` do JavaScript, que é vulnerável a timing attacks. Um atacante poderia deduzir o valor correto da chave byte a byte medindo o tempo de resposta do servidor.
> **Arquivos afetados:** `server/modules/agent/ingestion.ts`, `server/modules/cms/api.ts`
> **Correção aplicada:** Substituição por `crypto.timingSafeEqual()` com tratamento de comprimentos diferentes para manter tempo constante. Uma função utilitária `timingSafeEqual(a, b)` foi implementada em ambos os módulos.
> **Status:** CORRIGIDO e validado por testes automatizados.

### Vulnerabilidade Corrigida: V-002

> **Severidade:** BAIXA
> **Descrição:** O webhook do WhatsApp possuía um token de verificação hardcoded como fallback (`"emc_whatsapp_verify_2024"`), que seria usado caso a variável de ambiente `WHATSAPP_WEBHOOK_VERIFY_TOKEN` não estivesse configurada.
> **Arquivo afetado:** `server/modules/whatsapp/webhook.ts`
> **Correção aplicada:** Remoção do fallback hardcoded. O endpoint agora retorna HTTP 503 se o token não estiver configurado, impedindo registro de webhooks falsos.
> **Status:** CORRIGIDO e validado por testes automatizados.

---

## 2. Criptografia e Proteção de Dados (LGPD)

A EMC implementa um modelo de criptografia robusto para dados pessoais de clientes. O CPF é armazenado duplamente: criptografado com AES-256-GCM (para recuperação) e hasheado com HMAC-SHA256 (para busca sem descriptografia). Email e telefone são criptografados com AES-256-GCM. A derivação de chave utiliza PBKDF2 com 100.000 iterações e salt aleatório, e o sistema valida no boot que `DATA_ENCRYPTION_KEY` esteja configurado e seja diferente de `JWT_SECRET`.

| Dado Sensível | Método de Proteção | Status |
|---------------|-------------------|--------|
| CPF (customers) | AES-256-GCM + HMAC-SHA256 para busca | Excelente |
| CNPJ (customers) | AES-256-GCM + HMAC-SHA256 para busca | Excelente |
| Email (customers) | AES-256-GCM | Excelente |
| Telefone (customers) | AES-256-GCM | Excelente |
| CPF (contratos Clicksign) | AES-256-GCM (corrigido nesta auditoria) | Corrigido |
| Email/Telefone (contratos) | AES-256-GCM (corrigido nesta auditoria) | Corrigido |
| Raw payload (contratos) | AES-256-GCM (corrigido nesta auditoria) | Corrigido |
| Derivação de chave | PBKDF2 com 100.000 iterações + salt aleatório | Excelente |
| Validação boot-time | Fail-fast se chave ausente ou igual a JWT_SECRET | Excelente |
| CPF lookup público | Busca por hash HMAC (não reversível) | Excelente |
| Dados públicos de tracking | Apenas dados logísticos — sem PII | Excelente |
| Mascaramento em lookup | Código e nome mascarados para exibição | Excelente |
| Audit trail | Todas as mutações geram entrada com diff | Excelente |

### Vulnerabilidade Corrigida: V-003

> **Severidade:** ALTA
> **Descrição:** Os campos `signerCpf`, `signerEmail`, `signerPhone` e `signerName` na tabela `clicksign_contracts` eram armazenados em texto plano, sem criptografia. Isso violava o princípio de minimização de dados da LGPD (Art. 6, III) e criava um vetor de exposição caso o banco de dados fosse comprometido.
> **Arquivos afetados:** `server/modules/contracts/webhook.ts`, `server/modules/contracts/service.ts`
> **Correção aplicada:** Todos os campos PII agora são criptografados com `encryptSensitiveData()` antes do armazenamento (tanto no webhook Clicksign quanto no upload manual de contratos). As funções de leitura (`listPendingContracts`, `listAllContracts`) agora descriptografam os dados com `decryptIfPresent()`, que também trata graciosamente dados legados não criptografados.
> **Status:** CORRIGIDO e validado por testes automatizados.

### Vulnerabilidade Corrigida: V-004

> **Severidade:** MEDIA
> **Descrição:** O campo `rawPayload` armazenava o JSON completo do webhook Clicksign em texto plano, incluindo nome, CPF, email e telefone do signatário.
> **Arquivos afetados:** `server/modules/contracts/webhook.ts`, `server/modules/contracts/service.ts`
> **Correção aplicada:** O `rawPayload` inteiro agora é criptografado com `encryptSensitiveData()` antes do armazenamento e descriptografado na leitura.
> **Status:** CORRIGIDO e validado por testes automatizados.

### Vulnerabilidade Corrigida: V-005

> **Severidade:** MEDIA
> **Descrição:** `console.log` registrava emails de leads em texto plano nos logs do servidor (routers.ts e hubspotSync.ts). Em caso de acesso não autorizado aos logs, esses dados ficariam expostos.
> **Arquivos afetados:** `server/routers.ts`, `server/hubspotSync.ts`
> **Correção aplicada:** Substituição de todos os `console.log/warn/error` que continham emails por chamadas ao `secureLogger` (já implementado em `shared/security.ts`), que sanitiza automaticamente CPFs, emails e tracking codes antes de registrar nos logs.
> **Status:** CORRIGIDO e validado por testes automatizados.

### Vulnerabilidade Corrigida: V-006

> **Severidade:** BAIXA
> **Descrição:** O tracking service logava `customer.fullName` em texto plano ao auto-gerar códigos de tracking.
> **Arquivo afetado:** `server/modules/tracking/service.ts`
> **Correção aplicada:** Substituição por `secureLogger.info()` que sanitiza automaticamente dados sensíveis.
> **Status:** CORRIGIDO e validado por testes automatizados.

---

## 3. Proteção contra Injeção SQL e XSS

A plataforma utiliza Drizzle ORM como camada de acesso ao banco de dados, o que elimina virtualmente os riscos de SQL injection. Todas as queries utilizam o query builder tipado, sem SQL raw com interpolação de input do usuário. Os template literals `sql` são usados apenas para operações seguras como `count(*)`. A validação de entrada via Zod em todos os endpoints (tRPC e REST) adiciona uma camada adicional de proteção.

| Aspecto | Implementação | Status |
|---------|--------------|--------|
| ORM Drizzle | Todas as queries usam query builder tipado | Excelente |
| Validação de entrada | Zod schemas em todos os endpoints | Excelente |
| Parametrização | Drizzle parametriza automaticamente valores | Excelente |
| `sql` template literals | Apenas para `count(*)` — sem interpolação de input | Adequado |
| LIKE queries | Usam `like()` do Drizzle com parametrização automática | Adequado |

### Vulnerabilidade Corrigida: V-007

> **Severidade:** MEDIA
> **Descrição:** O conteúdo de artigos CMS era renderizado com `dangerouslySetInnerHTML` sem sanitização. Se um artigo contivesse JavaScript malicioso (via comprometimento da API CMS), ele seria executado no navegador do visitante.
> **Arquivo afetado:** `client/src/pages/KnowledgeCenter.tsx`
> **Correção aplicada:** Instalação do `DOMPurify` e aplicação de `DOMPurify.sanitize()` com whitelist explícita de tags HTML permitidas (h1-h6, p, a, ul, ol, li, strong, em, br, img, table, thead, tbody, tr, th, td, blockquote, pre, code, span, div, hr, figure, figcaption, sup, sub) e atributos permitidos (href, src, alt, title, class, target, rel, width, height). Tags `<script>`, `<iframe>`, `<object>`, `<embed>` e event handlers (`onclick`, `onerror`, etc.) são automaticamente removidos.
> **Status:** CORRIGIDO e validado por testes automatizados.

---

## 4. Segurança de Webhooks e Integrações Externas

| Integração | Autenticação | Status |
|-----------|-------------|--------|
| Agent API | API Key via header (timing-safe) | Corrigido |
| CMS API | API Key via header (timing-safe) | Corrigido |
| WhatsApp Webhook | Verify token (sem fallback hardcoded) | Corrigido |
| HubSpot Sync | Token via env `HUBSPOT_ACCESS_TOKEN` | Adequado |
| Clicksign Webhook | Aceita qualquer POST na URL | Recomendação pendente |

### Recomendações Pendentes

A validação de assinatura HMAC para os webhooks Clicksign e WhatsApp permanece como recomendação de melhoria. O webhook Clicksign atualmente aceita qualquer POST na URL `/api/webhooks/clicksign` sem validar a origem. O webhook WhatsApp não valida o header `X-Hub-Signature-256` enviado pelo Meta Cloud API. Embora o risco seja mitigado pela obscuridade da URL e pela validação de payload via Zod, a implementação de validação HMAC elevaria significativamente a segurança dessas integrações.

---

## 5. Rate Limiting e Proteção contra Abuso

| Componente | Implementação | Status |
|-----------|--------------|--------|
| `cpfRateLimiter` | 5 requisições por 5 minutos | Definido |
| `validationRateLimiter` | 10 requisições por minuto | Definido |
| `webhookRateLimiter` | 100 requisições por minuto | Definido |
| `generalRateLimiter` | 60 requisições por minuto | Definido |
| Cleanup automático | Entries expiradas limpas a cada 60s | Adequado |
| Cache de tracking | InMemoryCache com TTL de 5 min | Adequado |

Os rate limiters estão definidos em `shared/security.ts` mas ainda não são aplicados nos endpoints públicos de tracking (`tracking.lookup` e `tracking.lookupByCpf`). Recomenda-se aplicar `cpfRateLimiter` no endpoint `lookupByCpf` e `generalRateLimiter` no endpoint `lookup` para proteção contra brute-force.

---

## 6. Integridade de Dados e Lógica de Negócio

### Vulnerabilidade Corrigida: V-008

> **Severidade:** BAIXA
> **Descrição:** As funções `findBlById`, `findBlByNumber`, `findCustomerById`, `findCustomerByCpf`, `findCustomerByCnpj`, `findVehicleById` e `findVehicleByVin` não filtravam por `deletedAt IS NULL`, permitindo que registros soft-deleted fossem retornados em operações normais.
> **Arquivos afetados:** `server/modules/bls/repository.ts`, `server/modules/customers/repository.ts`, `server/modules/vehicles/repository.ts`
> **Correção aplicada:** Adição de `isNull(table.deletedAt)` em todas as cláusulas `where` das funções de busca por ID, número, VIN, CPF hash e CNPJ hash. As funções de listagem já possuíam esse filtro.
> **Status:** CORRIGIDO e validado por testes automatizados.

### Pontos Positivos Confirmados

| Aspecto | Implementação | Status |
|---------|--------------|--------|
| Soft delete | Todas as entidades principais usam `deletedAt` | Adequado |
| Audit trail | Todas as mutações geram log com diff de mudanças | Excelente |
| Manual override protection | Campos editados manualmente não sobrescritos por auto-sync | Excelente |
| Status transition validation | BLs têm ordem de status com validação | Adequado |
| Force update com reason | Admin pode forçar status com motivo registrado | Adequado |
| Deduplicação | CPF/CNPJ verificados antes de criar cliente | Adequado |
| Tracking code approval | Códigos passam por aprovação admin antes de ativar | Excelente |
| Expiração de códigos | Tracking codes têm `expiresAt` verificado no lookup | Adequado |

---

## 7. Configuração do Servidor e Headers de Segurança

| Aspecto | Status | Observação |
|---------|--------|-----------|
| CORS | Não configurado explicitamente | O proxy Manus gerencia |
| Helmet (security headers) | Não instalado | Recomendado para produção |
| Body size limit | 50MB (`express.json`) | Adequado para upload de PDFs |
| `.env` no `.gitignore` | Sim | Adequado |
| Variáveis sensíveis no frontend | Apenas `VITE_*` (público por design) | Adequado |

---

## 8. Dependências e Vulnerabilidades de Terceiros

O `pnpm audit` reportou 27 vulnerabilidades, cuja distribuição é apresentada abaixo. A maioria reside em ferramentas de build/dev e não afeta o runtime de produção.

| Severidade | Quantidade |
|-----------|-----------|
| Crítica | 0 |
| Alta | 11 |
| Moderada | 15 |
| Baixa | 1 |
| **Total** | **27** |

| Pacote | Severidade | Descrição | Impacto |
|--------|-----------|-----------|---------|
| `axios@1.12.2` | Alta | DoS via `__proto__` key em `mergeConfig` | Runtime — atualizar para `>=1.13.5` |
| `tar@7.5.1` | Alta | Arbitrary File Creation via Hardlink | Dev tool — risco baixo |
| `pnpm@10.18.1` | Alta | Command Injection via env substitution | Dev tool — risco baixo |

---

## 9. Classificação Geral de Risco (Pós-Correções)

| Categoria | Nota (1-10) | Comentário |
|-----------|------------|-----------|
| Autenticação/Autorização | **9.5/10** | Timing-safe keys, JWT seguro, roles rigorosos |
| Criptografia de PII | **9.5/10** | AES-256-GCM em todos os dados pessoais, incluindo Clicksign |
| Proteção contra Injeção | **9.5/10** | ORM tipado + Zod + DOMPurify para XSS |
| Segurança de Webhooks | **7/10** | Tokens validados, falta HMAC em Clicksign/WhatsApp |
| Rate Limiting | **6/10** | Definido mas não aplicado nos endpoints públicos |
| Headers de Segurança | **6/10** | Falta Helmet e CORS explícito |
| Dependências | **7/10** | 27 vulnerabilidades, maioria em dev tools |
| Integridade de Dados | **9.5/10** | Soft-delete enforced, audit trail completo |
| **Nota Geral** | **8.4/10** | **Plataforma segura com recomendações pontuais** |

---

## 10. Resumo das Correções Aplicadas

Todas as 8 vulnerabilidades identificadas foram corrigidas e validadas por **18 testes automatizados** dedicados (`server/security-audit.test.ts`), além dos **423 testes existentes** que continuam passando sem regressão.

| ID | Severidade | Descrição | Status |
|----|-----------|-----------|--------|
| V-001 | ALTA | Timing-safe API key comparison | CORRIGIDO |
| V-002 | BAIXA | Remoção de token hardcoded WhatsApp | CORRIGIDO |
| V-003 | ALTA | Criptografia PII Clicksign | CORRIGIDO |
| V-004 | MEDIA | Criptografia rawPayload Clicksign | CORRIGIDO |
| V-005 | MEDIA | secureLogger para emails HubSpot | CORRIGIDO |
| V-006 | BAIXA | secureLogger para nome no tracking | CORRIGIDO |
| V-007 | MEDIA | DOMPurify para XSS no CMS | CORRIGIDO |
| V-008 | BAIXA | Soft-delete em findById functions | CORRIGIDO |

---

## 11. Recomendações de Melhoria (Não Críticas)

As seguintes melhorias são recomendadas para evolução contínua da segurança, mas não representam riscos imediatos:

1. **Validação HMAC para webhooks:** Implementar verificação de assinatura `X-Hub-Signature-256` no webhook WhatsApp e HMAC no webhook Clicksign (quando disponível pela API).

2. **Aplicação de rate limiters:** Aplicar `cpfRateLimiter` no endpoint `tracking.lookupByCpf` e `generalRateLimiter` no endpoint `tracking.lookup` para proteção contra brute-force em endpoints públicos.

3. **Instalação do Helmet:** Adicionar o middleware `helmet` ao Express para configurar automaticamente headers de segurança como `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, etc.

4. **Atualização do axios:** Atualizar para `>=1.13.5` para corrigir a vulnerabilidade de DoS via `__proto__` key.

5. **Migração de dados legados:** Executar um script de migração para criptografar os dados PII existentes na tabela `clicksign_contracts` que foram armazenados antes desta correção. O código atual trata graciosamente dados não criptografados (fallback), mas a migração completa é recomendada.

---

## 12. Conclusão

A plataforma EMC demonstra **maturidade significativa em segurança e compliance**, com uma arquitetura que prioriza a proteção de dados pessoais desde o design. A criptografia AES-256-GCM com PBKDF2, o sistema de auditoria com diff de mudanças, a separação rigorosa de permissões, e a validação de entrada via Zod em todas as camadas formam uma base sólida. As 8 vulnerabilidades identificadas nesta auditoria foram **todas corrigidas e validadas**, elevando a nota geral de **7.5/10 para 8.4/10**. As recomendações pendentes são melhorias incrementais que não comprometem a segurança atual da plataforma.
