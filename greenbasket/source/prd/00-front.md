<!-- widths: 28,72 -->
| Field | Value |
|---|---|
| Document | Greenbasket — Product Requirements Document (PRD) and System Design Specification |
| Version | 2.0 — supersedes version 1.0 |
| Date | 13 October 2026 |
| Status | Draft for owner review. Requirements baseline for Phase 0 and Phase 1. |
| Business | Greenbasket, fresh-produce e-commerce |
| Platform baseline | WordPress + WooCommerce + Blocksy + Elementor Free + Hostinger |
| Primary service area | Chandigarh, Mohali, Panchkula, India |
| Execution model | Phased, evidence-based, approval-gated |
| Audience | Business owner; Claude (Claude Pro, Claude in Chrome, Claude Code); developer; QA; operations |
| Owner approval of v2.0 | Pending. Every v2.0 addition is a **RECOMMENDATION** or **OPEN DECISION** until the owner confirms it. Nothing **CONFIRMED** in v1.0 was removed or changed in meaning. |

[[CONTENTS]]

\pagebreak

# PART A — USING THIS DOCUMENT

# 0. Instructions for the AI Agent Reading This Document

This document is the source of truth for Greenbasket requirements. Follow it as a specification, not as permission to invent missing business rules.

## 0.1 Operating rules

1. **Do not implement the whole system in one pass.** Work only on the current phase approved by the owner.
2. **Do not install, activate, deactivate, update, or purchase plugins without explicit approval.**
3. **Do not edit the live production website during discovery, audit, or development.** Use the verified staging site.
4. **Do not assume the current hosting plan supports the target load.** Inspect available resources and run tests before making performance claims.
5. **Do not guess settings, plugin names, gateway capabilities, APIs, tax rules, prices, delivery cutoffs, tier boundaries, or policies.** Mark them as unresolved and ask concise questions only when the answer blocks the current phase.
6. **Do not make broad changes to WordPress, WooCommerce, theme settings, database records, or checkout until the impact is understood and a backup is verified.**
7. **Do not expose, copy, or request passwords, API secrets, payment credentials, customer personal data, or production payment tokens.**
8. **Do not use the browser UI to perform irreversible actions without the owner's explicit confirmation.** This includes deleting data, changing DNS, updating production, publishing pages, charging payments, and changing live orders.
9. **Inspect before acting.** Report what was observed, what was inferred, and what remains unknown.
10. **Use one phase at a time.** Produce the phase deliverables, run the acceptance checklist, summarize changed files and settings, list unresolved issues, and wait for approval before proceeding.
11. **Do not claim an action succeeded unless it was verified.**
12. **Do not create duplicate functionality when WooCommerce already provides a suitable supported capability.** Verify compatibility and limitations before recommending implementation.
13. **Prefer a small, modular Greenbasket-specific extension for custom domain logic over scattering custom code across theme files, snippets, and page builders.** This is an architectural direction, not authorization to begin coding before the design is approved.
14. **Do not change the architecture silently.** If a requirement conflicts with WooCommerce, hosting constraints, gateway limitations, or another requirement, explain the conflict and offer options before implementation.
15. **Keep an implementation log.** For each phase, record decisions, files changed, settings changed, tests run, results, and rollback instructions (template in §29.4).
16. **Treat every v2.0 addition as a RECOMMENDATION or OPEN DECISION** unless this document labels it **CONFIRMED**.
17. **Use this document's identifiers** (requirement, decision, transition, acceptance and risk IDs — §0.4) when reporting work, so every claim and test can be traced.

## 0.2 Required response format at the end of every phase

Return:

1. Phase status: `PASS`, `PASS WITH OPEN ITEMS`, or `BLOCKED`.
2. What was inspected.
3. What was changed, if anything.
4. Evidence for each important claim.
5. Tests run and exact results, by acceptance ID (§26).
6. Known risks (Appendix B IDs) and unresolved decisions (§6 IDs).
7. Backup and rollback method.
8. Proposed next phase.
9. A request for approval before starting the next phase.

## 0.3 Uncertainty labels

Use these labels consistently:

- **CONFIRMED:** explicitly chosen by the business owner.
- **OBSERVED:** verified directly in the website, settings, files, or a test result.
- **RECOMMENDATION:** suggested design decision that still requires approval.
- **OPEN DECISION:** business choice not yet made.
- **CONFIGURABLE:** value must be stored as a setting, not hard-coded.
- **BLOCKER:** cannot safely proceed without resolution.
- **NOT IN SCOPE:** explicitly deferred or excluded.

Never convert a recommendation, assumption, or open decision into a confirmed requirement.

## 0.4 Identifiers and conventions

<!-- widths: 22,50,28 -->
| Prefix | Used for | Example |
|---|---|---|
| BP, RT, FB, WS, SB, CP, IN, DL, OR, NA, RL | Confirmed requirements, by area (§4) | SB-04 |
| LG | Business and legal groundwork items (§5) | LG-03 |
| OD | Open decisions (§6) | OD-25 |
| O, P, R, L, S, V, F | State transitions: order, payment, stock reservation, slot reservation, subscription, subscription delivery, refund (§11) | O13 |
| J | Shopper journeys (§19.4) | J6 |
| AC | Acceptance criteria (§26) | AC-INV-01 |
| RK | Risks (Appendix B) | RK-05 |
| C | Phase 0 audit evidence items (Appendix C) | C2 |

Conventions (**RECOMMENDATION** unless stated):

