# Graph Report - FitHome  (2026-09-05)

## Corpus Check
- 38 files · ~17,182 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 228 nodes · 315 edges · 17 communities (11 shown, 3 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.83)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3c86352b`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- routeTree.gen.ts
- dependencies
- compilerOptions
- login.tsx
- devDependencies
- FitHome Fitness Platform
- $exerciseId.tsx
- schema.ts
- package.json
- streak.ts
- opencode.json
- graphify.js
- { signIn, signUp, signOut, useSession }
- latihan.tsx

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 20 edges
2. `FileRoutesByPath` - 12 edges
3. `relations` - 9 edges
4. `claimStreak()` - 8 edges
5. `auth` - 7 edges
6. `FitHome Fitness Platform` - 7 edges
7. `getSession` - 6 edges
8. `streakRoute` - 6 edges
9. `graphify` - 6 edges
10. `scripts` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Premium Payment Modal` --conceptually_related_to--> `user`  [INFERRED]
  index.html → src/db/schema.ts
- `Programs Section` --conceptually_related_to--> `exercise`  [INFERRED]
  index.html → src/db/schema.ts
- `Auth Modal (Login/Register)` --conceptually_related_to--> `auth`  [INFERRED]
  index.html → src/lib/auth.ts
- `homefit` --semantically_similar_to--> `FitHome Fitness Platform`  [INFERRED] [semantically similar]
  README.md → index.html
- `graphify` --conceptually_related_to--> `homefit`  [INFERRED]
  AGENTS.md → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **FitHome Landing Composition** — index_fithome, index_hero_section, index_features_strip, index_programs_section, index_navigation_system [EXTRACTED 1.00]
- **Dashboard & Workout System Flow** — index_dashboard_user, index_workout_flow, index_programs_section, index_auth_modal [INFERRED 0.85]

## Communities (17 total, 3 thin omitted)

### Community 0 - "routeTree.gen.ts"
Cohesion: 0.06
Nodes (35): ensureSession, getSession, getRouter(), Route, Route, Route, TABS, Route (+27 more)

### Community 1 - "dependencies"
Cohesion: 0.07
Nodes (27): better-auth, @better-auth/drizzle-adapter, drizzle-orm, elysia, @elysia/eden, @elysia/openapi, dependencies, better-auth (+19 more)

### Community 2 - "compilerOptions"
Cohesion: 0.08
Nodes (24): bun, DOM, DOM.Iterable, ESNext, compilerOptions, allowImportingTsExtensions, allowJs, jsx (+16 more)

### Community 3 - "login.tsx"
Cohesion: 0.24
Nodes (5): authClient, Route, styles, Route, styles

### Community 4 - "devDependencies"
Cohesion: 0.11
Nodes (19): drizzle-kit, devDependencies, drizzle-kit, tsx, @types/bun, @types/node, @types/pg, @types/react (+11 more)

### Community 5 - "FitHome Fitness Platform"
Cohesion: 0.11
Nodes (17): Community Structure, God Nodes, graphify, Graphify Query, Graphify Update, Auth Modal (Login/Register), Dashboard User & System Features, Features Strip (+9 more)

### Community 6 - "$exerciseId.tsx"
Cohesion: 0.18
Nodes (8): api, btnGhost, btnPrimary, btnSec, Exercise, Phase, Route, App

### Community 7 - "schema.ts"
Cohesion: 0.24
Nodes (12): account, exercise, exerciseLevels, exerciseTypes, exerciseVariations, relations, session, streakLog (+4 more)

### Community 8 - "package.json"
Cohesion: 0.15
Nodes (12): module, name, peerDependencies, typescript, private, scripts, build, db:generate (+4 more)

### Community 9 - "streak.ts"
Cohesion: 0.20
Nodes (16): db, auth, getExercise, calcDailyPoint(), ClaimResult, claimStreak(), diffDaysWIB(), getStreakHistoryFn (+8 more)

### Community 10 - "opencode.json"
Cohesion: 0.50
Nodes (3): plugin, $schema, .opencode/plugins/graphify.js

## Knowledge Gaps
- **99 isolated node(s):** `name`, `module`, `type`, `private`, `dev` (+94 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 118 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Dashboard User & System Features` connect `FitHome Fitness Platform` to `routeTree.gen.ts`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **What connects `name`, `module`, `type` to the rest of the system?**
  _99 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `routeTree.gen.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05803921568627451 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `devDependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._