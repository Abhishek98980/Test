\pagebreak

# APPENDICES

# Appendix A. Change Log from Version 1.0

## A.1 Section mapping

<!-- widths: 36,26,38 -->
| v1.0 section | v2.0 section | Change |
|---|---|---|
| 0. Instructions for the AI agent | §0 | Rules 16–17 added; identifiers, conventions, status and glossary added |
| 1. Executive summary | §2 | Unchanged in substance |
| — | §3 | New: 15 pillars and build order |
| 2. Business context and confirmed requirements | §4 | Same requirements, now with IDs |
| — | §5 | New: business and legal groundwork (Track A) |
| 3. Open decisions | §6 | 18 → 60 decisions, with "needed by" phase |
| 4. Architecture overview | §7 | Responsibility map and background-job rules added |
| 5. Functional modules | §8 | Additions marked (v2); customer account module added |
| 6. Data model | §9 | New entities; reservation reference fixed; derived regular capacity |
| 7. Pricing engine | §10 | Cart-level wholesale; tax after delivery; promotions, rounding, error codes |
| 8. Cart and checkout states | §11, §12 | Formal state machines and workflows |
| 9. Inventory | §13 | Shortage correction, returns, WooCommerce stock settings |
| 10. Subscriptions | §14 | Links to new decisions and mandate checks |
| 11. Delivery | §15 | Configuration table; driver view |
| 12. Notifications and integrations | §16, §17 | Payments consolidated into §16; event classification and consent |
| — | §18–§20 | New: design system, frontend and journeys, content |
| — | §21 | New: hosting, domain and environments |
| 13. Security | §22 | WordPress hardening, personal data, incident response |
| 14. Performance and recovery | §23 | Monitoring with alert owners |
| — | §24, §25 | New: operations and support; marketing, SEO and analytics |
| 15. Acceptance criteria | §26 | IDs, "verifies" column, and 6 new groups |
| 16. Phased plan | §27, §28 | Sequencing fixes; Tracks A and B; maintenance |
| 17–19. Agent workflow, prompt, summary | §29–§31 | Log template; prompt updated for Phase 0 continuation |

## A.2 Review of the owner-supplied workflow diagrams

Five diagrams were supplied with the request for version 2.0. Each was checked against the confirmed requirements. All five were relevant and are incorporated; the corrections are listed here.

<!-- widths: 18,30,52 -->
| Diagram | Kept | Changed or added, and why |
|---|---|---|
| Payment states | Pending, Authorized, ReviewRequired, Paid, Failed, PartiallyRefunded, Refunded and their main transitions | A voided authorization goes to a new Voided state, not Failed (a cancellation is not a failure). Failed → ReviewRequired for late success or a reported debit (CP-16). Repeated partial refunds, disputes, capture-unclear, and COD and bank-transfer mappings added. Refund states derived from refund transactions. (§11.2) |
| Stock reservation states | Active, Extended, Expired, ReviewRequired, Confirmed, Released, Consumed | Added payment failure and cancellation from Extended; hold during ambiguous payment, which the requirements demand; review hold limit; release of shortage quantity at packing with a stock correction; read-time expiry so a late job never locks stock. (§11.3) |
| Order states | Draft through Delivered, ReviewRequired, Cancelled | Added DeliveryFailed and Returned (DL-12 requires a failed-delivery workflow). Refund states moved to their own lifecycle so delivery history and repeat refunds are not lost. Added cancellation from Packing for shortages. Dropped `ready_for_packing` as redundant. WooCommerce status mapping added. (§11.1) |
| Pricing flow | Validation steps, channel branches, promotions, taxes, delivery, server breakdown | Wholesale aggregation made cart-level (a per-line flow cannot add up quantities across lines). Delivery charge before tax, since delivery may be taxable. Added price-rule version, minimum order, rounding, snapshot and price lock, and the error path. (§10) |
| Slot booking flow | Select → check → hold → checkout → confirm or release | Service-area check moved before slots are shown. Check and hold merged into one atomic step — as drawn, two customers could both book the last place. Added the ambiguous-payment path, rescheduling and capacity reductions. (§12.6) |

New diagrams added in v2.0: logical architecture; delivery plan; slot reservation states; subscription states; subscription delivery states; refund states; checkout sequence; payment callback handling; COD flow; bank-transfer flow; subscription delivery cycle; renewal and retries; packing and shortage; delivery and failed delivery.

