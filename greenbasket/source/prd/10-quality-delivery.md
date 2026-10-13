\pagebreak

# PART F — QUALITY AND DELIVERY

# 26. Acceptance Criteria

The system is not ready for launch until the relevant tests pass. Each criterion lists the requirements, decisions or transitions it verifies. Criteria added in v2.0 are marked **(v2)**.

## 26.1 Catalogue and pricing

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-CAT-01 | Retail pack price does not change with actual packed weight. | RT-02, RT-03 |
| AC-CAT-02 | Nominal stock deduction matches the configured selling-unit conversion. | RT-04, IN-05, IN-06 |
| AC-CAT-03 | Product eligibility and min, max and increment are enforced server-side, including against tampered requests. | §10.2 steps 1–4 |
| AC-CAT-04 | Wholesale quantities for the same product and unit aggregate across lines; the tier rate applies to all qualifying units; line allocations add up to the total. | WS-03, WS-04, §10.5 |
| AC-CAT-05 | Different products or units are never combined without an explicit rule. | §10.5 |
| AC-CAT-06 | A subscription basket above the allowance is blocked. | SB-07 |
| AC-CAT-07 | The price lock expires after 15 minutes; any price change then requires customer confirmation before payment. | CP-12, CP-13 |
| AC-CAT-08 **(v2)** | Displayed totals always equal charged totals, using the single rounding rule. | §10.9, OD-50 |
| AC-CAT-09 **(v2)** | Each pricing error returns its reason code and customer message. | §10.11 |

## 26.2 Inventory

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-INV-01 | Concurrent attempts cannot reserve the same final stock (tested with simultaneous checkouts). | IN-08, R1 |
| AC-INV-02 | An expired reservation releases stock — immediately at read time, even if the expiry job is delayed. | R4, §7.5 |
| AC-INV-03 | A late payment after expiry enters reconciliation and blocks dispatch. | CP-11, R7 |
| AC-INV-04 | A repeated callback or job never duplicates a stock movement. | §13.4 |
| AC-INV-05 | Manual adjustments are auditable with quantity, unit, reason, actor and time. | IN-09, §13.6 |
| AC-INV-06 | Stock and reservation balances reconcile after cancellation, expiry, shortage and return. | R5, R12, §13.7 |
| AC-INV-07 **(v2)** | A shortage at packing releases the unfilled quantity and posts a shortage correction. | R12, §13.4 |

## 26.3 Payments

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-PAY-01 | A browser redirect alone never confirms payment. | §16.2 |
| AC-PAY-02 | A duplicate callback does not duplicate processing. | CP-08, §12.2 |
| AC-PAY-03 | An ambiguous transaction is held for review, and the customer is not asked to pay again. | CP-07, P6 |
| AC-PAY-04 | A bank-transfer order cannot enter packing before verification, except with a recorded authorized exception. | CP-09, O7 |
| AC-PAY-05 | A COD order is confirmed only after eligibility and confirmation checks. | OD-06, OD-49 |
| AC-PAY-06 | Refund review and reconciliation are auditable. | CP-14, §11.7 |
| AC-PAY-07 **(v2)** | An invalid callback signature changes nothing and raises an alert. | §12.2 step 1 |
| AC-PAY-08 **(v2)** | An amount mismatch moves the payment to review. | P6 |
| AC-PAY-09 **(v2)** | A reported debit on a failed attempt is reconciled before any new payment request. | CP-16, P9 |
| AC-PAY-10 **(v2)** | A second Paid attempt on one order triggers duplicate handling and refund. | §16.8 |
| AC-PAY-11 **(v2)** | Partial refunds can repeat until the paid amount, and refund states are derived only from succeeded refund transactions. | P10–P12 |
| AC-PAY-12 **(v2)** | COD amount due at the door reflects shortage adjustments; cash variance opens a case. | §12.3, §24.4 |

## 26.4 Subscriptions

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-SUB-01 | Weekly and monthly combinations schedule correctly. | SB-01 to SB-03 |
| AC-SUB-02 | Monthly billing with weekly delivery creates separate delivery orders linked to one period. | SB-04 |
| AC-SUB-03 | A missed cutoff uses the last saved basket. | SB-10 |
| AC-SUB-04 | A skipped weekly delivery in a monthly plan does not automatically reduce the monthly charge. | SB-14 |
| AC-SUB-05 | The renewal retry policy runs without duplicate charges, reconciling before each retry. | SB-13, §12.8 |
| AC-SUB-06 | Exhausted retries pause future deliveries and notify the customer. | S5 |
| AC-SUB-07 | Basket versions and delivery snapshots are preserved. | SB-15 |
| AC-SUB-08 **(v2)** | A subscription never becomes Active without the required payment setup. | S1 |
| AC-SUB-09 **(v2)** | A re-run cutoff job never creates a second delivery order. | V8 |
| AC-SUB-10 **(v2)** | An invalid frozen basket opens an exception; nothing is substituted silently. | V5, OD-24 |

