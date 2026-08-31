# ScanScam experiment ledger

Reconstructed 2026-08-31 from git history in `Gabothefounder/scanscam` and operating notes in `Gabothefounder/personal-os-v2`.

This is a **documentation ledger**, not a product proposal.

Epistemic labels used below:

- **FACT** — in commits, files, or PR merge records
- **FOUNDER-REPORTED** — stated by Gabriel in GitHub issue #1 (and restated here without strengthening)
- **PRODUCT COPY** — claim shown to users; not independently verified from telemetry in this reconstruction
- **NOT IN REPO** — no counts, sheet exports, or result write-ups in either git history

Do not treat scanner usage as retention or willingness to pay. Do not treat a deployed landing page as demand. Do not treat the Trust Thesis as PMF.

**Repo facts at reconstruction:**

- ScanScam default branch `main` includes conversation + Family Protect landings after merge of PRs #7 and #8 (2026-08-18). Earlier local clones that stopped at `3aa91c9` (2026-05-30) were stale.
- Vercel deploy logs were **not** inspected. Merge to `main` is not independent proof of live traffic.
- No Stripe (or other payment rail) exists in the ScanScam repo. SQL views mention `payment_completed`; no TypeScript emitter for that event was found.
- Founder Control Panel / Google Sheets (Daily Pulse, user research, survey experiments) are wired in code; **sheet contents are not in git**.

---

## FOUNDER-REPORTED

