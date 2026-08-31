# Opportunity Radar v1 — 2026-08-31

Status: broad research pass, not a product decision

Operating rule:

> **Search broadly. Believe probabilistically. Attack the conclusion. Test cheaply. Follow evidence. Standardize only what repeats.**

This radar deliberately searches beyond “what should ScanScam become?” ScanScam is treated as an existing asset/lab, not a cage.

Three buckets:

- **TRUST** — opportunities connected to verification, authorization, provenance, exposure, recourse, reputation, or cooperation under uncertainty.
- **CASH** — small, capital-light, potentially sellable software/service opportunities even when they do not advance the grand trust thesis.
- **FRONTIER** — emerging shifts worth watching because they may create durable new markets.

Do not rank by excitement alone. Every serious candidate later runs through `SEARCH → ASSUMPTIONS → FORECAST → RED TEAM → TEST → UPDATE`.

---

## Current external signals

### Identity / fraud / trust

- Socure raised at a **$5.2B valuation** in August 2026 and acquired Fravity to add AI-driven fraud/risk/compliance operations. This validates identity/fraud operations as a major spend category, while also warning that incumbents are strong. Reuters: https://www.reuters.com/legal/transactional/socure-secures-investment-52-billion-valuation-buys-fravity-2026-08-27/
- Canada is developing a **National Anti-Fraud Strategy** with possible new prevention/detection/disruption/response obligations across banks, telecoms and digital platforms. https://www.canada.ca/en/department-finance/programs/consultations/2026/national-anti-fraud-strategy-discussion-paper.html
- Canada’s Bank Act changes and proposed regulations now require banks to implement fraud-prevention procedures and collect/report fraud data. https://www.canada.ca/en/department-finance/news/2026/06/government-pre-publishes-regulations-to-prevent-fraud-and-facilitate-the-next-phase-of-consumer-driven-banking.html
- EDC published a June 2026 exporter due-diligence checklist for qualifying international clients and partners. https://edc-prod-aem65.adobecqms.net/en/article/exporter-due-diligence-checklist.html

### Smart-glasses privacy

- Smart-glasses privacy backlash is active now; venues are banning devices and regulators are discussing protections. Business Insider / Guardian reporting Aug 2026.
- Canada’s DND/CAF published a July 2026 policy restricting AI glasses with recording/communication capabilities in sensitive zones. https://www.canada.ca/en/department-national-defence/maple-leaf/defence/2026/07/artificial-intelligence-glasses.html
- Multiple consumer apps already detect known smart-glasses Bluetooth signatures, including Glasses Radar and Counterlens. This validates a user problem but means the simple detector is already competitive.

### AI provenance / regulation

- EU AI Act Article 50 transparency obligations began applying **2 Aug 2026**, including disclosure for AI interactions and marking/labelling of AI-generated or altered content. https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
- OpenAI expanded public provenance verification to supported audio and images and introduced API access in July 2026. https://openai.com/index/advancing-content-provenance/

### Agent security / identity

- Microsoft, Okta, Visa and Mastercard are all building identity, governance or delegated-authority systems for agents.
- OpenAI publicly describes prompt injection as an increasingly important risk for agents that browse and take actions. https://openai.com/index/designing-agents-to-resist-prompt-injection/

### Canada consumer-driven banking

- Canada’s Consumer-Driven Banking Act received royal assent in March 2026; proposed regulations establish accreditation, governance, security and liability requirements for participants. https://gazette.gc.ca/rp-pr/p1/2026/2026-06-27/html/reg3-eng.html

### Cheap software + acquisition

