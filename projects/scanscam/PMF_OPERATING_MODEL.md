# ScanScam PMF Operating Model

Status: v0.1 — operating classification, not agent implementation
Date: 2026-08-31

Inputs:

- `wisdom/syntheses/AGENTIC_PMF_ENGINE.md`
- `projects/scanscam/EXPERIMENTS.md`
- `projects/scanscam/CUSTOMER_INTEL.md`
- `wisdom/lenses/NAVAL.md`
- `wisdom/lenses/FRANKLIN.md`

## Core strategy

> **Vertical in the test. Horizontal only after fit.**

A PMF experiment should go deep on one tightly defined combination:

**segment → trigger → job → payer → offer → channel → evidence threshold**

Do not test “trust” horizontally across many unrelated buyers at once. That creates motion without specific knowledge.

Horizontal expansion is allowed only after a vertical produces stronger evidence (normally Level 4–5 in `AGENTIC_PMF_ENGINE.md`) or after a repeated workflow clearly generalizes.

Horizontalization should reuse something that already compounds:

- customer relationships
- distribution
- domain knowledge
- outcome data
- reputation
- workflow
- reusable infrastructure

If an adjacent test resets all of those, treat it as a new game, not a pivot.

---

# 1. Agent-shaped-work classification

Verdicts use the current gate:

- **CHAT** — open-ended thinking; founder should stay in the loop continuously
- **ONE AGENT** — bounded multi-step work with cheap review
- **MULTI-AGENT** — independent/decomposable work where parallel perspectives materially improve the answer
- **HUMAN** — judgment-, relationship-, reputation-, money-, or ambiguity-heavy
- **DO NOT AUTOMATE (v0)** — automation would remove learning or create unjustified risk

| PMF job | Size | Independence | Separation value | Checkability | Economic value | Verdict | v0 authority |
|---|---|---|---|---|---|---|---|
| Choose the vertical / problem | Medium | Low | Some | Low | Very high | **HUMAN + CHAT** | Founder decides |
| Generate alternative hypotheses inside the chosen vertical | Small/medium | Low | Some | Medium | Medium | **CHAT** | Advise only |
| Public-source market / competitor research for one approved vertical | Large | High | Medium | High | High | **ONE AGENT** | A0 read/analyze |
| Mine Google Ads/search/analytics for patterns | Medium | High | Low | High | High | **ONE AGENT** | A0 read/analyze |
| Build a broad market map across many industries | Large | High | High | Medium | Low before fit | **DO NOT AUTOMATE (v0)** | Avoid horizontal wandering |
| Red-team one approved business hypothesis | Medium | High | High | Medium | High | **ONE AGENT** initially | A0 advise |
| Design a falsifiable experiment | Medium | High after inputs | Medium | High | High | **ONE AGENT** | A1 draft |
| Define success / kill thresholds | Small | Low | Some | Medium | Very high | **HUMAN + CHAT** | Founder approves |
| Draft offer / landing-page copy | Medium | High | Low | Medium | High | **ONE AGENT** | A1 draft |
| Implement a bounded landing/page/code change | Medium/large | High | Low | Very high (tests/diff) | High | **ONE AGENT** (Cursor) | A1/A2; human deploy approval |
| Instrument experiment analytics | Medium | High | Low | Very high | High | **ONE AGENT** | A1/A2; reviewed |
| Build a qualified prospect list for one vertical | Medium/large | High | Low | High by sampling | High | **ONE AGENT** | A0/A1 |
| Draft personalized outbound | Medium | High | Low | Medium | High | **ONE AGENT** | A1 draft only |
| Send cold outreach autonomously | Medium | High | Low | Low before consequences | Medium | **DO NOT AUTOMATE (v0)** | Human sends |
| Publish under Gabriel / ScanScam name | Small | High | Low | Low after publication | High | **HUMAN** | Human approval/send |
| Run customer discovery interview | Large | Low | Low | Low | Extremely high | **HUMAN** | Human owns conversation |
| Prepare interview brief / questions | Small | High | Low | High | Medium | **ONE AGENT** | A1 draft |
| Summarize interview notes and extract exact customer language | Medium | High | Low | High against transcript/notes | High | **ONE AGENT** | A1 draft |
| Interpret emotional / political / strategic customer signal | Medium | Low | Low | Low | Extremely high | **HUMAN** | Founder judgment |
| Price / discount / negotiate | Medium | Low | Some | Low | Extremely high | **HUMAN** | Founder decides |
| Recommend ad budget / keyword changes | Medium | High | Low | High | Medium | **ONE AGENT** | A0 advise |
| Spend money / change campaign budgets automatically | Medium | High | Low | Medium | High downside | **DO NOT AUTOMATE (v0)** | Human approves |
| Pull experiment metrics and compare with declared threshold | Medium | High | Low | Very high | Very high | **ONE AGENT** | A0/A1 |
| Draft experiment postmortem | Medium | High | Medium | Very high | Very high | **ONE AGENT** | A1 |
| Update experiment/customer-intel ledger | Medium | High | Low | Very high via git diff | Very high | **ONE AGENT** after review | A1 now; A2 later |
| Decide TEST / ITERATE / KILL / SCALE | Small | Low | Some | Low | Extremely high | **HUMAN** | Founder decides |
| Decide when to leave the vertical | Small | Low | Some | Low | Extremely high | **HUMAN + Naval/Franklin lenses** | Founder decides |
| Horizontalize a validated workflow into adjacent segments | Large | Medium | High | Medium | Potentially very high | **HUMAN + ONE AGENT research** | Only after fit |
| Autonomous product pivot | Large | High | High | Low | High downside | **DO NOT AUTOMATE** | Never in v0 |

