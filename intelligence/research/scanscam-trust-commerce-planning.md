# Planning memo: ScanScam as trust infrastructure for commerce

Version: 0.1
Date: 2026-08-31
Status: PLANNING ONLY — not a product spec, not a build decision, not a roadmap

Epistemic labels:

- **FACT** — observed in ScanScam code, workspace files, or named public programs
- **EVIDENCE** — weaker than a fact; observed substitute or analog
- **INFERENCE** — interpretation of facts
- **HYPOTHESIS** — claim to test
- **OPEN** — unanswered
- **DECISION** — none taken in this memo

This memo structures Gabriel’s working concept. It does not replace it with a different thesis.

Related workspace state:

- `NOW.md` — 30-day experiment is a **manual Counterparty Scan**. Do not build a platform, agent marketplace, trust passport, automated company-analysis engine, OSINT stack, new brand, new app, or agent swarm.
- `projects/scanscam/PROJECT.md` — stage is **DISCOVERY**. Next milestone is customer evidence, not more product.
- `thesis/TRUST_THESIS.md` — H3/H4: value, if any, is unlocking cooperation and **reducing how much personal trust is required**, not making people “feel safer.”

---

## Tension to keep in view

There are **three nested products** in this brief. Do not collapse them.

| Layer | Question | Status |
|---|---|---|
| A. Current 30-day offer | Will someone pay to reduce uncertainty about **one named counterparty**? | Active experiment (`NOW.md`) |
| B. Canada SME wedge | Can ScanScam **find and pre-qualify** new buyers/suppliers/partners under trade-diversification pressure? | **HYPOTHESIS** |
| C. Long-term vision | Trust infrastructure for commerce (humans, companies, agents): DISCOVER → VERIFY → QUALIFY → ACT → MONITOR → AUTHORIZE | **HYPOTHESIS** — not a commitment |

**INFERENCE:** Layer B is not a small extension of today’s ScanScam app. It adds market discovery, buyer lists, contacts, outreach, and transaction workflow. Layer A can be tested with almost no software. Layer B can be tested as a **service** before any of that software exists. Layer C should not be built until A and B produce evidence.

**Contradiction to preserve:** “Help Canadian SMEs find new customers” may be a **sales/export-development** problem, not a **trust** problem. TCS, EDC, chambers, and ChatGPT already address “find markets/buyers.” If customers will pay, it may be for **workflow completion** (a ranked shortlist + outreach + verification) rather than for “trust.”

---

## 1. Existing architecture audit

**FACT:** ScanScam (`C:\Projects\scanscam`) is a Next.js consumer **message** scanner, not a company-intelligence system. Atomic object is a `scans` row. There is no `companies` table, no entity graph, no buyer/supplier discovery, no CRM, no Stripe, no user accounts, no sanctions/trade data, no API product.

### What already exists and can be reused (patterns, not a platform)

| Building block | What it is today | Reuse for commerce? |
|---|---|---|
| Hybrid pipeline | LLM draft + **deterministic floors** (`app/api/scan/route.ts`, `lib/scan-analysis/*`) | **Reuse the shape**: model proposes, rules constrain, failure ≠ “safe” |
| Epistemic labels | `intel_state`, `context_quality`, `confidence_level`, `analysis_status`, `user_verdict: uncertain` | **Reuse labels**; map to VERIFIED / SUPPORTED / UNCERTAIN / CONTRADICTED / UNKNOWN |
| Evidence schema | Signals require **verbatim excerpt**; link intel stores lookup status + timestamps | **Reuse**: every claim needs source, date, status |
| Deterministic lookups | URL expand, Google Web Risk, RDAP (`webRiskLookup.ts`, `rdapLookup.ts`) | **Reuse wrapper pattern** (timeout, never-throw, structured status). Domain-age is **not** company identity |
| Hard fallback | `hardFallbackPresentation.ts` — AI down → `uncertain`, never fake safety | **Reuse as doctrine** for any B2B report |
| Decision Report | Tokenized `pro_report_access`, 21-day share, “Limits — what remains unknown” (`DecisionReport.tsx`) | **Reuse UX** for a counterparty brief; do not treat as a company dossier |
| Human review CTA | Mailto `hello@scanscam.ca`, beta copy ~$49 | **Reuse the commercial gesture**; no queue exists |
| Bilingual EN/FR | Copy modules throughout | **Reuse** |
| Telemetry + founder views | `events`, intel SQL views, Sheets ops | **Reuse for learning**, not for entity monitoring |
| Partner escalation | Tokenized MSP view | Weak analog for sharing a brief with a client; **not** multi-tenant B2B |

