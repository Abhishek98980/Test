\pagebreak

# PART D — EXPERIENCE

# 18. Brand and Design System

A design system is the set of rules and parts that make every page look and behave like one brand. It is defined once and reused everywhere, so a change — a new brand colour, a larger button — is made in one place. Everything in this section is a **RECOMMENDATION** until the owner approves it. Actual colours, fonts and imagery are owner decisions (OD-52).

## 18.1 Brand foundations

- **Logo set:** primary logo, compact icon (for the browser tab and social media), and a single-colour version.
- **Name usage:** how "Greenbasket" is written and capitalised everywhere.
- **Voice and tone:** for example friendly, plain and trustworthy. Short sentences, no jargon, honest about delays and shortages.
- **Brand colours:** one primary and one secondary colour, chosen with contrast in mind (§18.2).

## 18.2 Design tokens

Define each token once in the theme's global settings and reuse it. Do not hard-code values in pages or templates.

<!-- widths: 22,48,30 -->
| Token group | Tokens to define | Rules |
|---|---|---|
| Colour | Brand primary and secondary; neutral scale; text; background; surface; border; success; warning; error; info; focus outline | Body text contrast ≥ 4.5:1; large text and interface parts ≥ 3:1 (WCAG AA) |
| Channel colours | Retail, Farm Box, Wholesale, Subscription badges | Never the only signal; always paired with a text label |
| Typography | At most two font families; sizes for display, H1–H4, body, small, price; line heights; weights | Body text at least 16 px on mobile; fonts load fast and support ₹ |
| Spacing | One spacing scale used for all gaps and padding | Consistent rhythm across pages |
| Shape | Corner radius; border widths; shadows | Same values on all cards, buttons and inputs |
| Layout | Breakpoints for mobile, tablet, desktop; content width | Mobile-first (§19.5) |
| Motion | Durations and easing | Respect the "reduced motion" setting |

## 18.3 Component inventory

<!-- widths: 30,40,30 -->
| Component | Used in | Variants and states |
|---|---|---|
| Button | Everywhere | Primary, secondary, text, destructive; hover, focus, disabled, loading |
| Product card | Listings, Farm Box | Image, name, unit selector, price, badges, add-to-cart; out of stock |
| Selling-unit selector | Product page, cards | Pack, piece, bunch; unavailable unit disabled |
| Quantity stepper | Cart, product, Farm Box, wholesale | Respects min, max and increment (§8.4); error message when invalid |
| Price display | Everywhere | Retail; wholesale tier table with the tier that applies highlighted; promotional price |
| Channel badge | Cart lines, orders, packing list | Retail, Farm Box, Wholesale, Subscription |
| Stock badge | Cards, product page | In stock, low, out of stock |
| Farm Box panel | Farm Box builder | Running total; save basket; add to cart |
| Allowance meter | Subscription basket | Used versus allowance; blocks saving when over (SB-07) |
| Delivery-area checker | Header, checkout | PIN-code input; in-area or not-served message |
| Slot picker | Checkout, subscription, reschedule | Date tabs; slot cards with availability; disabled after cutoff; "just filled" refresh |
| Price-lock notice | Checkout | Remaining time; "prices changed — please confirm" dialog (CP-13) |
| Payment method selector | Checkout | COD shown only when eligible; bank-transfer instructions |
| Payment status page | After payment | Confirmed; failed with retry; "being verified — do not pay again" |
| Order timeline | Account, tracking | Every order state in §11.1 |
| Alerts and toasts | Everywhere | Success, warning, error, info |
| Forms | Checkout, account | Labels, help text, inline errors |
| Dialogs, empty states, loading skeletons | Everywhere | — |
| Staff components | Staff screens (§19.11) | Packing row, shortage dialog, review queue row, driver delivery card |

## 18.4 Imagery and icons

- Product photos follow one style: same background, lighting, angle and aspect ratio (§20.3).
- One icon set with consistent stroke and corner style.
- Every meaningful image has alt text. Decorative images are marked decorative.

## 18.5 Microcopy

Standard messages for the situations customers meet most — written once and reused:

