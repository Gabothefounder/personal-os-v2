# Opportunity Radar — deep dive + red team — 2026-08-31

Status: decision research, not product commitment

Source radar: `intelligence/briefs/opportunity-radar-2026-08-31.md`

Decision lenses used:

- `wisdom/lenses/NAVAL.md`
- `wisdom/lenses/FRANKLIN.md`
- `wisdom/lenses/LEX_SISNEY.md`
- `wisdom/lenses/SUPERFORECASTING.md`

Operating question:

> Which current hypotheses deserve a cheap market test **now**, rather than more architecture or a build?

The probability estimates below are **decision priors / synthesis**, not measured market probabilities. They mean roughly:

> probability that we can find a genuine paid wedge worth another iteration within ~30 days using <$1,000 of tests and manual delivery where needed.

They are written before the tests so they can later be updated rather than rewritten in hindsight.

---

# Compression

| Candidate | Decision prior | Current disposition | Why |
|---|---:|---|---|
| Supplier payment-change verification | **45%** | **TEST** | painful trigger, clear payer, real loss; fast concierge test |
| AI Act Article 50 implementation helper | **40%** | **TEST** | obligations just went live; narrow compliance job can be tested fast |
| Smart-glasses venue enforcement | **35%** | **TEST** | unusually current pain + venue bans; consumer detector itself is already commoditizing |
| Agent approval + action receipts | **30% near-term / high long-term category importance** | **WATCH / RESEARCH** | real governance need, but Microsoft/Okta/OpenAI are rapidly absorbing core controls |
| Cross-border counterparty / export qualification | **30%** | **WATCH / secondary test** | real Canadian need; free EDC/TCS substitutes weaken generic report wedge |
| Micro-SaaS sellability audit | **25%** | **DO NOT TEST AS PRODUCT YET** | sellability criteria are useful, but better as an investment/build filter than standalone service |
| Vibe-code security / launch trust | **20%** | **KILL GENERIC WEDGE** | real pain, but category is already crowded from $0–$10 tools to Snyk/Semgrep |
| Generic AI-search visibility monitor | **15%** | **KILL GENERIC WEDGE** | crowded category with Ahrefs/Semrush/Profound/Peec/Scrunch/etc.; monitor alone is commodity |

This ranking is intentionally less enthusiastic than Radar v1. The red-team pass killed two generic wedges and downgraded several others.

---

# 1. Supplier payment-change verification

## Resolvable question

Will at least one qualified SME pay for an independent verification workflow when a supplier's bank/payment instructions change?

## External evidence

- Canadian Anti-Fraud Centre continues to document payment-redirection / spear-phishing losses and specifically recommends independently verifying changed payment instructions.
- AFP's payments-fraud research reports very high attempted/actual fraud incidence among organizations, with business-email compromise and vendor impersonation important channels.
- Trustpair + Coupa expanded automated global bank-account ownership verification in 2026, validating real enterprise spend.

Sources:

- https://antifraudcentre-centreantifraude.ca/
- https://www.afponline.org/training-resources/resources/survey-research-economic-data/details/payments-fraud
- https://trustpair.com/blog/trustpair-coupa-ai-vendor-payment-fraud-partnership/

## Want

**Strong.** The consequence is money leaving the account. Buyer and triggering moment are unusually clear.

## Deliver

**Medium.** A manual process is feasible, but a trustworthy verification must rely on an independent channel. Merely searching the web is insufficient. The exact workflow may require direct supplier contact, known historical contact details, registry checks, bank-account ownership data, or customer-provided records.

## Economics

**Medium.** High-value incidents justify price, but the trigger is episodic. Customer acquisition may be harder than fulfillment. A per-case service may need referral/channel distribution or become a broader accounts-payable control.

## Survive

**Medium-high if workflow/verification; low if AI report.** Large enterprise vendors already automate this. The possible wedge is SME / occasional high-risk case / human-independent callback rather than a generic fraud classifier.

## Strongest case against

For many SMEs, the solution is already a two-minute phone call to a known supplier contact plus dual approval. A paid third party adds friction to an infrequent event.

## Naval

Good consequence layer and possible reputation/data compounding. Weak if we simply sell research; stronger if we sit in the verification workflow immediately before exposure.

## Franklin

Very testable with a concierge service before software.

## Sisney