### What would need to change (if we later built software)

Not a rebuild of the consumer scanner. A **new domain object**.

Must add (only after the service test):

- **Entity** as first-class object (legal name, jurisdiction, identifiers, domains, aliases)
- **Transaction context** (what exposure: buy / sell / partner; amount; timeline; product)
- **Claim graph** (claim → source → status), not a summary paragraph
- **Engagement object** (client, shortlist, outreach, outcomes)
- Auth, tenancy, billing if this becomes a product rather than a founder-delivered service

Must **not** assume we can stretch `scans` into companies. **INFERENCE:** using message-scan rows as a company proxy would produce a commodity wrapper with the wrong unit of analysis.

### What the existing app already forbids us to fake

**FACT:** Product copy and system prompt refuse legal/criminal determinations and surface unknowns. That doctrine is an asset. A commerce product that scores a company “safe/trustworthy” would **violate** both ScanScam’s current posture and `PROJECT.md`.

### Feasibility verdict

| Question | Answer |
|---|---|
| Can we test Layer A on existing architecture? | **Yes**, mostly **outside** the app: manual research + a brief that copies Decision Report epistemology. Optional: share via existing tokenized-report pattern later. |
| Can we test Layer B on existing architecture? | **Partially.** Discovery/outreach are not in the app. Do them with existing tools (search, registries, LinkedIn, email). Do not extend `/api/scan`. |
| Can Layer C evolve from today’s codebase without a rewrite? | **No.** Pipeline **patterns** transfer. Data model and GTM do not. |
| Is this technically feasible later? | **Yes**, as a new module/service, not as a feature flag on message-scan. Bottleneck is **data + entity resolution + distribution**, not Next.js. |

---

## 2. Smallest possible test

**Constraint from `NOW.md`:** 3–5 real businesses, human-directed, agent-assisted, **no new software**.

### Recommended test object

Do **not** start with the full honey-producer loop (markets → buyers → investigate → rank → contacts → outreach → track).

Start with a **transaction-scoped engagement** that still teaches Layer B:

> Named Canadian SME + one concrete need (new buyers **or** replacement suppliers) + bounded geography + bounded product.

Output of one engagement:

1. 3–7 ranked counterparties (not 50)
2. One-page evidence card each (VERIFIED / SUPPORTED / UNCERTAIN / CONTRADICTED / UNKNOWN)
3. 1–3 recommended next actions (email, call, RFQ, walk away)
4. Record of what the owner already knew, what they did, and what they refused

That is Layer A (verification) **plus a thin slice of Layer B** (shortlist), without becoming export consulting.

### Manual vs automatic (for 3–5 cases)

| Step | Manual (human owns) | Agent-assisted (ChatGPT/Cursor/search, not ScanScam agents) | Automatic in ScanScam app |
|---|---|---|---|
| Intake: product, constraints, exposure | Yes | Draft intake questions | No |
| Market hypotheses | Yes — owner must accept/reject | Suggest markets from public trade stats | No |
| Buyer/supplier longlist | Yes — quality control | Web/LinkedIn/directory scrape **draft** | No |
| Entity resolution (is this the legal entity?) | Yes — final call | Suggest aliases/domains | No (RDAP is domain-only) |
| Registry / identity checks | Operator retrieves | Summarize retrieved docs | No |
| Red-team / adverse items | Yes — must hunt disconfirming evidence | Search prompts | No |
| Qualification vs client’s actual need | Yes — cannot be delegated | Draft fit notes | No |
| Outreach copy | Owner sends, or we send with permission | Draft in owner’s voice | No |
| Outcome logging | Yes | Structure notes | No |
| Message-scan of inbound replies | Optional | — | **Yes** — existing scanner if a reply looks like a scam |

**Do not automate** ranking, “trust scores,” or send-on-behalf.

### Why this is fast

- No schema, no agents, no OSINT platform
- Uses tools that already exist: corporate registries, Google, LinkedIn, TCS/EDC public material, OpenAI chat, ScanScam only if a **message** appears
- One engagement is a week of founder time, not an engineering sprint

### Why this can fail (preserve)

- Owners may want **introductions**, not briefs
- TCS already offers free market assessment and qualified contacts
- “Find me buyers” may be unbounded consulting
- Public data may be too thin to change a decision
- The buying problem may be **capacity, price, logistics, or English**, not uncertainty

---

## 3. One complete test protocol

