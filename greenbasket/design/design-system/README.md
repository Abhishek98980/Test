Greeen Basket Farm Fresh is the storefront language for greeenbasket.com: a premium, fresh storefront built on one friendly typeface and three brand colours, leaf #66A626, olive #7BA63C and slate #324542, on solid white, with a matching dark theme. Its layout and type come from Farm to People, its palette (leaf, olive and slate, chosen 14 Oct 2026, replacing Atlantis) follows a 60-30-10 split, its shop grid and filters follow Mama Earth's market pages, its box picker follows Mama Earth's subscription section, and its social-proof sections follow Odd Bunch's reel wall and review wall.

## Content fundamentals

- Voice: warm, local, plain. Say where food comes from and when it arrives: "Picked at dawn, at your door by breakfast."
- Headlines are sentence case, short, often a promise ("From the mandi to you in a Chandigarh minute."). Buttons are uppercase in the `button` style with 2px tracking. Badges are lowercase ("fresh today", "on sale").
- Category labels on tiles name a promise, not a bare category: "Produce picked to order".
- Product names: English first, Hindi in brackets: "Kinnow (किन्नू)". Units sit under the name ("1 kg", "1 bunch", "500 g").
- Prices: whole rupees, no space: "₹79". Discounts show struck MRP and a savings chip ("Save 20%").
- Social proof is real only: customer photos, supplier messages and review counts from actual sources, used with permission.
- No emoji in the interface.

## Visual foundations

Colour. Solid white first, and it stays white: `surface` is #FFFFFF on every page, with `well` #F4F8EF only as a quiet band or photo well. 60% white, 30% slate, 10% green. Slate #324542 is the ink: `text` for body copy, `text-strong` #13201D for headings and prices, `text-muted` #566964 for units and hints. Leaf #66A626 is the action colour: `accent` fills carry `on-accent` dark text (6.1:1), never white (2.98:1 fails). Where leaf has to be text, use `accent-text` #426F18. Olive #7BA63C is the second green, for tags, seasonal badges and one highlighted tile, always with `on-olive` dark text. Big feature cards (next delivery, the subscription offer, help) sit on `band`, slate in light mode, with `on-band` white text. Soft grounds come in pairs: `accent-soft` with `on-accent-soft`, `olive-soft` with `on-olive-soft`. Status colours are `danger`, `warning` and `success`, each with a `-soft` ground. Borders: `line` for hairlines, `line-strong` for dividers, `field-line` for inputs. The older names (`green`, `ink`, `canvas`, `lime`, the `green-50` to `green-950` scale) still resolve, now pointing at the new palette.

Dark theme. Every semantic token has a dark value. The page goes to near-black slate #0C1311, cards step up to #111A18 and #172220, text turns light (`text-strong` #F1F5F3), and leaf text lightens to #A5D474 so it still reads. `accent` stays #66A626 with dark text. `band` darkens to #15201D but keeps light text, so feature cards never flip into bright slabs. Shadows deepen, and surfaces get lighter as they rise. Switch with `[data-theme="dark"]` or follow `prefers-color-scheme`.

Type. Rubik only, four weights: 400 body, 500 headings, 600 labels and buttons, 700 prices. Headings run tight (-2px tracking at 40px, -1.5px at 30px); uppercase only for buttons and tile labels. Noto Sans Devanagari renders Hindi names.

Shape. Small radii on photos (`radius-sm` 4px), soft cards (`radius-card` 10px), rounded-rectangle buttons inside cards (`radius-btn` 12px), large rounding on reels (`radius-lg` 24px), and full pills for every page-level action and badge.

Depth. Barely there. Cards sit on `shadow-card`, a 2% to 4% green-tinted haze; the header uses `shadow-sm`; only floating things (Need help, open dropdowns, hovered cards, reels) use `shadow-float`.

Layout. Content max 1280px, 48px side padding on desktop, 24px on mobile. Homepage sections 64px apart. Shop pages: 250px sticky sidebar, sticky toolbar, grouped product panels, 4 columns at desktop and 2 on mobile.

Motion. Two marquees (reel wall 40s, review wall 90s, rows opposite), both pausing on hover or focus and stopping for reduced motion. Cards lift 2px on hover. FAQ plus icon rotates to a cross. Nothing else moves.

Focus. A 3px `focus` ring with a 2px offset for keyboard users only (:focus-visible); mouse clicks show nothing. `focus` is leaf-600 #528A1D on light grounds (4.2:1 on white) and #84BF45 in dark mode (8.5:1).

Accessibility. Checked pairs, light then dark: `text-strong` on surface 16.8:1 and 17.1:1; `text` 10.2:1 and 13.4:1; `text-muted` 5.8:1 and 7.9:1; `accent-text` 6.0:1 and 11:1; `on-accent` on accent 6.1:1 and 6.4:1; `on-olive` on olive 6.4:1 and 8.3:1; `on-band` on band 10.2:1 and 13.9:1; `danger` on surface 6.6:1 and 6.8:1. `field-line` input borders 3.4:1 and 3.6:1. White on leaf #66A626 fails (2.98:1) and is never used. The older `green` token is leaf-700 in light mode (white text 6.0:1) and leaf-300 in dark mode, where `on-dark` turns dark (10.6:1). In dark mode `green` is tuned for fills and links, so don't put white text on it. Information never relies on colour alone: sale prices also show the struck MRP, selected chips also show a check, errors carry an icon and text.

## Iconography

Material Symbols Outlined at 20px in text rows, 26px in the header; filled only for the basket, stars and an active heart. Icons sit beside a label except search, basket, heart, mute and carousel arrows, which carry an aria-label. Illustrations (hand-drawn produce, used on value sections) are welcome once the brand commissions them; none ship with this system.

## Page templates

Homepage: utility bar and white header; hero on white or `well` with one headline and a leaf Shop now pill; canvas promise band; reel wall on white; category tiles on canvas; how it works on white; product grid of mandi deals on canvas; box plans on white with ratings row; value props on canvas; review wall on white; footer with Need help pill.

Shop and category page: header; sticky sidebar of sub-categories; sticky toolbar (title, count, Filters, Source, Sort); one panel per sub-category with title, description and grid; footer.

Product page: photo left, details right (source, name, unit, price, savings chip, Subscribe and Add, freshness and storage notes), related items grid below.

Inner pages (About, FAQ, Contact, Press, Cancellation, Privacy, Terms): 180px photo band with the title, then the page body: About as canvas intro plus wave plus collage and mission; FAQ as grouped accordions; Contact as info panel plus form; Press as a cream band of outlet logos; policies as a 760px text column.

## Assets

No logo file yet: the header shows "Greeen Basket" in Rubik 700 inside a hexagon outline as a stand-in. Product, hero, reel and review photos are supplied by the store: product photos 4:3 on a plain light ground, reels 9:16 MP4.
