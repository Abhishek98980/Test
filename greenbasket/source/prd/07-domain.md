# 13. Inventory Ledger and Reservations

## 13.1 Availability formula

`available_quantity = on_hand_quantity − active_reserved_quantity`

Quantities are expressed in the product's canonical base unit. "Active" means Active, Extended, Confirmed or ReviewRequired with an unexpired hold (§11.3). Expiry is enforced at read time (§7.5).

## 13.2 Atomic reservation

Stock availability check and reservation creation must be atomic or use an equivalent concurrency-safe mechanism. A read-then-write sequence without locking or a conditional update is not sufficient. A checkout reserves all its lines together or none of them.

## 13.3 Reservation timeout

- Default unpaid reservation timeout: 15 minutes (CP-10), **CONFIGURABLE**.
- The expiry worker must be recoverable and monitored.
- An expired reservation must not be reactivated blindly.
- A late successful payment after expiry enters reconciliation and must verify stock before fulfilment (§12.5).
- **(v2)** Extensions follow R2 only: online payment near expiry (OD-34), bank transfer (OD-25), or staff with a reason.

## 13.4 Stock movements

Record movements for: initial stock; manual restock; fulfilment deduction (reservation consumption); waste and shrinkage; stocktake correction; cancellation and return adjustment; authorized correction; **(v2)** shortage correction; **(v2)** return restock. Use idempotency keys so repeated job or callback execution never creates duplicate movements.

**(v2) Shortage correction:** if a confirmed line cannot be packed, the stock record said the goods existed but they did not. The unfilled quantity is released from the reservation (R12), and a shortage_correction movement reduces on-hand by the same amount, so the ledger matches the shelf.

## 13.5 Nominal pack deduction

If a 1 kg pack is selected, deduct 1 kg from the stock ledger even if the actual packed weight is 1.08 kg. Record actual packed weight separately if measured. Track variance and adjust stock through an explicit operational movement where appropriate. Do not alter the customer price because of actual packed weight. **(v2)** Packs below the stated weight follow OD-57 (LG-04).

## 13.6 Manual stock updates

- Require a quantity, unit, reason, actor, and timestamp.
- Show on-hand, reserved, and available quantities separately.
- Warn before an adjustment would make available stock negative.
- Keep history; do not silently overwrite inventory balances.
- Provide a stock reconciliation workflow (§12.13).

## 13.7 Returns and failed deliveries (v2)

Goods returned after a failed delivery are inspected. Sellable goods get a return_restock movement; unsellable goods get a waste movement (O15). Neither changes the customer's refund automatically; refunds follow OD-16.

## 13.8 WooCommerce's own stock settings (v2)

WooCommerce has its own stock counts and its own "hold stock" timer for unpaid orders. Two independent stock systems must never both decide availability (RK-05).

**RECOMMENDATION:** the Greenbasket ledger is the only authority. WooCommerce stock management is either switched off for these products, or updated one way from the ledger for display only. WooCommerce's unpaid-order hold must not cancel orders on a different timer from the reservation timeout. The final choice is made in Phase 1, after the Phase 0 audit records the current settings (Appendix C, C16).

# 14. Subscription Scheduling and Billing

## 14.1 Separate billing period from delivery order

A subscription period is a billing record. A delivery instance is a fulfilment record. They must be separate entities.

For monthly billing + weekly delivery:

- one subscription billing period;
- one monthly charge, subject to gateway and authorization rules;
- multiple separate weekly delivery records and orders;
- each delivery links to the same period;
- no additional recurring charge per delivery.

**(v2)** How delivery charges, the period length and the number of deliveries per period work with this rule is OD-20.

## 14.2 Basket edit workflow

1. Load the current saved basket version.
2. Allow the customer to edit eligible products, units and quantities.
3. Validate the product allowance.
4. Save a new version.
5. At cutoff, freeze the appropriate version.
6. If the cutoff is missed, use the last saved basket.
7. Validate stock and protected slot capacity.
8. Generate the delivery order.
9. Preserve the snapshot and resolution history.

The full cycle is in §12.7.

## 14.3 Subscription status

Statuses: `pending_setup`, `active`, `past_due`, `paused`, `cancel_pending`, `cancelled`, `completed`. Transitions are S1–S10 (§11.5). Do not move a subscription to active unless the required payment authorization or setup has succeeded.

## 14.4 Renewal retries

