# Graph Report - apps/web_v2 + apps/api_v2 + packages  (2026-04-12)

## Corpus Check
- 301 files · ~101,852 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 759 nodes · 930 edges · 92 communities detected
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `Widget` - 19 edges
2. `StyleManager` - 13 edges
3. `TelemetryTracker` - 13 edges
4. `ThemeManager` - 12 edges
5. `simulateLatency()` - 11 edges
6. `CSPValidator` - 11 edges
7. `RateLimiter` - 10 edges
8. `StorageManager` - 10 edges
9. `Logger` - 10 edges
10. `APIClient` - 9 edges

## Surprising Connections (you probably didn't know these)
- `web_v2 Next.js App` --references--> `Next.js Wordmark Logo SVG`  [INFERRED]
  apps/web_v2/README.md → apps/web_v2/public/next.svg
- `@workspace/eslint-config Shared ESLint Configuration` --conceptually_related_to--> `web_v2 Next.js App`  [INFERRED]
  packages/eslint-config/README.md → apps/web_v2/README.md
- `Globe/Web Icon SVG` --references--> `web_v2 Next.js App`  [INFERRED]
  apps/web_v2/public/globe.svg → apps/web_v2/README.md
- `Browser Window Icon SVG` --references--> `web_v2 Next.js App`  [INFERRED]
  apps/web_v2/public/window.svg → apps/web_v2/README.md
- `File Document Icon SVG` --references--> `web_v2 Next.js App`  [INFERRED]
  apps/web_v2/public/file.svg → apps/web_v2/README.md

## Hyperedges (group relationships)
- **Widget Security, Privacy and Compliance Layer** — widget_security_readme_content_sanitizer, widget_telemetry_readme_privacy_first, widget_readme_csp_compliance, widget_telemetry_readme_gdpr_ccpa [INFERRED 0.80]
- **Widget Core Bundle Delivery System** — widget_readme_iife_bundle, widget_readme_bundle_size_budgets, widget_readme_layout_chunks, widget_security_readme_dompurify [INFERRED 0.75]
- **Workspace Shared Tooling Packages** — eslint_config_readme_shared_eslint, typescript_config_readme_shared_tsconfig, web_v2_readme_nextjs_app, api_v2_readme_nestjs_scaffold [INFERRED 0.80]

## Communities

### Community 0 - "Shared UI Primitives (shadcn/radix)"
Cohesion: 0.02
Nodes (0): 

### Community 1 - "Web v2 API Client Functions"
Cohesion: 0.04
Nodes (14): apiApproveTestimonial(), apiGetApiKeys(), apiGetNotifications(), apiGetProject(), apiGetProjects(), apiGetSubscription(), apiGetTestimonial(), apiGetTestimonials() (+6 more)

### Community 2 - "Alert Dialog UI"
Cohesion: 0.04
Nodes (2): CarouselNext(), useCarousel()

### Community 3 - "Auth UI Components"
Cohesion: 0.07
Nodes (4): FormControl(), FormDescription(), FormMessage(), useFormField()

### Community 4 - "API v2 NestJS App Module"
Cohesion: 0.07
Nodes (8): AppModule, ClerkAuthGuard, ClerkService, getWidgetId(), parseWidgetConfig(), HealthController, RedisModule, UsersController

### Community 5 - "Widget Preview & CSS Sanitizer"
Cohesion: 0.12
Nodes (0): 

### Community 6 - "App Layout & Help FAB"
Cohesion: 0.1
Nodes (3): getQueryClient(), makeQueryClient(), QueryProvider()

### Community 7 - "Widget Component Docs"
Cohesion: 0.13
Nodes (22): Accessibility (ARIA, semantic HTML), Card Style Variants (default, minimal, bordered), CSS Custom Properties for Theming, Testimonial Display Options, OAuth Verification Badge, TestimonialCard Component, Bundle Size Budgets, CSP Compliance (+14 more)

### Community 8 - "Combobox UI"
Cohesion: 0.1
Nodes (0): 

### Community 9 - "Widget Core Engine"
Cohesion: 0.19
Nodes (1): Widget

### Community 10 - "Context Menu UI"
Cohesion: 0.12
Nodes (0): 