Discovery-stage: test the actual payment workflow, do not build payment infrastructure yet.

## Forecast

**45%** chance of finding a paid wedge worth a second iteration within 30 days / <$1k.

Lower to <25% if qualified SMEs consistently say callback + dual approval fully solves it.
Raise to >60% if 2+ businesses provide a real changed-payment case or pay for a pilot.

## Cheapest credible test

A narrow landing page + targeted acquisition/outreach to finance/admin/construction/real-estate operators with a real priced pilot. If anyone raises a hand, fulfill manually and interview them.

---

# 2. AI Act Article 50 implementation helper

## Resolvable question

Will small providers/deployers affected by Article 50 pay for a narrow implementation/evidence tool rather than rely on free guidance or counsel?

## External evidence

Article 50 transparency obligations apply from **2 August 2026**. The European Commission has published final guidelines, quick facts, FAQs, optional icons, and a voluntary Code of Practice. Providers/deployers may need disclosure, machine-readable marking, or labelling depending on the system/content. The Commission says fines under the AI Act can reach €15M or 3% of worldwide turnover for relevant infringements, subject to proportionality provisions.

Sources:

- https://digital-strategy.ec.europa.eu/en/policies/guidelines-ai-transparency-obligations
- https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act
- https://digital-strategy.ec.europa.eu/en/factpages/quick-facts-transparency-rules-ai-systems

## Want

**Medium-high.** There is a new mandatory event and a compliance deadline that is already live.

## Deliver

**Medium-high if narrowly scoped.** A widget/checklist/evidence log is technically straightforward. The difficult part is accurately determining scope and not representing the product as legal advice.

## Economics

**Medium.** Compliance spend exists, but free Commission material is excellent. The wedge must reduce implementation work, not merely summarize the law.

## Survive

**Low-medium.** CMSes, AI vendors, compliance suites, and legal platforms can add native disclosure/marking features quickly. A generic "AI disclosure widget" is fragile.

## Strongest case against

The Commission has already supplied clear guidance, icons and a code; affected software vendors may ship compliant defaults, leaving little standalone product value.

## Naval

Weak moat as a generic widget. Better if it accumulates auditable compliance evidence across many systems or becomes embedded workflow.

## Franklin

Excellent timing for a tiny implementation experiment. Sell the nuisance removed, not "AI governance."

## Sisney

Do not build a compliance platform. Test one repeated Article 50 implementation job.

## Forecast

**40%** chance of finding a small paid implementation wedge; lower confidence on long-term defensibility.

Lower below 20% if target SMEs say their platform/vendor handles it automatically.
Raise above 60% if several deployers independently ask for evidence logs, templates, or implementation help rather than interpretation.

## Cheapest credible test

A page offering an **Article 50 implementation pack** for one tightly defined customer type: disclosure placement + approved label/icon implementation + evidence record, with explicit non-legal-advice boundary. Price before building software.

---

# 3. Smart-glasses venue enforcement

## Resolvable question

Will privacy-sensitive venues pay for practical smart-glasses enforcement rather than simply post a policy and rely on staff observation?

## External evidence

- Canada DND/CAF now strictly prohibits AI/smart eyewear in Operations, Security and High Security Zones, explicitly including devices with recording/communications capabilities.
- Multiple nightlife/events venues are restricting or banning smart glasses in August 2026.
- Consumer detector apps already exist: Glasses Radar, Counterlens, NearLens and others. Glasses Radar is free, on-device and explicitly states detection indicates presence, **not recording**.
- Security/privacy coverage now frames smart glasses as enterprise/venue risk.

Sources:

- https://www.canada.ca/en/department-national-defence/maple-leaf/defence/2026/07/artificial-intelligence-glasses.html
- https://www.glassesradar.app/
- https://apps.apple.com/ca/app/counterlens-camera-radar/id6797302366
- https://www.techtarget.com/it-strategy/feature/Smart-glasses-as-an-enterprise-risk-What-CIOs-should-know

## Want

**Medium-high, unusually current.** The social/privacy trigger is real and visible.

## Deliver

**Medium-low for software-only detection.** BLE fingerprinting is probabilistic, hardware signatures can change, and detection cannot establish that recording is occurring. B2B value may be policy + enforcement workflow + alerts, not radar alone.

## Economics