- Retry up to three times over three days.
- After retries are exhausted, pause future deliveries and notify the customer.
- Decide before implementation whether the first failed attempt counts toward the three retries (OD-22).
- Retry scheduling is idempotent.
- Reconcile any late gateway success before starting another charge.
- Confirm the gateway's recurring payment capability and applicable Indian rules before launch (OD-11). **(v2)** These include e-mandate rules on pre-debit notification and on transaction amounts above which the customer must authenticate again, plus card tokenisation. Verify with the gateway in Phase 1 how they apply to weekly billing and to the retry schedule.

## 14.5 Skip, pause and cancel

- Skip applies to one scheduled delivery (V2).
- Pause affects future scheduling from its effective date (S6, OD-46).
- Cancellation stops future obligations according to published terms (S8, S9, OD-47).
- Skipping a weekly delivery within a monthly plan does not automatically reduce monthly billing.
- Preserve historical periods, orders, charges, and basket snapshots.

## 14.6 Subscription shortage

- Flag the affected line or item.
- Create an exception case.
- Contact the customer.
- Pause the affected item until it is resolved.
- Do not silently substitute or charge a different amount.
- Record customer approval and the final resolution.
- Apply any billing or credit decision only according to an approved published policy.

# 15. Delivery Slots and Fulfilment

## 15.1 Delivery configuration

<!-- widths: 34,22,44 -->
| Setting | Status | Value |
|---|---|---|
| Service area | **CONFIRMED** | Chandigarh, Mohali, Panchkula; exact PIN codes OD-27 |
| Hours | **CONFIRMED** | 6 AM to 10 PM; meaning OD-31 |
| Days | **CONFIRMED** | Monday through Sunday |
| Slot duration | **OPEN DECISION** | OD-05 |
| Slot capacity and capacity unit | **OPEN DECISION** | Per date and slot (OD-05); unit OD-42 |
| Cutoff | **OPEN DECISION** | OD-04 |
| Booking window | **OPEN DECISION** | OD-58 |
| Subscription capacity | **CONFIRMED** | Protected before regular orders use remaining capacity |

## 15.2 Slot reservation

- Reserve slot capacity at checkout (L1).
- A temporary slot hold has its own expiry, separate from the stock reservation.
- Confirm the slot with order confirmation (L2).
- Release on checkout expiry, confirmed failure, or cancellation when appropriate.
- Use concurrency-safe capacity checks; never allow negative available capacity.
- **(v2)** The check and the hold are one atomic step (§12.6).

## 15.3 Protected subscription capacity

- The scheduler calculates future scheduled subscription deliveries.
- Protected capacity is allocated before remaining capacity is shown to regular orders.
- Paused, skipped, or cancelled deliveries release capacity according to cutoff rules.
- If slot capacity cannot be honoured, create an exception and do not silently move a customer to a different slot.

## 15.4 Packing and delivery

The packing list includes: order reference; delivery date and slot; product and SKU; selling unit; quantity; channel label; customer instructions; shortage and exception indicator.

Delivery workflow: packing assigned; items picked; shortages recorded; packed; delivery assigned; out for delivery; delivered, failed or returned; proof and timestamp stored where applicable. Details are in §12.9 and §12.10.

A mixed cart remains one customer order. Group lines for packing where useful, but do not create separate orders only because the channel label differs.

## 15.5 Driver view (v2)

Drivers see only their assigned deliveries (§22.1): address, slot, contact method, COD amount due, delivery instructions. They record proof of delivery, COD collection, and failed-attempt reasons. The view must work on a phone over mobile data.

# 16. Payments

## 16.1 Methods

<!-- widths: 22,78 -->
| Method | Summary |
|---|---|
| Online | Through the selected gateway (OD-10). Confirmed only by verified server-side result (§12.1, §12.2). |
| COD | For eligible orders only (OD-06). Confirmed by the COD rule (OD-49); paid at collection (§12.3). |
| Bank transfer | Order waits for verified credit within the transfer window (OD-25); not packed before verification except by authorized exception (§12.4). |

## 16.2 Core rules

- A gateway redirect or browser success page is not proof of payment. Verify by server-to-server callback with signature, or by gateway status lookup.
- An ambiguous transaction remains pending or review-required until reconciled (CP-07).
- A payment callback must not create duplicate payment processing or duplicate orders (CP-08).
- Do not prompt a second payment while the first attempt is ambiguous.
- If a customer reports a debit after a failed-looking payment, reconcile before asking them to pay again (CP-16, §12.15).
- A successful payment after reservation expiry enters review; do not dispatch until payment and stock are reconciled (CP-11).
- Never charge an amount different from the snapshot the customer confirmed.

