# 6. Open Decisions Register

The system design must support these values without hard-coding them. The owner sets each value before the relevant feature is enabled. Do not block the architecture on these decisions: keep the values **CONFIGURABLE** and block only the specific feature whose safe operation depends on the missing value. "Needed by" names the first phase that cannot finish without the answer.

OD-01 to OD-18 come from v1.0. OD-19 onwards were added in v2.0.

## 6.1 Pricing and catalogue

<!-- widths: 8,42,12,38 -->
| ID | Decision | Needed by | Design response / recommendation |
|---|---|---|---|
| OD-01 | Wholesale tier boundaries and rates | Phase 3 (to enable) | Per-product, per-selling-unit tier table; **CONFIGURABLE**. |
| OD-02 | Minimum order value, and which channels it applies to | Phase 3 | **CONFIGURABLE** with channel eligibility. |
| OD-03 | Free-delivery threshold and its basis: before or after discounts and tax; which channels and areas | Phase 3 | **CONFIGURABLE** by order, channel and area. |
| OD-08 | Treatment of a mixed Farm Box cart under any general minimum | Phase 3 | **RECOMMENDATION:** Farm Box lines have a zero minimum initially (FB-03). |
| OD-26 | Wholesale aggregation scope: do retail or Farm Box lines of the same product and unit count toward a tier? | Phase 3 | **RECOMMENDATION:** only wholesale-channel lines aggregate. |
| OD-33 | Farm Box price source: the retail selling-unit price or a Farm Box-specific price | Phase 3 | Price rules are per channel, so both are possible. **RECOMMENDATION:** use the retail price unless the owner sets a Farm Box price. |
| OD-44 | Which coupons and promotions apply to which channels, and whether they stack | Phase 3 | **RECOMMENDATION:** no coupons on wholesale tier prices or subscription plan charges unless explicitly allowed per coupon. |
| OD-50 | Money rounding rule: per line or per order, and to the paisa or the rupee | Phase 1 (with CA) | Single rounding function used everywhere; amounts stored in paise. |
| OD-55 | Customer reviews and ratings on the site | Phase 3 | If enabled: genuine purchasers only, published moderation policy. |
| OD-57 | Packs that weigh less than stated: minimum acceptable packed weight | Phase 2 | Confirm under Legal Metrology (LG-04); packing screen enforces the rule. |

## 6.2 Checkout and payments

<!-- widths: 8,42,12,38 -->
| ID | Decision | Needed by | Design response / recommendation |
|---|---|---|---|
| OD-06 | COD eligibility criteria | Phase 3 | Server-side rules, for example order value, area, customer history; **CONFIGURABLE**. |
| OD-10 | Payment gateway | Phase 1 | Evaluate against §16.6 after the architecture and compatibility audit. |
| OD-11 | Recurring payment support (mandate or token) for the selected gateway under applicable Indian rules | Phase 1 (verify); Phase 4 (build) | Never enable automatic renewal until verified (SB-12). |
| OD-23 | Fallback if automatic renewal is not available at launch: a payment link each period, or subscriptions delayed | Phase 1 | Owner chooses; BP-05 means this decision can affect the launch date. |
| OD-25 | Bank-transfer hold window for stock and slot | Phase 3 | Stock reservation enters Extended for this window (R2); the slot hold uses the same window (§11.4). |
| OD-30 | Do saved Farm Boxes and subscriptions require a customer account? | Phase 3 | **RECOMMENDATION:** yes; guest checkout remains for one-time purchases. |
| OD-34 | Automatic reservation extension when an online payment starts close to expiry: duration and maximum count | Phase 3 | **RECOMMENDATION:** one automatic extension per order. |
| OD-35 | Review hold limit: how long stock and slot stay held while a payment is ambiguous | Phase 3 | **CONFIGURABLE**; after the limit the reservation expires (R10) and any later success follows the late-payment workflow (§12.5). |
| OD-36 | Authorize at checkout and capture at packing, so shortages reduce the capture instead of needing a refund | Phase 1 | Only if the gateway supports it for the chosen payment methods. |
| OD-37 | Refund request window and eligible reasons for fresh produce | Phase 5 | Published in the refund policy (LG-07). |
| OD-38 | Auto-approval of system-calculated refunds (cancellations, shortages, duplicates) versus manual review | Phase 3 | **RECOMMENDATION:** auto-approve exact system-calculated amounts; customer complaints always need human review (CP-14). |
| OD-39 | How COD orders are refunded: UPI, bank transfer, or store credit | Phase 5 | Payout details are sensitive data, deleted after use (§22.4). |
| OD-49 | COD confirmation method: automatic on eligibility, phone OTP, or a confirmation call | Phase 3 | **CONFIGURABLE** per COD rule. |

## 6.3 Subscriptions

