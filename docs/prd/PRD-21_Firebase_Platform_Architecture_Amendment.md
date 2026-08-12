# PRD-21 — Firebase Platform Architecture Amendment (Historical)

> **Canonical Technology Baseline:** TypeScript strict mode + TSX + React + Vite + Tailwind CSS + Node.js/TypeScript API + Firebase managed platform. For any platform-specific conflict, PRD-22 is authoritative.

> **Product:** NOCScheduler  
> **Document Type:** Historical Architecture Amendment  
> **Document ID:** PRD-21  
> **Status:** Superseded by PRD-22  
> **Original Decision Date:** 2026-08-13  
> **Superseded Date:** 2026-08-13  
> **Repository:** `jangangitungapah-pixel/NOCSchedulerJava`  
> **Default Timezone:** Asia/Jakarta  
> **Default Currency:** IDR

---

# 1. Status and precedence

PRD-21 is retained only as **historical architecture context**.

Its original decision removed the PostgreSQL/Drizzle/Docker/self-managed-server baseline and moved NOCScheduler to a managed Firebase platform. That product direction remains valid: the owner does not need to operate a dedicated VM, database server, Nginx host, or Docker-based production environment.

However, the original PRD-21 implementation selected **Next.js + Firebase App Hosting**. That framework choice is no longer canonical.

Effective immediately, **PRD-22 — TypeScript, TSX, Node.js, Vite, Tailwind & Firebase Managed Platform Rebaseline** supersedes PRD-21 and every conflicting platform-specific statement in PRD-01 through PRD-20.

If this document conflicts with PRD-22, **PRD-22 wins**.

---

# 2. Decisions retained from PRD-21

The following decisions remain in force unless PRD-22 explicitly changes their implementation detail:

- production must not require a self-managed application server;
- production persistence remains Cloud Firestore;
- Firebase Authentication remains the identity provider;
- Firebase Admin SDK remains the privileged server adapter;
- Firebase Local Emulator Suite remains the default local/CI platform for Firebase-dependent integration tests;
- Firestore rules are fail-closed by default for business-critical direct client writes;
- high-risk scheduling, payroll, access-control, audit, and historical mutations remain server-authoritative;
- business invariants remain mandatory even when Firestore cannot enforce SQL-style foreign keys or unique constraints;
- historical data remains append/version/snapshot oriented;
- production secrets must use managed secret/environment facilities and must never be committed;
- no Docker/PostgreSQL prerequisite is required for normal development;
- Firestore indexes and security rules remain version controlled.

---

# 3. Decisions removed from PRD-21

The following PRD-21 implementation choices are explicitly retired:

- Next.js as the frontend/full-stack framework;
- Next.js App Router;
- Next.js Server Components;
- Next.js Route Handlers;
- Next.js Server Actions;
- Firebase App Hosting as the required Next.js hosting path;
- any assumption that frontend rendering and authoritative backend logic must live in the same Next.js runtime.

---

# 4. Replacement direction

The replacement architecture is defined in PRD-22 and uses this logical split:

```text
Browser
  → React + TypeScript/TSX SPA
  → Vite build/runtime tooling
  → Tailwind CSS design-system implementation
  → Firebase Hosting
      ├─ SPA route fallback
      └─ /api/* rewrite
           ↓
     Node.js/TypeScript API on managed Firebase/Google Cloud runtime
           ↓
     Firebase Admin SDK
           ↓
     Cloud Firestore

Browser authentication
  → Firebase Authentication

Local development / CI
  → Vite dev server
  → Node.js/TypeScript API runtime
  → Firebase Local Emulator Suite
```

The frontend and backend are separate architectural layers even when deployed under one Firebase project and one public origin.

---

# 5. Historical business invariants

The architecture migration does **not** weaken any product requirement from PRD-01 through PRD-20.

The following remain non-negotiable:

- one primary work state per employee/work date;
- cross-midnight shift correctness;
- published schedule as authoritative payroll input where defined;
- deterministic payroll;
- integer IDR money handling;
- effective-dated configuration;
- immutable/versioned historical facts;
- explicit optimistic concurrency for mutable records;
- idempotency for dangerous duplicate mutations;
- append-oriented audit evidence;
- server-side authorization for protected actions;
- Light/Dark theme parity;
- first-class desktop and mobile UX;
- visual quality and alignment gates;
- deterministic automated regression coverage.

---

# 6. Implementation note

PRD-21 must not be used by implementation agents as a source for Next.js-specific code generation.

When an implementation task references PRD-21, the agent must resolve the current platform through PRD-22 first.

---

# 7. Acceptance

PRD-21 is considered correctly superseded when:

1. PRD-22 exists and is treated as the highest-precedence platform architecture document;
2. implementation no longer requires Next.js;
3. Firebase remains managed infrastructure rather than a self-hosted runtime dependency;
4. future work uses TypeScript/TSX + React + Vite + Tailwind on the client and TypeScript + Node.js on the server;
5. existing business, security, historical, UX, and QA requirements continue to apply.