## 26.5 Delivery

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-DEL-01 | Slot capacity cannot be exceeded by concurrent checkouts. | DL-06, L1 |
| AC-DEL-02 | A slot hold expires independently from the stock reservation. | DL-07 |
| AC-DEL-03 | Subscription capacity is protected. | DL-09, §15.3 |
| AC-DEL-04 | The delivery cutoff is applied consistently. | DL-08 |
| AC-DEL-05 | A shortage creates a case and pauses the affected item; the order cannot become Packed until resolved. | DL-10, O9 |
| AC-DEL-06 | Packing, dispatch, delivered, failed and return outcomes are recorded. | DL-12 |
| AC-DEL-07 **(v2)** | Addresses outside the service area see no slots. | §12.6, OD-27 |
| AC-DEL-08 **(v2)** | Rescheduling holds the new slot before releasing the old one. | L9 |
| AC-DEL-09 **(v2)** | A failed delivery can be re-attempted in a newly held slot, or returned with a stock disposition. | O13–O15 |

## 26.6 Operations and resilience

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-OPS-01 | Required packing and delivery records exist. | OR-01, OR-02 |
| AC-OPS-02 | Applicable invoice and credit-note records can be produced after tax validation. | OR-03 |
| AC-OPS-03 | Critical staff changes are audited. | OR-04 |
| AC-OPS-04 | A 50-concurrent-shopper test is run. | RL-02 |
| AC-OPS-05 | A load test reaches the agreed target without unacceptable errors. | RL-01, OD-59 |
| AC-OPS-06 | An RTO and RPO recovery exercise is completed. | RL-03, RL-04 |
| AC-OPS-07 | No unresolved critical or high-severity defects remain at launch. | §27 Phase 6 |

## 26.7 State machines (v2)

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-SM-01 | Every transition in §11 has at least one passing test. | §11 |
| AC-SM-02 | An attempted transition not listed in §11 is rejected and logged. | §11, §9.7 |
| AC-SM-03 | Every transition writes an audit event in the same database transaction. | §11.9 |
| AC-SM-04 | The cross-machine rules in §11.9 hold under concurrent events. | §11.9 |

## 26.8 Business and legal (v2)

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-LG-01 | Policy pages, seller details and grievance officer are live and approved. | LG-05, LG-07 |
| AC-LG-02 | FSSAI registration or licence is in place and displayed if required. | LG-03 |
| AC-LG-03 | The gateway is activated in live mode for the business entity. | LG-01, LG-08 |
| AC-LG-04 | SMS and WhatsApp send only registered or approved templates. | LG-09 |

## 26.9 Design system and frontend (v2)

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-UX-01 | Brand, token and component sheets are approved, and tokens are applied globally (no hard-coded colours). | §18 |
| AC-UX-02 | Wireframes for J1–J10 and the staff screens are approved before the Phase 3 build. | §19.12 |
| AC-UX-03 | Journeys J1–J10 pass on a mid-range Android phone, an iPhone and desktop. | §19.4 |
| AC-UX-04 | Key journeys meet the accessibility target in automated and manual checks. | OD-53 |
| AC-UX-05 | At least five real customers complete test orders on their own phones; issues found are triaged. | §19.12 |
| AC-UX-06 | Performance targets are met on staging mobile tests. | OD-59, §19.7 |

## 26.10 Content (v2)

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-CNT-01 | The launch catalogue is complete in the product data sheet and imported. | §20.1 |
| AC-CNT-02 | Every product has a photo, alt text, description and verified unit conversion. | §20.3, IN-05 |
| AC-CNT-03 | Every policy and explainer page is approved by the owner. | §20.4 |