- **Money** is stored as whole paise (₹1 = 100 paise) in Greenbasket tables, so no rounding errors build up. It is displayed in rupees with two decimals. The rounding rule is OD-50.
- **Time** is stored in UTC. Business rules — slots, cutoffs, operating hours, renewal dates — are evaluated in India Standard Time (Asia/Kolkata, UTC+05:30).
- **Stock quantities** are whole numbers of a base unit: grams, millilitres or pieces (RK-05).
- **Atomic** means the check and the change happen as one indivisible database operation (a conditional update or a row lock), so two simultaneous shoppers can never both get the last unit or the last slot.
- **Idempotent** means repeating an operation — a retried job, a duplicate gateway callback, a double-clicked button — has the same effect as doing it once.
- **Must** marks a mandatory requirement; **should** marks a recommendation.

## 0.5 Current status and next instruction

- **Phase 0 brief delivered (13 October 2026):** business understanding, high-level architecture, confirmed requirements, open decisions, risks, and the audit evidence list (Appendix C).
- **Phase 0 audit:** **BLOCKER** — waiting for staging evidence from the owner. Items C1–C3 (staging relationship, backups, isolation) come first.
- **Track A — business and legal groundwork (§5):** may start now. It needs no website access.
- **Next instruction to Claude:** continue Phase 0 only. Collect the Appendix C evidence and produce the environment report, plugin and theme inventory (no recommendations), current-state architecture, updated risk register, open decisions, and backup and rollback verification. Do not install plugins or modify site settings.

## 0.6 Glossary

<!-- widths: 24,76 -->
| Term | Meaning |
|---|---|
| Base unit | The single unit a product's stock is counted in — for example grams for tomatoes, pieces for coconuts. |
| Selling unit | What the customer buys: a pack, piece or bunch, with a fixed conversion to the base unit (a "500 g pack" = 500 g). |
| Nominal quantity | The quantity a selling unit states it contains — the "500 g" in a 500 g pack. |
| Channel | The shopping experience a cart line came from: Retail, Farm Box, Wholesale or Subscription. |
| Shared stock pool | One stock count per product, used by every channel. |
| Reservation (hold) | A temporary claim on stock or slot capacity so it cannot be sold to someone else while checkout completes. |
| Price lock | A 15-minute guarantee of the prices calculated at checkout start. |
| Allowance | The money value of products a subscription plan includes per period. |
| Tier | A wholesale quantity band with its own unit rate. |
| Slot | A delivery time window on a date, with limited capacity. |
| Cutoff | The latest time an order or basket change is accepted for a slot or delivery. |
| Protected capacity | Slot capacity set aside for subscription deliveries before regular orders can use what remains. |
| COD | Cash on delivery — cash or UPI collected at the door. |
| Gateway | The payment provider that processes online payments. |
| Callback (webhook) | A message the gateway's server sends to the website's server to report a payment result. |
| Reconciliation | Comparing the website's records with the gateway's or bank's records and resolving any difference. |
| Idempotency key | A unique key attached to an operation so that repeating it never creates a duplicate. |
| Audit log | An append-only history of who changed what, when, and why. |
| Exception case | A tracked problem that needs a person to resolve it (for example a shortage or an unclear payment). |
| Staging / production | Staging is a private copy of the website for testing; production is the live site. |
| HPOS | WooCommerce High-Performance Order Storage: orders kept in dedicated tables instead of WordPress posts. |
| RTO / RPO | Recovery Time Objective (how quickly the site must be back) / Recovery Point Objective (how much recent data may be lost). |
| Mandate / token | A permission held by the gateway that allows automatic recurring charges without the customer re-entering payment details. |
| DLT | TRAI's registration system that Indian businesses must use for commercial SMS (entity, sender IDs, templates). |
| FSSAI | Food Safety and Standards Authority of India. |
| Wireframe | A simple sketch of a page's layout and content before visual design. |
| Design token | A named design value — a colour, font size or spacing step — reused everywhere so the brand stays consistent. |

# 1. What Changed in Version 2.0

- **Seven missing pillars added:** business and legal groundwork (§5), hosting, domain and environments (§21), brand and design system (§18), frontend and shopper experience (§19), content and catalogue (§20), marketing, SEO and analytics (§25), and ongoing maintenance (§28). Payments (§16), security (§22), operations and support (§24) and testing (§26) were extended.
- **Formal state machines** with transition tables for orders, payments, stock reservations, slot reservations, subscriptions, subscription deliveries, refunds and exception cases (§11). They are built from the owner-supplied diagrams and corrected where those diagrams conflicted with the requirements (Appendix A.2).
- **Fifteen core workflows** with diagrams and step lists (§12).
- **Identifiers** for every confirmed requirement, open decision, transition, acceptance criterion and risk.
- **Open decisions register** grew from 18 to 60 items, each with the phase it blocks (§6).
- **Data model:** missing entities added (saved Farm Box, price lock, cutoff rule, service area, quote, refund transaction, COD collection, bank-transfer verification, delivery attempt, dispute, consent) and the reservation reference fixed (§9).
- **Phase plan:** sequencing fixed — slot holds moved into Phase 3 because checkout depends on them; a duplicated protected-capacity task removed; gateway sandbox testing placed in Phase 3. Parallel Tracks A and B added (§27).
- **v1.0 formatting defects fixed:** tables that appeared as raw `| pipe |` text, literal `**asterisks**`, and list numbering that ran on across sections (the phase-end checklist was numbered 16–24).
