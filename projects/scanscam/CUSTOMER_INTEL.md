# ScanScam customer intel

Last updated: 2026-08-31 (experiment reconstruction, issue #1)

Exact user/prospect language is **almost entirely missing** from both `personal-os-v2` and the ScanScam git history. Do not invent quotes.

## What we do not have

- Interview transcripts
- Recorded objections from paying or refusing customers
- Exported survey answers (WTP, “what would feel fair”)
- Family Protect concern-text (would be PII — do not dump raw rows here)
- Email threads from the $49 human-review mailto
- Notes from conversation-landing calendar bookings

If those exist in Gmail, Sheets, or Calendly, they have not been copied into this workspace.

## FOUNDER-REPORTED observations

From GitHub issue #1. Not customer quotes. Do not strengthen.

- Ads traffic scanned and did not return in a meaningful way.
- Paid options: no purchases.
- Free offers and conversation booking: no clear pull.
- PMF not established for consumer, family, or B2B.

## Observed search intent — Google Ads, not interviews

Source: founder-provided Gemini reconstruction of uploaded Google Ads `Search keyword report.csv` and `Search terms report.csv` for 2026-04-23 through 2026-05-22.

These are **search queries**, not customer interview quotes and not evidence of willingness to pay. They show what people were actively trying to verify when they searched.

Representative queries:

- `is this a scam`
- `is this link safe`
- `is this number a scammer canada`
- `does cra send text messages`
- `will the cra text you`
- `jula jewelry scam`
- `is jula jewelry a scam`
- `is temu a scam`
- `area code suspicious 647 text message`
- `pkginfo ups real or fake`

Observed intent categories:

- suspicious URL / website verification
- merchant legitimacy
- government impersonation
- parcel / courier impersonation
- phone / SMS number checking

Campaign context for interpreting this language: 15,131 impressions, 769 clicks, and 343 Google Ads conversion events were recorded on $592.96 CAD spend. The 343 events are **not** unique customers, retained users, leads, or revenue. Founder-reported return behavior remained weak and paid PMF was not established.

## Language we showed (not language they used)

These are product strings, useful so we do not confuse our copy with their words:

- Consumer: “Is this a scam?” / “Check Now”
- Report: “Unlock full report — $5” while checkout said unlock was **free** after questions
- Human review: “Still in a fog about what to do?” / “Beta: $49 / one situation / short call”
- Guide: “Get your free next-step report”
- Conversation: “I'm looking for 20 people who see this problem up close.” / “No sales pitch.”
- Family: “Protect the people you care about from scams.” / “Early access. No payment required today.”
- Counterparty (operating hypothesis only): reduce uncertainty about an unfamiliar company — **not yet put in front of recorded prospects**

## Segments we have mixed (keep separate)

| Segment | Surface | Evidence of pull |
|---|---|---|
| Consumer with a message | Scanner, Ads, post-scan CTAs | Usage yes (founder/copy); return/pay no (founder) |
| Family / caregiver | `/protect-family` | PMF not established (founder); counts missing |
| Fraud-adjacent professional | `/conversation` | No clear pull (founder); bookings missing |
| SME / counterparty | `NOW.md` only | Not tested in this log |

## Capture rule going forward

After any real conversation, add here:

- Date
- Who (role, not unnecessary PII)
- Segment
- Exact phrases (quoted)
- What they were trying to do
- Whether they paid, refused, ghosted, or booked
- What they said we were instead of (ChatGPT, bank, lawyer, TCS, etc.)