**Unknown.** Consumer tools are free or cheap. Venue managers may not have a software budget for this and may prefer door staff + policy.

## Survive

**Low for a phone radar. Medium if venue-control workflow becomes real.** Hardware makers can alter radio behavior; platforms can add privacy controls; free detector apps already exist.

## Strongest case against

The category's most obvious product already exists for free. A venue can simply ban smart glasses and train staff. The detector may produce uncertain alerts that create operational conflict without proving recording.

## Naval

Interesting current arbitrage, weak durable ownership unless it evolves into a broader physical-world permission/control layer.

## Franklin

Concrete nuisance with immediate local experiments: one nightclub, event, school or confidential meeting.

## Sisney

Test the venue workflow before building detection infrastructure.

## Forecast

**35%** chance of a paid B2B venue-enforcement wedge; **<15%** for another generic consumer radar.

Lower below 20% if venue operators say policy/visual checks are sufficient.
Raise above 55% if venue operators ask for enforcement evidence, continuous monitoring, signage/training, or event-level audit logs.

## Cheapest credible test

Do **not** build another detector. Offer a venue/event smart-glasses enforcement pilot using existing detection tools + policy/signage/staff workflow. Test whether the operational service is worth money.

---

# 4. Agent approval + action receipts

## Resolvable question

Is there an accessible cross-platform wedge for small teams that need explicit human approval and auditable receipts for agent actions?

## External evidence

- OpenAI explicitly uses confirmations for consequential actions and agent-native telemetry in its own deployments.
- Microsoft Entra Agent ID provides agent identity, governance, lifecycle, least privilege and audit controls.
- Okta for AI Agents registers agents, assigns human owners, governs access, offers kill switches, audit trails and an Agent Gateway that logs tool calls.

Sources:

- https://openai.com/index/running-codex-safely/
- https://openai.com/safety/prompt-injections/
- https://learn.microsoft.com/en-us/entra/agent-id/security-for-ai-overview
- https://www.okta.com/en-ca/products/govern-ai-agent-identity/

## Want

**Strong category need.** Accountability, least privilege, approvals and logs recur across serious agent deployments.

## Deliver

**Medium.** A lightweight gateway/receipt layer is feasible, but integrations, authentication and security quality raise the bar quickly.

## Economics

**Unknown but potentially strong enterprise spend.** Small-team willingness to pay is less clear.

## Survive

**High category importance; low-medium independent wedge.** Microsoft, Okta and model platforms are rapidly making these controls native.

## Strongest case against

The control plane belongs naturally to identity, cloud and agent platforms. A standalone startup can become middleware squeezed between giants.

## Naval

Excellent future territory—permission, consequence, accountability become more valuable as intelligence commoditizes. But platform dependency and low ownership are major warnings.

## Franklin

Needs a specific repeated nuisance before productization; "agent governance" is too broad.

## Sisney

Do not create a control plane before a repeated workflow demands it.

## Forecast

**30%** chance of a near-term small paid wedge; **high confidence the category itself grows materially**.

## Cheapest credible test

No build yet. Conduct targeted problem discovery with teams already deploying agents, or create a tiny approval/receipt wrapper around one actual workflow we ourselves use and see if it recurs.

---

# 5. Cross-border counterparty / export qualification

## Resolvable question

Will Canadian SMEs pay for done-for-you counterparty qualification before a meaningful international transaction?

## External evidence

EDC published a June 2026 due-diligence checklist specifically for international clients, suppliers and partners. It advises legal/entity checks, ownership/financial history, operations, personnel, references, regulatory specifics, and use of official registries. EDC also provides **Company InSight**, free through MyEDC, and points to the Trade Commissioner Service.

Sources:

- https://www.edc.ca/en/article/exporter-due-diligence-checklist.html
- https://www.edc.ca/en/export-knowledge/tools/search-international-companies.html

## Want

**Medium-high.** The problem is real and tied to current Canadian market diversification.

## Deliver

**High for a basic report; lower for differentiated verification.** Public-source research is easy. Direct references/verification, local-language checks, commercial-credit data and follow-up are harder.

## Economics

**Medium-low until proven.** Free credible substitutes are substantial. The actual paid job may be "find/qualify partners and help me transact," not "give me a report."

## Survive

**Low for research report; medium if workflow/relationships/data.** Generic research gets cheaper as models improve.

## Strongest case against