- Wix acquired Base44 in June 2025 for announced initial consideration of about **$80M plus earn-outs**; SEC filings later valued total purchase consideration at about $92.2M. This is a large outlier, not evidence that random vibe-coded apps sell for huge sums. https://www.sec.gov/Archives/edgar/data/1576789/000162828026015222/wix-20251231.htm
- Acquire.com’s 2026 material continues to show active buyer demand for small profitable software, but buyers emphasize predictable revenue, low churn, low founder dependence, clean financials and credible AI defensibility. https://blog.acquire.com/saas-exits-in-the-new-ai-era-webinar-recap/
- Acquire published a 2026 case in which a solo founder built a customer-support product and entered acquisition quickly; this validates liquidity for focused profitable software, not a guaranteed exit formula. https://blog.acquire.com/bootstrapped-profitable-and-acquired-in-four-days/
- Google says AI Overviews exceed **2.5B monthly active users** and AI Mode exceeds **1B**, increasing the importance of visibility inside AI-mediated discovery. https://blog.google/products-and-platforms/products/search/new-controls-website-owners/

### Unverified anecdote

The specific story described by Gabriel — roughly “camera radar built for about $9 and sold for about $400K” — was **not verified in this pass**. Do not use those numbers as evidence until the original article/source is found.

---

# A. TRUST HYPOTHESES

Use these as search objects, not company commitments.

| # | Hypothesis | Buyer / trigger | Current signal | Cheap first test | Main red-team flag |
|---|---|---|---|---|---|
| T1 | Supplier bank-detail change verification | SME/AP team before sending changed-payment instructions | Strong | page + priced concierge verification | episodic; phone callback may already be enough |
| T2 | Cross-border counterparty verification | Canadian SME before first large order/payment/distributor agreement | Strong | page + manual paid verification | EDC/TCS/lawyers already provide support; generic report commoditizes |
| T3 | Remote-worker identity/access verification | employer before credentials/equipment/access | Medium-strong | manual identity/access review pilot | crowded identity/background-check market |
| T4 | Smart-glasses privacy detection for venues | venue/school/event before or during entry | Strong current attention | venue-specific detection/policy pilot | BLE detection cannot prove recording; consumer apps already exist |
| T5 | High-risk payment/request callback verification | business when CEO/vendor/lawyer sends urgent unusual request | Strong | on-demand manual verification service | overlaps existing training/payment controls |
| T6 | Deepfake voice / trusted-contact verification | family/business during suspicious voice call or voice note | Medium-strong | challenge/callback protocol + small pilot | authentication may need ecosystem integration to be defensible |
| T7 | Provenance verification for media/brands | newsroom/brand before publishing suspicious media | Strong infrastructure trend | upload/verify workflow using provenance APIs | foundation providers increasingly ship native verification tools |
| T8 | Fraud-incident evidence packet | victim/bank/law enforcement after fraud attempt/loss | Medium | generate standardized report packet from real case | payer unclear; may become free public-service function |
| T9 | Canadian anti-fraud compliance evidence workflow | regulated organization/vendor preparing for new obligations | Strong regulatory signal | paid readiness review/template | sales cycles; legal-advice boundary; incumbents/consultants |
| T10 | Agent authorization receipt | company before/after AI agent takes consequential action | Strong frontier signal | simple approval + signed action log prototype | Microsoft/Okta/payment networks moving rapidly |

---

# B. ASYMMETRIC CASH HYPOTHESES

The standard here is not “grand moat.” It is **small build cost + clear utility + reachable distribution + real payment + sellable residue**.

| # | Hypothesis | Why now | Cheap first test | Main red-team flag |
|---|---|---|---|---|
| C1 | Smart-glasses radar with venue mode | privacy backlash + venue bans + device proliferation | landing page targeted to clubs/events/schools | existing apps; iOS/BLE limitations; fad risk |
| C2 | Vibe-code security preflight | AI-built apps proliferating; security concerns are growing | scan 10 public apps + sell remediation report | security market crowded; liability and false assurance |
| C3 | AI Act Article 50 transparency helper | rules just became enforceable | compliance checklist/widget with paid audit | legal/compliance competitors; narrow geography |
| C4 | AI-search visibility monitor for niche businesses | AI Overviews/Mode now massive discovery surfaces | monitor 20 high-value prompts for one niche | GEO tools are exploding; underlying platforms change quickly |
| C5 | Tiny vertical workflow SaaS for one boring trade | AI reduces build cost; buyers still value embedded workflows | one manual workflow replacement in a trade | requires privileged access to actual workflow/problem |
| C6 | Micro-SaaS sellability / founder-dependency audit | active market for small software acquisitions | paid audit for founders considering sale | founders may use free checklists/brokers instead |
| C7 | Consumer-driven-banking accreditation readiness kit | Canada is creating a new accredited fintech regime | readiness checklist + paid gap review | timing depends on final rules; legal specialization needed |
| C8 | Export partner qualification concierge | Canada is pushing diversification and EDC stresses due diligence | sell one manual qualification report | may really be lead-gen/business-development demand instead |
| C9 | “AI disclosure” embed widget for websites/media | EU transparency requirements now live | one-line embed + compliance log | native CMS/vendor features could erase it quickly |
| C10 | Acquire-improve-resell tiny SaaS | small SaaS buyer market is active | analyze one real $10k–$50k target instead of building | operational distraction; due diligence; weak assets can be traps |