### Community 11 - "API v2 Architecture Docs"
Cohesion: 0.14
Nodes (15): Clerk-ready Service Wiring, Health Endpoint, api_v2 NestJS Scaffold, Prisma Connection via @workspace/database, Redis + BullMQ Bootstrap, @workspace/eslint-config Shared ESLint Configuration, File Document Icon SVG, Globe/Web Icon SVG (+7 more)

### Community 12 - "CSP Validator"
Cohesion: 0.16
Nodes (1): CSPValidator

### Community 13 - "Content Sanitizer (XSS)"
Cohesion: 0.21
Nodes (5): containsHTML(), ContentSanitizer, escapeHTML(), isValidURL(), sanitizeContent()

### Community 14 - "Style Manager"
Cohesion: 0.22
Nodes (1): StyleManager

### Community 15 - "Telemetry Tracker"
Cohesion: 0.2
Nodes (1): TelemetryTracker

### Community 16 - "Sidebar Navigation"
Cohesion: 0.17
Nodes (2): SidebarMenuButton(), useSidebar()

### Community 17 - "Theme Manager"
Cohesion: 0.23
Nodes (1): ThemeManager

### Community 18 - "Rate Limiter"
Cohesion: 0.2
Nodes (1): RateLimiter

### Community 19 - "Storage / Cache Manager"
Cohesion: 0.36
Nodes (1): StorageManager

### Community 20 - "Widget Logger"
Cohesion: 0.2
Nodes (1): Logger

### Community 21 - "Menubar UI"
Cohesion: 0.2
Nodes (0): 

### Community 22 - "Select UI"
Cohesion: 0.2
Nodes (0): 

### Community 23 - "Widget API Client"
Cohesion: 0.2
Nodes (1): APIClient

### Community 24 - "Drawer UI"
Cohesion: 0.22
Nodes (0): 

### Community 25 - "Env Config & URL Utils"
Cohesion: 0.25
Nodes (2): buildWidgetScriptUrl(), normalizeVersionSegment()

### Community 26 - "IndexedDB Adapter"
Cohesion: 0.36
Nodes (1): IndexedDBAdapter

### Community 27 - "CSP Compliance Audit"
Cohesion: 0.46
Nodes (7): auditCSPCompliance(), checkForEval(), checkForExternalDomains(), checkForFunctionConstructor(), checkForInlineEventHandlers(), checkForJavaScriptURLs(), getTypeScriptFiles()

### Community 28 - "Bundle Manifest Generator"
Cohesion: 0.36
Nodes (4): generateCSPEmbed(), generateManifest(), generateStandardEmbed(), getFiles()

### Community 29 - "LocalStorage Adapter"
Cohesion: 0.32
Nodes (1): LocalStorageAdapter

### Community 30 - "Prisma Service (API v2)"
Cohesion: 0.29
Nodes (1): PrismaService

### Community 31 - "Web v2 API Error Client"
Cohesion: 0.33
Nodes (1): ApiError

### Community 32 - "Redis Service (API v2)"
Cohesion: 0.33
Nodes (1): RedisService

### Community 33 - "Network Client & Interceptors"
Cohesion: 0.33
Nodes (1): NetworkClient

### Community 34 - "Telemetry Sampler"
Cohesion: 0.33
Nodes (1): TelemetrySampler

### Community 35 - "Programmatic API Tests"
Cohesion: 0.47
Nodes (3): clonePayload(), createFetchSuccessResponse(), createMockHeaders()

### Community 36 - "Users Service (API v2)"
Cohesion: 0.4
Nodes (1): UsersService

### Community 37 - "Bundle Budget Checker"
Cohesion: 0.6
Nodes (3): checkBudgets(), formatBytes(), getAllFiles()

### Community 38 - "Retry Logic"
Cohesion: 0.7
Nodes (4): calculateDelay(), isRetryableError(), retry(), sleep()

### Community 39 - "Widget Loader / Auto-init"
Cohesion: 0.6
Nodes (3): findContainer(), initializeWidget(), parseConfig()

### Community 40 - "Widget Error Types"
Cohesion: 0.67
Nodes (1): WidgetError