EDC provides free tools and TCS has offices in 60+ countries. The buyer may reasonably prefer them or a lawyer/credit insurer for high-stakes transactions.

## Naval

Only attractive if we compound relationships, private outcomes, distribution or transaction access. Report generation alone fails the GPT-10x test.

## Franklin

Can be tested manually immediately, but should discover the actual nuisance before defining the product.

## Sisney

Keep it concierge and temporary until the repeated job becomes visible.

## Forecast

**30%** chance of finding a paid wedge as framed; higher if the test reveals adjacent demand for partner qualification/business development.

## Cheapest credible test

Priced manual qualification for one real foreign counterparty. Measure what the buyer actually values in the result and whether the next ask is verification, introduction, insurance, negotiation, or lead generation.

---

# 6. Micro-SaaS sellability / founder-dependency audit

## Resolvable question

Will small SaaS founders pay an independent service to make their business more transferable/sellable?

## External evidence

Acquire.com's 2026 material says buyers remain selective and value predictable recurring revenue, profitability, low churn, clean books, low founder dependency and credible AI defensibility. Its 2025 transaction report says confirmed SaaS profit multiples averaged in the low-to-mid 4x range and smaller businesses often sold within 90 days. A 2026 case study describes Helploom receiving several serious LOIs within days; the founder credited organized credentials, code, documentation and transferability.

Sources:

- https://blog.acquire.com/saas-exits-in-the-new-ai-era-webinar-recap/
- https://blog.acquire.com/acquire-com-biannual-acquisition-multiples-report-jan-2026/
- https://blog.acquire.com/bootstrapped-profitable-and-acquired-in-four-days/

## Want

**Medium.** Founder exit anxiety is real, but the problem occurs relatively late and many brokers/marketplaces already educate sellers.

## Deliver

**High.** Audit/documentation service is easy to deliver.

## Economics

**Medium-low.** Founders may prefer free checklists, brokers or marketplace guidance; frequency is one-off.

## Survive

**Low as standalone knowledge service.** Advice can be codified/free.

## Strongest case against

This is more useful to **us as an opportunity-selection criterion** than as a product.

## Naval

The lesson is ownership/transferability, not necessarily "sell audits."

## Franklin

Useful checklist, weak repeating nuisance/institution.

## Sisney

Could become unnecessary process before we even own a sellable product.

## Forecast

**25%** for a standalone paid audit.

## Decision

**Do not smoke-test this product now.** Instead, incorporate sellability into the Cash Opportunity Radar:

- can the product operate without founder?
- clean code/docs/credentials?
- predictable revenue?
- low churn?
- margins?
- distribution transferable?
- defensible in AI era?

This is a selection lens, not currently a business thesis.

---

# 7. Vibe-code security / launch trust

## Resolvable question

Is there still an underserved paid wedge for a generic pre-launch security scan/certification aimed at AI-built apps?

## External evidence

The underlying problem is absolutely real, but competition has exploded:

- Semgrep launched Guardian specifically for AI-generated code in 2026.
- Snyk markets end-to-end security for AI-generated code.
- VibeCheck/VibeScan sells a one-time scan around **$9.99**.
- Revibed, CheckVibe, ScanVibe, VibeZero, Bleek and open-source scanners target the same "AI-built app security" wedge, many with free scans.

Sources:

- https://semgrep.dev/blog/2026/introducing-semgrep-guardian-real-time-security-for-ai-written-code/
- https://snyk.io/solutions/secure-ai-generated-code/
- https://getvibescan.com/
- https://revibed.io/
- https://checkvibe.dev/vibe-coding-security-scanner

## Want

**Strong.** Security anxiety exists.

## Deliver

**Medium.** Automated scans are easy to create; trustworthy assurance is hard and creates liability.

## Economics

**Low for generic scan.** Free/$10 offers already anchor price while enterprise vendors own higher-value AppSec.

## Survive

**Low for scanner/wrapper.** Coding agents and security platforms will keep integrating scanning/fixes natively.

## Strongest case against

We would enter a category that is already commoditizing *before we even launch*.

## Naval

Bad ownership/average-output profile unless we possess unique distribution, data or accountability.

## Franklin

Useful problem, but too many existing whistles.

## Sisney

External integration signal exists for the category, not for us.

## Forecast

**20%** chance of an accessible generic paid wedge; lower for a durable product.

