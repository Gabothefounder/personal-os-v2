# Superforecasting — Tetlock / Gardner / Good Judgment

Status: source-grounded ingestion v0.1

This is not a full-text extraction of the copyrighted book. It captures decision-useful principles from public Good Judgment material, public descriptions of the Good Judgment Project, and the book's publicly documented framework. Deepen later from a licensed copy or notes rather than inventing missing passages.

Primary public sources:

- Good Judgment — About Superforecasting: https://goodjudgment.com/about/
- Good Judgment — Beliefs as Hypotheses: https://goodjudgment.com/superforecasters-toolbox-beliefs/
- Good Judgment — Applied Superforecasting Fundamentals: https://goodjudgment.com/applied-superforecasting-fundamentals/
- Good Judgment — Open-Minded Forecasting / pre-mortem: https://goodjudgment.com/open-minded-forecasting-in-a-deeply-polarized-world/
- Good Judgment — accuracy / calibration / Brier scoring: https://goodjudgment.com/resources/the-superforecasters-track-record/
- Good Judgment — advanced decision thresholds and base-rate modeling: https://goodjudgment.com/services/advanced-judgment-modeling/

Lens: `wisdom/lenses/SUPERFORECASTING.md`

---

## 1. Beliefs are hypotheses

Strong forecasters treat beliefs as provisional models, not identities.

Decision implication:

> Ask what evidence would change the belief before defending it.

This is especially important when the forecaster wants a particular outcome.

---

## 2. Make uncertainty explicit

Replace vague language such as "likely," "promising," or "probably" with probabilities or explicit ranges when the question is resolvable.

The purpose is not fake precision. It is to make disagreement, updating, and calibration visible.

For business exploration, useful questions include:

- Probability that a qualified visitor will submit a real case?
- Probability that one of 20 target buyers will pay for the pilot?
- Probability that we can deliver the result within the proposed cost/time?
- Probability that this remains differentiated if frontier models improve materially?

---

## 3. Start with the outside view / base rate

Good Judgment training explicitly emphasizes inside-versus-outside views and setting base rates.

Before telling the story of why this opportunity is special, ask:

> What usually happens to similar products, offers, acquisition channels, buyers, or experiments?

Then adjust from the base rate using specific evidence.

Boundary: the relevant reference class can be ambiguous. State which one is being used and why.

---

## 4. Decompose hard questions

Large fuzzy questions are poor forecasting objects.

Instead of:

> Will ScanScam work?

break it into questions such as:

- Is the problem recognized?
- Does the target take costly action?
- Can the target be reached economically?
- Can we deliver the promised outcome?
- Will someone pay enough?
- Does repeat use or referral occur?

Decomposition improves testability and reveals which uncertainty matters most.

---

## 5. Update, do not defend

Forecasts should move when information changes.

The useful record is:

**prior probability → new evidence → revised probability → reason for update**

Small updates are often more rational than dramatic swings unless the evidence is unusually diagnostic.

---

## 6. Calibration matters

Good Judgment evaluates forecasts with proper scoring rules such as the Brier score and emphasizes calibration: when a forecaster says 70% repeatedly, roughly 70% of those events should occur over time.

For an early-stage business, we do not need elaborate forecasting infrastructure immediately. We do need to preserve predictions before outcomes are known so hindsight cannot rewrite them.

A useful founder calibration practice:

- make explicit predictions before tests
- keep them in git
- resolve them honestly afterward
- periodically inspect systematic overconfidence / underconfidence

---

## 7. Pre-mortem / alternative future

Good Judgment uses pre-mortem exercises to force consideration of alternative outcomes and reduce overconfidence.

Before running a test:

> Imagine six months from now we conclude this was a misleading signal or failed business. What most plausibly happened?

Also reverse it:

> Imagine the idea worked far better than expected. What did we initially misunderstand?

This is a red-team tool, not pessimism.

---

## 8. Seek disconfirming evidence

Do not ask only whether evidence supports the current hypothesis.

Search specifically for:

- strong substitutes
- failed companies with similar offers
- low willingness to pay despite high pain
- regulatory blockers
- acquisition channels that look cheap but attract the wrong intent
- technically feasible demos that fail operationally
- incumbent advantages
- evidence that a generic model solves the problem sufficiently

A conclusion is stronger when it survives an adversarial search.

---

## 9. Diverse views can improve forecasts

Good Judgment's work shows value in aggregating independent judgments and maintaining diversity of perspective.

Application:

For high-stakes opportunity decisions, separate roles can be useful:

- advocate / opportunity case
- skeptic / failure case
- outside-view / base-rate case
- operator / feasibility case

Do not create permanent agents merely to mimic a panel. Independence matters more than role-play volume.

---

## 10. Forecasts must connect to decisions

Recent Good Judgment training explicitly includes decision thresholds.

A probability without a decision rule can become intellectual decoration.

Example:

> If we estimate at least a 30% chance of getting one paid pilot from a $300 smoke test and downside is capped, TEST may be rational even though failure remains more likely than success.

The correct action depends on upside, downside, reversibility, and information value—not probability alone.

---

## 11. Forecasting is not the same as acting

When you can directly influence an outcome, forecasting and commitment can conflict.

Use forecasts to calibrate expectations and choose bets, but once a reversible test is selected, execute it rather than continuously reforecasting instead of acting.

---

## 12. Business-search translation

For opportunity search:

> **Research broadly → identify assumptions → set priors → red-team → test → update.**

The forecast is not PMF evidence. The market outcome is.

Shorthand:

> **State what you believe, how strongly you believe it, what would change your mind, and keep score.**