### Community 41 - "Testimonial Limiter"
Cohesion: 1.0
Nodes (2): limitTestimonials(), sortByCreatedAtDesc()

### Community 42 - "Storage Manager Tests"
Cohesion: 0.67
Nodes (0): 

### Community 43 - "Aspect Ratio UI"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Direction Provider"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Public Decorator"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Clerk Module"
Cohesion: 1.0
Nodes (1): ClerkModule

### Community 47 - "Health Check Module"
Cohesion: 1.0
Nodes (1): HealthModule

### Community 48 - "Prisma Module"
Cohesion: 1.0
Nodes (1): PrismaModule

### Community 49 - "Users Module"
Cohesion: 1.0
Nodes (1): UsersModule

### Community 50 - "Database Seed Script"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Copy Generated Files Script"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Color Utilities"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "ESLint Config Package"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Sonner Toast UI"
Cohesion: 2.0
Nodes (0): 

### Community 55 - "CSP Validator Tests"
Cohesion: 1.0
Nodes (0): 

### Community 56 - "Testimonial Limiter Tests"
Cohesion: 1.0
Nodes (0): 

### Community 57 - "Next.js Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 58 - "Next.js Proxy"
Cohesion: 1.0
Nodes (0): 

### Community 59 - "Current User ID Decorator"
Cohesion: 1.0
Nodes (0): 

### Community 60 - "Users Service Spec"
Cohesion: 1.0
Nodes (0): 

### Community 61 - "Base Types"
Cohesion: 1.0
Nodes (0): 

### Community 62 - "Widget Type Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 63 - "Payments Model"
Cohesion: 1.0
Nodes (0): 

### Community 64 - "Testimonial Model"
Cohesion: 1.0
Nodes (0): 

### Community 65 - "Widget Type Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 66 - "Vite Config"
Cohesion: 1.0
Nodes (0): 

### Community 67 - "Vite Env Types"
Cohesion: 1.0
Nodes (0): 

### Community 68 - "API Client Tests"
Cohesion: 1.0
Nodes (0): 

### Community 69 - "Rate Limiter Tests"
Cohesion: 1.0
Nodes (0): 

### Community 70 - "Config Tests"
Cohesion: 1.0
Nodes (0): 

### Community 71 - "Loader Tests"
Cohesion: 1.0
Nodes (0): 

### Community 72 - "Widget Integration Tests"
Cohesion: 1.0
Nodes (0): 

### Community 73 - "CSS Sanitizer Tests"
Cohesion: 1.0
Nodes (0): 

### Community 74 - "Content Sanitizer Tests"
Cohesion: 1.0
Nodes (0): 

### Community 75 - "Cache Manager Tests"
Cohesion: 1.0
Nodes (0): 

### Community 76 - "IndexedDB Tests"
Cohesion: 1.0
Nodes (0): 

### Community 77 - "LocalStorage Tests"
Cohesion: 1.0
Nodes (0): 

### Community 78 - "Style Manager Tests"
Cohesion: 1.0
Nodes (0): 

### Community 79 - "Theme Manager Tests"
Cohesion: 1.0
Nodes (0): 

### Community 80 - "Telemetry Sampler Tests"
Cohesion: 1.0
Nodes (0): 

### Community 81 - "Telemetry Tracker Tests"
Cohesion: 1.0
Nodes (0): 

### Community 82 - "Logger Tests"
Cohesion: 1.0
Nodes (0): 

### Community 83 - "Accessibility Tests"
Cohesion: 1.0
Nodes (0): 

### Community 84 - "API Client Tests (Widget)"
Cohesion: 1.0
Nodes (0): 

### Community 85 - "Content Sanitizer Tests (Widget)"
Cohesion: 1.0
Nodes (0): 

### Community 86 - "CSP Compliance Tests"
Cohesion: 1.0
Nodes (0): 

### Community 87 - "CSS Isolation Tests"
Cohesion: 1.0
Nodes (0): 

### Community 88 - "Debug Mode Tests"
Cohesion: 1.0
Nodes (0): 

### Community 89 - "Widget Index Tests"
Cohesion: 1.0
Nodes (0): 