Example (as specified): **Canadian company needs new international buyers.**

Do not run this as software. Run it as a **protocol** on paper + shared doc. Timebox: **8–12 hours** research + **1 review call** with the owner.

### Input (required before research)

Collect, in writing:

- Legal company name, jurisdiction, website
- Product(s) with **HS code if known** (or a one-line product definition we will not invent)
- What they sell today vs what they **can** export
- Current markets and **why** they are looking (lost US volume, tariff, concentration, growth)
- Constraints: certifications, MOQ, languages, Incoterms they can support, max travel, banned markets
- Exposure: typical order size, payment terms they would accept, what would be a bad counterparty
- What they have **already tried** (TCS, distributors, Amazon, shows)
- Decision: what would make this week a success (3 names to email vs a market recommendation)

If they cannot name a product and a constraint, **stop**. That is consulting sprawl, not a ScanScam test.

### Pipeline

```
INPUT
  → market candidates (public stats + constraints)
  → rank 2–3 markets (with reasons AND kill reasons)
  → buyer discovery (importers/distributors/retailers/industrial users)
  → entity verification (legal existence, identity, domain, claims)
  → qualification (fit to THIS seller, not generic “good company”)
  → risks / unknowns
  → contacts (named role, not a generic info@ if a better path exists)
  → outreach draft
  → OUTPUT pack + owner decision
```

### Step details and sources

| Step | What “good” looks like | Sources / tools (existing, not to build) |
|---|---|---|
| Market ranking | 2–3 markets with import demand, access, language/logistics fit, and **why not** others | Statistics Canada Trade Data Online; ITC Trade Map / Export Potential Map; Canada Tariff Finder; TCS market pages; EDC country notes |
| Buyer discovery | 10–20 raw names → 5–7 survivors | Importer lists where public; Kompass/Europages; trade-show exhibitor lists; LinkedIn; company “our suppliers/clients” pages; TCS contact lists **if the client already has access** |
| Entity verification | Legal name, number, status, registered address, directors if public, domain registrant age, same-name collisions | Provincial/federal registries (e.g. Registraire des entreprises du Québec, Corporations Canada); foreign registries as available; RDAP; company site / about / imprint; sanctions lists (OSFI, OFAC, UK, EU) **as a check, not a product** |
| Qualification | Fit to product, channel, size, geography, and **whether they actually buy this category** | Website SKUs, job posts, import records **if legally obtainable**, news, LinkedIn product lines |
| Risks / unknowns | Explicit UNKNOWN list; CONTRADICTED claims called out | Adverse media search; complaint boards; litigation if public; nothing presented as complete |
| Contacts | Purchasing / import / category manager where findable | LinkedIn, site contact, switchboard — **no scraped email dump as a deliverable** |
| Outreach | 1 short email, 1 LinkedIn note, in the owner’s language (EN or FR) | Human-edited; owner sends |
| Inbound message check | If a reply smells like a scam | **Existing ScanScam scanner** |

### Output pack (one engagement)

A folder, not a dashboard:

1. `00-decision.md` — recommended action this week
2. `01-markets.md` — 2–3 markets, evidence, kill list
3. `02-shortlist.md` — table of counterparties with status labels
4. One card per counterparty (see §5)
5. `outreach/` drafts
6. `log.md` — hours spent, sources that failed, owner reactions

### What we refuse in the protocol

- No “trust score”
- No “this buyer is safe”
- No 40-page AI narrative
- No claiming coverage of beneficial ownership if the registry does not provide it
- No using TCS introductions as if they were ScanScam proprietary data

---

## 4. Agent design

**DECISION for now:** do not implement agents. `NOW.md` forbids an agent swarm.

**HYPOTHESIS:** multiple **roles** are useful as a **checklist for a human operator** (and later as prompts). They are not useful as autonomous workers until a repeatable engagement exists.

### If we later split work, minimum roles

Fewer is better. Seven named agents is already too many for V0.

| Role | Job | Must not do |
|---|---|---|
| **Market intelligence** | Propose/kill markets from public stats + client constraints | Invent demand |
| **Counterparty discovery** | Produce a longlist with source URLs | Deduplicate legal entities (needs human) |
| **Entity / evidence verification** | Attach sources to identity and claims; label UNKNOWN | Declare trustworthy |
| **Adversarial research** | Hunt disconfirming evidence, same-name fraud, borrowed prestige | Be optional — this role is the anti-wrapper |
| **Commercial fit** | Score fit to **this transaction**, not generic quality | Override verification |
| **Outreach** | Draft, not send | Contact people without permission |
| **Synthesis** | Assemble the pack; preserve contradictions | Smooth UNKNOWN into prose |