- price changed since checkout started;
- slot just filled;
- payment being verified (never ask to pay again);
- payment failed — try again;
- over subscription allowance;
- below wholesale minimum or not in the right increment;
- outside the delivery area;
- item short — we will contact you.

Each pricing error code (§10.11) maps to one of these messages.

## 18.6 Implementation on WordPress

Set colour and typography tokens once in Blocksy's global settings and Elementor's site-wide global colours and fonts. Extension screens read the same tokens through shared CSS variables. Verify each capability on the installed versions in Phase 1 before relying on it.

## 18.7 Deliverables and acceptance

Track B produces a brand sheet, token sheet and component sheet. The owner approves all three before the Phase 3 frontend build (AC-UX-01).

# 19. Frontend and Shopper Experience

## 19.1 Principles

- **Mobile first.** Most shoppers will use phones. Design the phone layout first.
- **The server is the truth.** The page never calculates the final price, stock or slot availability; it shows what the server returns.
- **Clear over clever.** One primary action per screen; plain language.
- **Accessible.** WCAG 2.2 AA target (OD-53).
- **Fast on mobile data** (§19.7).

## 19.2 Sitemap

<!-- widths: 32,68 -->
| Page | Purpose |
|---|---|
| Home | What Greenbasket is; entry to the four experiences; delivery-area checker |
| Shop (Retail) category and listing | Browse retail products |
| Product page | Units, price, availability, description, storage tips |
| Farm Box builder | Pick eligible items with a running total; save or add to cart |
| My saved Farm Boxes | Reuse, edit, delete saved baskets |
| Wholesale | Catalogue with tier tables; minimum and increment rules; quote request |
| Subscriptions | Plans, how allowance and cutoff work, sign-up |
| Cart | Lines with channel labels; edits; totals from the server |
| Checkout | Address, slot, payment method, price-lock notice |
| Payment status and order confirmation | Server-verified result |
| My Account | Orders, addresses, subscriptions, saved boxes, refund requests, communication preferences |
| Track order | Status timeline |
| Delivery areas and slots | PIN codes served, hours, cutoffs |
| FAQ, About | Trust and explanation |
| Contact and grievance officer | Seller details and complaint contact (LG-05) |
| Policies | Privacy, terms, refund and cancellation, delivery, subscription terms, wholesale terms |
| Search results, 404 | Find products; recover from bad links |

## 19.3 Navigation

The four experiences are top-level menu items. The cart is always visible. The delivery-area checker is available before browsing, so customers outside the area learn early.

## 19.4 Key shopper journeys

<!-- widths: 7,23,35,35 -->
| ID | Journey | Steps | Must handle |
|---|---|---|---|
| J1 | Retail purchase | Browse → product → choose unit → add → cart → checkout → pay → confirmation | Unavailable unit; out of stock; price changed after lock |
| J2 | Build and save a Farm Box | Pick eligible items → running total → add to cart or save → reuse later | Saved items now ineligible, out of stock or repriced — changes shown before checkout |
| J3 | Wholesale purchase | View tiers → enter quantity → tier applied across lines → checkout | Below minimum; wrong increment; tier changes as quantity changes |
| J4 | Subscribe | Choose plan and cadence → build basket within allowance → set up payment → active | Over allowance; payment setup fails (stays PendingSetup) |
| J5 | Manage a subscription | Edit basket before cutoff; skip; pause; resume; cancel; see next charge, next delivery and cutoff countdown | Edit after cutoff blocked; skip does not reduce charge (explained) |
| J6 | Choose a delivery slot | PIN check → slots → hold → checkout | Outside area; slot just filled; hold expired |
| J7 | Pay and recover | Pay → result | Failure with retry; ambiguous result shows "being verified" and never asks to pay again |
| J8 | Track an order | Timeline → out-for-delivery → delivered or failed | Failed delivery with re-attempt options |
| J9 | Request a refund | Order → items → reason and photo → status | Outside the refund window; partial approval |
| J10 | Guest checkout | Checkout without an account → optional account afterwards | Saving a Farm Box or subscribing asks for an account (OD-30) |

## 19.5 Mobile requirements

