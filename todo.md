# Project TODO

## Completed (Pre-existing)
- [x] Complete website structure with all sections
- [x] Header with navigation and tracking modal
- [x] Hero with calculator link
- [x] Stats section (+1,500 vehicles)
- [x] Benefits Grid
- [x] CTA sections (calculator + WhatsApp)
- [x] Testimonials section (video removed, 3-column grid)
- [x] Services section (6 cards with images)
- [x] WhyUs section
- [x] FAQ section (12 questions)
- [x] Footer with newsletter and Membro Afiliado logos
- [x] Floating WhatsApp button
- [x] Updated EMC logo (LOGOparaloja.png) - increased 81%
- [x] Content rewritten for global scope
- [x] Full SEO optimization (6 schema types, sitemap, robots.txt)
- [x] Google Analytics GA4 tracking (G-K5GHBLZBTQ)
- [x] Google Tags (GT-5RMBD99G, GT-WPDP3HDS)
- [x] Google Ads tracking (AW-17154661982)
- [x] Meta Pixel tracking (1460384848838281)
- [x] CTA tracking, scroll tracking, section visibility
- [x] Dark theme with Chakra Petch + Inter fonts

## Full-Stack Upgrade
- [x] Upgrade to full-stack (tRPC + DB + Auth)
- [x] Database schema: site_settings table
- [x] Database schema: newsletter_subscribers table
- [x] Database query helpers (db.ts)
- [x] Resolve merge conflicts (App.tsx, Home.tsx)
- [x] tRPC routes for admin settings CRUD
- [x] tRPC routes for newsletter management
- [x] tRPC public route for newsletter subscription
- [x] Admin dashboard page with auth guard
- [x] Admin: Settings management UI (addresses, phones, WhatsApp, emails)
- [x] Admin: Newsletter subscribers list with export
- [x] Seed default site settings
- [x] Connect Footer newsletter form to backend
- [x] Write vitest tests for admin routes (13 tests passing)
- [x] Final verification and checkpoint

## UI Changes
- [x] Disable "Rastrear Meu Carro" button and show "Em Breve" badge
- [x] Set site favicon to EMC logo
- [x] Investigate: site not loading without www (enviandomeucarro.com vs www.enviandomeucarro.com) — DNS issue, root domain not configured in Cloudflare
- [x] Fix: root domain issue resolved by user in Cloudflare
- [x] Audit: HTML head meta tags, pixels, analytics tags, structured data
- [x] Audit: data capture forms, newsletter, WhatsApp, CTAs, event tracking
- [x] Audit: frontend components tracking integration and compliance
- [x] Audit: compile comprehensive report with findings and recommendations
- [x] SEO: robust optimization — theme-color, LocalBusiness schemas, skip-to-content, preload hero, preconnect Facebook
- [x] SEO: sitemap.xml updated, robots.txt improved with /404 disallow
- [x] SEO: alt tags, heading hierarchy, semantic HTML already strong from previous work
- [x] SEO: performance (preload, preconnect) and accessibility (skip-to-content, aria labels) improvements
- [x] Fix: header menu items not harmonious — improved spacing, whitespace-nowrap, responsive font sizes

