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
