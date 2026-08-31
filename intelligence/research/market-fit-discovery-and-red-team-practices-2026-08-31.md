# Market-fit discovery + red-team practices — 2026-08-31

Status: research snapshot, not a product decision

Question: How should a founder search broadly for opportunities, test cheaply without excessive cold calling, assess feasibility, and red-team conclusions before committing?

## Sources reviewed

- Strategyzer — critical hypotheses / desirability, feasibility, viability: https://www.strategyzer.com/library/how-to-test-your-idea-start-with-the-most-critical-hypotheses
- Strategyzer — assumptions mapping / desirability, feasibility, viability, survivability: https://www.strategyzer.com/programs/assumptions-mapping-prepare-to-test-your-business-idea-part-1
- Strategyzer — evidence strength / discovery vs validation: https://www.strategyzer.com/library/business-testing-is-your-hypothesis-really-validated
- Strategyzer — strong experiments: https://www.strategyzer.com/library/designing-strong-experiments
- Sequoia — Arc PMF Terrifying Questions: https://sequoiacap.com/article/pmf-framework-2
- Y Combinator — The Real Product Market Fit: https://www.ycombinator.com/blog/the-real-product-market-fit/
- Pretotyping.org — methodology / Market Engagement Hypothesis / XYZ hypothesis: https://www.pretotyping.org/methodology.html
- Google Testing Blog — pretotyping: https://testing.googleblog.com/2011/08/pretotyping-different-type-of-testing.html
- Good Judgment — Superforecasting public methodology and pre-mortems: https://goodjudgment.com/about/ ; https://goodjudgment.com/open-minded-forecasting-in-a-deeply-polarized-world/ ; https://goodjudgment.com/applied-superforecasting-fundamentals/

---

# 1. Convergence across the frameworks

The strongest common pattern is not “talk to customers first” or “build an MVP first.” It is:

> **Identify the uncertainty that matters most, then choose the cheapest credible evidence that can change your mind.**

Different uncertainties require different tests.

## Four business risks

### Desirability
Do people care enough to act?

Useful evidence:
- search behavior
- ad/landing engagement
- case submission
- booking
- deposit / purchase
- actual usage
- customer conversation about a demonstrated problem

### Feasibility
Can we actually deliver the promised outcome at acceptable quality, speed, legality, and operational burden?

Useful evidence:
- manual concierge fulfillment
- technical spike / proof of concept
- data-source availability check
- regulatory/legal review
- supplier/partner test
- time-and-cost measurement on a real case

### Viability
Can the economics work?

Useful evidence:
- real price shown
- deposit / purchase
- acquisition-cost test
- manual delivery cost
- gross-margin estimate grounded in actual work
- repeat/expansion willingness

### Survivability / adaptability
Can the opportunity survive competition, regulation, platform dependency, and rapid model improvement?

Useful evidence:
- competitor/substitute research
- regulatory trend
- platform/API dependency
- “GPT 10x” substitution test
- ownership/compounding analysis

---

# 2. Calls are a tool, not a religion

Sequoia emphasizes customer conversations because they reveal depth of pain, willingness to pay, and the common traits of customers who lean in.

However, Strategyzer and pretotyping explicitly support behavioral tests such as landing pages, mock sales, and simplified real-world pretotypes.

Synthesis:

> Do not require cold calls as the entry fee for broad market search.

Instead:

1. use research + cheap behavioral tests to find signal;
2. talk to people when the signal is interesting or the mechanism remains ambiguous;
3. prioritize conversations with people who already clicked, submitted, paid, replied, booked, or otherwise raised their hand.

This preserves qualitative learning without making the founder perform dozens of low-signal cold calls for every hypothesis.

Boundary:

Avoiding conversations entirely creates a major blind spot. Analytics can show **what** happened but often not **why**, what alternative the customer uses, what internal process/budget exists, or why feasibility fails in practice.

---

# 3. Pretotyping is useful for broad search

Pretotyping's key discipline is to isolate the assumption and state a Market Engagement Hypothesis numerically.

Example:

> At least 3% of targeted Canadian SME finance visitors who see this payment-verification offer will begin a real verification request at $295.

This is better than “let's see if the page does well.”

The useful rule is:

> **Say the expected behavior with numbers before seeing the data.**