## Decision

**KILL generic scanner/certification for now.** Revisit only if research reveals a privileged niche, e.g. regulated launch assurance with a buyer/channel we can actually reach.

---

# 8. AI-search visibility monitor

## Resolvable question

Can we win a generic AI-visibility monitoring product in 2026?

## External evidence

The category is already dense:

- Ahrefs Brand Radar tracks AI visibility at massive scale and has a free checker.
- Profound, Peec AI, Scrunch, Semrush, Otterly, AthenaHQ and multiple newer entrants compete on essentially the same monitoring loop.
- Independent/current comparisons show products ranging from low-cost prompt trackers to expensive enterprise tools.

Sources:

- https://help.ahrefs.com/en/articles/11064852-what-is-brand-radar-and-how-to-use-it
- https://ahrefs.com/ai-visibility-checker
- https://nboundmarketing.com/research/ai-visibility/geo-software-feature-comparison/

## Want

**Strong category interest.** AI-mediated discovery is important.

## Deliver

**High.** Monitoring prompts is technically easy.

## Economics

**Low-medium.** Many tools compete from ~$29/mo upward, and SEO incumbents bundle the feature.

## Survive

**Low for monitor.** Platform-native analytics and SEO suites can absorb it.

## Strongest case against

Monitoring has become a feature, not a wedge. "Show me whether AI mentions my brand" is already widely sold and often free.

## Naval

Average software; weak ownership unless distribution or proprietary outcome data is unique.

## Franklin

The repeating nuisance may be **fixing visibility**, not monitoring it.

## Sisney

Do not build a dashboard because the market has dashboards.

## Forecast

**15%** for a generic monitor.

## Decision

**KILL generic monitor.** A future niche done-for-you outcome service could still be tested if a particular industry/channel gives us privileged access.

---

# Lens synthesis

## Naval

The three immediate tests are imperfect, but they sit closer to consequential action than generic reports/dashboards. The long-run strongest territory remains **identity / authorization / accountability / verification immediately before exposure**. Agent governance is strategically more important than its near-term testability.

## Franklin

Prioritize nuisances we can solve this week with real people and no software. Supplier verification and venue enforcement can both be concierge. AI Act implementation can be a simple service before a product.

## Sisney

We are still in discovery/Innovating mode. Do not stabilize a product architecture. Test external integration. Standardize only after repetition.

## Superforecasting

The priors force us to admit none of the immediate candidates is >50% likely to reveal a paid wedge under the defined short test. That is acceptable because tests are cheap and information value is high. The correct objective is calibrated learning, not being certain before acting.

---

# Recommended next three tests

## Test A — Supplier payment-change verification

Why: clearest payer + consequence + manual feasibility + trust-thesis adjacency.

Primary uncertainty: **will an SME pay rather than use callback/dual approval?**

## Test B — AI Act Article 50 implementation pack

Why: unusually sharp timing; obligation already applies; very fast digital acquisition test.

Primary uncertainty: **is implementation painful enough to pay for beyond free guidance/vendor defaults?**

## Test C — Smart-glasses venue enforcement pilot

Why: current cultural/enterprise signal, unusual new physical-world trust/privacy problem, and we can test the **venue workflow** without building a detector.

Primary uncertainty: **will venues pay for enforcement beyond a posted ban/staff observation?**

These are not "the three businesses." They are the three most information-efficient experiments from the current eight.

---

# Watchlist

- **Agent approval/action receipts** — strategically important; wait for a specific repeated workflow / buyer access.
- **Cross-border qualification** — keep close to ScanScam/Canada trade exploration; test after/alongside the current three if fresh pull appears.
- **Acquire/improve/resell tiny SaaS** — treat as a separate capital/allocation strategy. Use sellability criteria from Acquire research to evaluate assets; do not confuse it with a PMF product test.

---

# Calibration record

Initial decision priors recorded 2026-08-31:

- Supplier payment verification: 45%
- Article 50 implementation: 40%
- Smart-glasses venue enforcement: 35%
- Agent approval/action receipts: 30% near-term paid wedge
- Cross-border counterparty verification: 30%
- Micro-SaaS sellability audit: 25%
- Vibe-code generic security wedge: 20%
- Generic AI-search monitor: 15%

Do not rewrite these after results. Append posterior updates with evidence.