## A.3 Formatting defects fixed

Version 1.0 contained formatting errors that could cause a reader — or an AI agent — to misread it:

- every table appeared as raw `| pipe |` text instead of a table;
- bold markers appeared as literal `**asterisks**`;
- numbered lists continued their numbering across unrelated sections (for example, the phase-end checklist was numbered 16–24 and the Phase 0 tasks 79–88).

## A.4 Diagram sources

All diagrams are kept as editable Mermaid source files with this document's build files, in the folder `greenbasket/source/diagrams` of the repository `abhishek98980/test`. Edit the source and rebuild rather than editing the images.

# Appendix B. Risk Register

Severity reflects the impact if the risk is not handled. Owners and dates are assigned in Phase 0 and Phase 1.

<!-- widths: 8,30,10,52 -->
| ID | Risk | Severity | Mitigation |
|---|---|---|---|
| RK-01 | Scope versus budget: a free-only plugin preference and an undecided custom budget, against a custom ledger, reservations, tier engine, subscription scheduler and payment reconciliation | High | Decide OD-12 and OD-18 in Phase 1 with a cost and risk comparison |
| RK-02 | Recurring payments in India: automatic renewal depends on gateway mandate or token support and on mandate rules (pre-debit notice, authentication thresholds, tokenisation). Weekly billing and the retry schedule must fit them. Because all four experiences launch together (BP-05), this can delay the launch | High | Verify in Phase 1 (OD-11); choose a fallback (OD-23) |
| RK-03 | A 15-minute RPO may not be achievable on the current hosting plan | High | Verify in Phase 0; decide hosting in Phase 1 (OD-13) |
| RK-04 | Visit-triggered scheduling runs jobs late during quiet hours (expiry, retries, cutoffs) | High | Server cron (§21.5); read-time expiry (§7.5); job-lag monitoring |
| RK-05 | Two stock authorities: WooCommerce's own stock and hold timer versus the Greenbasket ledger; fractional stock | High | Ledger is the only authority; whole-number base units (§13.8, §0.4) |
| RK-06 | Subscription rules conflict or are undefined: allowance scope, delivery charge timing, 4 or 5 deliveries a month, invalid basket at cutoff | High (Phase 4) | OD-19 to OD-24 decided before Phase 4 |
| RK-07 | Three separate timers (price lock, stock hold, slot hold) create late-payment reviews, especially with UPI app switching; bank transfers cannot complete in 15 minutes | Medium | Authorized extensions (R2, OD-34, OD-25); review hold limit (OD-35) |
| RK-08 | Staging not isolated: real customer data, live gateway keys or live messaging on staging; shared resources with production during load tests | High (Phase 0) | Appendix C, C3; §21.2 |
| RK-09 | Checkout type (blocks or shortcode) and order storage mode change how every checkout customisation is built | Medium | Record in Phase 0 (C6, C7); design in Phase 1 |
| RK-10 | Shortage handling at volume: a call per shortage at 500 orders a day with fixed slots | Medium | Default action (OD-28); staffing; shortage-rate monitoring |
| RK-11 | GST treatment of fixed-price plans over a mixed basket; invoice timing for monthly-billed weekly deliveries | Medium | CA decisions OD-09, OD-32 |
| RK-12 | Messaging registrations (DLT, WhatsApp templates) take time | Low | Start in Track A (LG-09) |
| RK-13 | Launching all four experiences together: a defect in one blocks all (BP-05 is confirmed; flagged, not reopened) | Medium | Early end-to-end testing; launch rehearsal |
| RK-14 | Elementor Free is for page layout; the Farm Box builder, basket editor and tier tables are application screens | Low | Build them in the extension using the design tokens (§18.6) |
| RK-15 | WooCommerce order status and Greenbasket fulfilment status could disagree | Medium | One service writes both, in one transaction (OD-45) |
| RK-16 | Check-then-hold race in slot booking (as originally drawn) | High | Atomic hold (L1, §12.6) |
| RK-17 | Refunds modelled as order states would lose delivery history and block repeat refunds | Medium | Separate refund lifecycle (§11.7) |
| RK-18 | Duplicate payments from two tabs or UPI retries | Medium | One active attempt per order; duplicate handling (§16.8) |
| RK-19 | Customer payout details for COD refunds are sensitive | Medium | Minimal collection; deleted after use (§22.4) |
| RK-20 | Manual review load: late payments, shortages, refunds and failed deliveries at volume | Medium | Response targets, queues and alerts (§24.2); auto-approval rules where allowed (OD-38) |
| RK-21 | Packs below the stated weight could breach weights-and-measures rules | Medium | LG-04, OD-57; packing-screen check |
| RK-22 | v1.0 formatting defects could cause misreading | Low | Fixed in v2.0 (A.3) |