## Phase 3: Public Settings + Privacy Policy + Search Console
- [x] Create public settings tRPC endpoint (read-only, cached) — already existed
- [x] Create SiteSettingsContext to provide settings to all components
- [x] Connect Footer to read phone, email, addresses, social links from DB
- [x] Connect Header logo link to DB settings
- [x] Connect WhatsApp button to read phone number from DB
- [x] Connect HeroSection WhatsApp CTA to DB settings
- [x] Connect OfficesSection to read addresses from DB
- [x] Create Privacy Policy page (LGPD compliant)
- [x] Register /politica-de-privacidade route in App.tsx
- [x] Update Footer links to point to Privacy Policy page
- [x] Add Google Search Console verification meta tag (commented placeholder, needs user's code)
- [x] Write/update vitest tests for new endpoints (13 tests passing)

## Phase 4: Visual Audit Improvements (72 points)
- [x] Analyze sister sites (calculadora + importação) for design coherence
- [x] Fix Header: logo proportion, nav spacing, rastrear button
- [x] Fix contrast: all gray subtitles improved (muted-foreground + gray-400)
- [x] Fix title breaks: balanced text-wrap on all section titles
- [x] Fix Footer: bottom bar visibility, text size, newsletter input, social icons
- [x] Fix badges: unified section-badge style across all sections
- [x] Fix CTA buttons: unified cta-primary style across all CTAs
- [x] Fix Stats section: clean red accent borders, consistent cards
- [x] Fix Hero: badge size, CTA consistency, improved layout
- [x] Fix Services cards: consistent badge, title wrapping, CTA buttons
- [x] Fix Testimonials: red top border (not gold), consistent card styling
- [x] Fix Offices cards: equalized heights, consistent badge
- [x] Fix Why Us: checklist text size, mini-stats, consistent CTA
- [x] Fix spacing: normalized section transitions (py-16/py-20)

## Phase 5: Footer Gap + Header Logo
- [x] Fix: large white gap between last section and footer (removed pt-16, fixed TestimonialsSection footer tags)
- [x] Fix: header logo increased to h-16 lg:h-20

## Phase 6: Brand Color Palette Update
- [x] Update CSS variables to EMC brand: #000000, #28292b, #d93711, #f7f5f4
- [x] Update all hardcoded red values to #d93711 (only 1 found: ImportCalculator)
- [x] Update all hardcoded gray/dark values to #28292b (all use CSS vars already)
- [x] Verify visual consistency across all sections

## Phase 7: Terms of Use Page
- [x] Create Termos de Uso page at /termos-de-uso with comprehensive legal content
- [x] Register route in App.tsx with lazy loading
- [x] Update Footer "Termos de Uso" link to point to /termos-de-uso
- [x] Update sitemap.xml with new page
- [x] Add cross-references between Privacy Policy and Terms of Use
- [x] Run tests to verify no regressions

## Phase 8: Premium Calculator CTA Button
- [x] Audit all instances of "Simule Seus Custos" / calculator CTA across the site
- [x] Design premium standout treatment (glow, animation, gradient, pulse, etc.)
- [x] Apply enhanced styling to Hero section calculator button
- [x] Apply enhanced styling to CTA section calculator button
- [x] Apply enhanced styling to any other calculator references
- [x] Visual verification across all sections
- [x] Run tests to verify no regressions

## Phase 9: WhatsApp Button Green + Calculator Button Red
- [x] Add WhatsApp green color variable to CSS theme
- [x] Update Hero section "Fale com um Especialista" button to green
- [x] Update CTA section WhatsApp buttons to green
- [x] Update WhyUsSection "Falar com um Consultor" button to green
- [x] Update FAQSection WhatsApp button to green (already was green)
- [x] Update any other WhatsApp-related buttons to green (ServicesSection Assessoria + Testimonials CTA)
- [x] Keep calculator buttons in red EMC (verified)
- [x] Visual verification across all sections
- [x] Run tests to verify no regressions

## Phase 10: Center CTA Buttons on Mobile
- [x] Center Hero CTA buttons on mobile (flex-col + items-center)
- [x] Center WhyUs CTA button on mobile
- [x] Verify on mobile viewport

## Phase 11: Reduce Nossos Serviços Card in Hero
- [x] Reduce card size (smaller text, tighter padding, compact service items)
- [x] Verify desktop harmony

## Phase 12: Reduce Nossos Serviços Card Horizontal Width
- [x] Reduce horizontal width of the card while keeping vertical proportion

## Phase 13: Replace "Barato" with Simples/Prático/Inteligente
- [x] Hero: "Barato" → "Simples"
- [x] Footer: "Barato" → "Inteligente"

## Phase 14: LGPD Cookie Consent Banner
- [x] Create cookie consent management utility (localStorage-based)
- [x] Create CookieConsent banner component with granular options
- [x] Integrate consent checks with existing analytics tracking
- [x] Add banner to App.tsx
- [x] Visual verification and testing

## Phase 15: Daily Lead Export to HubSpot
- [x] Analyze lead data structure in DB (newsletter_subscribers table)
- [x] Check HubSpot MCP tools available for contact creation
- [x] Ensure UTM/referrer tracking data is captured with leads
- [x] Build export script that syncs leads to HubSpot with "Canal de Aquisição" = "Site" and "Origem" from tracking
- [x] Schedule daily task at 00:01 BRT
- [x] Test end-to-end flow

## Phase 16: Real-time HubSpot Sync + Incremental Retry
- [x] Create server-side HubSpot sync service (REST API v3 with Private App Token)
- [x] Integrate real-time sync into newsletter subscribe tRPC mutation (fire-and-forget)
- [x] Update scheduled task from 00:01 to 23:50 BRT as incremental retry for failed syncs
- [x] Test real-time sync and retry logic (14 tests passing, token validated)

## Phase 17: Update WhatsApp Number
- [x] Update all WhatsApp links to +55 11 992448920 (already configured correctly)

## Phase 18: Cargo Tracking Backend - Database & Foundation
- [x] Install additional dependencies (p-limit, nanoid, express-rate-limit)
- [x] Configure environment variables (DATA_ENCRYPTION_KEY)
- [x] Create full database schema (12 tables) in drizzle/schema.ts
- [x] Create relations in drizzle/relations.ts
- [x] Run pnpm db:push to sync schema
- [x] Create shared/schemas.ts (ClientDataSchema, VehicleDataSchema, etc.)

## Phase 19: Shared Infrastructure
- [x] Create server/shared/pagination.ts (PaginatedQuerySchema + helpers)
- [x] Create server/shared/security.ts (AES-256-GCM, HMAC, rate limiting)
- [x] Create server/shared/retry.ts (withRetry with exponential backoff)
- [x] Create server/shared/cache.ts (InMemoryCache with TTL)
- [x] Create server/shared/audit.ts + audit.repository.ts
- [x] Create server/shared/config.repository.ts (system_config CRUD + cache)
- [x] Create server/shared/events.ts (EventEmitter for SSE)

## Phase 20: Core Domain Modules
- [x] Customers module (repository + service + router)
- [x] Vehicles module (repository + service + router)
- [x] Bills of Lading module (repository + service + router)

## Phase 21: Tracking & Reconciliation
- [x] Tracking codes repository + tracking history repository
- [x] Tracking service (lifecycle management)
- [x] Tracking router (admin + public endpoints)
- [ ] Reconciliation service + router (deferred)

## Phase 22: Admin Panel Frontend
- [x] Admin layout with sidebar navigation (existing tabs extended)
- [ ] Dashboard page (overview stats) — deferred
- [ ] Customers CRUD page — deferred
- [x] BLs management tab in Admin panel
- [ ] Vehicles page — deferred
- [x] Tracking Codes management tab in Admin panel

## Phase 23: Public Tracking Page
- [x] Tracking input page (code entry + CPF verification)
- [x] Tracking result page (status + timeline + progress)
- [x] Connect Rastrear button in header to tracking page (/rastrear)
- [x] Remove "Em Breve" badge from Rastrear button

## Phase 24: Tests & Verification
- [x] Security module tests (encryption, hashing, CPF validation, VIN validation)
- [x] Cache and rate limiter tests
- [x] Tracking schema validation tests (71 tests passing)
- [x] Code generation uniqueness and format tests
- [x] Masking and sanitization tests
- [x] End-to-end compilation verification

## Phase 25: AI Agent API for BL Ingestion
- [x] Create API key authentication middleware for agent access (x-agent-api-key / Bearer)
- [x] Create REST endpoints: POST /api/agent/bl, PUT /api/agent/bl, POST /api/agent/tracking-event
- [x] Create POST /api/agent/generate-code endpoint
- [x] Create POST /api/agent/ingest bulk operations endpoint
- [x] Create GET /api/agent/health and GET /api/agent/stats endpoints
- [x] Create GET /api/agent/bl/:blNumber detail endpoint
- [x] Auto-resolve customers by CPF (create if not exists)
- [x] Auto-resolve vehicles by VIN (create if not exists)
- [x] Write comprehensive AI agent prompt document (docs/AGENT_PROMPT.md)
- [x] Test agent API schemas and logic (63 tests passing)

## Phase 26: Admin Dashboard with Overview Statistics
- [x] Create dashboard.stats tRPC endpoint (BLs by status, active codes, customers, vehicles, recent events)
- [x] Build DashboardPanel component with KPI cards (Total BLs, Em Trânsito, Códigos Ativos, Clientes, Veículos)
- [x] Add BLs por Status breakdown with progress bars
- [x] Add recent activity feed with event timeline
- [x] Dashboard is now the default tab in admin panel
- [x] Auto-refresh every 60 seconds

## Phase 27: Automatic Notifications on Tracking Events
- [x] Create centralized notification module (server/modules/tracking/notifications.ts)
- [x] Event importance classification (critical/high/normal/low)
- [x] Owner notifications via Manus built-in notification service
- [x] WhatsApp message templates for tracking events and new codes
- [x] Integrated notification dispatch into tracking service (fire-and-forget)
- [x] Notifications on: tracking events, new tracking codes, agent ingestion
- [x] Portuguese-localized status labels and emoji per event type
- [ ] WhatsApp Business API integration (ready for future — templates prepared)
- [ ] Customer notification preferences (deferred)

## Phase 28: BL-Vehicle N:N Restructure + Manual Status Change
- [x] Create bl_vehicles junction table in drizzle schema (N:N relationship)
- [x] Push migration with pnpm db:push
- [x] Update BL repository to support bl_vehicles CRUD (addVehicleToBl, getVehiclesForBl, removeVehicleFromBl, getBlsForVehicle, getBlVehiclesForCustomer)
- [x] Update BL service to handle multi-vehicle BLs with audit logging
- [x] Update Agent API `/ingest` and `/bl` POST to populate bl_vehicles via `vehicles[]` array
- [x] Update Agent API `/bl/:blNumber` GET to include linked vehicles
- [x] Auto-resolve customers by CPF and vehicles by VIN in agent ingestion
- [x] Implement `forceUpdateStatus` in BL service (skip transition validation)
- [x] Add manual BL status change buttons in admin BlsPanel (forward=green, backward=yellow)
- [x] Allow status advance and retrocede to any status (admin override)
- [x] Update agent prompt document (AGENT_PROMPT.md) with `vehicles[]` directive and multi-vehicle examples
- [x] Write 29 vitest tests for BLs module (status transitions, force update, junction, agent vehicles)
- [x] All 181 tests passing across 7 test files
- [ ] Update public tracking page to show per-vehicle info from bl_vehicles (deferred)
- [ ] Migrate existing data: parse vehicle_description and populate bl_vehicles (deferred)

## Bug Fix: forceUpdateStatus not working
- [x] Fix: admin status buttons calling updateStatus instead of forceUpdateStatus — removed status from generic update mutation, status changes now exclusively via forceUpdateStatus/updateStatus

## Phase 29: Clicksign Integration + Customer Status Flags
- [x] Research Clicksign API (endpoints, auth, contract data structure) — done, v1 API with access_token
- [x] Update DB schema: customer status enum (aguardando_embarque, aguardando_li, em_processo, concluido, cancelado) — done in Phase 30
- [x] Update DB schema: tipo_operacao field (importacao/exportacao) on customers — done in Phase 30
- [ ] Update DB schema: clicksign fields on clicksign_contracts table (deferred — using envelope_id on customers)
- [x] Build Clicksign API service (fetch contracts, parse VIN/CPF/Name/Email from contract text) — done via scripts
- [ ] Build reconciliation logic: cross-reference Clicksign customers with BL vehicles (VIN-a-VIN)
- [x] Auto-set status to em_processo when VIN matches existing BL — done for Fabricio
- [x] Admin UI: Customer management tab with status flags and manual override — done in Phase 30
- [x] Auto-generate tracking codes when customer+BL are linked (with admin approval layer)
- [ ] Write tests for Clicksign integration and reconciliation

## Phase 30: Customer Management with Manual Override Protection
- [x] Add `manual_overrides` JSON field to customers table (tracks which fields were manually edited)
- [x] Add `data_source` field to customers (manual/clicksign/agent)
- [x] Add `status` enum (aguardando_embarque, aguardando_li, em_processo, concluido, cancelado) to customers
- [x] Add `tipo_operacao` enum (importacao/exportacao) to customers
- [x] Schema migration applied and synced
- [x] Build CustomersPanel admin component with full CRUD
- [x] Customer status flags: aguardando_embarque, aguardando_li, em_processo, concluido, cancelado
- [x] Tipo operação: importacao/exportacao
- [x] Implement merge logic: manual fields protected from auto-sync overwrite
- [x] Build Clicksign sync as complementary data source (not primary)
- [ ] Wire customer-vehicle-BL linking in admin UI (deferred to next phase)
- [ ] Support CNPJ-based imports (EMC as importer, customer as beneficiary) (deferred)
- [x] Write tests for merge logic and customer CRUD (25 tests, 208 total passing)
- [x] 7 active clients identified with full names and emails from Clicksign API
- [x] Extract Paulo Jr data from Clicksign (CPF: 039.401.701-35, Email: paulo.mns@hotmail.com)
- [x] Process André Simas contract PDF (VINs: 210716, 1FTEX15H6MKA92716, CPF: 289.916.178-40)
- [x] Extract Huber Mastelari from Clicksign (Email: hubermastelari@gmail.com)
- [x] Add VinOrIdSchema for legacy/military VINs (e.g. Humvee 210716)

## Follow-up #1: Seed 7 Active Customers into Database
- [x] Seed André Simas (CPF: 289.916.178-40, manual) — verified in DB
- [x] Seed Paulo Jr (CPF: 039.401.701-35, clicksign) — verified in DB
- [x] Seed Huber Mastelari (email: hubermastelari@gmail.com, clicksign) — verified in DB
- [x] Seed Sandoval Gonçalves Pereira (email: samboston14@gmail.com, clicksign) — verified in DB
- [x] Seed André Francisco Junqueira Merino Teles (email: Afteles@hotmail.com, clicksign) — verified in DB
- [x] Seed Roberto Nunes Fortaleza Neto (email: fortaleza.neto@gmail.com, clicksign) — verified in DB
- [x] Seed Fabricio Oliveira Menezes (email: fabricio.o.menezes@gmail.com, clicksign) — verified in DB

## Follow-up #2: Link Vehicles to Customers & BLs
- [x] customer_id FK already exists in vehicles table (schema was correct)
- [x] Link Simas vehicles (210716, 1FTEX15H6MKA92716) to his customer record — done in seed
- [ ] Cross-reference existing BL VINs with customer vehicles for auto-linking (deferred)

## Follow-up #3: Clicksign Webhook Sync
- [ ] Create webhook endpoint for Clicksign document events
- [ ] Auto-update customer status on contract sign/cancel events
- [ ] Store clicksign_envelope_id and clicksign_signer_id on customer records

## Project Audit
- [x] Database integrity check: 0 critical issues, 2 warnings (orphan vehicles/BLs), encryption valid
- [x] Code quality audit: 0 TypeScript errors, 0 LSP errors, clean build
- [x] Test coverage audit: 9 test files, 208 tests, all passing
- [x] Generate comprehensive progress report with completion percentage

## Cleanup: Remove Newsletter from Admin Dashboard (REVERTED — Newsletter is a lead repository)
- [x] Reverted: Newsletter kept and repositioned to Marketing/Leads section
- [x] Reverted: NewsletterPanel restored
- [x] Reverted: All newsletter imports restored

## Revert Newsletter Removal & Reposition
- [x] Revert newsletter router in routers.ts (restore all CRUD + subscribe endpoints)
- [x] Revert newsletter section in Footer.tsx (restore subscribe form)
- [x] Revert NewsletterPanel in Admin.tsx (restore full panel component)
- [x] Reposition Newsletter tab away from operations tabs (separate Marketing/Leads section)

## Fabricio Menezes — Multiple Contracts Investigation
- [x] Query Clicksign API for all Fabricio contracts (found 2: 1 canceled, 1 signed)
- [x] Identify BMW contract linked to booking MAEU266193682 (VIN: WBABA110X0EB56026)
- [x] Identify contract with 2 camionetes — not yet in Clicksign (user confirmed)
- [x] Extract VINs and vehicle details from signed contract (BMW 320i E30, 1992, blue, from Germany)
- [x] Link Fabricio's BMW to his customer record and BL MAEU266193682

## VIN Correction & Customer-BL Linking
- [x] Correct BMW VIN from WBADA110X0EB56026 to WBABA110X0EB56026 in vehicles table (was already correct)
- [x] Update BMW model to '320i Series 3 E30' year 1992 (from Clicksign contract)
- [x] Link Fabricio (customer_id:7) to vehicle ID:1 (BMW) and BL MAEU266193682
- [x] Update Fabricio status to em_processo (BL is in_transit)
- [x] Verify André Simas (customer_id:1) vehicles (210716, 1FTEX15H6MKA92716) — confirmed linked
- [ ] Review remaining 4 BLs and link customers where identifiable (MAEU266742227, MAEU265399692, MAEU266742326, BUE105691RCN)

## Phase 31: Auto-Generate Tracking Codes on Customer-BL Link
- [x] Analyze existing tracking code generation flow (service, repository, router)
- [x] Implement auto-generation in BL service when customer_id is set on a BL
- [x] Prevent duplicate codes: skip if customer+BL already has an active code
- [x] Send notification to owner when tracking code is auto-generated
- [x] Update admin BlsPanel to show linked tracking codes
- [x] Write vitest tests for auto-generation logic (48 tests)
- [x] Verify end-to-end: link customer → code generated → code visible in admin

## Phase 31: Auto-Generate Tracking Codes on Customer-BL Link (with Admin Approval)
- [x] Analyze existing tracking code generation flow (service, repository, schema)
- [x] Add approval_status enum (pending/approved/rejected) to tracking_codes schema
- [x] Implement auto-generation in BL service when customer_id is set (code created as pending)
- [x] Prevent duplicate codes: skip if customer+BL already has a pending/approved code
- [x] Build admin approval UI: pending codes queue with Approve/Reject buttons
- [x] On Approve: activate code + send notification to owner
- [x] On Reject: mark code as rejected with reason
- [x] Notify owner when new pending codes are generated
- [x] Write vitest tests for auto-generation and approval flow (48 tests, 256 total)
- [x] Verify end-to-end: link customer → pending code → admin approves → code active

## Phase 31 Addition: Email + WhatsApp on Tracking Code Approval
- [x] Build email template for customer when tracking code is approved
- [x] Build WhatsApp message template for customer when tracking code is approved
- [x] On admin approval: preview dialog shows email + WhatsApp templates
- [x] Admin notification: notify owner immediately when new pending code is auto-generated
- [x] Admin can preview email/WhatsApp before sending (opt-in confirmation via preview dialog)
- [x] Copy-to-clipboard for email body and WhatsApp message
- [x] Direct WhatsApp link (wa.me) with pre-filled message
- [x] Direct mailto: link with pre-filled subject and body

## Phase 32: SEO/GEO Restructuring Plan

### FASE 1: Core Positioning e Definição de Entidade (GEO)
- [x] Add entity definition paragraph to Hero section below H1
- [x] Ensure entity definition matches JSON-LD schema markup

### FASE 2: Arquitetura Semântica — Deep Service Pages (1500+ words each)
- [x] Create /importacao-de-veiculos page (1867 words)
- [x] Create /exportacao-de-veiculos page (1900+ words)
- [x] Create /despacho-aduaneiro page (2100+ words)
- [x] Create /transporte-internacional-de-veiculos page (2000+ words)
- [x] Create /importacao-de-carros-classicos page (3613 words)
- [x] Create /admissao-temporaria page (2000+ words)
- [x] Each page: definition, process steps, cost factors, timelines, documentation, comparison table, FAQ with schema
- [x] Create reusable ServicePageLayout component with JSON-LD FAQ schema
- [x] Register all 6 routes in App.tsx with lazy loading
- [x] Update ServicesSection cards to link to deep pages
- [x] Update Footer service links to point to deep pages
- [x] Add related services cross-links in each service page

### FASE 3: Knowledge Center (Hub de Conteúdo)
- [x] Create /centro-de-conhecimento route and listing page with search
- [x] Create category routes (6 categories with icons and descriptions)
- [x] Build article system with 12 seeded articles, JSON-LD schema, and related articles
- [x] Add Knowledge Center link to Header and Footer navigation

### FASE 4: Páginas de Alta Intenção (Rotas e Preços)
- [x] Create /rotas/enviar-carro-brasil-estados-unidos page (2217 words)
- [x] Create /rotas/enviar-carro-brasil-europa page (2171 words)
- [x] Create /rotas/importar-carro-estados-unidos-brasil page (2156 words)
- [x] Create /custos/quanto-custa-importar-veiculo page (1800 words)
- [x] Create /custos/quanto-custa-exportar-carro page (1600 words)
- [x] Create RoutePageLayout reusable component with FAQ JSON-LD schema
- [x] Register all 5 routes in App.tsx with lazy loading
- [ ] Add prominent CTAs linking to calculator subdomain

### FASE 5: Ajustes Técnicos Finais
- [x] Update sitemap.xml with all 22 URLs (services, routes, costs, knowledge center, tracking, legal)
- [x] Implement internal linking: Footer has Serviços + Rotas & Custos sections, Header has Centro de Conhecimento
- [x] JSON-LD FAQ schema on all service and route pages
- [ ] Validate SSR/prerendering for Googlebot and AI crawlers (deferred — requires production deploy)
- [x] All 256 tests passing (10 test files, no regressions from SEO changes)

## Phase 33: Google Search Console Sitemap Submission
- [x] Submit sitemap.xml to Google Search Console (done by user manually)
- [ ] Verify indexing status of new pages (ongoing — Google will crawl over next days)

## Phase 34: Content Management API for External SEO/GEO Task
- [x] Design CMS API schema: articles, categories, metatags, media
- [x] Create articles table in database (title, slug, content, excerpt, category, status, seo_title, seo_description, seo_keywords, author, published_at, featured_image)
- [x] Create categories table in database (name, slug, description, parent_id)
- [x] Create media table in database (url, alt_text, caption, mime_type, file_key)
- [x] Implement API key authentication middleware for CMS endpoints
- [x] Generate dedicated CMS API key
- [x] Build REST endpoints: POST/GET/PUT/DELETE /api/cms/articles
- [x] Build REST endpoints: POST/GET/PUT/DELETE /api/cms/categories
- [x] Build REST endpoints: POST/GET/PUT/DELETE /api/cms/media
- [x] Build REST endpoints: GET/PUT /api/cms/menus
- [x] Build REST endpoints: GET/PUT /api/cms/seo (global SEO settings)
- [x] Write comprehensive API documentation (Swagger/OpenAPI style)
- [x] Test all endpoints with curl examples
- [x] Write vitest tests for CMS API (3 tests)
- [x] Deliver API key + docs to user for external Manus task

## Phase 35: CMS Integration — Seed Data + Frontend Migration
- [x] Seed 6 CMS categories via REST API (transporte, importacao, exportacao, frete, classicos, regulamentacoes)
- [x] Seed 12 CMS article stubs via REST API (draft status, with SEO metadata)
- [x] Create CMS tRPC router with listCategories, listArticles, getArticle endpoints
- [x] listArticles: pagination, categorySlug filter, text search, draft+published support
- [x] getArticle: returns single article by slug with category slug
- [x] Migrate KnowledgeCenter.tsx from hardcoded data to tRPC-powered (categories, articles, article detail)
- [x] Category page: loads articles filtered by category from DB
- [x] Article page: loads single article with related articles, JSON-LD schema
- [x] Search functionality: live search across title, description, tags
- [x] Draft articles show "Em preparação" badge and placeholder content
- [x] Write 11 vitest tests for CMS tRPC router (listCategories, listArticles, getArticle)
- [x] All 270 tests passing (12 test files, no regressions)
- [x] Visual verification: categories, articles, article detail pages all rendering from DB

## Phase 36: Logo Replacement — Two Versions (Dark/Light Background)
- [x] Upload IMG_8091 (dark bg version, light subtitle) to CDN
- [x] Upload IMG_8092 (light bg version, dark subtitle) to CDN
- [x] Identify all logo references across the project (Header, Footer, Tracking, JSON-LD schemas)
- [x] Replace logo in Header (dark background → IMG_8091 via LOGO_URL = LOGO_DARK_BG_URL)
- [x] Replace logo in Footer (dark background → IMG_8091 via LOGO_URL = LOGO_DARK_BG_URL)
- [x] Replace logo in Admin panel (no direct logo img, uses text only)
- [x] Replace logo in Tracking page (dark bg → IMG_8091 via LOGO_URL)
- [x] Replace logo in JSON-LD schemas (4 instances in index.html → IMG_8092 light bg for Google)
- [x] VITE_APP_LOGO is built-in and cannot be changed via secrets (not used in code)
- [x] Visual verification across all sections (Header, Footer, Tracking page, JSON-LD schemas)

## Phase 37: Logo Size Adjustments
- [x] Increase logo size in Header component (h-16/h-20 → h-20/h-24)
- [x] Increase logo size in Footer component (h-10 → h-16)
- [x] Increase logo size in Tracking page (h-10 → h-14)
- [x] Visual verification of all logo sizes

## Phase 38: Logo Size 218% Increase
- [x] Calculate 218% of original logo sizes (Header, Footer, Tracking)
- [x] Apply new sizes to Header logo (h-[140px]/h-[174px], container h-28/h-32)
- [x] Apply new sizes to Footer logo (h-[87px])
- [x] Apply new sizes to Tracking page logo (h-[87px])
- [x] Visual verification

## Phase 39: Logo Size — Match Previous Logo Visual Prominence
- [x] Analyze previous AI logo aspect ratio vs new EMC logo aspect ratio (content was only 21% of image height)
- [x] Cropped logos to remove whitespace, re-uploaded to CDN, updated all references
- [x] Visual verification — logo now prominently visible with EMC + ENVIANDO MEU CARRO text

## Phase 40: CTA Tracking Audit
- [x] Review analytics library (15 tracking functions: trackCTAClick, trackWhatsAppClick, trackNavClick, trackCalculatorInteraction, trackOutboundLink, trackModalOpen/Close/Submit, trackPhoneCall, trackEmailClick, trackFAQInteraction, trackSocialClick, trackNewsletterSubscribe)
- [x] Audit all CTAs in Header component
- [x] Audit all CTAs in HeroSection component (already tracked)
- [x] Audit all CTAs in StatsSection component (no CTAs, informational only)
- [x] Audit all CTAs in BenefitsGrid component (no CTAs, informational only)
- [x] Audit all CTAs in CTASection component (already tracked)
- [x] Audit all CTAs in ServicesSection component
- [x] Audit all CTAs in WhyUsSection component (already tracked)
- [x] Audit all CTAs in TestimonialsSection component (already tracked)
- [x] Audit all CTAs in OfficesSection component (no CTAs, informational only)
- [x] Audit all CTAs in FAQSection component (already tracked)
- [x] Audit all CTAs in Footer component (already tracked)
- [x] Audit all CTAs in WhatsAppButton component (already tracked)
- [x] Audit all CTAs in KnowledgeCenter page
- [x] Audit all CTAs in Tracking page
- [x] Audit all CTAs in service pages (ServicePageLayout already tracked, RoutePageLayout fixed, ImportCalculator fixed)
- [x] Add missing tracking to 16 untracked CTAs across 6 files

## Phase 41: Analytics Improvements (3 Suggestions)

### 41a: UTM Tracking on WhatsApp Links
- [x] Update openContact() in contact.ts to append UTM parameters (source, medium, campaign) to WhatsApp URLs
- [x] Pass source/campaign context from each CTA caller to openContact() — 14 callers updated across 10 files
- [x] Verify UTM params appear in WhatsApp link URLs (appended as [Ref: source/medium/campaign] tag)

### 41b: GTM DataLayer Event Triggers & Custom Conversions
- [x] Create GTM container configuration JSON (GTM_CONTAINER_CONFIG.json) with 12 triggers, 18 tags, 18 variables
- [x] Define 6 custom conversion tags for Google Ads (cta_click, whatsapp_click, whatsapp_open, newsletter_subscribe, phone_call, calculator_interaction)
- [x] Verified: gtag.js already captures dataLayer events; GTM container JSON ready for import
- [x] Created comprehensive GTM_SETUP_GUIDE.md with step-by-step instructions

### 41c: GA4 Conversion Dashboard Configuration
- [x] Create GA4 custom event configuration with 16 custom dimensions and conversion marking guide
- [x] Create GA4_DASHBOARD_CONFIG.md with 5 explorations, Looker Studio dashboard spec, and automated alerts
- [x] Document recommended GA4 Explorations setup (included in GA4_DASHBOARD_CONFIG.md)

## Phase 42: Article Typography (prose) Styling
- [x] Install @tailwindcss/typography plugin
- [x] Register plugin in index.css via @plugin directive (Tailwind 4)
- [x] Apply comprehensive prose classes to article content container in KnowledgeCenter
- [x] Verify visual result with published articles (H2 borders, H3 spacing, tables, lists, bold all rendering correctly)

## Phase 43: Clicksign → BL Reconciliation Fix
- [ ] Investigate current Clicksign integration code and why clicksign_contracts table is empty
- [ ] Fix Clicksign sync to fetch contracts and extract VINs from contract content
- [ ] Implement VIN matching: Clicksign VIN → bl_vehicles VIN → link customer (CPF) to BL
- [ ] Run reconciliation and verify customer-vehicle-BL links
- [ ] Generate tracking codes for reconciled customer-BL pairs

## Phase 43: State Machine Reconciliation System
- [x] State machine reconciliation service: detect process stage for each contract/customer
- [x] Stage detection logic: Clicksign→VIN→BL→Tracking chain (each false = stage indicator, not error)
- [x] Process stages: aguardando_assinatura → contrato_ativo → fase_documental → aguardando_embarque → em_transito → desembaraco → concluido
- [x] Admin dashboard: process pipeline view showing each customer's current stage
- [x] Admin actions per stage: force sync, manual insert, override stage
- [ ] Clicksign sync: populate clicksign_contracts table from API
- [x] Auto-reconciliation: run chain detection and set correct customer status
- [x] Tests for state machine reconciliation logic (14 tests passing)
- [x] Non-blocking stages: absence of any phase does NOT prevent next phases from occurring
- [x] Admin can advance/retrocede stages manually (no validation blocking)
- [x] BL without client is valid (recurring export operations without per-operation contracts)
- [x] Manual client insertion for tracking delivery (no Clicksign required)
- [x] Tracking code absence is not a fatal error (beta/sandbox phase)
- [x] Stage detection is informative only, never blocking

## Phase 44: Manual Contract PDF Upload + CPF/VIN Extraction
- [x] PDF upload endpoint (accept PDF, store in S3)
- [x] PDF text extraction service (extract CPF and VIN from contract content using LLM)
- [x] Auto-create customer record from extracted CPF (or link to existing)
- [x] Auto-create vehicle record from extracted VIN (or link to existing)
- [x] Mark as "contrato fechado, fase documental" and trigger reconciliation chain
- [x] Admin UI: contract upload panel with drag-and-drop PDF upload
- [x] Admin UI: show extracted data (CPF, VIN, name) for confirmation before saving
- [x] Tests for PDF extraction and contract processing (12 tests passing)

## Phase 44: Stage-Based Notifications
- [x] Notification service: send email AND/OR phone (WhatsApp) per stage change
- [x] Logic: has email → send email; has phone → send phone; has both → send both
- [x] Logic: has neither email nor phone → flag for admin to correct
- [x] Notification templates per stage (embarque, trânsito, desembaraço, entrega)
- [x] Notification history via audit log (track what was sent, when, to whom)
- [x] Admin UI: notification endpoints (missing contact list, templates, send)
- [x] Tests for notification logic (9 tests passing)

## Phase 44: Scheduled Reconciliation
- [x] Schedule reconciliation to run every 6 hours automatically
- [x] Log reconciliation results for admin review + owner notification

## Phase 45: Admin Organization — Glossary + Leads Separation
- [x] Add status/tag glossary to Clientes page (chronological order of process stages)
- [x] Separate Newsletter/Leads into its own admin tab (apart from operational system)

## Phase 46: Footer Fixes
- [x] Change footer email from atendimento@ to info@enviandomeucarro.com
- [x] Fix footer layout overlap between columns

## Phase 47: Card Height Equalization
- [x] Equalize category card heights in /centro-de-conhecimento (flex-col, min-h, flex-grow on description)
- [x] Equalize related articles card heights in article sidebar (flex-col, min-h, flex-grow on title)

## Phase 48: Footer Email Fix (all pages)
- [x] Ensure footer email is info@enviandomeucarro.com everywhere (code + database + seed file)

## Phase 49: Batch Operational Features

### 49a: Admin UI — Manual Customer↔Vehicle↔BL Linking
- [x] Add "Vincular" actions in BlsPanel to link/unlink customers and vehicles to a BL
- [x] Add vehicle selector (search by VIN) when linking vehicle to BL
- [x] Add customer selector (search by name/CPF) when linking customer to BL
- [x] Show linked customers and vehicles inline in BL detail/row
- [ ] Auto-trigger tracking code generation when customer is linked to BL

### 49b: Quick-Add Customer to BL (Export Operations)
- [x] Add "Adicionar Cliente Rápido" button on BL row for BLs without customer
- [x] Inline form: name, email, phone, CPF/CNPJ (minimal fields)
- [ ] On save: create customer → link to BL → trigger reconciliation

### 49c: Real Email Sending
- [ ] Create email sending service using built-in notification/forge API
- [ ] Wire email sending into stage notification service (replace placeholder)
- [ ] Send real emails on tracking code approval (to customer)
- [ ] Send real emails on stage changes (to customer)
- [ ] Admin notification email when new pending actions exist

### 49d: Clicksign Webhook Endpoint
- [ ] Create POST /api/webhooks/clicksign endpoint
- [ ] Validate webhook signature/token
- [ ] Handle document_signed event → update customer status
- [ ] Handle document_canceled event → update customer status
- [ ] Store clicksign_envelope_id on customer records
- [ ] Write tests for webhook handler

### 49e: CNPJ Support
- [x] Add CNPJ field to customers schema (nullable, alongside CPF)
- [x] Update customer validation to accept CPF or CNPJ
- [x] Update CustomersPanel UI to show/edit CNPJ
- [ ] Update PDF extraction to detect CNPJ in addition to CPF

### 49f: Auto-Link Existing Data
- [ ] Script to cross-reference BL vehicle_description VINs with vehicles table
- [ ] Auto-populate bl_vehicles junction for matches
- [ ] Auto-link customers via vehicle.customer_id → bl_vehicles

### 49g: Public Tracking — Per-Vehicle Info
- [ ] Update tracking result page to show vehicle details (make, model, year, VIN)
- [ ] Show multiple vehicles if BL has multiple linked vehicles for the customer

### 49h: Tests
- [x] Tests for linking endpoints (37 tests in cnpj-linking.test.ts)
- [ ] Tests for email sending service
- [ ] Tests for Clicksign webhook
- [x] Tests for CNPJ validation (included in cnpj-linking.test.ts)

## Sprint: Full Phase 49 Completion

### Email Template System
- [x] Create email_templates table in schema (name, subject, htmlBody, variables, isActive)
- [x] Build email templates CRUD backend (router + service + repository)
- [x] Build Email Templates admin panel with rich editor
- [x] Seed default templates (tracking code, stage change, welcome, admin notification)

### Real Email Sending
- [x] Create email sending service using built-in notification/forge API
- [x] Wire email sending into stage notification service
- [x] Send emails on tracking code approval (to customer)
- [x] Send emails on stage changes (to customer)
- [x] Admin notification email on new pending actions
- [x] Use template system for all emails (variable interpolation)

### Clicksign Webhook
- [x] Create POST /api/webhooks/clicksign endpoint
- [x] Validate webhook token
- [x] Handle document_signed event → update contract status
- [x] Handle document_canceled event → update contract status

### Auto-Link & Auto-Trigger
- [x] Auto-link script: cross-reference BL VINs with vehicles table
- [x] Auto-trigger tracking code when customer linked to BL
- [x] Auto-populate bl_vehicles junction for VIN matches

### Public Tracking Vehicle Info
- [x] Show vehicle details (make, model, year) on tracking result page
- [x] Show multiple vehicles if BL has multiple linked vehicles
- [x] Ensure NO personal data (CPF, CNPJ, name, email) is exposed

### CNPJ in PDF Extraction
- [x] Update contract extraction to detect CNPJ patterns
- [x] Store detected CNPJ in customer record

### Tests
- [x] Tests for email template rendering (10 tests)
- [x] Tests for Clicksign webhook event parsing (4 tests)
- [x] Tests for auto-link VIN matching logic (5 tests)
- [x] Tests for tracking page vehicle info safety (3 tests)
- [x] Tests for CNPJ PDF extraction (4 tests)
- [x] Tests for email template slug conventions (2 tests)
- [x] Tests for notification service template integration (2 tests)

## Responsive Email Template Preview
- [x] Add device toggle (Desktop / Tablet / Mobile) to email template preview
- [x] Render preview in iframe with device-appropriate width
- [x] Show device frame/chrome around the preview for realism
- [x] Ensure preview works for both HTML body and WhatsApp message

## Visual Drag-and-Drop Email Editor
- [x] Research and select best React drag-and-drop email editor library (Unlayer react-email-editor)
- [x] Install and configure the editor library
- [x] Replace HTML textarea in Create Template dialog with visual editor
- [x] Replace HTML textarea in Edit Template dialog with visual editor
- [x] Export HTML + Design JSON from visual editor on save
- [x] Support loading existing designJson into the editor on edit
- [x] Keep HTML source tab as fallback for advanced users
- [x] Ensure backward compatibility with existing templates (no designJson → HTML mode)

## WhatsApp Cloud API (Meta) Integration
- [x] Create whatsapp_messages log table in schema
- [x] Create WhatsApp service module (server/modules/whatsapp/)
- [x] Implement sendTemplateMessage() using Meta Cloud API
- [x] Implement sendTextMessage() for customer service window replies
- [x] Wire WhatsApp into notification pipeline (tracking code approved, stage change)
- [x] Add template mapping: system email templates → Meta-approved WhatsApp template names
- [x] Implement webhook endpoint for incoming WhatsApp messages/status updates
- [x] Build admin UI: WhatsApp settings panel (connection status, phone number info)
- [x] Build admin UI: WhatsApp message log viewer
- [ ] Request WHATSAPP_TOKEN and WHATSAPP_PHONE_NUMBER_ID secrets from user
- [x] Write tests for WhatsApp service (32 tests)
- [x] Fallback: if WhatsApp fails, send via email notification

## Fix: BL Status Transition Rules
- [x] Allow admin override for status regression (arrived → in_transit, etc.) — already existed via forceUpdateStatus
- [x] Add reason field to forceUpdateStatus for audit trail
- [x] Verified: No BLs with inconsistent status (arrived + future ETA) currently in DB
- [x] Add visual warning (yellow triangle + banner) for BLs with status inconsistent with ETA
- [x] Add ETA future warning on status change buttons (red highlight + confirmation)
- [x] Status change now prompts for reason (audit trail)
- [x] Add audit log entry when admin overrides status (reason field in audit_logs)

## Security & Compliance Audit (March 2026)
- [x] V-001: Timing-safe API key comparison (Agent + CMS) — crypto.timingSafeEqual
- [x] V-002: Remove hardcoded WhatsApp webhook verify token fallback
- [x] V-003: Encrypt PII in Clicksign contracts (signerCpf, signerEmail, signerPhone, signerName)
- [x] V-004: Encrypt rawPayload in Clicksign contracts
- [x] V-005: Replace console.log with secureLogger for HubSpot email logging
- [x] V-006: Replace console.log with secureLogger for tracking customer name logging
- [x] V-007: Add DOMPurify XSS sanitization for CMS HTML content in KnowledgeCenter
- [x] V-008: Add soft-delete (deletedAt IS NULL) filter to findBlById, findBlByNumber, findCustomerById, findCustomerByCpf, findCustomerByCnpj, findVehicleById, findVehicleByVin
- [x] Write 18 security audit tests (server/security-audit.test.ts)
- [x] All 423 tests passing (19 test files, 0 failures)
- [x] Comprehensive audit report (SECURITY_AUDIT_REPORT.md)
- [ ] Recommendation: Apply rate limiters to public tracking endpoints
- [ ] Recommendation: Implement HMAC signature validation for Clicksign/WhatsApp webhooks
- [ ] Recommendation: Install Helmet for security headers
- [ ] Recommendation: Update axios to >=1.13.5
- [ ] Recommendation: Migrate legacy Clicksign PII data to encrypted format

## Security Recommendations Implementation (March 2026)
- [x] Apply rate limiters (cpfRateLimiter, generalRateLimiter) to public tracking endpoints
- [x] Create and run migration script to encrypt legacy Clicksign PII data
- [x] Update axios to >=1.13.5 to fix DoS vulnerability (updated to 1.13.6)
