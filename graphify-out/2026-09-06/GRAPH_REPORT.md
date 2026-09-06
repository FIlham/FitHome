# Graph Report - FitHome  (2026-09-06)

## Corpus Check
- 43 files · ~21,076 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 235 nodes · 343 edges · 15 communities (9 shown, 3 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3c86352b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- routeTree.gen.ts
- dependencies
- compilerOptions
- format.ts
- devDependencies
- AGENTS.md
- $exerciseId.tsx
- FitHome Fitness Platform
- package.json
- schema.ts
- README.md
- { signIn, signUp, signOut, useSession }

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `FileRoutesByPath` - 12 edges
3. `relations` - 9 edges
4. `claimStreak()` - 8 edges
5. `auth` - 7 edges
6. `db` - 6 edges
7. `getSession` - 6 edges
8. `streakRoute` - 6 edges
9. `FitHome Fitness Platform` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Premium Payment Modal` --conceptually_related_to--> `user`  [INFERRED]
  index.html → src/db/schema.ts
- `Programs Section` --conceptually_related_to--> `exercise`  [INFERRED]
  index.html → src/db/schema.ts
- `Auth Modal (Login/Register)` --conceptually_related_to--> `auth`  [INFERRED]
  index.html → src/lib/auth.ts
- `getStreakStatusFn` --calls--> `getStreakStatus()`  [EXTRACTED]
  src/lib/streak.functions.ts → src/lib/streak.ts
- `getStreakHistoryFn` --calls--> `getStreakHistory()`  [EXTRACTED]
  src/lib/streak.functions.ts → src/lib/streak.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **FitHome Landing Composition** — index_fithome, index_hero_section, index_features_strip, index_programs_section, index_navigation_system [EXTRACTED 1.00]
- **Dashboard & Workout System Flow** — index_dashboard_user, index_workout_flow, index_programs_section, index_auth_modal [INFERRED 0.85]

## Communities (15 total, 3 thin omitted)

### Community 0 - "routeTree.gen.ts"
Cohesion: 0.06
Nodes (40): authClient, ensureSession, getSession, getRouter(), Route, Route, styles, Route (+32 more)

### Community 1 - "dependencies"
Cohesion: 0.07
Nodes (29): better-auth, @better-auth/drizzle-adapter, drizzle-orm, elysia, @elysia/eden, @elysia/openapi, dependencies, better-auth (+21 more)

### Community 2 - "compilerOptions"
Cohesion: 0.08
Nodes (24): bun, DOM, DOM.Iterable, ESNext, compilerOptions, allowImportingTsExtensions, allowJs, jsx (+16 more)

### Community 3 - "format.ts"
Cohesion: 0.42
Nodes (8): DateInput, formatCreatedAt, formatDate(), formatDateShort(), formatDateTime(), formatRelative(), formatUpdatedAt(), toDate()

### Community 4 - "devDependencies"
Cohesion: 0.11
Nodes (19): drizzle-kit, devDependencies, drizzle-kit, tsx, @types/bun, @types/node, @types/pg, @types/react (+11 more)

### Community 6 - "$exerciseId.tsx"
Cohesion: 0.13
Nodes (13): createQueryClient(), exerciseKeys, newsKeys, streakKeys, api, Route, Route, btnGhost (+5 more)

### Community 7 - "FitHome Fitness Platform"
Cohesion: 0.22
Nodes (10): Auth Modal (Login/Register), Dashboard User & System Features, Features Strip, FitHome Fitness Platform, Hero Section, Navigation System, Premium Payment Modal, Programs Section (+2 more)

### Community 8 - "package.json"
Cohesion: 0.15
Nodes (12): module, name, peerDependencies, typescript, private, scripts, build, db:generate (+4 more)

### Community 9 - "schema.ts"
Cohesion: 0.10
Nodes (32): db, account, exercise, exerciseLevels, exerciseTypes, exerciseVariations, news, relations (+24 more)

## Knowledge Gaps
- **98 isolated node(s):** `name`, `module`, `type`, `private`, `dev` (+93 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 114 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.033) - this node is a cross-community bridge._
- **Why does `Dashboard User & System Features` connect `FitHome Fitness Platform` to `$exerciseId.tsx`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **What connects `name`, `module`, `type` to the rest of the system?**
  _98 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `routeTree.gen.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05519480519480519 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.06896551724137931 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._