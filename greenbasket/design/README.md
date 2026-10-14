# Greeen Basket site design

Page designs for the Greeen Basket store, in the brand palette: leaf `#66A626`, olive `#7BA63C` and slate `#324542`, on solid white, with a dark mode.

- **Live canvas:** https://claude.ai/artifact/AUesBckuxj3Xrr76yFzHnN (private until you share it)
- **My account, on its own** (desktop, dark, tablet and phone rows): https://claude.ai/artifact/RAHurVcwBMwDjRRJdaUfNy
- **Log in and sign up, on their own** (desktop, dark, tablet and phone rows): https://claude.ai/artifact/6UHj28pjsWJo1Qzbn5yVx8
- **Every screen on a phone (390 px):** https://claude.ai/artifact/Gtv8DdbE4oRyDj6h1yzR4q
- **Every screen on a tablet (834 px):** https://claude.ai/artifact/PgNaQc3mCsYksMoqtnFqjV
- **Every screen in dark mode, desktop and phone:** https://claude.ai/artifact/G5kp43npf6r3Kq6J84mVdi
- **Design system:** https://claude.ai/artifact/9d4YrEVidtS6qEENyHckE5 ("Greeen Basket Farm Fresh", now on the new palette with light and dark themes)

## What's in the folder

| Path | Contents |
|---|---|
| `site/*.dc.html` | One file per page or component, as published on the canvas |
| `site/gb.css` | The theme: colour scales, light and dark semantic tokens, type, buttons, forms, cards |
| `site/canvas.json` | Board layout of the canvas (pages, positions, sizes) |
| `site/sizes/canvas-*.json` | Board layouts of the phone, tablet and dark-mode canvases |
| `site/sizes/dark-*-phone.dc.html` | The phone boards on the dark-mode canvas (each one shows a page at 390 px) |
| `design-system/tokens.json` | The design system's tokens, light and dark |
| `design-system/README.md` | The design system's brand book |
| `research/web-interface-guidelines.md` | The guidelines every page was reviewed against |

The `.dc.html` files run inside the canvas. Their images point at `/_blob/<id>` uploads that only resolve there, and they load the canvas runtime `support.js`, which isn't in this repo.

## Pages

| Canvas page | Boards |
|---|---|
| Pages | Home, Product, Cart, Farm Box, Subscriptions, Wholesale, About, Contact us, FAQ, 404 |
| Log in, sign up and checkout | Log-in steps 1–3, Sign-up steps 1–4, Checkout steps 1–5 |
| My account | Overview, Orders, Subscription, Profile and settings |
| Policies | Cancellation and replacement, Terms of service, Privacy policy |
| Components | Header, Footer, Product card, Product card states, Form kit |
| Dark mode | Home, Product, Cart, Checkout, My account, Farm Box, Contact us, 404 |

The canvas opens on the Pages page; switch canvas pages to find the rest. A green note above Home lists where every screen is. In Play, Home shows a visitor’s header with Log in and Sign up, and every other page shows the logged-in header with Account.

Forms validate inline and announce errors to screen readers. The main forms (sign-up, checkout, account, subscriptions, Farm Box, wholesale quote, contact and refund request) also move focus to the first error on submit.

## Screen sizes

The same page files serve every size. The layout changes at two widths, set in `site/gb.css`:

| Width | What changes |
|---|---|
| 1025 px and up (desktop) | The layouts as drawn on the main canvas |
| 641–1024 px (tablet) | Department links sit on one line you swipe. Side menus (My account, FAQ, the policies) turn into a row of pills above the content. The Farm Box summary stops sticking. The help card on My account is hidden. |
| 640 px and below (phone) | Header: logo and actions on one line, then search, then the delivery area; button labels are kept for screen readers. Product grids become rails you swipe, about two cards to a screen. The footer shows link columns two to a row. Product, Cart and Farm Box get a sticky bar at the bottom with the total and the next step, on a frosted background (solid when the system asks for less transparency). |

Dark mode is the `.dark` class on any ancestor of `.gb`. The dark-mode canvas forces it on with a copy of `gb.css`; the site should follow the visitor's system setting and offer a switch.

The phone and tablet canvases cut each board at 8,000 px. Open a board full-window to scroll the whole page.

## Commerce sections added beyond the PRD

PIN code delivery check, back-in-stock alerts, recently viewed, review form and empty state, cookie consent and cookie settings, order tracking, report a problem with photos, store credit, GST invoice and GSTIN, newsletter with a separate WhatsApp opt-in, save for later, coupon, minimum order and free-delivery progress, slot hold, short-item preference, reschedule a missed delivery, subscription skip, pause and cancel, wholesale tier calculator and quote form, saved Farm Boxes, data export and account deletion, grievance officer, FSSAI and GSTIN in the footer.

## Before launch

**Fill the placeholders.** Highlighted `[LIKE THIS]` on the pages:

- Support: support phone, email and hours; response time; wholesale phone and email; quote response time; store address and area.
- Legal: legal entity name, registered address, GSTIN, FSSAI number, grievance officer name, email and phone; jurisdiction; limitation of liability; minimum age; date on each policy.
- Policy rules: report window, refund window, cancellation after packing, change of mind, same-day replacement, cash-on-delivery rules and refund method, bank refund time, hold window, missed delivery, subscription cancellation terms, rollover rule, store credit expiry, credit terms and eligibility, wholesale minimum, cut-off time.
- Privacy: payment gateway, messaging, hosting and analytics providers; retention periods; grace period; export window; rights response time; advertising cookies.
- About: founding year, founders, sourcing, delivery areas for each city, open roles.

**Prices are samples.** Store prices, wholesale tiers and plan prices (₹499, ₹849 and ₹3,299) are there to show the layouts.

**Policies are drafts.** Cancellation, Terms and Privacy are plain-language starting points for a lawyer to review, written with the Consumer Protection (E-Commerce) Rules and the DPDP Act in mind.

## Notes for the WooCommerce build

- Put stateful UI in the URL: account tabs, order filters, shop filters and FAQ search.
- Warn before leaving with unsaved changes on the subscription basket and the profile forms.
- Set `color-scheme` on `<html>` and a `theme-color` meta for each theme.
- Keep the phone action bars clear of the home indicator with `env(safe-area-inset-bottom)` and `viewport-fit=cover`.
- Headings and buttons use sentence case, as the design system says. The Web Interface Guidelines ask for Title Case; we kept sentence case on purpose.
- In the design system, the older `green` token is tuned for fills in dark mode. Use `accent-text` for links in new work.