### Community 90 - "Test Setup"
Cohesion: 1.0
Nodes (0): 

### Community 91 - "Widget Core Tests"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **26 isolated node(s):** `AppModule`, `ClerkModule`, `HealthModule`, `PrismaModule`, `RedisModule` (+21 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Aspect Ratio UI`** (2 nodes): `aspect-ratio.tsx`, `AspectRatio()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Direction Provider`** (2 nodes): `direction.tsx`, `DirectionProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Public Decorator`** (2 nodes): `public.decorator.ts`, `Public()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Clerk Module`** (2 nodes): `clerk.module.ts`, `ClerkModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Health Check Module`** (2 nodes): `health.module.ts`, `HealthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Prisma Module`** (2 nodes): `prisma.module.ts`, `PrismaModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Users Module`** (2 nodes): `users.module.ts`, `UsersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Seed Script`** (2 nodes): `seed.ts`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Copy Generated Files Script`** (2 nodes): `copy-generated.js`, `copyDir()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Color Utilities`** (2 nodes): `colors.ts`, `isFreeColor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config Package`** (2 nodes): `eslint.config.js`, `react-internal.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sonner Toast UI`** (2 nodes): `sonner.tsx`, `Toaster()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CSP Validator Tests`** (2 nodes): `csp-validator.test.ts`, `getHostname()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Testimonial Limiter Tests`** (2 nodes): `testimonial-limiter.test.ts`, `createTestimonial()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Env Types`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Proxy`** (1 nodes): `proxy.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Current User ID Decorator`** (1 nodes): `current-user-id.decorator.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Users Service Spec`** (1 nodes): `users.service.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Base Types`** (1 nodes): `base.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Widget Type Definitions`** (1 nodes): `index.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Payments Model`** (1 nodes): `payments.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Testimonial Model`** (1 nodes): `testimonial.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Widget Type Declarations`** (1 nodes): `widget.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Config`** (1 nodes): `vite.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Vite Env Types`** (1 nodes): `vite-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Client Tests`** (1 nodes): `client.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Rate Limiter Tests`** (1 nodes): `rate-limiter.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Config Tests`** (1 nodes): `config.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Loader Tests`** (1 nodes): `loader.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Widget Integration Tests`** (1 nodes): `widget.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CSS Sanitizer Tests`** (1 nodes): `css-sanitizer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Content Sanitizer Tests`** (1 nodes): `sanitizer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Cache Manager Tests`** (1 nodes): `cache-manager.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `IndexedDB Tests`** (1 nodes): `indexeddb.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `LocalStorage Tests`** (1 nodes): `localstorage.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Style Manager Tests`** (1 nodes): `style-manager.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Theme Manager Tests`** (1 nodes): `theme-manager.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Telemetry Sampler Tests`** (1 nodes): `sampler.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Telemetry Tracker Tests`** (1 nodes): `tracker.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Logger Tests`** (1 nodes): `logger.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Accessibility Tests`** (1 nodes): `accessibility.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Client Tests (Widget)`** (1 nodes): `api-client.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Content Sanitizer Tests (Widget)`** (1 nodes): `content-sanitizer.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CSP Compliance Tests`** (1 nodes): `csp-compliance.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `CSS Isolation Tests`** (1 nodes): `css-isolation.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Debug Mode Tests`** (1 nodes): `debug-mode.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Widget Index Tests`** (1 nodes): `index.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Setup`** (1 nodes): `setup.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Widget Core Tests`** (1 nodes): `widget-core.test.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Widget` connect `Widget Core Engine` to `Widget Preview & CSS Sanitizer`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Tresta Widget CDN System` connect `Widget Component Docs` to `API v2 Architecture Docs`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **Why does `@workspace/typescript-config Shared TypeScript Configuration` connect `API v2 Architecture Docs` to `Widget Component Docs`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **What connects `AppModule`, `ClerkModule`, `HealthModule` to the rest of the system?**
  _26 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Shared UI Primitives (shadcn/radix)` be split into smaller, more focused modules?**
  _Cohesion score 0.02 - nodes in this community are weakly interconnected._
- **Should `Web v2 API Client Functions` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Alert Dialog UI` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._