# OrbitMod V5 — Independent Repository & Library Analysis (Stage 1)

This research document evaluates candidate tools and libraries for **OrbitMod V5** ("The Four Dots": Avis, Scout, Quill, Relay) and shared infrastructure. In accordance with the non-negotiable rules:
1. **Reuse the existing Orbit stack**: Next.js 16 (App Router), TypeScript, Prisma ORM, PostgreSQL, Zod, Tailwind CSS v4, Lucide React, NextAuth v5, Supabase SSR/Storage/Realtime, Vitest.
2. **Deterministic First**: Logic that can be executed via pure code (permissions, state machines, matching scores, routing tables, DNS TXT verification) is implemented in plain TypeScript.
3. **AI Advisory Only**: AI never sets states to `VERIFIED`, never alters permissions, and never makes hiring decisions.
4. **License Compliance**: GPL/AGPL tools are flagged and will NEVER be vendored or linked into the Next.js application server.
5. **No Placeholders & Real Verification**: Every candidate package was verified against real package registries (npm/PyPI) and official documentation.

---

## 1. Shared Infrastructure Candidates

| Candidate / Repo | Purpose & Codebase Usage | License | Maintenance & Health | Runtime Fit | Security & Operational Cost | Verdict & One-Line Reason |
|---|---|---|---|---|---|---|
| **shadcn/ui**<br>[shadcn-ui/ui](https://github.com/shadcn-ui/ui) | Copy-paste Tailwind UI component primitives | MIT | Active (~80k+ stars), high release frequency | TypeScript / React 19 / Tailwind | Zero runtime overhead; code lives in repo (`src/components/ui`) | **ADOPT (EXISTING)**: Orbit already uses custom Tailwind primitives in `src/components/ui/`; continue using and extending them. |
| **TanStack Query**<br>[TanStack/query](https://github.com/TanStack/query) | Client-side cache, optimistic updates, query sync | MIT | v5.104.4, very active (~45k+ stars) | TypeScript / React 19 | Client-side memory cache; small bundle | **OPTIONAL-LATER**: App Router Server Components + `useRouter` / React Server Actions currently handle data fetching cleanly without extra bundle size. |
| **Zod**<br>[colinhacks/zod](https://github.com/colinhacks/zod) | Schema validation for API payloads, forms, AI schemas | MIT | v4.6.7 (installed), v3.24.x LTS | TypeScript / Node | Zero native dependencies; high performance | **ADOPT (EXISTING)**: Already the platform standard in `src/lib/validation/schemas.ts`. |
| **XState**<br>[statelyai/xstate](https://github.com/statelyai/xstate) | Formal finite state machines for verification, attempts, community notes | MIT | v5.33.3, active (~28k+ stars) | TypeScript / Node | Minimal overhead; pure deterministic transitions | **USE-ALTERNATIVE**: Lightweight pure-function state transition tables in TypeScript (`transition(state, event): nextState`) provide type safety without adding 50KB runtime dependency. |
| **CASL**<br>[stalniy/casl](https://github.com/stalniy/casl) | Isomorphic ability/permission rules | MIT | v7.0.2, stable (~6k stars) | TypeScript / Node | In-memory evaluation | **USE-ALTERNATIVE**: Orbit already has a centralized, battle-tested `can(user, capability)` capability system in `src/lib/auth/permissions.ts`. Extending it maintains consistency. |
| **BullMQ**<br>[taskforcesh/bullmq](https://github.com/taskforcesh/bullmq) | Redis-backed distributed task queue | MIT | v6.3.16, very active (~8k stars) | TypeScript / Node | Requires Redis server; operational cost & infrastructure | **SKIP (FOR V5)**: Orbit has no Redis instance configured; adding Redis violates rule #1. |
| **Inngest**<br>[inngest/inngest](https://github.com/inngest/inngest) | Serverless event-driven background workflow engine | Apache-2.0 | v4.24.0, active | TypeScript / Next.js | Cloud coordinator or local dev server; API keys needed | **OPTIONAL-LATER**: Excellent for long-running workflows, but introduces external service dependency. |
| **Trigger.dev**<br>[triggerdotdev/trigger.dev](https://github.com/triggerdotdev/trigger.dev) | Background jobs and workflows framework | MIT | v4.7.4, active (~10k stars) | TypeScript / Node | Cloud/self-hosted engine | **SKIP**: Heavy setup compared to Next.js background execution for V5. |
| **pgvector / pgvector-node**<br>[pgvector/pgvector](https://github.com/pgvector/pgvector) | Vector similarity search extension for PostgreSQL | PostgreSQL / MIT | Active, standard in Supabase/PostgreSQL | SQL / Node (`pgvector` v0.3.0) | Requires `CREATE EXTENSION vector` in Postgres | **OPTIONAL-LATER**: Reserved behind feature flag for Scout vector search. Tag overlap (Jaccard) is the default requirement. |
| **Vercel AI SDK**<br>[vercel/ai](https://github.com/vercel/ai) | Unified AI interface, streaming, structured outputs | Apache-2.0 | v7.0.143, very active (~15k stars) | TypeScript / Next.js | Pluggable providers (`@ai-sdk/openai`, `@ai-sdk/anthropic`) | **ADOPT**: Industry standard for Next.js App Router; provides native Zod schema parsing (`generateObject`), timeouts, and retries. |
| **Anthropic TS SDK**<br>[anthropics/anthropic-sdk-typescript](https://github.com/anthropics/anthropic-sdk-typescript) | Direct Anthropic Claude API client | MIT | v0.135.0, active | TypeScript / Node | Requires `ANTHROPIC_API_KEY` | **USE-ALTERNATIVE**: Connect Anthropic via Vercel AI SDK adapter in `src/lib/ai/` rather than coupling codebase to a single vendor. |
| **LiteLLM**<br>[BerriAI/litellm](https://github.com/BerriAI/litellm) | Multi-model proxy gateway | MIT | Active (~18k stars) | Python | Requires Python runtime/proxy process | **SKIP**: Avoid adding a Python microservice when Next.js API route adapter does this in-process. |
| **Langfuse**<br>[langfuse/langfuse](https://github.com/langfuse/langfuse) | Open source LLM observability and tracing | MIT / FSL | v3.39.2, active | TypeScript / REST | Requires self-hosted or cloud Langfuse instance | **SKIP (FOR V5)**: Custom lightweight internal audit logger (`AuditLog` model) tracks prompts/tokens without leaking private text or requiring external services. |
| **Faker-js**<br>[faker-js/faker](https://github.com/faker-js/faker) | Deterministic mock/seed data generation | MIT | v10.6.0, active (~16k stars) | TypeScript / Node | Dev dependency only; zero production footprint | **ADOPT**: Ideal for generating realistic, clearly-labelled "DEMO / simulated" test data in `scripts/seed-demo.ts`. |

*Simplest thing that could work (Shared)*:
- State machines: Pure TypeScript discriminated unions with a transition lookup table.
- Queue/Background jobs: Database-backed jobs table with Next.js route handlers / `after()` or idempotent sync-on-demand processing.

---

## 2. AVIS (Trust & Verification) Candidates

| Candidate / Repo | Purpose & Codebase Usage | License | Maintenance & Health | Runtime Fit | Security & Operational Cost | Verdict & One-Line Reason |
|---|---|---|---|---|---|---|
| **Node built-in `dns.promises`**<br>`node:dns/promises` | DNS TXT record resolution for domain verification challenges | Built-in (Node.js) | Native LTS standard | Native Node.js | Zero install size, zero network services, zero external attack surface | **ADOPT**: Perfectly solves domain challenge resolution (`resolveTxt`) with no added dependencies. |
| **tldts**<br>[remusao/tldts](https://github.com/remusao/tldts) | Extract root domains, subdomains, and public suffixes from URLs | MIT | v7.4.18, highly active (~1k stars) | TypeScript / Node | Fast in-memory Public Suffix List parser | **ADOPT**: Fast, accurate root domain parsing to prevent subdomains (e.g. `google.com.attacker.io`) from spoofing verified organizations. |
| **dnstwist**<br>[elceef/dnstwist](https://github.com/elceef/dnstwist) | Domain permutation engine for look-alike & homoglyph detection | **GPL-3.0** | Active (~6k stars) | Python | **GPL license constraint**: Cannot be included in app code. Heavy python dependencies. | **USE-ALTERNATIVE**: Build a pure TypeScript homoglyph normalizer + Damerau-Levenshtein distance algorithm. Zero licensing issues, zero Python overhead. |
| **URLhaus API**<br>[urlhaus.abuse.ch](https://urlhaus.abuse.ch/api/) | Free database of malicious URLs and phishing domains | Open / Free | Actively maintained by abuse.ch community | REST API | Free community API; rate limited; requires outbound HTTPS | **ADOPT**: Excellent free, privacy-preserving lookup for known malicious URLs in job postings. Fall back gracefully to `NEEDS_REVIEW` on timeout. |
| **Google Safe Browsing**<br>[Google Safe Browsing](https://developers.google.com/safe-browsing) | Check URLs against Google's lists of unsafe web resources | Proprietary API | Google Cloud production API | REST API | Requires GCP API key; quotas apply | **OPTIONAL-LATER**: URLhaus provides zero-cost setup; Safe Browsing can be enabled if GCP key is configured in `.env`. |
| **VirusTotal**<br>[virustotal.com](https://docs.virustotal.com) | URL and file reputation aggregator | Proprietary API | Active, enterprise standard | REST API | Free tier limited to 4 requests/min; enterprise is costly | **OPTIONAL-LATER**: Rate limits too restrictive for high-frequency checks without paid plan. |
| **file-type**<br>[sindresorhus/file-type](https://github.com/sindresorhus/file-type) | Detect file type from magic bytes in Buffer/Uint8Array | MIT | v22.2.0, active (~4k stars) | TypeScript / Node (ESM) | Validates true MIME types, preventing extension spoofing | **ADOPT**: Essential for secure upload verification of PDF, PNG, JPEG, and ZIP artifacts. |
| **ClamAV / clamscan**<br>[kylefarris/clamscan](https://github.com/kylefarris/clamscan) | Node.js wrapper for ClamAV antivirus engine | MIT (clamscan), **GPL-2.0 (ClamAV)** | v2.4.0, stable | Node wrapper / C daemon | Requires native ClamAV daemon (`clamd`) running on host or Docker | **USE-ALTERNATIVE**: Provide an abstract `MalwareScanner` interface with a deterministic signature/extension checker for dev/test and optional ClamAV adapter for production. |
| **C2PA**<br>[contentauth/c2pa-rs](https://github.com/contentauth/c2pa-rs) | Read-only provenance metadata extraction for digital content | MIT / Apache-2.0 | Active (Content Authenticity Initiative) | Rust native / Python / WASM | Native Rust compilation required for Node; binary overhead | **SKIP (DEFAULT OFF)**: Flagged off per specification. UI copy rule strictly enforced ("Provenance data present and valid / not available"). |

*Simplest thing that could work (AVIS)*:
- DNS Verification: Native Node `dns.promises.resolveTxt`.
- Look-alike detection: 30-line pure TypeScript Levenshtein distance + Unicode homoglyph mapping table.
- Malware scanning hook: Abstract interface verifying magic bytes + size limits + dangerous script content, delegatable to external ClamAV daemon when configured.

---

## 3. SCOUT (Discovery, Matching & Teams) Candidates

| Candidate / Repo | Purpose & Codebase Usage | License | Maintenance & Health | Runtime Fit | Security & Operational Cost | Verdict & One-Line Reason |
|---|---|---|---|---|---|---|
| **ESCO Skills Taxonomy**<br>[esco.ec.europa.eu](https://esco.ec.europa.eu/) | Standardized European taxonomy of skills and occupations | Open Data (CC BY 4.0) | Standard EU classification (~13.8k skills) | Data / JSON | Static data asset | **ADOPT (CURATED SUBSET)**: Seed a curated subset of ~300 common tech/design/business skills in Prisma `Skill` model to enable exact and alias matching. |
| **O\*NET Database**<br>[onetcenter.org](https://www.onetcenter.org/database.html) | US occupational taxonomy & descriptor system | CC BY 4.0 | US Dept of Labor, updated regularly | Data / CSV | Static data asset | **USE-ALTERNATIVE**: ESCO's hierarchical skill format is cleaner for JSON seeding than O\*NET. |
| **transformers.js**<br>[xenova/transformers.js](https://github.com/xenova/transformers.js) | Run Hugging Face Transformer models directly in Node.js/browser | Apache-2.0 | v2.17.2 (HuggingFace v3 active) | TypeScript / WASM / ONNX | Downloads ~100MB+ model weights (`MiniLM-L12-v2`); high memory usage | **OPTIONAL-LATER**: Reserved behind feature flag. The blueprint and prompt mandate deterministic tag overlap first. |
| **sentence-transformers**<br>[UKPLab/sentence-transformers](https://github.com/UKPLab/sentence-transformers) | Python framework for state-of-the-art sentence embeddings | Apache-2.0 | Active (~15k stars) | Python | Requires Python runtime, PyTorch, GPU or large CPU footprint | **SKIP**: Introduces Python service dependency when pure TypeScript default is required. |
| **OR-Tools**<br>[google/or-tools](https://github.com/google/or-tools) | Combinatorial optimization suite (Hungarian algorithm, MIP) | Apache-2.0 | Active (~17k stars) | C++ with Python/Java/C# wrappers, unofficial Node | Heavy native binary bindings; complex build process | **USE-ALTERNATIVE**: A deterministic greedy bipartite matching algorithm in pure TypeScript (<60 lines) matches candidates to project slots with zero dependencies. |

*Simplest thing that could work (SCOUT)*:
- Matching Score Formula: Exact pure TypeScript implementation of the formula:
  `0.35 * skillCoverage + 0.25 * availabilityOverlap + 0.20 * interestMatch + 0.10 * timezoneCompat + 0.10 * verifiedEvidence`
- Explanation: Built deterministically directly from score breakdown without LLM hallucination risk.
- Team Slot Assignment: Pure TypeScript greedy assignment algorithm ensuring no candidate is placed in two slots.

---

## 4. QUILL (Skills, Assessments & Evidence) Candidates

| Candidate / Repo | Purpose & Codebase Usage | License | Maintenance & Health | Runtime Fit | Security & Operational Cost | Verdict & One-Line Reason |
|---|---|---|---|---|---|---|
| **CodeMirror 6**<br>[codemirror/dev](https://github.com/codemirror/dev) | Extensible code/text editor for submissions and SQL tasks | MIT | Active (~17k stars), modular | TypeScript / React | Lightweight (~300KB), fast startup, mobile-friendly | **ADOPT**: Ideal lightweight editor for candidate code/SQL submissions without the massive bundle of Monaco. |
| **Monaco Editor**<br>[microsoft/monaco-editor](https://github.com/microsoft/monaco-editor) | VS Code browser editor | MIT | v4.7.0 (`@monaco-editor/react`), active | TypeScript / Webpack | Very large bundle (~5-10MB), worker config challenges in Next.js Turbopack | **USE-ALTERNATIVE**: CodeMirror 6 is 90% lighter and works seamlessly in Next.js Turbopack. |
| **Tiptap**<br>[ueberdosis/tiptap](https://github.com/ueberdosis/tiptap) | Headless rich-text editor based on ProseMirror | MIT | v3.32.0, very active (~25k stars) | TypeScript / React | Highly modular; outputs clean Markdown/JSON | **ADOPT**: Best-in-class editor for Artifact task A (document, memo, design submission). |
| **DuckDB WASM / Node**<br>[duckdb/duckdb-wasm](https://github.com/duckdb/duckdb-wasm) | In-process analytical SQL engine for assessment task B | MIT | v1.33.1 (WASM), v1.4.4 (Node) | WASM / C++ | Can run isolated in browser or worker with external file access completely disabled | **OPTIONAL-LATER**: Candidate task A (Artifact tasks) is the mandatory MVP requirement; DuckDB can be plugged in for SQL assessments. |
| **Pyodide**<br>[pyodide/pyodide](https://github.com/pyodide/pyodide) | Python WebAssembly environment | **MPL-2.0** | v314.0.7, active | WASM / Python | 20MB+ download; high CPU/memory; potential client crash risk | **SKIP**: Non-negotiable rule specifies: "Do NOT execute arbitrary candidate code in the app. Default: no code execution." |
| **Sandboxes: Judge0 / E2B / Piston** | Remote code execution sandboxes | Mixed (Judge0: GPLv3, E2B: Apache-2.0) | Active | External HTTP API | Paid cloud service or complex Docker cluster; high operational attack surface | **SKIP (DEFAULT NOT BUILT)**: Explicitly forbidden by prompt: "Do NOT execute arbitrary candidate code in the app... Default: not built." |
| **promptfoo**<br>[promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | CLI & library for testing and evaluating LLM outputs & prompt injection | MIT | v0.124.1, active (~5k stars) | TypeScript / Node | Runs locally in CI/Vitest without cloud dependency | **ADOPT**: Perfect fit for verifying Quill AI grading schemas, fallback paths, and prompt-injection defense. |
| **DeepEval**<br>[confident-ai/deepeval](https://github.com/confident-ai/deepeval) | LLM evaluation framework | Apache-2.0 | Active (~4k stars) | Python | Requires Python environment | **USE-ALTERNATIVE**: `promptfoo` runs natively in our Node/TypeScript test harness. |
| **JPlag**<br>[jplag/JPlag](https://github.com/jplag/JPlag) | Software plagiarism detection | **GPL-3.0** | Active (~2k stars) | Java | **GPL license constraint**: Requires JVM service; cannot be embedded in Node | **USE-ALTERNATIVE**: Pure TypeScript text shingling (n-gram Jaccard similarity) flags candidate submission overlap to human reviewers safely without Java or GPL. |

*Simplest thing that could work (QUILL)*:
- Editor: Clean Markdown / rich text input via Tiptap or structured textarea for Artifact task A.
- Similarity Check: 40-line n-gram text shingling algorithm comparing submission tokens against existing submissions in the database.
- AI Review: Vercel AI SDK `generateObject` with strict Zod schema enforcing `evidenceQuote` substring validation.

---

## 5. RELAY (Community, Messaging, Safety & Community Notes) Candidates

| Candidate / Repo | Purpose & Codebase Usage | License | Maintenance & Health | Runtime Fit | Security & Operational Cost | Verdict & One-Line Reason |
|---|---|---|---|---|---|---|
| **Supabase Realtime**<br>[supabase/realtime](https://github.com/supabase/realtime) | Realtime WebSocket updates for chat & notifications | Apache-2.0 | Native in `@supabase/supabase-js` (already installed) | TypeScript / Browser / Server | Already configured in `src/lib/supabase/realtime.ts`; zero additional servers | **ADOPT (EXISTING)**: Satisfies non-negotiable rule #1 (reuse existing Orbit stack). |
| **Socket.IO**<br>[socketio/socket.io](https://github.com/socketio/socket.io) | Standalone WebSocket server | MIT | v4.8.4, active | Node.js | Requires dedicated Node.js stateful server process (incompatible with serverless Next.js deployment) | **SKIP**: Supabase Realtime already handles WebSocket multiplexing without dedicated server infrastructure. |
| **Centrifugo**<br>[centrifugal/centrifugo](https://github.com/centrifugal/centrifugo) | Realtime messaging engine | Apache-2.0 | Active (~8k stars) | Go binary | Separate daemon required | **SKIP**: Redundant with Supabase Realtime. |
| **rate-limiter-flexible**<br>[animir/node-rate-limiter-flexible](https://github.com/animir/node-rate-limiter-flexible) | In-memory and Postgres rate limiter for API & messages | ISC | v11.2.3, active (~2.5k stars) | TypeScript / Node | Works with local memory, Prisma/Postgres, or Redis; zero external services | **ADOPT**: Ideal for message bursts, invite throttling, and verification attempt rate-limiting. |
| **@upstash/ratelimit**<br>[upstash/ratelimit-js](https://github.com/upstash/ratelimit-js) | Serverless rate limiter using Upstash Redis | MIT | v2.2.0, active | TypeScript / Edge | Requires Upstash Redis account and REST credentials | **USE-ALTERNATIVE**: `rate-limiter-flexible` with Postgres/in-memory storage avoids external SaaS dependency. |
| **DOMPurify / isomorphic-dompurify**<br>[cure53/DOMPurify](https://github.com/cure53/DOMPurify) | Sanitize HTML and prevent XSS in community posts and markdown | MIT / Apache-2.0 | v4.6.0 (`isomorphic-dompurify`), active | TypeScript / Node & Browser | Thoroughly tested security library for XSS defense | **ADOPT**: Essential for sanitizing user-submitted post markdown on both server API ingestion and client render. |
| **linkify-it**<br>[markdown-it/linkify-it](https://github.com/markdown-it/linkify-it) | Fast, RFC-compliant URL extraction from raw message text | MIT | v6.1.0, active (~1k stars) | TypeScript / Node | Fast regex engine recognizing valid TLDs | **ADOPT**: Detects URLs in messages and posts for SSRF safety screening and malicious domain detection. |
| **react-markdown**<br>[remarkjs/react-markdown](https://github.com/remarkjs/react-markdown) | Render markdown safely into React elements | MIT | v10.1.0, very active (~13k stars) | TypeScript / React | Safe AST-based rendering | **ADOPT**: Standard React markdown renderer for Space posts, community notes, and assessment instructions. |
| **OpenAI Moderation API**<br>[platform.openai.com/docs/guides/moderation](https://platform.openai.com/docs/guides/moderation) | Automated content safety screening (hate, harassment, self-harm) | Commercial API | Free tier available via OpenAI API | REST API | Outbound API call; privacy policy must allow content moderation | **ADOPT (OPTIONAL FALLBACK)**: Free API for ambiguous messages, with deterministic regex/rules as primary barrier. |
| **Microsoft Presidio**<br>[microsoft/presidio](https://github.com/microsoft/presidio) | PII detection and anonymization | MIT | Active (~3k stars) | Python | Requires Python runtime and spaCy models | **USE-ALTERNATIVE**: Pure TypeScript regex-based PII mask (emails, phone numbers, Aadhaar/SSN patterns, credit cards) runs in-process with 0ms latency and no Python service. |
| **Detoxify**<br>[unitaryai/detoxify](https://github.com/unitaryai/detoxify) | Deep learning toxic comment classifier | Apache-2.0 | Stable | Python / PyTorch | Heavy model inference | **SKIP**: Rules-first + OpenAI moderation/LLM classifier is faster and requires no GPU. |
| **Postgres ltree**<br>[PostgreSQL ltree](https://www.postgresql.org/docs/current/ltree.html) | Hierarchical tree data structure extension | PostgreSQL | Core Postgres contrib extension | SQL / Postgres | Requires Postgres extension | **USE-ALTERNATIVE**: Orbit already models nested comments cleanly using `CommunityComment` self-referential `parentId`. |
| **Novu**<br>[novuhq/novu](https://github.com/novuhq/novu) | Open source notification infrastructure | MIT | Active (~35k stars) | TypeScript / Service | Heavy self-hosted multi-container stack or cloud SaaS | **SKIP**: Orbit already has native `Notification` table and Supabase Realtime alerts. |

*Simplest thing that could work (RELAY)*:
- Message Routing Engine: Single pure TypeScript function implementing the 7-step priority order (Block -> Contact Policy -> Rate Limit -> Link Quarantine -> Classifier Review -> Promotion Settings -> Deliver).
- PII Redaction: Deterministic regex scrubbing for emails, phone numbers, and payment identifiers prior to passing any text to external models.
- Community Notes: Status machine (`SUBMITTED` -> `EVIDENCE_CHECK` -> `NEEDS_REVIEW` -> `PUBLISHED_CONTEXT` / `REJECTED`) with moderator approval gate.

---

## 6. Testing & Security Candidates

| Candidate / Repo | Purpose & Codebase Usage | License | Maintenance & Health | Runtime Fit | Security & Operational Cost | Verdict & One-Line Reason |
|---|---|---|---|---|---|---|
| **Vitest**<br>[vitest-dev/vitest](https://github.com/vitest-dev/vitest) | Fast unit and integration test runner | MIT | v5.0.5 (installed), active | TypeScript / Node | Already configured and passing (75/75 tests) | **ADOPT (EXISTING)**: Platform standard for all unit, permission, and API route tests. |
| **Playwright**<br>[microsoft/playwright](https://github.com/microsoft/playwright) | End-to-end browser automation & acceptance testing | Apache-2.0 | v1.64.1, very active (~68k stars) | TypeScript / Node | Standard browser test runner | **ADOPT**: Run E2E tests for the critical acceptance flow (Space -> Opportunity -> Avis -> Scout -> Quill -> Evidence -> Team -> Relay). |
| **promptfoo**<br>[promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | Automated prompt security & prompt-injection regression testing | MIT | v0.124.1, active | TypeScript / CLI | Runs offline with recorded fixtures | **ADOPT**: Verify that adversarial prompts injected in opportunity descriptions or artifacts cannot change verification status or leak private data. |
| **Semgrep**<br>[semgrep/semgrep](https://github.com/semgrep/semgrep) | Static code security scanner (SAST) for security bugs and OWASP Top 10 | LGPL-2.1 (CLI) / Commercial | Active | CLI | Scans repo for security anti-patterns (IDOR, raw queries, insecure regex) | **ADOPT (CI / SCAN)**: Run security scan on codebase to verify OWASP API Top 10 compliance. |
| **Trivy**<br>[aquasecurity/trivy](https://github.com/aquasecurity/trivy) | Vulnerability scanner for dependencies and secrets | Apache-2.0 | Active (~23k stars) | CLI binary | Fast scanner for vulnerable dependencies | **ADOPT (CI / SCAN)**: Run scan for CVEs in `package-lock.json`. |
| **Schemathesis**<br>[schemathesis/schemathesis](https://github.com/schemathesis/schemathesis) | Property-based API testing from OpenAPI schemas | MIT | Active (~2.5k stars) | Python CLI | Requires OpenAPI/Swagger schema spec | **OPTIONAL-LATER**: Vitest API route tests with Zod schemas provide immediate test coverage. |

---

## 7. Strategic Adoption Summary for OrbitMod V5

### Final Recommended Package Adoptions (To be added in Stage 3)
1. **Core Utilities**:
   - `tldts` (MIT) — Precise root domain & public suffix parsing for Avis domain challenges.
   - `file-type` (MIT) — True MIME type magic-byte inspection for uploaded artifacts and verification documents.
   - `isomorphic-dompurify` (MIT) + `linkify-it` (MIT) + `react-markdown` (MIT) — Safe rich text rendering, link extraction, and XSS sanitization.
   - `rate-limiter-flexible` (ISC) — Deterministic rate limiting for messages, invite bursts, and verification requests.
2. **AI & Validation**:
   - `ai` (Vercel AI SDK, Apache-2.0) — Unified AI gateway with strict Zod structured outputs, timeouts, and fallbacks.
   - `@faker-js/faker` (MIT, dev) — Realistic, clearly-labeled simulated seed data for demo environments.
   - `promptfoo` (MIT, dev) — Prompt injection and AI evaluation fixture harness.
3. **Testing**:
   - `@playwright/test` (Apache-2.0, dev) — Comprehensive E2E test execution for the critical acceptance workflow.

### Explicitly Excluded / Skipped (To avoid bloat & license violations)
- **GPL/AGPL libraries** (`dnstwist`, `ClamAV` native, `JPlag`): Replaced with clean, pure TypeScript algorithms (homoglyph/Levenshtein matching, text shingling) and abstract scanning interfaces.
- **Python-heavy services** (`sentence-transformers`, `Presidio`, `Detoxify`, `LiteLLM`): Replaced with TypeScript equivalents (tag overlap, regex PII scrubber, deterministic rule classifier) to keep the Next.js runtime self-contained.
- **External Queues / Datastores** (`BullMQ`, `Upstash`, Redis): Maintained within PostgreSQL and Prisma transactions.
- **Arbitrary Code Execution Sandboxes** (`Judge0`, `E2B`, `Piston`): Not built, as mandated by the project security requirements.
