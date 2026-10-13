\pagebreak

# PART E — PLATFORM AND OPERATIONS

# 21. Hosting, Domain and Environments

## 21.1 Current assets

The domain and Hostinger hosting are purchased (**CONFIRMED**). The plan's resources, backups, PHP and database versions, and staging arrangement are **NOT VERIFIED** until Phase 0 (Appendix C).

## 21.2 Environments

<!-- widths: 20,80 -->
| Environment | Requirements |
|---|---|
| Production | The live site. No testing, no experiments, no load tests. Changes arrive only through the deployment process below. |
| Staging | Separate files and separate database. Payment gateway in test mode only; outbound email, WhatsApp and SMS disabled or captured; no real customer data, or anonymised data only; hidden from search engines and password-protected; analytics off. |
| Local (optional) | A developer's own copy for building the extension. |

Deployment process (mechanics fixed in Phase 1):

1. Build and test on staging.
2. Take and verify a production backup.
3. Deploy the approved change.
4. Run smoke tests.
5. Keep the rollback ready; record everything in the implementation log.

## 21.3 Domain, DNS and HTTPS

- The registrar account is owned by the business, with two-factor login.
- DNS records are documented.
- HTTPS is active and forced on every page; one canonical host (with or without "www").
- Strict-Transport-Security is added only after HTTPS is verified everywhere.

## 21.4 Email

- Business mailboxes on the domain.
- Order and account emails are sent through an authenticated sending service, not the server's default mail function, which often lands in spam.
- SPF, DKIM and DMARC records are published and pass.
- From and reply-to addresses are set; deliverability is tested in Phase 6.

## 21.5 Scheduled jobs

A server cron triggers WordPress jobs at a fixed interval. Visit-triggered scheduling is switched off only after the server cron is verified. Job lag is monitored (§7.5, §23.3).

## 21.6 Backups and recovery

Backups cover files and the database, are stored off the server, and are restore-tested. A 15-minute RPO (RL-04) needs point-in-time database recovery or very frequent database backups; daily backups cannot meet it. Details are in §23.4.

## 21.7 Capacity

Phase 0 records the plan's limits and usage (Appendix C, C11–C13). Phase 1 decides whether the plan meets RL-01 to RL-04 — or whether a different plan or host is needed (OD-13). Load testing needs the host's permission and must never run against production.

## 21.8 Access and ownership

- The owner holds the master accounts: registrar, hosting, WordPress administrator, payment gateway, Google, messaging providers. Each has two-factor login.
- Staff get named accounts with the least access their role needs (§22.1).
- Credentials are never shared in chat, email or documents.
- Access is reviewed at each phase gate and when someone leaves.

# 22. Security and Access

## 22.1 Roles

<!-- widths: 26,74 -->
| Role | Access |
|---|---|
| Administrator | Everything; very few people |
| Catalogue manager | Products, selling units, price rules, tiers, content |
| Order manager | Orders, slots, review queues for orders, cancellations |
| Packing staff | Packing lists and shortage recording; cannot alter payment credentials or price rules |
| Delivery staff | Assigned deliveries only; proof of delivery; COD collection |
| Customer support | Cases, customer contact, refund requests; cannot silently erase payment or stock history |
| Finance and reconciliation | Payment review, bank-transfer verification, refunds, COD reconciliation, disputes |

Least privilege applies everywhere:

- price overrides and stock adjustments require permission and a reason;
- refunds follow the configured approval workflow;
- every critical action is audited.

## 22.2 Application security requirements

- Server-side validation of price, quantity, stock, discount, and state transitions.
- Protected payment callbacks: signature verification and idempotency (§12.2).
- Secrets stored outside public code and outside the repository.
- No raw card PAN or CVV stored.
- Audit logs for critical actions.
- Staging isolation (§21.2).
- Backups and restoration tests.
- Access control for customer and financial data.
- **(v2)** Rate limits on public endpoints that check stock, slots or PIN codes, so they cannot be abused or scraped.

## 22.3 WordPress hardening (v2)

- Two-factor login for every administrator and every staff account with elevated access.
- Named accounts only; no shared logins; as few administrators as possible.
- WordPress core, theme and plugins kept updated — tested on staging first (§28.3).
- Unused plugins and themes removed; software installed only from reputable sources.
- File editing from the WordPress dashboard disabled.
- Login attempt limits.
- A web application firewall and malware scanning. The capability is required; the product choice waits for Phase 1 (rule 2).
- Least-privilege database user; secure cookies; HTTPS only.
- Backups encrypted and stored off the server.

## 22.4 Personal data (v2)

- Collect only what is needed. Mask personal data in logs.
- Customer payout details (for COD refunds — OD-39) are sensitive and deleted after the refund completes.
- Consent records and retention follow OD-17 and LG-06.
- Customer and financial data are visible only to roles that need them; access is logged.

## 22.5 Incident response (v2)

A one-page runbook, written in Phase 6:

- who to call;
- how to put the site into maintenance mode;
- how to rotate keys and passwords;
- how to restore from backup;
- what to record;
- whom to notify under applicable law.

# 23. Performance, Observability and Recovery

## 23.1 Load targets

- Up to 500 orders a day (RL-01); 50 concurrent shoppers initially (RL-02).
- Actual performance must be measured on staging.
- Define acceptable p95 response times and error rates after inspecting the hosting environment (OD-59); do not invent them.