Source: GitHub issue [#1](https://github.com/Gabothefounder/personal-os-v2/issues/1) (2026-08-31). These statements may not exist in telemetry or commits. Do not upgrade them.

- Google Ads produced scans, but users did not come back in a meaningful way.
- Several paid-option experiments produced no purchases.
- Free offers / conversation-booking attempts also failed to show clear pull.
- Product-market fit has **not** been established for consumer, family, or B2B use.

---

## Ledger

### EXP-001 — Free public scanner (core product)

- **Date / period:** Shipped by 2025-12-29; still the live core product through 2026-08.
- **Hypothesis:** People with a suspicious message will use a free, no-login scanner and get a useful risk reading.
- **Audience / segment:** Consumer (EN/FR). Not B2B. Not family-protect.
- **Offer / CTA:** Homepage evolved from **“Scan a Scam”** (2025-12-29) to **“Is this a scam?” / “Check Now”** (2026-02-22). Support copy: “No login required. Instant results.”
- **Channel:** organic / direct / later Google Ads (see EXP-003) / landing page
- **What changed:** Dual CTA (scan vs community report) → conversion-focused single primary CTA; scan + result pipeline hardened through 2026.
- **Traffic / exposure:** **PRODUCT COPY** on `/conversation` (2026-08-18) claims **“1,350+ real-world checks.”** That number is not reproduced from a telemetry export in this reconstruction. Treat as founder-facing copy until verified.
- **Observed behavior:** **FOUNDER-REPORTED:** Ads-driven scans happened; return behavior was not meaningful (see EXP-003). Repeat-use rates: **NOT IN REPO**.
- **Revenue / conversion:** Free. Usage ≠ payment.
- **User conversations / qualitative evidence:** **NOT IN REPO** (no saved interview notes in either workspace).
- **Result:** **WEAK** as a business test (usage without demonstrated retention or pay). **POSITIVE** only as “people will submit a message once.”
- **What this actually falsified:** Nothing about willingness to pay. Nothing about B2B. Nothing about family protection.
- **What it did NOT falsify:** That a scam-check problem exists; that the scanner is useless; that a different offer/segment could pay.
- **Learning:** Free scanner usage is not PMF. Do not cite scan volume as demand for a paid product.
- **Next implication:** Any new offer must measure return and payment separately from scan count.
- **Source:** `scanscam` `a06f553` (2025-12-29), `4f085f9` (2026-02-22), `app/page.tsx`, `app/scan/page.tsx`, `app/result/ResultView.tsx`; conversation copy `lib/conversation/copy.ts`

---

### EXP-002 — Community report / “mission gate”

- **Date / period:** 2025-12-29 onward
- **Hypothesis:** Recipients of scams will spend ~3 minutes filing a community report that becomes a warning for others.
- **Audience / segment:** Same consumer as EXP-001
- **Offer / CTA:** Secondary homepage CTA **“Report a Scam”** → `/report` (“Take 3 minutes. Turn what happened to you into a warning for others.”)
- **Channel:** landing page (organic)
- **What changed:** Multi-step `/report/*` mission-gated flow
- **Traffic / exposure:** **NOT IN REPO**
- **Observed behavior:** **NOT IN REPO**
- **Revenue / conversion:** Unpaid community contribution. Completions **NOT IN REPO**.
- **User conversations / qualitative evidence:** **NOT IN REPO**
- **Result:** **NOT MEASURED**
- **What this actually falsified:** Nothing recorded.
- **What it did NOT falsify:** Whether community reporting is valuable.
- **Learning:** A second CTA was built; no result log was kept.
- **Next implication:** Do not assume a “network of reports” exists. Count submissions before building on it.
- **Source:** `scanscam` `a06f553`, `ccabf97`; `app/report/`

---

### EXP-003 — Google Ads acquisition of free scans

- **Date / period:** Tag installed 2026-02-22; UTM/gclid capture 2026-03-08; first-touch attribution persistence 2026-05-11. Campaign dates **NOT IN REPO**.
- **Hypothesis:** Paid search can acquire people with a live suspicious-message problem who will scan (and, implicitly, return or convert).
- **Audience / segment:** Consumer search traffic
- **Offer / CTA:** Same free scanner (EXP-001). Conversion event fired on valid result render.
- **Channel:** Google Ads
- **What changed:** Global tag `AW-16787240010`; conversion `AW-16787240010/-lHQCNrulP0bEMro48Q-`; anonymous UTM + `gclid` on scans/telemetry; `sessionStorage` first-touch snapshot (`lib/attribution.ts`). Founder Control Daily Pulse has **manual** Ad Spend/Clicks columns; Ads API explicitly out of scope.
- **Traffic / exposure:** **FOUNDER-REPORTED:** Ads produced scans. Counts, spend, CPA: **NOT IN REPO**.
- **Observed behavior:** **FOUNDER-REPORTED:** users did not come back in a meaningful way.
- **Revenue / conversion:** Ads conversion = scan completed, not purchase.
- **User conversations / qualitative evidence:** **NOT IN REPO**
- **Result:** **NEGATIVE** on retention/return (**FOUNDER-REPORTED**). Acquisition-of-scans may have “worked” as a pixel event; that is not a business result.
- **What this actually falsified:** That Google Ads → free scan is, by itself, a path to retained users (**FOUNDER-REPORTED**, not a sheet-backed funnel).
- **What it did NOT falsify:** Ads for a *different* offer (paid brief, family, B2B); organic retention; whether the problem is real.
- **Learning:** Buying scans is not buying customers. Attribution plumbing was built; outcomes were not written back into the operating workspace.
- **Next implication:** Do not scale the same Ads → free scanner loop hoping retention appears. If Ads are reused, the success metric cannot be `scan_completed`.
- **Source:** `scanscam` `8d82b33`, `0d9fdbc`, `b540c4f`, `d0091b3`; `app/layout.tsx`, `lib/gtag.ts`, `founder-control/SETUP.md`; issue #1

---

### EXP-004 — Pro Decision Report (“$5”) with free beta unlock

- **Date / period:** 2026-05-03–04 (sales page, checkout, shareable `/r/[token]`); still in repo
- **Hypothesis:** After a free scan, people will pay a small amount for a fuller decision report.
- **Audience / segment:** Consumer, post-scan
- **Offer / CTA:** Result upsell **“Unlock full report — $5”** (`lib/proReports/getDecisionReportSalesCopy.ts`). On `/pro`: **“Beta access: today, you can unlock it for free after answering 4 short questions.”** Checkout: **“Unlock your beta report”** — free survey, not a charge.
- **Channel:** in-product, post-scan
- **What changed:** `/pro`, `/pro/checkout`, `/r/[token]`, beta-unlock API, telemetry `pro_sales_viewed`, `beta_unlock_*`, `pro_unlock_clicked`
- **Traffic / exposure:** Event schema exists. Counts **NOT IN REPO**.
- **Observed behavior:** **FOUNDER-REPORTED:** paid-option experiments produced no purchases.
- **Revenue / conversion:** **FACT:** no payment integration in repo. “No purchases” is therefore **overdetermined**: users were not given a working $5 checkout. Free unlocks (survey) are not purchases.
- **User conversations / qualitative evidence:** Survey answers (if any) live in Supabase/`DATA_User Research`. **NOT IN REPO.**
- **Result:** **INCONCLUSIVE** as a price test ($5 was displayed, not charged). **NEGATIVE** as “this funnel produced revenue” (**FOUNDER-REPORTED** + no rail).
- **What this actually falsified:** That putting “$5” on a button, while unlocking for free, produces recorded revenue. It does **not** falsify that $5 (or another price) would fail if checkout existed.
- **What it did NOT falsify:** WTP if a real charge existed; that a report is unwanted at any price.
- **Learning:** Paid *copy* ≠ paid *offer*. Do not cite this as “consumers won’t pay $5.”
- **Next implication:** A future paid test needs an actual charge, a defined deliverable, and a kill metric. Do not restyle the same fake-$5 button.
- **Source:** `scanscam` `2d06bf5`, `d40595f`, `1c63408`; `app/pro/page.tsx`, `app/pro/checkout/page.tsx`; issue #1

---

### EXP-005 — Post-scan user-research report gate (4 questions)

- **Date / period:** Added 2026-05-08; copy-test overlay 2026-05-12; **removed from live result flow** by 2026-05-22 (component remains)
- **Hypothesis:** People will answer four questions (including willingness-to-pay) to unlock a “full report”; answers will reveal need and price.
- **Audience / segment:** Consumer, post-scan
- **Offer / CTA:** Badge **“4 short questions — about 30 seconds”**; submit **“Unlock the full report.”** Q4: **“If ScanScam truly solved your problem, what price would feel fair?”** (bands from $0–$5 through $150–$500/month). 2026-05-12 copy: **“Free action plan” / “Get My Action Plan Now.”**
- **Channel:** in-product gate
- **What changed:** `UserResearchGate` → tokenized `/r/{token}`; May 12: weak-input gate only for partner/MSP; direct users saw results immediately; CTA relabeled “action plan.”
- **Traffic / exposure:** Export view `ops_user_research_export_v1` → sheet `DATA_User Research`. Row counts **NOT IN REPO**.
- **Observed behavior:** **NOT IN REPO**
- **Revenue / conversion:** Unlock was free. Stated prices are hypothetical WTP, not charges.
- **User conversations / qualitative evidence:** Answers **NOT IN REPO**. Exact wording of questions is in code (not customer language).
- **Result:** **NOT MEASURED** (data may exist in Sheets; not reconstructed here)
- **What this actually falsified:** Nothing we can see.
- **What it did NOT falsify:** Price, need, or PMF.
- **Learning:** A research instrument was shipped and then replaced before results were written into the operating log. That is a process failure, not a market finding.
- **Next implication:** If the table has rows, export a summary into this ledger before running another survey gate.
- **Source:** `scanscam` `d4a7999`, `1f85e15`; `app/result/UserResearchGate.tsx`

---

### EXP-006 — Parking-ticket-text smoke test

- **Date / period:** 2026-05-15
- **Hypothesis:** A specific scam pattern (parking-ticket SMS) is a better entry than generic “is this a scam?”
- **Audience / segment:** People who received a parking-ticket text (narrow consumer)
- **Offer / CTA:** `/parking-ticket-text` — **“Got a parking ticket text?”** / **“Get the right next-step checklist before you click or pay.”** **“Free. No email required.”**
- **Channel:** landing page (intended paid/organic unknown; UTM captured)
- **What changed:** Survey experiment `parking_ticket_text` / `parking_ticket_text_v1`; checklist branches; writes `survey_experiment_responses`
- **Traffic / exposure:** **NOT IN REPO**
- **Observed behavior:** **NOT IN REPO**
- **Revenue / conversion:** Free. No pay.
- **User conversations / qualitative evidence:** Open-text fields possible; contents **NOT IN REPO** (do not pull PII here)
- **Result:** **NOT MEASURED**
- **What this actually falsified:** Nothing recorded.
- **What it did NOT falsify:** Vertical smoke tests in general; this vertical specifically.
- **Learning:** A clean, cheap experiment was built. Outcome never landed in the workspace.
- **Next implication:** Check `DATA_Survey_Experiments` before repeating or killing this vertical.
- **Source:** `scanscam` `2cffcfc`; `app/parking-ticket-text/`, `lib/parkingTicketText/copy.ts`

---

### EXP-007 — Human review beta ($49 call, mailto)

- **Date / period:** On result page 2026-05-22 → replaced 2026-05-30 (8 days). Component still in repo, not wired in current `ResultView`.
- **Hypothesis:** After a scan, some users will pay for a short human call before they act.
- **Audience / segment:** Consumer, post-scan (copy varies by risk tier)
- **Offer / CTA:** **“Beta: $49 / one situation / short call.”** Button **“Email hello@scanscam.ca.”** Medium-risk headline: **“Still in a fog about what to do?”**
- **Channel:** in-product; fulfillment via email (no checkout)
- **What changed:** `HumanReviewCallCTA` variant `human_review_beta_v1`; telemetry viewed/clicked
- **Traffic / exposure:** Click counts **NOT IN REPO**. Live window ~8 days if `main` was production.
- **Observed behavior:** **FOUNDER-REPORTED:** paid-option experiments produced no purchases.
- **Revenue / conversion:** Off-platform email. **FOUNDER-REPORTED:** no purchases. Inbox contents not inspected.
- **User conversations / qualitative evidence:** **NOT IN REPO**
- **Result:** **NEGATIVE** on recorded paid take-up (**FOUNDER-REPORTED**). Sample size and impression count **NOT IN REPO** — do not treat as a high-powered test.
- **What this actually falsified:** That this exact $49 mailto CTA, in that window, produced purchases Gabriel remembers.
- **What it did NOT falsify:** Human review at another price, calendar booking, or longer exposure.
- **Learning:** A priced human offer was shown. Payment was friction-heavy (email). Absence of purchases is real as founder memory; it is not a measured funnel.
- **Next implication:** Do not restage the same mailto $49 card and call it a new test.
- **Source:** `scanscam` `e976a6d`, `3aa91c9`; `lib/humanReviewCallCTA/copy.ts`; issue #1

---

### EXP-008 — Guide report email opt-in (free)

- **Date / period:** 2026-05-30 — current post-scan CTA on `main`
- **Hypothesis:** People will give an email to receive a private next-step report (lead capture / smoke test for a report product).
- **Audience / segment:** Consumer, post-scan (non-partner)
- **Offer / CTA:** **“Get your free next-step report”** / **“Send me the report.”** Panel: **“Enter your email to open your private next-step report.”** Variant `guide_report_v1`
- **Channel:** in-product
- **What changed:** Replaced human-review CTA on the result page. Email → `guide_leads` + `pro_report_access` → `/r/{token}`
- **Traffic / exposure:** Telemetry `guide_report_*`. Counts **NOT IN REPO**.
- **Observed behavior:** **FOUNDER-REPORTED:** free offers failed to show clear pull (grouped with conversation-booking; not named specifically). Do not force this CTA into that sentence beyond “free offer.”
- **Revenue / conversion:** Free email gate. Opt-in rate **NOT IN REPO**.
- **User conversations / qualitative evidence:** **NOT IN REPO**
- **Result:** **NOT MEASURED** in git. Qualitatively covered only if counted among “free offers” in issue #1.
- **What this actually falsified:** Nothing quantitative here.
- **What it did NOT falsify:** Email demand for a report; paid demand.
- **Learning:** The live consumer CTA is still a **free** report-for-email, not a paid product.
- **Next implication:** Pull `guide_leads` count before deciding this channel has pull or does not.
- **Source:** `scanscam` `3aa91c9`; `components/PostResultReportCTA.tsx`, `lib/postResultReportCTA/copy.ts`

---

### EXP-009 — Founder conversation / booking landing

- **Date / period:** Committed 2026-08-18; **merged to `main`** PR #7 then PR #8 (2026-08-18)
- **Hypothesis:** People who see fraud up close (fraud, banking, payments, cybersecurity, MSP, insurance, telecom, customer protection) will book 30 minutes of discovery. Copy also sells a vision beyond the scanner.
- **Audience / segment:** Professional / adjacent operators — **not** the consumer scanner user, **not** Family Protect, **not** SME Counterparty Scan
- **Offer / CTA:** `/conversation` + `/fr/conversation`. Headline **“Scams are breaking trust.”** Ask: **“I'm looking for 20 people who see this problem up close.”** CTA **“Book 30 minutes with me →”** → Google Calendar `https://calendar.app.google/jHcoWuZWKB8NTrXz6`. Support: **“No sales pitch.”** Fallback `hello@scanscam.ca`
- **Channel:** landing page (distribution **NOT IN REPO** — Ads vs organic vs founder share unknown)
- **What changed:** New bilingual landing + telemetry `conversation_page_view`, `conversation_booking_click`, `conversation_email_click`
- **Traffic / exposure:** **NOT IN REPO**. **PRODUCT COPY** cites 1,350+ checks (same caveat as EXP-001).
- **Observed behavior:** **FOUNDER-REPORTED:** conversation-booking attempts failed to show clear pull. Booked-conversation count **NOT IN REPO**.
- **Revenue / conversion:** Explicitly not a sales pitch. Bookings ≠ revenue.
- **User conversations / qualitative evidence:** If any calls happened, notes are **NOT IN REPO**.
- **Result:** **WEAK** / no clear pull (**FOUNDER-REPORTED**). Not a measured funnel.
- **What this actually falsified:** That this landing + calendar link, as run, produced pull Gabriel considers clear.
- **What it did NOT falsify:** That 20 well-chosen outbound conversations would fail; that fraud teams have no problem; B2B Counterparty Scan.
- **Learning:** Deploying a booking page is not customer discovery. Segment on this page is **professional**, while NOW.md’s current test is **SME counterparties** — different hypothesis.
- **Next implication:** Do not redeploy the same page and infer demand. If discovery continues, outbound to named people and log conversations in `CUSTOMER_INTEL.md`.
- **Source:** `scanscam` `f2b8dc6`, PR #7/#8; `lib/conversation/copy.ts`; issue #1

---

### EXP-010 — Family Protect early-access waitlist

- **Date / period:** 2026-08-18; **merged to `main`** PR #8
- **Hypothesis:** People will join early access to protect a loved one (parent, grandparent, partner, family, self) from scams. Separate from core scanner.
- **Audience / segment:** Family / caregiver. Distinct from EXP-001 and EXP-009.
- **Offer / CTA:** `/protect-family` + `/fr/protect-family`. Headline **“Protect the people you care about from scams.”** CTA **“I want to protect someone →”**. Note: **“Early access. No payment required today.”** Captures `who_protect`, optional concern, first name, email. Notify `hello@scanscam.ca` via Resend.
- **Channel:** landing page (paid/organic **NOT IN REPO**)
- **What changed:** Signup table `family_protect_signups`; telemetry page_view / cta_click / signup
- **Traffic / exposure:** Signup count **NOT IN REPO**
- **Observed behavior:** **FOUNDER-REPORTED:** PMF has not been established for family use. That is not the same as “zero signups.”
- **Revenue / conversion:** No payment by design.
- **User conversations / qualitative evidence:** Concern text **NOT IN REPO** (PII — do not paste raw rows here)
- **Result:** **NOT MEASURED** quantitatively. **FOUNDER-REPORTED:** family PMF not established.
- **What this actually falsified:** Family PMF as of issue #1. Does not falsify waitlist interest without the count.
- **What it did NOT falsify:** That caregivers have no problem; that a later paid family product would fail.
- **Learning:** Family Protect is a **different product hypothesis**. Merging it to `main` is not evidence of pull.
- **Next implication:** Export signup count (no PII) before killing or rebuilding. Do not blend family waitlist with scanner PMF or B2B.
- **Source:** `scanscam` `c56e244`, PR #8; `lib/family-protect/copy.ts`; issue #1

---

### EXP-011 — Manual Counterparty Scan (current operating hypothesis)

- **Date / period:** Declared 2026-08-30 in `NOW.md` / `projects/scanscam/PROJECT.md`. **Not a completed market test.**
- **Hypothesis:** Businesses will pay for independent public-source research that reduces uncertainty about an unfamiliar company / supplier / partner / counterparty. Pilot range mentioned: ~$500–$1,500. Manual delivery. No new software.
- **Audience / segment:** SME / operators facing a named counterparty — **unvalidated** (`PROJECT.md`)
- **Offer / CTA:** “Scan a Company / Counterparty Scan” — human-reviewed brief with VERIFIED / SUPPORTED / UNCERTAIN / CONTRADICTED / UNKNOWN. Must not call a company “safe.”
- **Channel:** direct outreach (planned). Not the consumer scanner. Not Family Protect. Not `/conversation`.
- **What changed:** Operating docs only. **FACT:** no Counterparty product in ScanScam app. Planning memo exists (`intelligence/research/scanscam-trust-commerce-planning.md`) — planning, not evidence.
- **Traffic / exposure:** Success criteria (10 conversations, 3 pilots, 1 paid) are **targets**, not results.
- **Observed behavior:** None recorded in `CUSTOMER_INTEL.md` or `OUTREACH.md` (those files were empty at reconstruction).
- **Revenue / conversion:** No paid B2B engagement recorded in this workspace.
- **User conversations / qualitative evidence:** None captured yet.
- **Result:** **NOT MEASURED** (experiment not yet run as specified)
- **What this actually falsified:** Nothing.
- **What it did NOT falsify:** Anything about B2B demand. **FOUNDER-REPORTED:** B2B PMF has not been established — consistent with “not yet tested,” not with “tested and failed.”
- **Learning:** This is a **new** hypothesis after consumer paid/free tests did not produce PMF. It is not a continuation of demonstrated consumer demand.
- **Next implication:** Run the smallest real offer to real prospects and log outcomes here. Do not build software. Do not treat Trust Thesis as the test.
- **Source:** `personal-os-v2` `4371c99` (2026-08-30); `NOW.md`; `projects/scanscam/PROJECT.md`; issue #1

---

### EXP-012 — Trust Thesis (intellectual territory, not an experiment)

- **Date / period:** Documented in `thesis/TRUST_THESIS.md` (workspace conversion 2026-08-30)
- **Hypothesis:** Various (H1–H7). Explicitly **not** a company thesis or PMF claim.
- **Audience / segment:** n/a
- **Offer / CTA:** none
- **Channel:** none
- **What changed:** Research framing
- **Traffic / exposure:** n/a
- **Observed behavior:** n/a
- **Revenue / conversion:** n/a
- **User conversations / qualitative evidence:** n/a
- **Result:** **NOT MEASURED** — not a market test
- **What this actually falsified:** Nothing commercial.
- **What it did NOT falsify:** Any product hypothesis
- **Learning:** Keep thesis separate from experiment results.
- **Next implication:** Do not use the thesis as evidence that ScanScam should pivot.
- **Source:** `thesis/TRUST_THESIS.md`; issue #1

---

## What we know

Only what is strong enough to act on:

1. **FACT:** ScanScam’s shipped product is a consumer suspicious-message scanner, plus a series of post-scan CTAs and two Aug 2026 landings (conversation, Family Protect).
2. **FACT:** There is no payment rail in the ScanScam repo. The “$5 report” was copy plus a free survey unlock.
3. **FOUNDER-REPORTED:** Google Ads created scans without meaningful return.
4. **FOUNDER-REPORTED:** Paid-option experiments produced no purchases.
5. **FOUNDER-REPORTED:** Free offers / conversation booking did not show clear pull.
6. **FOUNDER-REPORTED:** PMF is not established for consumer, family, or B2B.
7. **FACT:** Counterparty Scan is written as the current 30-day test and has **no recorded prospect evidence** yet.
8. **FACT:** Outcome data that would make several tests conclusive (Sheets, Ads, signups, bookings) was never committed to the operating workspace.

---

## What remains genuinely unknown

- Whether the **problem** (calibrating trust under uncertainty) is wrong, or only the **format** (free message scanner) is wrong.
- Whether the **segment** is wrong (consumer vs family vs fraud-pro vs SME).
- Whether **timing** or **distribution** is wrong (Ads to a one-shot tool; landings without outbound).
- Whether **perceived differentiation** is too low vs ChatGPT / search / bank advice.
- Whether **AI-wrapper substitution** makes a generic scan unpayworthy even if the problem is real.
- Whether a **trust problem is valuable** but this product does not capture it.
- Actual **scan volume, return rate, Ads spend, email opt-ins, waitlist size, calendar bookings, survey WTP distribution** — all **NOT IN REPO**.
- Whether $5 or $49 would convert **if checkout existed**.
- Whether Counterparty Scan is a real buying job vs export-development / introductions (see planning memo contradiction).

---

## Experiments we should NOT repeat (unchanged)

Only tests that were actually run enough that repeating them *as-is* is unjustified:

1. **Google Ads → free scanner**, success = completed scan. **FOUNDER-REPORTED** no meaningful return. Do not buy more of the same.
2. **“$5 full report” button that unlocks for free.** That is not a price test. Do not restyle it and call it new evidence.
3. **$49 human-review mailto card** as the sole paid path, for another short unmeasured window, without logging impressions/replies.
4. **Conversation landing + calendar link** as a substitute for outbound discovery. **FOUNDER-REPORTED** no clear pull. Do not redeploy the same page expecting a different result.

Do **not** put on this list (not measured, or not yet run): parking-ticket vertical, guide-report email rates, Family Protect waitlist volume, Counterparty Scan, community report completions.

---

## Gaps (data missing)

| Gap | Why it matters |
|---|---|
| Google Ads spend, clicks, CPA, return visits | Needed to size EXP-003 beyond founder memory |
| Founder Control / sheet exports | Daily Pulse, research, surveys never copied into git |
| `payment_completed` never emitted | Cannot reconcile “no purchases” with funnel SQL |
| User-research response summaries | Gate ran ~2 weeks; answers not in workspace |
| Guide-report lead count | Current CTA; unknown pull |
| Family Protect signup count | Waitlist may have data; PMF claim is founder-level |
| Calendar booking count | Conversation experiment unquantified |
| Vercel production traffic | Merge ≠ measured visits |
| Customer language | `CUSTOMER_INTEL.md` had no quotes |
| Inbox / call notes for $49 review | Off-platform |

---

## Contradictions (repo vs operating story)

1. **NOW.md vs product git:** Operating plan is B2B Counterparty Scan. Shipped code is still a consumer scanner + family waitlist + fraud-pro conversation page. Those are three other segments.
2. **Paid experiments vs checkout:** Issue #1 groups “paid-option experiments” with no purchases. Repo never charged. Failure to collect money is true; “price rejected” is not proven.
3. **1,350+ checks vs telemetry:** Stated in conversation landing copy; not verified from an export here. Do not treat as a KPI in this ledger.
4. **Stale `main` vs GitHub `main`:** Reconstruction initially saw `main` at 2026-05-30; after fetch, Aug 18 landings **are** on `main`. Any note that Family Protect / conversation “never shipped” is wrong if it relied on an unfetched clone.
5. **Trust Thesis vs PMF:** Thesis is active research. Issue #1 and `TRUST_THESIS.md` both forbid reading it as market evidence. `NOW.md` still names ScanScam as the laboratory for that thesis — compatible only if the lab logs experiments, which it had not.
6. **Family Protect merged vs “PMF not established”:** Shipping a waitlist is not contradiction of the founder claim; treating merge as validation would be.
