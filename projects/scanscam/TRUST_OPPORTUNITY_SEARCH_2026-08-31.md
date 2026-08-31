# ScanScam Trust Opportunity Search — 2026-08-31

Status: research pass, not a product decision

Operating principle:

> **Search broadly. Test narrowly. Follow pull. Standardize what repeats.**

This memo searches for expensive trust moments across consumers, businesses, finance, trade, hiring, and AI agents. It does not assume the current ScanScam scanner is the product.

## Current external signals

- Canadian Anti-Fraud Centre: about **$351M reported fraud losses in H1 2026**; only an estimated 5–10% of fraud is reported. Spear phishing was about **$57.7M** in H1 2026. Source: https://antifraudcentre-centreantifraude.ca/features-vedette/2026/08/fraud-trends-tendances-matiere-fraude-eng.htm
- CAFC recovered/froze funds in multiple 2026 payment-redirection cases, including about **$3.5M involving a Quebec business**; CAFC explicitly says construction/contracting and real estate are common targets and recommends independent verification of payment instructions. Source: https://antifraudcentre-centreantifraude.ca/news-nouvelles/2026/2026-05-13-eng.htm
- AFP: **79% of organizations** in its 2025 survey reported attempted or actual payments fraud in 2024; BEC was the leading avenue; vendor impersonation increased. Source: https://www.afponline.org/training-resources/resources/survey-research-economic-data/details/payments-fraud
- EDC: **65% of Canadian exporters plan to enter new markets within two years**; Europe and Asia-Pacific are major targets. Source: https://www.edc.ca/en/about-us/news/edc-tci-winter-2026.html
- EDC published a June 2026 due-diligence guide specifically urging Canadian exporters to verify international clients, suppliers, and partners. Source: https://www.edc.ca/en/article/exporter-due-diligence-checklist.html
- Canada has enacted new Bank Act obligations requiring banks to have policies/procedures to detect and prevent consumer-targeted fraud and mitigate harm. Source: https://www.canada.ca/en/department-finance/news/2026/06/government-pre-publishes-regulations-to-prevent-fraud-and-facilitate-the-next-phase-of-consumer-driven-banking.html
- Visa, Mastercard, Microsoft, and Okta are all building identity/authorization/governance infrastructure for AI agents, confirming that trusted agent identity and delegated authority are real emerging infrastructure problems. Sources: https://developer.visa.com/capabilities/trusted-agent-protocol ; https://www.mastercard.com/ca/en/business/artificial-intelligence/mastercard-agent-pay.html ; https://learn.microsoft.com/en-us/entra/agent-id/ ; https://www.okta.com/en-ca/products/govern-ai-agent-identity/
- DOJ/FBI continue to document fraudulent remote IT workers using stolen identities to gain employment and access to companies. Source: https://www.justice.gov/opa/pr/two-us-nationals-sentenced-facilitating-fraudulent-remote-information-technology-worker
- CAFC 2025 data also shows major consumer losses in investment, relationship, job, service, and merchandise fraud. Source: https://antifraudcentre-centreantifraude.ca/features-vedette/2026/02/month-prevention-mois-eng.htm

---

# 12 candidate trust moments

## 1. Supplier/payment-instruction change verification

**Who:** SMEs, controllers, AP teams, owners

**Trigger:** supplier says bank/payment details changed, or an unusual high-value payment is requested

**Payer:** business sending the money

**Why it matters:** direct, high-dollar loss; current CAFC cases; vendor impersonation is rising

**Current alternative:** call supplier manually, internal approval, bank controls, enterprise vendor-verification platforms

**AI resistance:** strong — value is in independent verification, identity, process, audit trail, and accountability, not just text analysis

**Testability:** very high

**Competition note:** enterprise platforms such as Trustpair already validate vendor bank accounts globally. The opening, if any, is likely below enterprise scale or in a narrower workflow/segment.

**Verdict:** STRONG TEST CANDIDATE

---

## 2. Cross-border counterparty verification for Canadian SMEs

**Who:** Canadian importers/exporters entering Europe, Asia-Pacific, or unfamiliar markets

**Trigger:** first meaningful PO, distributor agreement, supplier payment, or credit exposure

**Payer:** Canadian business

**Why it matters:** trade diversification is accelerating; EDC itself is emphasizing due diligence

**Current alternative:** EDC Company InSight, Trade Commissioner Service, credit reports, lawyers, Google, registries, insurance

**AI resistance:** medium if it is only a report; stronger if it includes evidence collection, direct verification, references, decision workflow, and follow-up

**Testability:** high

**Risk:** generic public-source research can become an AI wrapper quickly; EDC already provides credible public/free support

**Verdict:** STRONG TEST CANDIDATE, BUT MUST BE MORE THAN A REPORT

---

## 3. Construction / real-estate payment verification

**Who:** contractors, developers, property managers, construction finance teams, real-estate operators

**Trigger:** large invoice, new payee, changed bank details, lawyer/contractor payment instructions

**Payer:** business/property operator

**Why it matters:** CAFC explicitly identifies construction/contracting and real estate as common payment-redirection targets