## 26.11 Platform and security (v2)

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-PLT-01 | HTTPS is forced site-wide. | §21.3 |
| AC-PLT-02 | SPF, DKIM and DMARC pass; test order emails arrive in the inbox. | §21.4 |
| AC-PLT-03 | The server cron runs jobs on schedule with nobody visiting the site. | §21.5 |
| AC-PLT-04 | Two-factor login is enforced for administrators and elevated staff. | §22.3 |
| AC-PLT-05 | Staging is isolated: test gateway keys, no live messages, not indexed. | §21.2 |
| AC-PLT-06 | A restore from backup succeeds within the RTO. | RL-03 |

## 26.12 Marketing and analytics (v2)

<!-- widths: 13,62,25 -->
| ID | Criterion | Verifies |
|---|---|---|
| AC-MKT-01 | GA4 ecommerce events fire correctly and respect consent. | §25.3 |
| AC-MKT-02 | Search Console is verified and the sitemap is submitted. | §25.1 |
| AC-MKT-03 | Structured data validates and its prices match the page. | §25.1 |
| AC-MKT-04 | Marketing messages go only to consenting customers and carry an opt-out. | NA-04, §17.4 |

# 27. Phased Implementation Plan

The phases define dependency order. All four shopping experiences are still intended to launch together after the acceptance tests pass (BP-05). Tracks A and B run alongside the main track (§3).

**(v2) Sequencing fixes from v1.0:**

- Temporary slot holds moved from Phase 5 to Phase 3, because checkout cannot be completed or tested without them.
- The duplicated "protected subscription capacity" task (it appeared in both Phase 4 and Phase 5) now sits only in Phase 4.
- Gateway integration is built and tested in sandbox mode in Phase 3; Phase 6 switches to live credentials.

## Track A — Business and legal groundwork

Starts now. Items LG-01 to LG-11 (§5). Gate: LG-01, LG-03, LG-05, LG-07 and LG-08 complete before the live gateway in Phase 6; LG-09 before SMS or WhatsApp.

## Track B — Brand, design system and content

Starts after the owner approves this requirements baseline.

- **Deliverables:** brand sheet; token sheet; component sheet (§18); wireframes for J1–J10 and staff screens (§19); product data sheet (§20.1); photography (§20.3); page and policy copy (§20.4).
- **Dependencies:** the product data sheet is needed by Phase 2; approved wireframes and components by Phase 3; photos and copy by Phase 6.

## Phase 0: Discovery and baseline audit

**Do not change site configuration.**

Tasks:

1. Inspect current WordPress and WooCommerce versions.
2. Inspect PHP and database versions and the memory limit.
3. Inspect Hostinger plan resources and backup capabilities.
4. Inspect Site Health and WooCommerce system status.
5. Inventory active and inactive plugins and theme versions.
6. Verify the staging URL, separate files and database, and backup.
7. Inspect the WooCommerce order-storage mode.
8. Inspect products, categories, variations, pages, payment settings, shipping settings, and tax settings.
9. Record existing errors and performance symptoms.
10. Identify which requirements are already implemented.
11. **(v2)** Verify staging isolation, HTTPS, email sending, the cron arrangement and the checkout type (blocks or shortcode) — Appendix C.

Deliverables: verified environment report; plugin and theme inventory only, not recommendations; current-state architecture; risk register (Appendix B updated); list of open decisions and blockers; backup and rollback verification.

Acceptance gate:

- no unknown production and staging relationship;
- a verified backup exists;
- current environment facts are recorded;
- no modifications were made without approval.

## Phase 1: Technical specification and solution options

Tasks:

1. Freeze the logical data model (§9).
2. Define module boundaries and service contracts (§7.4, §8).
3. Freeze the state machines (§11), including the WooCommerce status mapping (OD-45).
4. Define pricing calculations (§10), with the rounding rule (OD-50).
5. Define database indexes and idempotency rules.
6. Define API and event contracts.
7. Define acceptance tests (§26).
8. Compare configuration, existing capability, and custom module options.
9. Assess plugin compatibility and costs — only now.
10. Confirm gateway requirements (§16.6) and hosting constraints, including whether RPO can be met (OD-13).
11. **(v2)** Decide accessibility target, languages and performance budget (OD-53, OD-51, OD-59).
12. **(v2)** Decide the job schedule and maximum acceptable delays (§7.5).

Deliverables: implementation-ready specification; decision log; compatibility matrix; cost and risk comparison; test plan; migration and rollback plan.

Acceptance gate: the owner approves the design and implementation options before any plugin is installed or code is deployed.

## Phase 2: Catalogue and inventory foundation

Tasks:

1. Normalise SKUs and product units (from the product data sheet).
2. Define canonical whole-number base units and conversions.
3. Implement the stock ledger and reservations (§13, R1–R12).
4. Implement the manual stock adjustment workflow (§12.13).
5. Implement reservation expiry, including read-time expiry.
6. Implement the audit trail.
7. Test concurrent reservations and late-payment cases.
8. **(v2)** Configure WooCommerce's own stock settings per §13.8.

Acceptance gate: stock concurrency and ledger tests pass (AC-INV).

## Phase 3: Pricing, shared checkout, payments and slot holds

Tasks:

1. Implement retail pricing.
2. Implement Farm Box selection and saved baskets.
3. Implement the wholesale tier engine.
4. Implement shared cart line context.
5. Implement the price snapshot and 15-minute lock.
6. Implement minimum-order and free-delivery configuration.
7. Implement online, COD and bank-transfer states — gateway in sandbox mode.
8. Implement reconciliation and duplicate protection.
9. **(v2)** Implement service-area validation, slots and temporary slot holds (§12.6) — moved from Phase 5.
10. **(v2)** Build the retail, Farm Box, wholesale, cart, checkout and account pages to the approved design system and wireframes.
11. **(v2)** Implement consent capture (§17.4).

Acceptance gate: pricing, payment, slot-hold and checkout journey tests pass (AC-CAT, AC-PAY, AC-DEL-01, AC-DEL-02, AC-DEL-07, J1–J3, J6, J7).

## Phase 4: Subscription engine

Tasks:

1. Implement plans, allowance, and eligible products.
2. Implement basket versioning and cutoff.
3. Implement billing-period and delivery-instance records.
4. Implement separate delivery order generation.
5. Implement recurring payment setup after gateway verification.
6. Implement retry, pause, skip, and cancellation.
7. Implement protected subscription capacity.
8. **(v2)** Build the subscription pages (J4, J5).

Acceptance gate: no duplicate charges or delivery orders under repeated job execution (AC-SUB).

## Phase 5: Delivery and operations

Tasks:

1. Configure delivery slots and cutoffs for operations.
2. Implement packing lists and item-level status.
3. Implement driver and delivery assignment, including the driver view.
4. Implement shortage, cancellation, failed delivery, and refund review.
5. Implement required exports and tax documents after validation.
6. **(v2)** Implement COD collection and cash reconciliation.
7. **(v2)** Implement review queues with response targets.

Acceptance gate: the full order lifecycle can be completed by staff (AC-DEL, AC-OPS-01 to AC-OPS-03).

## Phase 6: Integrations and launch validation

Tasks:

1. Connect the approved gateway in live mode and the notification providers.
2. Configure GA4 and Search Console; SEO foundations (§25).
3. Implement alerts and operational dashboards.
4. Run regression and security tests.
5. Run concurrency and load tests.
6. Test backups and recovery.
7. Train staff.
8. Run a launch rehearsal using staging data.
9. **(v2)** Publish policy and content pages; real-shopper testing (AC-UX-05); accessibility and performance checks.

Acceptance gate:

- all four shopping experiences pass end-to-end tests;
- no critical or high defects remain;
- operations and recovery are documented;
- Track A gate met;
- the owner explicitly approves production deployment.

## Phase 7: Production launch and hypercare

See §28.

# 28. Launch and Ongoing Maintenance

## 28.1 Launch

1. Confirm the production backup.
2. Deploy the approved release through the documented process.
3. Run smoke tests.
4. Verify payment callbacks, stock reservations, subscription jobs, and notifications.
5. Monitor errors, orders, payments, stock, and delivery capacity.
6. Keep the rollback procedure ready.
7. Review incidents daily during initial hypercare. The hypercare length is an owner decision.

Do not use production customers or real payment transactions for staging tests.

## 28.2 Go-live checklist (v2)

- All Phase 6 gates passed and approved.
- Live gateway verified with a small real transaction and refund, with the owner's approval.
- Policies, contact details, grievance officer and FSSAI details live.
- Server cron, backups, monitoring and alerts verified on production.
- Staff trained; support channels staffed.
- First week's slots and capacities configured.

## 28.3 Ongoing maintenance (v2)