---

# 2. What this implies

## We do not need a multi-agent company yet

No current PMF job requires a permanent multi-agent swarm.

Multi-agent work becomes justified when all three are true:

1. the vertical is already important enough to merit expensive breadth,
2. work splits into genuinely independent lines (for example legal/regulatory, commercial, technical, adversarial research),
3. synthesis can be cheaply verified against evidence.

Until then, multiple named agents mostly add coordination cost.

## The highest-value human work remains scarce

Gabriel should spend disproportionate time on:

- choosing the vertical
- customer conversations
- selling / asking for money
- negotiation
- reading weak or strange signals
- reputation-bearing communication
- capital allocation
- deciding when evidence is enough to stay, pivot, or stop

Agents should remove research/admin latency around those activities, not remove Gabriel from the market.

---

# 3. First agent to test

## Recommendation: Experiment Closer / Archivist

This is the strongest first agent-shaped job because it fixes a failure already observed in ScanScam: experiments were shipped, changed, and sometimes forgotten before outcomes became durable memory.

### Agent-shaped-work gate

- **Size:** meaningful after every experiment
- **Independence:** high once inputs/results exist
- **Separation:** useful — evaluator should not be the same cognitive pass that designed the experiment
- **Checkability:** very high; compare against declared thresholds, telemetry, notes, and git
- **Economic value:** high; prevents repeated tests and preserves specific knowledge
- **Reputation risk:** low; internal-only

### v0 authority

A1 — draft only.

It may:

- read experiment spec and observed results
- separate FACT / FOUNDER-REPORTED / INFERENCE
- compare outcome to predeclared thresholds
- identify what was falsified / not falsified
- draft updates to `EXPERIMENTS.md` and `CUSTOMER_INTEL.md`
- propose TEST / ITERATE / KILL / SCALE

It may **not**:

- make the final decision
- alter `NOW.md` automatically
- publish externally
- spend money
- change product behavior
- invent missing metrics

### Definition of done

Every closed experiment leaves:

**hypothesis → vertical → payer → offer → channel → exposure → observed behavior → money → result → falsified/not-falsified → customer language → next decision**

and the founder can verify the draft faster than reconstructing the experiment manually.

### Kill condition

Retire/simplify the agent if review and correction take as long as writing the postmortem manually, or if it repeatedly overstates weak evidence.

---

# 4. Likely second and third agents — only if the jobs repeat

## Vertical Intelligence Agent — probable second

For one founder-approved vertical only.

Job: gather public evidence, competitors, current alternatives, existing spend, buyer roles, triggering events, and counterevidence.

It must not select the vertical or recommend horizontal expansion on its own.

Authority: A0.

## Experiment Builder — probable third

Job: convert a founder-approved vertical hypothesis into a test package:

- payer
- trigger
- job
- offer
- price hypothesis
- channel
- artifact required
- sample/exposure target
- success threshold
- kill threshold
- instrumentation

Authority: A1.

No other permanent roles until these create recurring review burden.

---

# 5. Vertical test protocol

Every vertical test must fit on one page before anything is built.

```text
VERTICAL:
WHO:
TRIGGER / MOMENT OF EXPOSURE:
JOB TO BE DONE:
WHO PAYS:
CURRENT ALTERNATIVE / EXISTING SPEND:
WHY NOW:
OFFER:
PRICE HYPOTHESIS:
CHANNEL:
DELIVERABLE:
WHAT MUST REMAIN HUMAN:
WHAT AI/AGENTS MAY DO:
SAMPLE / EXPOSURE TARGET:
SUCCESS THRESHOLD:
KILL THRESHOLD:
MAX TIME:
MAX CASH:
EVIDENCE LEVEL SOUGHT:
WHAT ASSET COMPOUNDS IF IT WORKS:
WHAT WOULD GPT 10x COMMODITIZE:
WHAT REMAINS VALUABLE IF GPT 10x IMPROVES:
```

A test is invalid if “who pays,” “trigger,” or “kill threshold” is missing.

---

# 6. Stay vertical / go horizontal rule

## Stay vertical when

- real users keep exposing new edge cases
- response quality is improving
- customer language is becoming more specific
- a buyer role is emerging
- conversations lead to data/workflow access
- payment/design-partner evidence increases
- the same job recurs
- the next experiment builds on the prior one

## Kill or change the vertical when

- qualified prospects repeatedly do not recognize the problem
- the problem is real but nobody owns budget/responsibility
- generic AI/search solves it well enough at negligible switching cost
- acquiring the customer costs more than the plausible value
- repeated tests produce only Level 1–2 evidence
- progress depends on changing buyer, job, channel, and product simultaneously

## Horizontalize only when

At least one vertical has repeated Level 4–5 evidence **or** a repeated workflow is clearly valuable across adjacent customers.

Then ask:

> Which component is actually generalizable — verification method, evidence model, workflow, distribution, dataset, reputation, or transaction infrastructure?

Horizontalize that component. Do not prematurely horizontalize the whole company.

---

# 7. Current operating recommendation

1. Keep only **one active vertical PMF test** at a time unless a second test requires nearly zero founder attention.
2. Use ChatGPT + GitHub + Cursor manually for now.
3. Implement **Experiment Closer / Archivist** first only after the next real vertical experiment has a declared spec and outcome to evaluate.
4. Compare its time/rework against doing the postmortem manually.
5. If useful, keep it and test the Vertical Intelligence Agent next.
6. Do not create a multi-agent roster until repeated work demonstrates the need.

This operating model is intentionally smaller than a “Business in a Box” org chart. The point is to earn automation from repeated reality rather than design an AI company before the market tells us what company should exist.