# Appendix C. Phase 0 Audit Evidence Checklist

Send text or screenshots. **Never send:** passwords; `wp-config.php`; API keys or secrets; payment gateway settings screens that show keys; customer names, emails, phone numbers or addresses; database dumps.

## C.1 Gate items (Phase 0 cannot pass without them)

<!-- widths: 7,58,35 -->
| ID | Evidence | Where to find it |
|---|---|---|
| C1 | Production and staging URLs; how staging was created; confirmation that they use separate databases and folders | Hostinger hPanel (website list, database names); owner knowledge |
| C2 | Latest backup of each site: date, what it covers (files and database), where it is stored, retention, and whether a restore has ever been tested | hPanel backups; any backup tool in use |
| C3 | Staging isolation: payments in test mode? Email, WhatsApp and SMS off? Real customer or order data present? Hidden from search engines or password-protected? | Staging admin; owner knowledge |

## C.2 Platform

<!-- widths: 7,58,35 -->
| ID | Evidence | Where to find it |
|---|---|---|
| C4 | WooCommerce system report (versions, PHP, memory limit, database, plugins, theme, template overrides) | WooCommerce → Status → Get system report |
| C5 | Site Health status issues and site information | Tools → Site Health (Status; Info → Copy site info) |
| C6 | Order data storage setting and compatibility mode | WooCommerce → Settings → Advanced → Features |
| C7 | Whether Cart and Checkout pages use blocks, shortcodes or Elementor templates | Edit the Cart and Checkout pages |
| C8 | Site timezone | Settings → General |
| C9 | Scheduled actions: counts of pending, past-due and failed; any server cron jobs | WooCommerce → Status → Scheduled Actions; hPanel cron jobs |
| C10 | Child theme, must-use plugins, code-snippet plugins (names only) | Appearance → Themes; Plugins |

## C.3 Hosting

<!-- widths: 7,58,35 -->
| ID | Evidence | Where to find it |
|---|---|---|
| C11 | Plan name; resource limits; last 30 days of usage; any limit-reached notices | hPanel plan and usage pages |
| C12 | Backup frequency and retention included in the plan; whether production and staging share the plan's resources | hPanel; Hostinger support |
| C13 | Caching in use, and confirmation that cart, checkout and account pages are excluded | Caching settings |
| C14 | Whether load testing is allowed on the plan | Ask Hostinger support |

## C.4 Shop configuration

<!-- widths: 7,58,35 -->
| ID | Evidence | Where to find it |
|---|---|---|
| C15 | Product export (no customer data) | Products → Export (CSV) |
| C16 | Inventory settings: stock management, hold-stock minutes, out-of-stock behaviour | WooCommerce → Settings → Products → Inventory |
| C17 | General (selling locations, currency, decimals), Tax, and Shipping (zones, regions or PIN codes, methods) settings | WooCommerce → Settings |
| C18 | Payment methods list and their test or live mode — list page only | WooCommerce → Settings → Payments |
| C19 | Accounts and privacy settings; list of enabled emails | WooCommerce → Settings → Accounts & Privacy; Emails |
| C20 | Order counts by status (no customer details); coupons list | WooCommerce → Orders; Marketing → Coupons |
| C21 | Pages list, marking which use Elementor | Pages |

## C.5 Errors, symptoms and new checks

<!-- widths: 7,58,35 -->
| ID | Evidence | Where to find it |
|---|---|---|
| C22 | Fatal-error logs from the last 30 days, with customer details removed | WooCommerce → Status → Logs |
| C23 | Server error log, if the plan exposes one | hPanel |
| C24 | Problems the owner has noticed: slow pages, checkout errors, failed payments, stock mismatches | Owner |
| C25 **(v2)** | HTTPS forced on every page; certificate valid | Browser; hPanel |
| C26 **(v2)** | How the site sends email today; whether SPF, DKIM and DMARC records exist | hPanel DNS zone; email settings |