## 23.2 Performance principles

- Cache public product pages and static assets.
- Never put personalised pricing, cart, checkout, stock authority, account pages, or payment state in a shared cache.
- Use database indexes for high-frequency lookups; avoid unbounded queries.
- Process slow integrations asynchronously.
- Monitor scheduled job delays.
- Test concurrent stock and slot reservation.
- Verify the configured WooCommerce order storage mode.
- Use supported APIs and hooks.

## 23.3 Monitoring

<!-- widths: 46,54 -->
| Monitor | Alert goes to (OD-54) |
|---|---|
| PHP and application errors | Developer |
| Database errors and slow queries | Developer |
| Payment callback failures; reconciliation backlog | Finance + developer |
| Order confirmation delays | Order manager |
| Reservation expiry and job lag | Developer |
| Subscription job failures | Developer + support |
| Notification queue failures | Developer |
| Slot capacity inconsistencies | Order manager |
| Backup completion and restore readiness | Owner + developer |
| Disk, memory, CPU and hosting resource usage | Developer |
| Site uptime | Owner + developer |
| Exception cases past their response target | Case owner role |

Alert thresholds are set in Phase 1.

## 23.4 Recovery targets

- RTO: 2 hours (RL-03). RPO: 15 minutes (RL-04).
- Validate both against the hosting and database arrangement.
- Daily backups alone do not satisfy a 15-minute RPO.
- Recovery must include order, payment reference, inventory movement, reservation, subscription, and delivery records.

## 23.5 Recovery procedure

1. Restore to a controlled environment.
2. Verify database and custom table integrity.
3. Reconcile payment attempts with the gateway.
4. Reconcile stock balances, movements, and active reservations.
5. Verify subscription periods and generated delivery orders.
6. Run overdue jobs safely with idempotency.
7. Resume checkout only after consistency checks pass.

# 24. Operations and Customer Support

## 24.1 Daily operating rhythm (RECOMMENDATION)

Exact times depend on OD-04 and OD-05.

1. **Before each slot's cutoff:** clear the payment review and late-payment queues for that slot.
2. **At cutoff:** generate the packing list; subscription cutoff jobs have already frozen baskets and generated orders.
3. **Packing:** pick, record and handle shortages (§12.9).
4. **Dispatch and delivery** (§12.10).
5. **End of day:**
   - COD cash handover and reconciliation;
   - payment and settlement reconciliation;
   - review of stock variance and shortage corrections;
   - failed-delivery follow-up;
   - refund queue;
   - stock count updates.

## 24.2 Queues and response targets

Each exception case type (§11.8) has an owner role and a response target (OD-54). Queues are shown oldest first. Cases past their target raise an alert.

## 24.3 Customer support

- **Channels, hours and response targets:** OD-54.
- **Grievance officer** named and published (LG-05).
- **Scripts for common situations:**
  - debit but failed payment — reconcile before asking to pay again (§12.15);
  - shortage call;
  - failed delivery;
  - subscription skip, pause and cancel;
  - refund status.
- **Support tools:** support can look up orders and cases but cannot delete payment or stock history.

## 24.4 COD cash handling

1. The driver records each collection (amount, cash or UPI, time).
2. At day end, the driver hands over cash against a summary.
3. Finance confirms. Any difference opens a cod_variance case.
4. Deposits are recorded.

## 24.5 Records required at launch

Packing lists and item-level fulfilment status; delivery assignment and outcome records; GST-compliant invoice and credit-note records where applicable, after CA validation; staff audit log for price, stock, payment, and order changes (OR-01 to OR-04).

## 24.6 Exports

Packing lists; delivery manifests per slot; payment and settlement reconciliation; refund register; stock movement report; GST reports after CA validation.

# 25. Marketing, SEO and Analytics

## 25.1 SEO foundations

- Unique page titles and meta descriptions.
- Clean, readable URLs.
- Product structured data (schema.org Product and Offer), with prices that always match the page.
- XML sitemap; correct robots rules; canonical URLs; breadcrumbs.
- Image alt text; fast mobile pages (§19.7).
- Cart, checkout, account pages and the whole staging site are never indexed.

## 25.2 Local SEO

Greenbasket delivers locally, so local search matters most:

- a Google Business Profile set up as a service-area business;
- the same business name, address and phone everywhere;
- a delivery-areas page.

## 25.3 Analytics

- GA4 ecommerce events: `view_item`, `add_to_cart`, `begin_checkout`, `add_payment_info`, `purchase`, `refund`, with the channel as a parameter.
- Respect consent choices.
- Analytics is never the financial source of truth (§17.5).
- Verify Search Console and submit the sitemap.

## 25.4 Measures to define before launch

Decide what will be measured before launch, so tracking is in place from the first order. Targets are owner decisions; these are the measures:

- conversion rate and average order value;
- repeat-purchase rate;
- active subscriptions and subscription cancellations;
- Farm Box saved-to-reordered rate;
- wholesale share of revenue;
- slot utilisation and on-time delivery rate;
- shortage rate and refund rate;
- payment success rate.

## 25.5 Launch marketing (RECOMMENDATION)

The owner plans how the first customers will find Greenbasket. Examples: launch offers; opt-in WhatsApp communities; social media; local flyers; referrals. Every channel must respect consent (§17.4).