## 16.3 Payment states

Payment states and transitions are P1–P15 (§11.2): pending, authorized (if supported), paid, failed, voided, review_required, partially_refunded, refunded, disputed.

## 16.4 COD controls (v2)

COD eligibility is decided on the server and is never shown as available when the rules fail. The amount due at the door always comes from the server, after any shortage adjustment. Cash handover and variance follow §24.4.

## 16.5 Bank-transfer controls (v2)

Every bank-transfer order has a unique reference. Verification records the bank reference, amount received and verifier. Underpayments and overpayments open a payment_review case. Packing before verification needs an approver and a reason (CP-09).

## 16.6 Gateway selection criteria

Before selecting a provider, verify and cite current documentation for:

- WordPress and WooCommerce compatibility, including the order storage mode and checkout type in use;
- supported payment methods in India (UPI, cards, net banking, wallets);
- reliable signed, server-verified callbacks;
- transaction lookup and reconciliation, with settlement reports;
- refunds, including partial refunds, through the API;
- recurring-payment and token or mandate support for subscriptions, including weekly frequency, retries and pre-debit notification handling (OD-11);
- authorization and later capture, if OD-36 is wanted;
- handling of delayed or ambiguous payment results;
- documented retry and idempotency behaviour;
- dispute and chargeback process;
- a test or sandbox mode for Phase 3;
- fees, settlement timing, support, and compliance requirements;
- **(v2)** onboarding requirements: KYC documents and website readiness checks (LG-08).

Do not select a gateway solely because it supports one-time checkout.

## 16.7 Refunds and disputes

Refunds follow the refund lifecycle (§11.7, §12.12). Disputes follow P13–P15 with their response deadlines tracked. Refund requests are reviewed by support under the published policy; there is no self-service refund approval (CP-14).

## 16.8 Duplicate payments (v2)

If a customer pays twice for one order — for example in two browser tabs, or by retrying a UPI payment — the second Paid attempt goes to ReviewRequired and a duplicate_payment case opens. After verification, the duplicate amount is refunded through a system refund request (F1).

## 16.9 What is never stored

Card numbers (PAN), CVV, UPI PINs, net-banking credentials. Only gateway references and tokens the gateway issues are stored (§22).

# 17. Notifications and Integrations

## 17.1 Channels

Email; WhatsApp; SMS; push notifications if the chosen website or app capability supports them (OD-15).

## 17.2 Events

<!-- widths: 40,22,38 -->
| Event | Type (RECOMMENDATION) | Trigger |
|---|---|---|
| Order confirmation and status updates | Transactional | O2, O7–O15 |
| Payment confirmation, failure, under review | Transactional | P1, P5, P6 |
| Delivery reminder | Transactional | Before the slot (timing **CONFIGURABLE**) |
| Out for delivery, delivered, delivery failed | Transactional | O11, O12, O13 |
| Shortage exception | Transactional | Stock_shortage case |
| Refund status | Transactional | F5, F6, F8 |
| Subscription basket cutoff reminder | Transactional | Before the cutoff |
| Subscription renewal reminder and pre-debit notice | Transactional (pre-debit notice may be mandatory under mandate rules) | §12.8 |
| Failed renewal and pause | Transactional | S3, S5 |
| Back in stock | On customer request only | Customer asked to be told |
| Abandoned cart | Marketing — consent required | Checkout abandoned |
| Reorder reminder | Marketing — consent required | Configured interval |
| Promotional offers | Marketing — consent required | Campaign |

Classify each message with LG-06 before launch.

## 17.3 Event processing

Each event or job includes: unique event ID; source order, subscription or product reference; event time; recipient and channel; processing status; attempt count; next retry time; provider reference; last error.

Rules:

- notifications are asynchronous where practical;
- notification failure must not roll back an order or payment (NA-05);
- retry safely without sending duplicates;
- use consent and opt-out controls for marketing (NA-04);
- do not log secrets or unnecessary personal data.

## 17.4 Consent and provider requirements (v2)

- Marketing messages are sent only to customers with a granted ConsentRecord for that channel. Every marketing message carries an opt-out.
- SMS uses DLT-registered sender IDs and templates; WhatsApp uses approved templates and opt-in rules (LG-09).
- Transactional email is sent through an authenticated sending service from the business domain (§21.4).

## 17.5 Analytics

- GA4 ecommerce events and Google Search Console (§25.3).
- Analytics must not be used as the financial source of truth.
- Do not send payment credentials or unnecessary sensitive customer data to analytics.
