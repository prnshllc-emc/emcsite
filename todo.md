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