**INFERENCE:** the only role that is **not** a commodity LLM wrapper is **adversarial research + provenance labeling + transaction-scoped fit**. Discovery and fluent outreach will be eaten by frontier models first.

### What should remain a deterministic pipeline

Never give these to a free-form agent:

- Registry identifier capture (company number, jurisdiction)
- Sanctions list hit / no-hit with query timestamp
- Domain RDAP created_at / registrar
- Source URL + retrieved-at
- Status enum: VERIFIED / SUPPORTED / UNCERTAIN / CONTRADICTED / UNKNOWN
- “AI unavailable → cannot claim verified”
- Rate limits, PII handling, “do not send email”

This is the ScanScam lesson: **LLM drafts, rules floor, failure stays uncertain.**

### Orchestration

For 3–5 cases: **one human** (Gabriel) running roles as sequential prompts in one project folder. No message bus. No marketplace.

---

## 5. Output (minimum thing a business owner values)

Avoid a dashboard. Owners do not open dashboards during discovery. They open a **two-page brief** and a **shortlist table**.

### Page 1 — Decision

- Context: “You asked us to find buyers for X, excluding Y, typical order ~Z.”
- Recommendation: **Act / Investigate further / Do not proceed** on the **set**, plus the **one** counterparty to contact first
- Why: 3 bullets, each with a source
- Exposure: what you would be putting at risk if you proceed (money, IP, exclusive distributor rights, production slot)
- Unknowns that would change the recommendation

### Page 2 — Shortlist table

| Rank | Entity (legal name) | Market | Why they might buy | Key evidence | Status | Main unknown | Next action |
|---|---|---|---|---|---|---|---|

Status uses only: VERIFIED / SUPPORTED / UNCERTAIN / CONTRADICTED / UNKNOWN (per **claim**, not a single halo on the row).

### Per-entity card (one screen)

- Who we think they are (legal vs trade name vs domain) — **identity collisions listed**
- What we verified vs what the website claims
- Fit to **this** product (competence in-domain)
- Alignment/incentives (exclusive deals, competitor-owned, payment behavior if evidenced)
- Red flags and **borrowed prestige** (TCS mention, “official partner of…”)
- Sources (URL + date)
- Questions to ask **them** before committing
- Draft outreach (optional appendix)

### Explicitly omit

- Generic company encyclopedia
- Personality of the brand
- “AI confidence 87%”
- World news dump
- A map unless it changes a decision

**HYPOTHESIS:** owners pay when the pack **names who to email this week** and **what not to believe**, not when it explains a market.

---

## 6. Free / paid product ladder

Possible future tiers. **Not a commitment.**

| Tier | Job | Why it might exist | Commoditization risk |
|---|---|---|---|
| **FREE** | Quick scan of **one named company or one inbound message** | Funnel; reuse consumer ScanScam | Very high — ChatGPT does this |
| **PAID AUTOMATED** | Deeper public-source pack on a named counterparty | Speed | High unless provenance + registries are real |
| **HUMAN-REVIEWED** | Transaction-scoped shortlist + verification + outreach drafts | Matches 3–5 case test | Medium — this is a **service**; margins depend on hours |
| **SUBSCRIPTION** | Monitor a **named set** of buyers/suppliers for change | Recurring; needs entity objects | Medium — only valuable with **their** list |
| **FUTURE API** | Qualification/evidence layer for agents (graduated authority) | Trust Thesis H5 | Speculative; no customers yet |

Do not sell “trust passport,” “agent marketplace,” or “authorize” until monitoring of **named** counterparties is real.

Pricing: keep `PROJECT.md` range **$500–$1,500** for human-reviewed pilots. Automated cheap tiers should not be priced until we know cost-of-goods (registry APIs, time).

---

## 7. Time and complexity

Honest ranges for **one founder + existing tools**, not a team building Layer C.

| Stage | What it is | Time | Main bottleneck |
|---|---|---|---|
| **Proof of concept** | 3–5 engagements, protocol in §3, Google Doc output | **1–3 weeks** calendar (if prospects exist); **8–12h** each | Finding 3 owners who will sit still; not engineering |
| **Internal V0** | Checklist + templates + source list + labeled claim format; maybe a Notion/folder convention | **2–5 days** after first two cases | Discipline, not code |
| **Public beta** | Landing page + intake + paid human-reviewed Counterparty/Trade brief on scanscam.ca | **1–3 weeks** of product/copy **after** paid demand exists | Positioning vs TCS/EDC; legal disclaimer; bilingual |
| **Reliable paid version** | Entity store, registry connectors, monitoring, billing, auth | **2–4 months** engineering **after** repeatable delivery | Entity resolution, jurisdiction coverage, source licensing, sales |

