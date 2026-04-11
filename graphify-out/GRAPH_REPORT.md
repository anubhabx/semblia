# Graph Report - .  (2026-04-11)

## Corpus Check
- 157 files · ~293,921 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 4477 nodes · 11052 edges · 55 communities detected
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## God Nodes (most connected - your core abstractions)
1. `push()` - 66 edges
2. `constructor()` - 51 edges
3. `toString()` - 41 edges
4. `L()` - 38 edges
5. `destroy()` - 36 edges
6. `slice()` - 32 edges
7. `write()` - 31 edges
8. `keys()` - 28 edges
9. `on()` - 28 edges
10. `JF()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `Globe Icon SVG` --conceptually_related_to--> `web_v2 Next.js App`  [INFERRED]
  apps/web_v2/public/globe.svg → apps/web_v2/README.md
- `handleSubmit()` --calls--> `errMsg()`  [EXTRACTED]
  apps\web_v2\app\(auth)\sign-in\[[...sign-in]]\_form.tsx → apps\web_v2\app\(auth)\sign-up\[[...sign-up]]\_form.tsx
- `File Icon SVG` --semantically_similar_to--> `Browser Window Icon SVG`  [INFERRED] [semantically similar]
  apps/web_v2/public/file.svg → apps/web_v2/public/window.svg
- `Next.js Wordmark SVG` --semantically_similar_to--> `Vercel Logo SVG (Triangle)`  [INFERRED] [semantically similar]
  apps/web_v2/public/next.svg → apps/web_v2/public/vercel.svg
- `web_v2 Next.js App` --conceptually_related_to--> `api_v2 NestJS App`  [INFERRED]
  apps/web_v2/README.md → apps/api_v2/README.md

## Hyperedges (group relationships)
- **api_v2 Core Feature Set** — api_v2_config_env, api_v2_prisma, api_v2_redis, api_v2_bullmq, api_v2_clerk, api_v2_health_endpoint [EXTRACTED 1.00]
- **web_v2 Default Next.js Public Icons Set** — file_svg_file_icon, globe_svg_globe_icon, next_svg_nextjs_wordmark, vercel_svg_vercel_logo, window_svg_browser_window_icon, web_v2_public_assets [INFERRED 0.90]
- **Next.js and Vercel Branding Assets** — next_svg_nextjs_wordmark, vercel_svg_vercel_logo, nextjs_framework, vercel_platform [INFERRED 0.85]

## Communities

### Community 0 - "Prisma Client Binary (WASM)"
Cohesion: 0.01
Nodes (597): a(), A0(), aB(), abort(), Ac(), Ad(), add(), addAll() (+589 more)

### Community 1 - "Prisma WASM Compiler Edge"
Cohesion: 0.01
Nodes (416): _a(), aa(), ac(), ad(), addErrorMessage(), addField(), addItem(), addMarginSymbol() (+408 more)

### Community 2 - "Prisma Client Core"
Cohesion: 0.01
Nodes (406): #a(), aa(), ac(), Ad(), addErrorMessage(), addField(), addItem(), addMarginSymbol() (+398 more)

### Community 3 - "Prisma Client Library"
Cohesion: 0.01
Nodes (358): _a(), aa(), ac(), ad(), addErrorMessage(), addField(), addItem(), addMarginSymbol() (+350 more)

### Community 4 - "Prisma React Native Engine"
Cohesion: 0.01
Nodes (330): a(), Aa(), ac(), addErrorMessage(), addField(), addItem(), addMarginSymbol(), addSuggestion() (+322 more)

### Community 5 - "Prisma Edge ESM Runtime"
Cohesion: 0.01
Nodes (303): a(), Aa(), ac(), addErrorMessage(), addField(), addItem(), addMarginSymbol(), addSuggestion() (+295 more)

### Community 6 - "Prisma Edge Runtime"
Cohesion: 0.01
Nodes (291): a(), Aa(), ac(), addErrorMessage(), addField(), addItem(), addMarginSymbol(), addSuggestion() (+283 more)

### Community 7 - "Prisma WASM Engine Edge"
Cohesion: 0.01
Nodes (290): aa(), addErrorMessage(), addField(), addItem(), addMarginSymbol(), addSuggestion(), ae(), afterNextNewline() (+282 more)

### Community 8 - "Prisma WASM Engine"
Cohesion: 0.02
Nodes (282): _a(), aa(), addErrorMessage(), addField(), addItem(), addMarginSymbol(), addSuggestion(), ae() (+274 more)

### Community 9 - "Shared UI Components"
Cohesion: 0.01
Nodes (26): apiApproveTestimonial(), apiGetApiKeys(), apiGetNotifications(), apiGetProject(), apiGetProjects(), apiGetSubscription(), apiGetTestimonials(), apiGetUser() (+18 more)

### Community 10 - "Prisma Query Engine WASM"
Cohesion: 0.04
Nodes (35): A(), at(), b(), be(), bt(), ce(), _e(), ee() (+27 more)

### Community 11 - "Prisma Query Compiler WASM"
Cohesion: 0.07
Nodes (17): a(), F, G(), ge(), I(), J(), k(), l() (+9 more)

### Community 12 - "API v2 Architecture"
Cohesion: 0.11
Nodes (23): api_v2 NestJS App, BullMQ Queue Bootstrap, Clerk Auth Service Wiring, Config and Env Validation, Health Endpoint, NestJS Framework, Default Port 8100, Prisma via @workspace/database (+15 more)

### Community 13 - "Prisma Runtime Types"
Cohesion: 0.1
Nodes (21): _d(), AnyNull, DataLoader, DbNull, Decimal, JsonNull, MergedExtensionsList, MetricsClient (+13 more)

### Community 14 - "Prisma Service Layer"
Cohesion: 0.29
Nodes (1): PrismaService

### Community 15 - "Prisma Browser Client"
Cohesion: 0.33
Nodes (3): c(), k(), PrismaClient

### Community 16 - "Frontend API Client"
Cohesion: 0.33
Nodes (1): ApiError

### Community 17 - "Redis Service"
Cohesion: 0.33
Nodes (1): RedisService

### Community 18 - "Clerk Auth Service"
Cohesion: 0.4
Nodes (1): ClerkService

### Community 19 - "Users Controller"
Cohesion: 0.4
Nodes (1): UsersController

### Community 20 - "Users Service"
Cohesion: 0.4
Nodes (1): UsersService

### Community 21 - "Prisma Type Definitions"
Cohesion: 0.4
Nodes (4): AnyNull, DbNull, JsonNull, PrismaClient

### Community 22 - "Auth Guard (Clerk)"
Cohesion: 0.5
Nodes (1): ClerkAuthGuard

### Community 23 - "Health Check Controller"
Cohesion: 0.5
Nodes (1): HealthController

### Community 24 - "Aspect Ratio UI"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Direction Provider"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "NestJS App Module"
Cohesion: 1.0
Nodes (1): AppModule

### Community 27 - "API Entry Point"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Public Route Decorator"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Env Config Validation"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Clerk Module"
Cohesion: 1.0
Nodes (1): ClerkModule

### Community 31 - "Health Module"
Cohesion: 1.0
Nodes (1): HealthModule

### Community 32 - "Prisma Module"
Cohesion: 1.0
Nodes (1): PrismaModule

### Community 33 - "Redis Module"
Cohesion: 1.0
Nodes (1): RedisModule

### Community 34 - "Users Module"
Cohesion: 1.0
Nodes (1): UsersModule

### Community 35 - "Database Seed Script"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Build Utilities"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Color Utilities"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Toast Notifications"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Next.js Type Declarations"
Cohesion: 1.0
Nodes (0): 

### Community 40 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 41 - "Auth Proxy Middleware"
Cohesion: 1.0
Nodes (0): 

### Community 42 - "Test Config"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "User ID Decorator"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Users Service Tests"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Prisma Config"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Type Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Default Exports"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Edge Runtime Types"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Package Index"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "WASM Base64 Asset"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Payments Schema"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Testimonial Schema"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Widget Type Definitions"
Cohesion: 1.0
Nodes (0): 

### Community 54 - "Widget Types"
Cohesion: 1.0
Nodes (0): 

## Knowledge Gaps
- **43 isolated node(s):** `AppModule`, `ClerkModule`, `HealthModule`, `PrismaModule`, `RedisModule` (+38 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Aspect Ratio UI`** (2 nodes): `aspect-ratio.tsx`, `AspectRatio()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Direction Provider`** (2 nodes): `direction.tsx`, `DirectionProvider()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `NestJS App Module`** (2 nodes): `app.module.ts`, `AppModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `API Entry Point`** (2 nodes): `main.ts`, `bootstrap()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Public Route Decorator`** (2 nodes): `public.decorator.ts`, `Public()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Env Config Validation`** (2 nodes): `env.ts`, `validateApiV2Env()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Clerk Module`** (2 nodes): `clerk.module.ts`, `ClerkModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Health Module`** (2 nodes): `health.module.ts`, `HealthModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Prisma Module`** (2 nodes): `prisma.module.ts`, `PrismaModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Redis Module`** (2 nodes): `redis.module.ts`, `RedisModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Users Module`** (2 nodes): `users.module.ts`, `UsersModule`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Database Seed Script`** (2 nodes): `seed.ts`, `main()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Build Utilities`** (2 nodes): `copy-generated.js`, `copyDir()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Color Utilities`** (2 nodes): `colors.ts`, `isFreeColor()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Toast Notifications`** (1 nodes): `sonner.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Type Declarations`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Auth Proxy Middleware`** (1 nodes): `proxy.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Test Config`** (1 nodes): `vitest.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `User ID Decorator`** (1 nodes): `current-user-id.decorator.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Users Service Tests`** (1 nodes): `users.service.spec.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Prisma Config`** (1 nodes): `prisma.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Type Definitions`** (1 nodes): `default.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Default Exports`** (1 nodes): `default.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Edge Runtime Types`** (1 nodes): `edge.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Package Index`** (1 nodes): `index.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `WASM Base64 Asset`** (1 nodes): `query_compiler_fast_bg.wasm-base64.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Payments Schema`** (1 nodes): `payments.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Testimonial Schema`** (1 nodes): `testimonial.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Widget Type Definitions`** (1 nodes): `widget.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Widget Types`** (1 nodes): `widget.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `_d()` connect `Prisma Runtime Types` to `Prisma Client Library`?**
  _High betweenness centrality (0.001) - this node is a cross-community bridge._
- **What connects `AppModule`, `ClerkModule`, `HealthModule` to the rest of the system?**
  _43 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Prisma Client Binary (WASM)` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._
- **Should `Prisma WASM Compiler Edge` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._
- **Should `Prisma Client Core` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._
- **Should `Prisma Client Library` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._
- **Should `Prisma React Native Engine` be split into smaller, more focused modules?**
  _Cohesion score 0.01 - nodes in this community are weakly interconnected._