# ScanScam PMF Operating Model

Status: v0.2 — simplified operating model
Date: 2026-08-31

Inputs:

- `wisdom/syntheses/AGENTIC_PMF_ENGINE.md`
- `projects/scanscam/EXPERIMENTS.md`
- `projects/scanscam/CUSTOMER_INTEL.md`
- `wisdom/lenses/NAVAL.md`
- `wisdom/lenses/FRANKLIN.md`
- `wisdom/lenses/LEX_SISNEY.md`

## Core principle

> **Search broadly. Test narrowly. Follow pull. Standardize what repeats.**

Do not use “horizontal” and “vertical” as PMF rules unless explicitly defined; they are easy to confuse with organizational-design terminology.

### 1. Search broadly

Explore different trust problems, users, payers, triggers, markets, and business models cheaply.

This is discovery, not commitment.

Agents can help here because public research, search-intent mining, competitor mapping, and hypothesis generation are broad and checkable.

### 2. Test narrowly

A real test should isolate one concrete combination:

**who → trigger → job → payer → offer → channel → success / kill condition**

Do not change several of those at once and then pretend the result taught us which assumption was wrong.

### 3. Follow pull

When a test produces stronger evidence — payment, repeated use, workflow/data access, serious design-partner commitment, or repeated qualified demand — go deeper on that exact problem.

Do not broaden just because the idea is interesting.

### 4. Standardize what repeats

Only after useful work repeats should we stabilize it into:

- product features
- workflows
- agents
- automation
- distribution systems
- durable operating structure

This is the shared Naval / Franklin / Sisney logic:

- **Naval:** preserve compounding; own what remains.
- **Franklin:** test cheaply; copy what works.
- **Sisney:** Innovate before fit, Produce when pull appears, Stabilize after repetition.

---

# What should be human vs agentic

| Work | Default |
|---|---|
| Search markets / trust problems / signals | **ONE AGENT** or chat |
| Mine Ads, search, analytics, competitors | **ONE AGENT** |
| Generate / red-team hypotheses | **CHAT / ONE AGENT** |
| Choose what to test | **HUMAN** |
| Design the experiment | **ONE AGENT drafts; HUMAN approves** |
| Build page/code/instrumentation | **ONE AGENT / Cursor; HUMAN approves deploy** |
| Build prospect list | **ONE AGENT** |
| Draft outreach/content | **ONE AGENT drafts** |
| Send reputation-bearing outreach/content | **HUMAN** |
| Customer interviews | **HUMAN** |
| Sales, price, negotiation | **HUMAN** |
| Pull metrics / summarize conversations | **ONE AGENT** |
| Close experiment / update learning ledger | **ONE AGENT drafts; HUMAN verifies** |
| Decide deepen / change / kill | **HUMAN** |
| Autonomous spend, promises, pivots, contracts | **DO NOT AUTOMATE** |

No permanent multi-agent company is justified yet. Add another agent only when a recurring job creates enough work to justify it.

---

# First agent to test

## Experiment Closer / Archivist

Why first: ScanScam already showed the failure mode it fixes — experiments happened, but outcomes and learning were not consistently preserved.

Job:

> Turn a completed experiment into a factual, reviewable learning record.

It may:

- read the experiment and results
- separate FACT / FOUNDER-REPORTED / INFERENCE
- compare results with the declared success/kill condition
- extract customer language
- draft updates to `EXPERIMENTS.md` and `CUSTOMER_INTEL.md`
- propose deepen / change / kill

It may not:

- make the final decision
- alter `NOW.md` automatically
- publish externally
- spend money
- invent missing evidence

Kill it if reviewing its work takes as long as doing the postmortem manually.

---

# Small test card

Before building anything, write:

```text
WHO:
TRIGGER:
JOB:
PAYER:
OFFER / PRICE:
CHANNEL:
SUCCESS:
KILL:
MAX TIME / CASH:
```

If **payer**, **trigger**, or **kill** is unclear, the test is not ready.

---

# Evidence rule

Prefer evidence in this order:

**payment / repeat behavior > committed workflow or data > qualified conversation > signup/click/scan > opinion/idea**

Do not add weak signals together and call them strong evidence.

---

# Operating loop

1. **SEARCH** — agents + founder scan broadly for trust problems and market signals.
2. **CHOOSE** — founder picks one concrete hypothesis worth testing.
3. **TEST** — smallest credible real-market test.
4. **LEARN** — close the experiment and preserve the evidence.
5. **FOLLOW PULL** — deepen where evidence strengthens; change or kill where it does not.
6. **AUTOMATE LATER** — only repeated useful work earns structure or agents.

That is the whole PMF operating model for now.