### Actual technical bottlenecks (when/if software)

1. **Entity resolution** — same name, many companies, many domains
2. **Heterogeneous registries** — every country is a different scrape/API/legal regime
3. **Licensed data** — import records, credit, UBO are not free and not “just scrape Google”
4. **Stale web evidence** — LLM summaries rot; provenance must be stored
5. **Contact data legality** — CASL/anti-spam if ScanScam sends outreach
6. **Evaluation** — no ground truth for “good buyer”; only **outcomes**
7. **Existing app coupling** — `scans` cannot carry this without a parallel model

**INFERENCE:** the consumer scanner is not the bottleneck. **Demand and data rights** are.

---

## 8. Commoditization test

Assume frontier models get dramatically better and cheaper.

### What disappears

- Market overviews
- “Tell me about Company X”
- First-draft outreach
- Translating a website into a summary
- Generic risk-score blogs
- Most of **FREE** and much of **PAID AUTOMATED**

That is exactly the product principle: **company → web search → LLM summary** dies.

### What can remain valuable

Aligned with Trust Thesis H2/H4 and ScanScam’s own floors:

- **Transaction context** — exposure, product fit, what would constitute a bad deal **for this client**
- **Entity resolution** with collision handling
- **Source quality + provenance** (retrieved-at, registry vs blog vs LLM)
- **Verification against primary records**, not pages
- **Historical change** (they were X last year; now Y)
- **Monitoring a client-specific set**
- **Workflow completion** — shortlist + send + track + learn
- **Proprietary outcomes** — who paid, who ghosted, who scammed, who converted (the recursive business-in-a-box)
- **Jurisdiction-specific knowledge** (Québec / Canada / target-market practice)
- **Exposure policies** — “do not authorize more than N until claims A,B are VERIFIED”
- **Inbound message competence** — ScanScam’s actual current product, if counterparties reply with fraud

### What ScanScam must accumulate to stay strategic

Not a model. Not a UI.

1. Labeled **engagement outcomes** (the only proprietary loop)
2. A **claim/evidence store** tied to entities and transactions
3. Repeatable **adversarial** checks that models skip
4. Permissioned **relationship** data (who introduced whom, who paid)
5. A doctrine: **never convert UNKNOWN into a score**
6. Distribution into a **moment of exposure** (before wire, before exclusive, before RFQ)

If we cannot accumulate (1) and (6), we do not have a company. We have a prompt.

---

## 9. Competitive category

**OPEN:** this is not yet one category. Forcing one name too early produces the wrong competitors.

| If the customer job is… | Category | Substitutes |
|---|---|---|
| “Is this message/scam real?” | Consumer fraud / message intelligence | Banks, carriers, Google, Norton, **current ScanScam** |
| “Is this company real before I wire?” | Third-party / vendor risk, KYB | D&B, Creditsafe, Forthsource, Averom, VendorCheck, KeyBS, lawyers |
| “Find me export markets and buyers” | Export development / trade intelligence | **TCS (free)**, EDC, BDC, provincial trade offices, ITC Trade Map, TAP, consultants |
| “Give me names to email this week” | Sales intelligence | LinkedIn Sales Nav, Apollo, ZoomInfo, Kompass |
| “Watch my suppliers” | Supplier intelligence / TPRM | EcoVadis, Prewave, large TPRM suites (usually too heavy for SME) |
| “Help me replace a US supplier” | Procurement / sourcing | Alibaba, Thomasnet, industry reps, trade shows |
| “Should my agent be allowed to do this?” | Agent trust / authorization | Does not exist as an SME product; **HYPOTHESIS only** |

### Likely SME-specific gap (HYPOTHESIS, not a finding)

Enterprise TPRM is too expensive and too compliance-flavored. Consumer ScanScam is the wrong object (messages). TCS is free but **slow, eligibility-gated, and not a software loop**. ChatGPT is fast but **unaccountable and not transaction-scoped**.

Possible gap:

> A Canadian SME, in a moment of **forced diversification**, needs a **bounded, bilingual, evidence-labeled shortlist + next action**, cheaper than a consultant, faster than TCS, more cautious than ChatGPT.