**Current alternative:** phone verification, dual approval, bank controls

**AI resistance:** strong — real-world identity/payment verification and process ownership

**Testability:** very high; narrower than #1 and potentially easier to sell because the story is concrete

**Verdict:** STRONG TEST CANDIDATE

---

## 4. High-risk business request verification

**Who:** owner-managed businesses / finance/admin staff

**Trigger:** CEO/vendor/lawyer asks for wire, gift cards, credentials, secrecy, urgent action

**Payer:** employer

**Current alternative:** training + ad hoc callback

**Why it matters:** spear phishing and trusted-contact impersonation remain major loss channels

**AI resistance:** medium-high if the workflow verifies the requester through an independent channel; low if it only classifies the message

**Verdict:** GOOD, overlaps #1

---

## 5. Bank/credit-union customer scam intervention workflow

**Who:** banks / credit unions / fintechs

**Trigger:** customer initiates suspicious or unusually large transfer

**Payer:** financial institution

**Why it matters:** new Canadian Bank Act anti-fraud obligations create regulatory and operational pressure

**Current alternative:** internal fraud models, call-centre escalation, transaction holds, warnings

**AI resistance:** high — regulated workflow, auditability, authorization, customer interaction

**Testability:** medium-low because enterprise access and sales cycles are harder

**Verdict:** STRATEGIC WATCH / DISCOVERY CONVERSATIONS

---

## 6. Family / older-adult scam escalation

**Who:** adult children, seniors, caregivers, financial advisors

**Trigger:** loved one is about to send money/share credentials or receives a high-pressure request

**Payer:** adult child / family / advisor / financial institution

**Why it matters:** older Canadians lost at least $179.9M reported in 2024; banks have senior-support obligations and new fraud obligations

**Current alternative:** family calls, bank, government guidance, consumer-security subscriptions

**AI resistance:** medium — trusted contact/network and escalation matter more than generic scam classification

**Testability:** medium-high, but ScanScam's own family experiment has not established PMF

**Verdict:** REAL PROBLEM, PAYER STILL UNCLEAR

---

## 7. Investment-opportunity verification / second opinion

**Who:** consumers facing unsolicited or high-pressure investment pitches

**Trigger:** before sending investment funds

**Payer:** consumer / advisor / financial institution

**Why it matters:** investment fraud was about $139.6M reported in H1 2026 in Canada

**Current alternative:** securities regulators, advisors, search, bank

**AI resistance:** medium if limited to identity/claims/evidence verification; legal/regulatory risk rises quickly if giving investment advice

**Verdict:** HIGH PAIN, HIGH COMPLIANCE RISK

---

## 8. Job-offer / recruiter legitimacy verification

**Who:** job seekers

**Trigger:** recruiter asks for money, equipment purchase, personal information, or unusual onboarding

**Payer:** consumer is weak; platform/employer may be stronger

**Why it matters:** CAFC reported about $50.6M in job-fraud losses in 2025

**Current alternative:** LinkedIn/platform checks, search, company contact

**AI resistance:** low-medium unless tied to employer/recruiter identity infrastructure

**Verdict:** STRONG PROBLEM, WEAK DIRECT PAYER

---

## 9. Remote-worker / contractor identity verification

**Who:** tech firms, staffing firms, companies hiring remote IT workers/contractors

**Trigger:** before granting employment, equipment, credentials, or production access

**Payer:** employer

**Why it matters:** DOJ/FBI cases show stolen identities, laptop farms, insider access, and data/extortion risk

**Current alternative:** identity verification vendors, background checks, interviews, device checks

**AI resistance:** high, but market is specialized and competitive

**Verdict:** GOOD B2B NICHE; REQUIRES DOMAIN ACCESS

---

## 10. Merchant / website legitimacy before checkout

**Who:** online shoppers

**Trigger:** unfamiliar merchant/site before purchase

**Payer:** consumer appears weak; issuer/platform/merchant ecosystem could be stronger

**Why it matters:** ScanScam's own Google Ads data showed strong search intent around links, websites, merchant legitimacy, courier/government impersonation

**Current alternative:** Google/search/reviews/browser tools/card protections/generic AI

**AI resistance:** weak if just a public-data report

**Verdict:** DEMAND EXISTS; CURRENT BUSINESS MODEL NOT PROVEN

---

## 11. Digital-platform anti-fraud / impersonation compliance

**Who:** social platforms, telecoms, marketplaces, ad platforms

**Trigger:** onboarding/content/ad/call patterns look like impersonation or fraud

**Payer:** platform/operator

**Why it matters:** Canada's National Anti-Fraud Strategy discussion contemplates cross-sector prevention obligations, including banks, telecom and digital platforms

**Current alternative:** in-house trust & safety / fraud teams

**AI resistance:** high, but access and sales difficulty are very high

**Verdict:** LARGE MARKET, POOR FIRST TEST

---

## 12. AI-agent identity / authority / action governance

**Who:** companies deploying agents that can access data, tools, payments, or external systems

**Trigger:** an agent receives permission to act

**Payer:** enterprise IT/security/finance