- Tap targets at least 24 × 24 CSS pixels (WCAG 2.2 AA minimum); 44 × 44 recommended for primary actions.
- Sticky "add to cart" and "checkout" buttons on long pages.
- Numeric keypad for quantities, PIN codes and phone numbers.
- No horizontal scrolling; images sized for the screen.

## 19.6 Accessibility

Target WCAG 2.2 level AA (OD-53): colour contrast; full keyboard use; visible focus; labelled inputs; errors described in text; alt text; no information by colour alone; reduced-motion support; screen-reader announcements when the cart total, price lock or slot availability changes.

## 19.7 Performance

**RECOMMENDATION** for OD-59: aim for Google's "good" Core Web Vitals on mobile at the 75th percentile — Largest Contentful Paint ≤ 2.5 s, Interaction to Next Paint ≤ 200 ms, Cumulative Layout Shift ≤ 0.1. Set server response targets (p95) after the Phase 0 measurements. Compress and lazy-load images. Never cache personalised pages (§23.2).

## 19.8 Trust signals

Delivery area and slot information early; policies linked in the footer and at checkout; seller details and grievance officer (LG-05); FSSAI number if required (LG-03); genuine reviews only (OD-55); security claims only if true.

## 19.9 Languages

Per OD-51. If more than one language is chosen, every template, message, policy and notification needs each language before launch.

## 19.10 Customer account

Implements §8.11: orders, addresses, subscriptions, saved Farm Boxes, refund requests, communication preferences, account deletion request.

## 19.11 Staff screens

<!-- widths: 30,70 -->
| Screen | Must show and do |
|---|---|
| Packing list | By date and slot; lines with unit, quantity, channel, instructions; record packed quantity and actual weight; raise a shortage |
| Shortage handling | Contact details; customer decision; default action after the deadline (OD-28) |
| Delivery assignment | Orders per slot; assign driver and route; dispatch |
| Driver view | Assigned deliveries only; proof of delivery; COD collection; failed-attempt reason (§15.5) |
| Review queues | Payment review, late payment, refunds, disputes, failed deliveries, COD variance — oldest first, with response targets |
| Stock screen | On-hand, reserved, available; adjustments with reason (§12.13) |
| Slot capacity | Create slots; set capacity and protected capacity; see allocations; warn before reducing below allocations |
| Price and tier management | Versioned price rules and tiers; audit trail |

## 19.12 Deliverables and acceptance

Wireframes for J1–J10 and the staff screens are approved by the owner before the Phase 3 build (AC-UX-02). Before launch, at least five real customers place test orders on their own phones (AC-UX-05).

# 20. Content and Catalogue

## 20.1 Product data sheet

A spreadsheet, completed before Phase 2, with one row per selling unit:

SKU; product name; category and sub-category; base unit; selling unit name; nominal quantity; conversion to base unit; retail price; channel eligibility (Retail, Farm Box, Wholesale, Subscription); minimum, maximum and increment per channel; wholesale tiers if any; tax class (from the CA); origin; storage tips; shelf life; short description; long description; image file name; alt text; search keywords; active status.

## 20.2 Categories

The owner defines the category structure before Phase 2. Example only: vegetables; fruits; leafy greens and herbs; exotic produce.

## 20.3 Photography specification

- One main photo per product and, where useful, a pack-size photo.
- Same background, light, angle and aspect ratio for all products. **RECOMMENDATION:** square (1:1), at least 1200 × 1200 px source size.
- Files named by SKU; served in a modern compressed format with a fallback.
- The source of photos is OD-60.

## 20.4 Copy

Product descriptions; explainer pages for Farm Box, wholesale tiers and subscriptions (allowance, cutoff, skip, pause, cancel, retries); FAQ; About; delivery areas; contact and grievance details; all policy texts (LG-07).

## 20.5 Ownership and updates

The catalogue manager role maintains products, prices and content. Price changes are new price-rule versions, never overwrites. Stock is updated by staff through the stock screen.

## 20.6 Acceptance

The launch catalogue is complete in the data sheet; every product has a photo, alt text, description and verified unit conversion; every policy page is approved by the owner (AC-CNT-01 to AC-CNT-03).