**Falsifiers:** TCS already satisfies them; they will not pay $500; they only want warm intros; procurement is relationship-driven; US market loss is a **price** problem not a **counterparty** problem.

### Category recommendation for the test

Position the **pilot** as:

**Transaction-scoped counterparty intelligence for Canadian SMEs**

not as “trust infrastructure,” “sales intelligence platform,” or “export agency replacement.”

Talk to customers in **job** language: “before you commit to this buyer/supplier.”

---

## 10. Go / no-go test

Evidence required from the **first 3–5 cases** before investing in software (extends `PROJECT.md` evidence list).

### Must observe (go)

1. A real owner **spent time** on intake (not just “send me ideas”)
2. At least one owner says a **specific unknown** was blocking a real transaction
3. The shortlist caused a **behavior change** (emailed, killed a name, delayed a wire, opened an RFQ)
4. They would **pay** at a stated price, or already paid
5. They were **not** satisfied by “I asked ChatGPT” or “I’ll call TCS”
6. We could produce the pack in a **repeatable** number of hours with **named sources**
7. At least one **disconfirming** finding mattered (adversarial role earned its keep)
8. We logged **objections in their words** (`CUSTOMER_INTEL.md`)

### No-go (stop or narrow)

- They want 50 names and a CRM, not verification
- They want a **guarantee** or “safe list”
- Public sources cannot answer the questions that would change the deal
- Delivery exceeds ~12 hours with no path to a template
- They will only buy **introductions** we cannot make
- Legal/compliance (we are giving regulated credit/investment advice by accident)
- All five cases are unique snowflakes — nothing to productize
- Payment problem is **tariffs/logistics/working capital**, and intelligence is a polite extra

**Do not treat “they said it was interesting” as a go.**

No **DECISION** to build is implied by this memo.

---

## Closing

### A. Recommended 48-hour experiment

Do not design agents. Do not touch the ScanScam app.

1. Write the **smallest Counterparty Scan one-pager** (offer + what we will not promise) — aligns with `NOW.md` actions 1–3.
2. Pick **one** customer profile: Canadian SME with a **named** diversification problem (lost US buyer **or** must replace a US-sourced input). Not “any SMB.”
3. Contact **5** people who own that problem (existing ScanScam/conversation list, network, one trade org). Ask for a **paid or strongly scoped pilot**, not feedback on a vision.
4. If **one** says yes to a working session, run **half** of protocol §3 live: intake + 3-entity shortlist in 4 hours, then ask: *would you pay $500–$1,500 for the rest / for the next five names?*
5. Publish **one** piece of content that states the problem in their language (not “trust infrastructure”).
6. Log objections in `projects/scanscam/CUSTOMER_INTEL.md`.

Success in 48 hours is **conversations and a sharper offer**, not a prototype.

### B. Estimated implementation effort

- Protocol + templates: **days**
- 3–5 real cases: **weeks**, gated by access to owners
- Public paid landing on existing site: **small**, after demand
- Software that is not a wrapper: **months**, and only if go-criteria hit
- Layer C (monitor/authorize/agent API): **not estimable**; do not start

### C. Biggest reason to build

If Canadian SMEs are **stuck mid-transaction** — they have a product, they have urgency, they lack a **justified next counterparty** — then a ScanScam-shaped product (evidence, floors, unknowns, bilingual, no fake certainty) could sit in a real **exposure moment**, accumulate outcomes, and later become infrastructure. That would be Trust Thesis H3/H4 in commerce, not a slogan.

### D. Biggest reason NOT to build

The job may already be **free (TCS/EDC)**, **cheap and generic (ChatGPT + LinkedIn)**, or **not an intelligence job at all** (price, logistics, working capital, relationships). Building Layer B/C software now would create the exact commodity wrapper the product principle forbids, while violating `NOW.md`.

### E. What we need to learn first

1. Is the paying job **verify this counterparty**, **find me a shortlist**, **write the email**, or **introduce me**?
2. Does **uncertainty** actually delay or kill the deal, or do they proceed anyway?
3. Will they pay ScanScam rather than TCS, a consultant, or ChatGPT?
4. Can public sources change a decision in <12 hours?
5. Does the ScanScam **message** product remain the wedge (inbound fraud) while commerce work stays a **manual service**?

Until those are answered with real cases, the long-term loop DISCOVER → … → AUTHORIZE stays a **hypothesis**, and ScanScam’s laboratory remains the manual Counterparty Scan.