<!-- widths: 8,42,12,38 -->
| ID | Decision | Needed by | Design response / recommendation |
|---|---|---|---|
| OD-07 | Plan prices, allowances and eligible products | Phase 4 | Data-driven plan configuration. |
| OD-19 | Monthly billing + weekly delivery: is the allowance per delivery or per month? | Phase 4 | Allowance check runs at the chosen scope. |
| OD-20 | Monthly billing + weekly delivery: when delivery charges are billed (inside the monthly charge or per delivery); whether a period is a calendar month or a fixed 4 weeks; how many deliveries a period contains | Phase 4 | A calendar month holds 4 or 5 weekly deliveries; charging per delivery conflicts with §14.1 "no additional recurring charge per delivery". Owner must choose. |
| OD-21 | Do deliveries continue while a renewal is being retried (subscription PastDue)? | Phase 4 | Options: hold, continue, or continue only already-paid deliveries. |
| OD-22 | Does the first failed attempt count as one of the three retries, and how are retries spaced? | Phase 4 | **CONFIGURABLE** retry schedule. |
| OD-24 | Missed cutoff when the last saved basket is no longer valid (price rise pushes it over allowance; item ineligible or unavailable) | Phase 4 | **RECOMMENDATION:** exception case and customer contact; never a silent substitution (§14.6). |
| OD-29 | Does a subscriber choose a recurring delivery slot? | Phase 4 | Protected capacity is planned per chosen or assigned slot. |
| OD-32 | The amount shown on each generated delivery order, and when the GST invoice is issued (at billing or per delivery) | Phase 4 (with CA) | Order value is either allocated or zero with a period reference; CA decides. |
| OD-41 | How long a subscription may stay in PendingSetup before it is cancelled | Phase 4 | **CONFIGURABLE**. |
| OD-46 | Pause: when it takes effect, and whether billing stops during the pause | Phase 4 | Published in subscription terms (LG-07). |
| OD-47 | Cancellation: do remaining deliveries in an already-paid period still happen? | Phase 4 | Published in subscription terms (LG-07). |
| OD-48 | Do plans have a fixed term that ends (subscription Completed)? | Phase 4 | Status exists but is only used if plans have terms. |

## 6.4 Delivery and operations

<!-- widths: 8,42,12,38 -->
| ID | Decision | Needed by | Design response / recommendation |
|---|---|---|---|
| OD-04 | Delivery cutoff times | Phase 3 (slot holds) | **CONFIGURABLE** by date and slot. |
| OD-05 | Slot durations and capacities | Phase 3 | Date-specific **CONFIGURABLE** capacity. |
| OD-14 | Wholesale quotation workflow: request, approval, expiry, conversion to order | Phase 3 | Skeleton in §12.14; quote overrides need actor, reason, amount, approval and expiry. |
| OD-16 | Failed delivery and return policy: maximum re-attempts, re-delivery charge, refund for a failed delivery, what happens to perishables | Phase 5 | Published in the delivery policy (LG-07). |
| OD-27 | Service-area boundary: exact PIN codes and zones (for example, whether Zirakpur, Kharar or New Chandigarh are included) | Phase 3 | PIN-code list with zones; **CONFIGURABLE**. |
| OD-28 | Default action for a shortage when the customer cannot be reached before dispatch | Phase 5 | Options: remove the item and refund it, or hold the order. Published in policy. |
| OD-31 | Is 6 AM–10 PM the delivery window, the ordering window, or both? | Phase 3 | Slots are generated only inside the delivery window. |
| OD-40 | Proof-of-delivery method: OTP, photo, signature | Phase 5 | Proof reference stored on the delivery attempt. |
| OD-42 | Slot capacity unit: orders, crates, or weight | Phase 3 | Capacity check uses this unit. |
| OD-43 | Substitution policy: allowed or not; how price differences are handled | Phase 5 | Never without the customer's explicit approval (§14.6). |
| OD-54 | Customer support channels, hours and response targets for each queue | Phase 5 | §24.2 and §24.3. |
| OD-58 | Booking window: how many days ahead slots are offered | Phase 3 | **CONFIGURABLE**. |

## 6.5 Platform, budget and compliance

<!-- widths: 8,42,12,38 -->
| ID | Decision | Needed by | Design response / recommendation |
|---|---|---|---|
| OD-09 | Tax calculation and invoice numbering | Phase 1 (with CA) | Configure in WooCommerce tax settings; never invent tax treatment. |
| OD-12 | Custom development budget | Phase 1 | Do not assume a budget. |
| OD-13 | Hosting capacity, and whether the current plan can meet RTO and RPO | Phase 0 (verify); Phase 1 (decide) | **NOT VERIFIED.** Inspect the plan and load-test. |
| OD-15 | Push notifications: website, PWA or app scope, and the consent model | Phase 6 | Optional channel. |
| OD-17 | Customer data retention and privacy details | Phase 3 (consent capture); Phase 6 | Based on applicable law (LG-06) and business needs. |
| OD-18 | Plugin budget: free-only, or paid where reliability requires it | Phase 1 | Compared in the Phase 1 cost and risk matrix. |
| OD-45 | WooCommerce order-status mapping: custom statuses, or one WooCommerce status plus a separate fulfilment field | Phase 1 | **RECOMMENDATION** in §11.1. |
| OD-56 | Business registrations: FSSAI tier and GST registration | Track A | LG-02, LG-03. |
| OD-59 | Performance budget: p95 server response time, error rate, Core Web Vitals | Phase 1 (after Phase 0 measurements) | **RECOMMENDATION** in §19.7. |

## 6.6 Experience and brand

<!-- widths: 8,42,12,38 -->
| ID | Decision | Needed by | Design response / recommendation |
|---|---|---|---|
| OD-51 | Site languages: English only, or Hindi and Punjabi too | Phase 1 | Adding languages later is harder; decide before templates are built. |
| OD-52 | Brand assets: do a logo, colours and fonts already exist? | Track B | §18.1. |
| OD-53 | Accessibility target level | Phase 1 | **RECOMMENDATION:** WCAG 2.2 level AA. |
| OD-60 | Product photography approach: own photography, supplier images, or stock images | Track B | §20.3 photo specification applies to all sources. |