---

# C. FRONTIER OPTIONS

Do not rush to build. These are places where scarce layers may appear as intelligence becomes cheaper.

| # | Hypothesis | Emerging scarce layer | Why watch | Main red-team flag |
|---|---|---|---|---|
| F1 | Human approval gateway for agents | permission / consequence | agents increasingly act across tools and payments | incumbents may own this at identity/platform layer |
| F2 | Agent action ledger + replay | accountability / audit | enterprises need to know what agents actually did | may become standard platform observability |
| F3 | Prompt-injection test harness for deployed agents | verification / security | browsing/tool agents inherit social-engineering risk | security vendors moving quickly; technical depth required |
| F4 | Agent least-privilege permission mapper | authorization | agent sprawl increases access complexity | Microsoft/Okta could absorb category |
| F5 | Agent-to-agent counterparty identity | identity / delegation | commerce agents need to know who/what they face | standards likely controlled by payment/identity giants |
| F6 | Provenance aggregation across AI vendors | origin / authenticity | many watermark/credential systems coexist | standards may converge and make aggregator thin |
| F7 | Consumer financial-data permission dashboard | consent / recourse | Canadian open banking creates explicit permissions | banks/fintech platforms may provide natively |
| F8 | Cross-sector fraud signal exchange | network / shared intelligence | Canadian strategy explicitly targets cross-sector gaps | regulation, privacy, network cold start |
| F9 | Smart-glasses consent / venue-control layer | physical-world permission | recording wearables challenge existing no-camera rules | hardware manufacturers can change protocols at any time |
| F10 | Independent “launch trust” certification for AI-built apps | verification / reputation | software creation is becoming cheap; confidence may become scarce | certification liability; credibility must be earned |

---

# Preliminary compression — NOT final ranking

These eight deserve deeper research because they combine current signal with a potentially cheap test. They have **not** yet survived a full outside-view + red-team pass.

1. **C2 / F10 — Vibe-code security preflight / launch trust**
2. **C1 / T4 — Smart-glasses privacy radar / venue mode**
3. **T1 — Supplier payment-change verification**
4. **C3 / C9 — AI Act transparency compliance helper**
5. **C4 — AI-search visibility monitor for one niche**
6. **T2 / C8 — Cross-border counterparty / export qualification**
7. **C6 — Micro-SaaS sellability / founder-dependency audit**
8. **F1 / F2 — Agent approval + action receipts**

Why these and not the others: each has a visible current trigger and a path to a small real-world experiment without first building a full company.

---

# What to do next

Do **not** build eight products.

For each of the eight, run the same compact dossier:

```text
QUESTION:
OUTSIDE VIEW / BASE RATE:
WHO / TRIGGER / PAYER:
CURRENT ALTERNATIVE:
WANT RISK:
DELIVER RISK:
ECONOMICS RISK:
SURVIVE RISK:
STRONGEST CASE AGAINST:
WHAT WOULD CHANGE OUR MIND:
CHEAPEST CREDIBLE TEST:
```

Then select at most **3** smoke tests.

The radar succeeds if it keeps discovering and killing hypotheses cheaply. It fails if it becomes a factory for plausible startup prose.
