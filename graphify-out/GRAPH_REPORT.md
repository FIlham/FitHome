# Graph Report - FitHome  (2026-09-06)

## Corpus Check
- 44 files · ~17,370 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 284 nodes · 441 edges · 24 communities (15 shown, 6 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f85d6730`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- routeTree.gen.ts
- dependencies
- compilerOptions
- ai-coach.tsx
- devDependencies
- AGENTS.md
- $exerciseId.tsx
- FitHome Fitness Platform
- package.json
- schema.ts
- README.md
- gym/-route.ts
- { signIn, signUp, signOut, useSession }
- auth-client.ts
- getSession
- gym.tsx
- router.tsx
- $.tsx
- index.tsx
- FileRoutesByPath
- __root.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `FileRoutesByPath` - 17 edges
3. `relations` - 9 edges
4. `formatRelative()` - 9 edges
5. `getSession` - 8 edges
6. `auth` - 8 edges
7. `claimStreak()` - 8 edges
8. `api` - 8 edges
9. `db` - 6 edges
10. `streakRoute` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Premium Payment Modal` --conceptually_related_to--> `user`  [INFERRED]
  index.html → src/db/schema.ts
- `Programs Section` --conceptually_related_to--> `exercise`  [INFERRED]
  index.html → src/db/schema.ts
- `Auth Modal (Login/Register)` --conceptually_related_to--> `auth`  [INFERRED]
  index.html → src/lib/auth.ts
- `RouteComponent()` --calls--> `formatDate()`  [EXTRACTED]
  src/routes/_protected/streak.tsx → src/lib/format.ts
- `RouteComponent()` --calls--> `formatRelative()`  [EXTRACTED]
  src/routes/_protected/news/$newsId.tsx → src/lib/format.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **FitHome Landing Composition** — index_fithome, index_hero_section, index_features_strip, index_programs_section, index_navigation_system [EXTRACTED 1.00]
- **Dashboard & Workout System Flow** — index_dashboard_user, index_workout_flow, index_programs_section, index_auth_modal [INFERRED 0.85]

## Communities (24 total, 6 thin omitted)

### Community 0 - "routeTree.gen.ts"
Cohesion: 0.07
Nodes (28): AdminRoute, ApiSplatRoute, AuthLoginRoute, AuthRegisterRoute, AuthRoute, AuthRouteChildren, AuthRouteWithChildren, FileRoutesByFullPath (+20 more)

### Community 1 - "dependencies"
Cohesion: 0.06
Nodes (35): better-auth, @better-auth/drizzle-adapter, drizzle-orm, elysia, @elysia/eden, @elysia/openapi, dependencies, better-auth (+27 more)

### Community 2 - "compilerOptions"
Cohesion: 0.08
Nodes (24): bun, DOM, DOM.Iterable, ESNext, compilerOptions, allowImportingTsExtensions, allowJs, jsx (+16 more)

### Community 3 - "ai-coach.tsx"
Cohesion: 0.38
Nodes (4): FallbackMarkdown(), Markdown(), parseInline(), Route

### Community 4 - "devDependencies"
Cohesion: 0.11
Nodes (19): drizzle-kit, devDependencies, drizzle-kit, tsx, @types/bun, @types/node, @types/pg, @types/react (+11 more)

### Community 6 - "$exerciseId.tsx"
Cohesion: 0.11
Nodes (25): DateInput, formatCreatedAt, formatDate(), formatDateShort(), formatDateTime(), formatRelative(), formatUpdatedAt(), toDate() (+17 more)

### Community 7 - "FitHome Fitness Platform"
Cohesion: 0.22
Nodes (10): Auth Modal (Login/Register), Dashboard User & System Features, Features Strip, FitHome Fitness Platform, Hero Section, Navigation System, Premium Payment Modal, Programs Section (+2 more)

### Community 8 - "package.json"
Cohesion: 0.15
Nodes (12): module, name, peerDependencies, typescript, private, scripts, build, db:generate (+4 more)

### Community 9 - "schema.ts"
Cohesion: 0.11
Nodes (32): db, account, exercise, exerciseLevels, exerciseTypes, exerciseVariations, news, relations (+24 more)

### Community 11 - "gym/-route.ts"
Cohesion: 0.43
Nodes (6): bodySchema, buildOverpassQuery(), gymRoute, haversineKm(), OverpassElement, queryOverpass()

### Community 16 - "auth-client.ts"
Cohesion: 0.24
Nodes (5): authClient, Route, styles, Route, styles

### Community 17 - "getSession"
Cohesion: 0.36
Nodes (5): ensureSession, getSession, Route, Route, Route

### Community 18 - "gym.tsx"
Cohesion: 0.40
Nodes (3): GymItem, Loc, Route

### Community 19 - "router.tsx"
Cohesion: 0.50
Nodes (3): getRouter(), Register, routeTree

### Community 22 - "FileRoutesByPath"
Cohesion: 0.22
Nodes (7): Route, Route, Route, Route, Route, FileRoutesById, FileRoutesByPath

## Knowledge Gaps
- **116 isolated node(s):** `name`, `module`, `type`, `private`, `dev` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 135 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `Dashboard User & System Features` connect `FitHome Fitness Platform` to `$exerciseId.tsx`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `name`, `module`, `type` to the rest of the system?**
  _116 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `routeTree.gen.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._