**Why it matters:** Visa Trusted Agent Protocol, Mastercard Agent Pay, Microsoft Entra Agent ID, and Okta agent governance all point to identity, authorization, audit, and human sponsorship as emerging infrastructure requirements

**Current alternative:** Microsoft/Okta/identity vendors, custom policy layers

**AI resistance:** very high as a category; but incumbents are already moving quickly

**Testability:** low-medium for ScanScam today

**Verdict:** IMPORTANT FUTURE TERRITORY, NOT THE FASTEST PMF TEST

---

# Lens pass

## Naval

Best opportunities leave owned residue: relationships, transaction context, outcome history, distribution, workflow, reputation, and eventually proprietary data. Generic reports and prompts are weak. Payment verification and counterparty workflows are better because they sit near a consequential action and can accumulate outcome data.

Warning: agent-identity infrastructure is strategically important, but competing directly with Visa/Microsoft/Okta would reset the game and require access ScanScam does not yet have.

## Franklin

Prefer problems with an obvious nuisance and a cheap real test. Do not build software before somebody uses/pays for the manual version.

Payment verification wins because the test can be as simple as: "Before you send this changed-payment instruction, we'll independently verify it." A real business can accept or refuse that offer immediately.

## Sisney

ScanScam is still in discovery/innovation stage. Do not stabilize architecture or create an agent organization yet. Increase **integration with the environment** by running more market-facing tests; keep **entropy** low by reusing the current site, research stack, GitHub memory, and founder conversations.

---

# Top three for actual testing

## TEST A — Payment-change verification for Quebec SMEs

**WHO:** owner/finance/controller at Quebec SME; prioritize construction, contracting, real estate, or businesses making meaningful vendor wires

**TRIGGER:** new supplier bank account or changed payment instructions

**JOB:** "Before I send this money, independently verify that the request and payee are legitimate."

**PAYER:** business

**OFFER / PRICE:** manual verification pilot, proposed $250–$500 per high-risk case or a small monthly pilot; price is a hypothesis

**CHANNEL:** direct founder outreach to 20–30 finance/owner contacts

**SUCCESS:** at least 3 qualified businesses say this is a real recurring problem and 1 pays or commits to a live pilot using a real payment case

**KILL:** 20 qualified conversations with no live case, no willingness to pay, and "our existing callback/control is enough" as dominant response

**MAX:** 7 days / <$300 before a real paid/live-case signal

**WHY FIRST:** strongest combination of loss severity, clear payer, reachability, AI resistance, and cheap manual testing

---

## TEST B — First-deal verification for Canadian exporters/importers

**WHO:** Canadian SME entering a new foreign market or dealing with an unfamiliar buyer/supplier/distributor

**TRIGGER:** before first meaningful contract, shipment, credit exposure, deposit, or wire

**JOB:** "Help me verify this company before I expose money, goods, reputation, or time."

**PAYER:** business

**OFFER / PRICE:** done-for-you verification brief + direct checks + clear unknowns, proposed $300–$750 pilot

**CHANNEL:** founder outreach to exporters/importers affected by current tariff diversification; chambers, trade contacts, LinkedIn, Quebec manufacturers/exporters

**SUCCESS:** 3 businesses provide a real counterparty to investigate; 1 pays

**KILL:** prospects consistently say EDC/TCS/credit bureau/Google already solves the job, or they value introductions/sales development rather than trust verification

**MAX:** 10 days / <$300

**IMPORTANT:** this test must discover whether the buying job is verification or actually export-market development. Do not assume.

---

## TEST C — Remote hire / contractor trust check

**WHO:** Canadian tech firms or agencies hiring remote developers/IT contractors

**TRIGGER:** before giving a remote worker equipment, credentials, code, or production access

**JOB:** "Give me independent evidence that this person/company is who they claim to be before I grant access."

**PAYER:** employer

**OFFER / PRICE:** manual pre-access verification pilot, proposed $250–$500 per candidate/contractor case

**CHANNEL:** 20–30 CTO/founder/IT-security conversations

**SUCCESS:** 3 recognize the problem from experience/current policy and 1 provides a real candidate/contractor case or pays

**KILL:** identity/background-check vendors already solve the need adequately or Canadian firms do not perceive this as urgent

**MAX:** 10 days / <$300

---

# What is NOT top-three now

- Family protection: emotionally important, but payer/retention remains unclear and ScanScam has already produced weak/inconclusive evidence.
- Consumer merchant checker: search demand exists, but direct willingness to pay and defensibility are weak.
- Bank anti-fraud workflow: strong regulatory pull, but sales/access cycle makes it poor for the first fast PMF sprint.
- Agent governance: strategically important and likely part of the future trust layer, but incumbents are already building core identity infrastructure and ScanScam lacks a clear wedge/access advantage today.
- Investment verification: huge losses, but regulatory exposure is too high for a first test.

# Current recommendation

Start with **TEST A** because it is closest to a real, expensive, verifiable trust decision and can be tested manually within days.

Do not build product yet. Search broadly can continue in parallel, but the next market-facing action should be a narrow offer to real businesses with a live payment-risk moment.