The number can be wrong. Being wrong is how calibration improves.

---

# 4. Behavior is stronger than opinion — but behavior can still mislead

Evidence hierarchy:

1. repeat paid use / retention / expansion
2. actual purchase / deposit / real case
3. costly commitment (workflow/data/time/access)
4. booking / qualified reply / meaningful signup
5. click / free action
6. stated interest / interview opinion
7. founder/AI belief

Important red-team correction:

A click is not always weak because the channel is weak; a purchase is not always strong if the buyer was unrepresentative. Evidence quality depends on whether the experiment actually tested the hypothesis.

ScanScam already demonstrated this: high free-scan conversion did not imply retention or willingness to pay.

---

# 5. Feasibility must be tested separately

A landing page can test acquisition and desirability. It cannot prove that the service can be delivered accurately, legally, cheaply, or repeatedly.

For each promising opportunity, ask:

> What is the smallest real case we can manually fulfill to learn whether the promise is operationally possible?

A good feasibility test measures:

- required inputs/data
- time to deliver
- hard-to-automate steps
- errors / ambiguity
- need for licensed professionals or regulated data
- variable cost
- customer verification burden
- liability / recourse

This is where concierge delivery is powerful: it tests the future business process before software hides the hard parts.

---

# 6. Superforecasting adds a missing discipline

Before the test:

- define the resolvable question
- identify an outside-view/base rate
- state a probability or numeric market-engagement hypothesis
- list what evidence would move the belief

Then red-team:

- strongest case that the hypothesis is wrong
- pre-mortem: assume failure; explain why
- identify misleading signals
- seek disconfirming evidence

After the test:

- record the result
- update the probability
- explain why
- decide TEST AGAIN / DEEPEN / WATCH / KILL

This prevents hindsight stories such as “we always knew that clicks weren't enough.”

---

# 7. Broad research should itself be red-teamed

Desk research has predictable failure modes:

## Popularity bias
Search engines surface well-documented markets and companies. This can make crowded opportunities look more attractive simply because more material exists.

## Incumbent-validation fallacy
“The market exists” does not imply an accessible wedge exists.

## Pain-without-payer
Large losses or social problems can exist without a buyer willing or able to pay.

## Regulation-as-opportunity fallacy
New obligations can create demand, but incumbents or internal teams may absorb it.

## AI-wrapper blindness
Research-heavy services may look differentiated today but become commodity model capabilities quickly.

## Founder-access blindness
A good market that the founder cannot reach cheaply may be inferior to a slightly smaller market with strong access/distribution.

## Channel confounding
A failed ad can mean bad market, bad creative, wrong audience, wrong timing, or weak offer. One failed acquisition test rarely kills the underlying problem.

---

# 8. Minimal opportunity-search loop

Do not create a large scoring bureaucracy.

Use:

> **SEARCH → ASSUMPTIONS → FORECAST → RED TEAM → TEST → UPDATE**

### SEARCH
Look broadly for consequential problems, triggers, payers, existing spend, new regulation/technology, and reachable channels.

### ASSUMPTIONS
What must be true across:
- want
- deliver
- economics
- survive

Choose the riskiest high-impact unknown.

### FORECAST
State expected behavior/probability before seeing the result.

### RED TEAM
What would make our current conclusion wrong?

### TEST
Choose the cheapest credible test of that assumption.

### UPDATE
Change the belief and next action based on evidence.

---

# 9. Simple test card

```text
WHO / TRIGGER:
ASSUMPTION BEING TESTED:
RISK: want / deliver / economics / survive
CURRENT EVIDENCE:
FORECAST:
CHEAPEST CREDIBLE TEST:
SUCCESS / KILL:
MAX TIME / CASH:
RESULT:
UPDATE:
```

This is enough structure for early search.

---

# 10. Current conclusion for ScanScam

Do not force dozens of cold calls across every market hypothesis.

Better sequence:

> broad research → rank uncertainties → cheap smoke/pretotype → pull-triggered conversations → manual feasibility test → paid/repeat evidence

Calls become important when they have high information value, especially after a person has shown behavior or when the reason behind the behavior is unclear.

The strongest next system improvement is not another agent or folder hierarchy. It is explicit **forecast + red-team + update discipline** inside the existing opportunity analyses.
