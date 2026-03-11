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
- [ ] Auto-generate tracking codes when customer+BL are linked
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