<!-- widths: 34,66 -->
| Activity | Requirement |
|---|---|
| Updates | WordPress, theme and plugins updated on a regular schedule; tested on staging first; production backup before each update |
| Backup restore test | Monthly restore test into staging |
| Monitoring | Uptime and alerting reviewed weekly; alert owners kept current |
| Renewals calendar | Domain, hosting, paid plugins, gateway agreements, FSSAI and other registrations |
| Change log | Every production change recorded with date, reason and rollback |
| Access review | Quarterly, and whenever staff leave |
| Policy and decision review | Quarterly review of policies, open decisions and configurable values |
| Incident review | After every incident: cause, fix, prevention |

# 29. Required AI Agent Workflow

Claude must follow this workflow across phases.

## 29.1 Phase execution template

For each phase:

1. State the objective.
2. List exact pages, settings and files to inspect.
3. Explain any risk before changing anything.
4. Ask for approval if the action is destructive, production-facing, financial, or irreversible.
5. Make the smallest set of changes required.
6. Verify the change directly.
7. Run phase-specific tests, by acceptance ID.
8. Record results and changed artifacts.
9. Update the decision log and issue list.
10. Stop and wait for approval before the next phase.

## 29.2 Evidence standard

For any claim about the existing website, use direct observation from the actual environment, not assumptions based on this document. If the browser does not expose a setting or the action cannot be verified, say so and ask the owner to provide the relevant screen or report.

## 29.3 Anti-hallucination rules

- Do not invent plugin features, current versions, API names, gateway support, or compatibility.
- Do not infer that a plugin is installed from a feature appearing on the site.
- Do not assume the current checkout or inventory behaviour is correct until tested.
- Do not claim the website supports 500 orders a day until a load test confirms it.
- Do not silently select prices, thresholds, policies, or cutoffs.
- Do not proceed past a failed acceptance gate.
- Do not modify production during Phase 0.
- Do not make broad code changes without explaining files, rationale, and rollback.
- If an external capability is unknown, inspect reliable current documentation during the implementation-options phase and cite it in the decision log.

## 29.4 Implementation log template (v2)

<!-- widths: 11,9,22,18,14,12,14 -->
| Date | Phase | Decision or change | Files or settings | Tests (AC IDs) | Result | Rollback |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — |

# 30. First Claude Session Prompt

Paste the following prompt after attaching this document to Claude:

> You are the lead e-commerce solution architect and implementation lead for Greenbasket.
>
> Treat the attached Greenbasket PRD and System Design Specification (version 2.0) as the authoritative requirements baseline.
>
> We will work phase by phase. Do not attempt to implement the whole project at once.
>
> **Continue with Phase 0 only.** Do not install, activate, deactivate, update, purchase, or recommend specific plugins yet. Do not modify the website or database.
>
> Guide me through auditing my existing WordPress, WooCommerce, Blocksy, Elementor Free, and Hostinger staging environment, using the evidence checklist in Appendix C. Start with items C1–C3.
>
> Inspect only what is necessary for Phase 0. Clearly distinguish confirmed requirements, directly observed facts, recommendations, open decisions, and blockers. Use the document's IDs.
>
> Do not guess technical versions, plugin capabilities, payment-gateway support, hosting capacity, tax rules, or business values. If you cannot inspect a value in the browser, tell me exactly where I should find it or what safe report I should provide.
>
> At the end of Phase 0, deliver the environment report, current-state architecture, risk register, open decisions, and rollback and backup verification. Stop and wait for my explicit approval before Phase 1.
>
> Keep a concise decision log and implementation log throughout the project. Every phase must end with acceptance-test results and a request for approval before moving forward.

# 31. Final Architecture Decision Summary

The core architecture is:

- WordPress + WooCommerce as the initial commerce platform;
- one modular Greenbasket business-logic layer;
- one canonical product catalogue and shared stock ledger, which is the only stock authority;
- one pricing engine for all channels, working on the whole cart;
- one shared cart and checkout for compatible one-time purchases;
- separate subscription billing periods and delivery instances;
- separate state machines for order, payment, stock reservation, slot reservation, subscription, subscription delivery, refund and exception case;
- transaction-safe, atomic stock and slot holds, with expiry enforced even when jobs run late;
- asynchronous, retryable, idempotent event processing driven by a real server cron;
- auditable operations and recovery;
- phased implementation with explicit acceptance gates, with business, legal, brand and content work running in parallel tracks.

**Do not begin with plugin installation.** Begin with Phase 0 and verify the current staging environment. Then approve the implementation specification and compatibility assessment before selecting components.

The goal is not to make Claude generate the largest amount of code. The goal is to make Claude implement the correct system, in small verified steps, without inventing requirements or destabilising the existing website.
