# Quality Steel and Metals — Website Phase 1: Front-end Design

Date: 2026-10-22 · Status: awaiting client approval

## 1. Intent

Quality Steel and Metals (founded 2002 by Hemant Agrawal) imports, stocks, distributes and trades tool steel, die steel, plastic mould steel and special alloy steel, and offers cutting and machining services. The website is a premium B2B catalogue and lead-generation site. It is not a shop: buyers browse grades and services, then contact the company.

Buyers today mostly reach the company by **WhatsApp and phone**. The site must make those two actions effortless (especially on mobile) while looking clearly more premium than typical Indian steel-trader sites.

Phase 1 is the **public front end only**, built as real production code with sample content, so the client can approve the look and feel by using it on a phone and a laptop. Database, admin panel, email, uploads and deployment come in Phase 2 and plug into this code.

## 2. Goals, non-goals, anti-goals

**Goals**
- A dark, premium industrial design inspired by belgradearbor.rs/en: very large type, generous spacing, large image areas, smooth scrolling, restrained motion.
- Mobile-first. WhatsApp and Call are always one tap away.
- Every page in the brief exists and is navigable, using realistic sample content.
- The content structure mirrors the future database, so Phase 2 swaps the data source without redesigning pages.

**Non-goals (Phase 1)**
- No database, admin panel, authentication, emails or file storage. Forms validate input but do not send.
- No prices, stock quantities, cart or checkout (never, not only in Phase 1).
- No final photography. It arrives later and drops into marked slots.

**Anti-goals: a failure even if the site works**
- Anything invented: clients, awards, certifications, turnover, growth numbers, partnerships, milestones or testimonials.
- Generic stock photos of steel mills that misrepresent a tool-steel stockist.
- Copying Belgrade Arbor's or Purohit Steels' layouts, text or assets.
- Motion that makes the site slow or janky on a mid-range Android phone.
- A Clients & Partners page that looks empty.

## 3. Constraints and facts given by the client

- Colours: Primary #0A0A0A, Secondary #1A1A1A, Accent #C9A35D, Surface #F8F8F8. On light backgrounds, a darker gold (#7A5D24 to #9C7A36) is used wherever gold must stay readable.
- Fonts: Inter Tight for headings, Inter for body text.
- Logo: direction **D, Stacked Plates** (chosen from four options), to be refined: real-rack proportions, with the gold top plate as the memorable element.
- Contact person: Mohit Agrawal. Show phone, WhatsApp, email, office address and a Google Map. **Never show the warehouse address.**
- Founder timeline: only verified facts. 2002, started with Rs 500 by Hemant Agrawal → Today, importer, stockist, distributor and trader with processing services. Further milestones are added later by staff.
- No photos or videos exist yet. The client's shoot is expected around 2026-10-24/25.
- Breakpoints to verify: 1920, 1440, 1024, 768, 480 and 360 px.

## 4. Approaches considered

1. Static picture mockups first, then build the real site. Fastest first look, but motion and mobile behaviour can't be judged, and the design gets built twice.
2. **Build the real front end now with sample content, shown on a private preview link. (CHOSEN by client.)** The client judges real motion and mobile behaviour, and the approved code is the code that ships. It takes longer before the first look, so it is delivered homepage first.
3. Mockups of two key pages, then build. A middle ground, but still partly throwaway, and motion still can't be judged.

## 5. Site map (Phase 1)

| Page | Notes |
|---|---|
| Home | 8 sections, below |
| About Us | history, founder story, capabilities, sourcing expertise, gallery. The certificates and brochure sections stay hidden until content exists (no placeholder certificates). |
| Products | all categories → category page → grade page |
| Grade pages (9) | P20, P20+Ni, H13, H11, D2, SKD11, SKD61, OHNS, HCHCR |
| Services | overview plus 4 pages: Bandsaw Cutting, Precision Machining, Surface Grinding, Custom Cutting |
| Clients & Partners | Hidden from the menu and returns "not found" while there are no logos. A preview switch shows how it looks with logos (built with neutral sample logo shapes, never real company names). |
| Contact | Mohit Agrawal's details, map, enquiry form |
| Request a Quote | full quote form (can also be opened from any grade or service page with the grade or service already selected) |

Product categories: Plastic Mould Steel, Hot Work Die Steel, Cold Work Tool Steel, High Speed Steel, EN Series Engineering Steel, Alloy Steel, Mould Base Plates, Other Steel Grades. (The homepage card labelled "Specialized Steels" links to "Other Steel Grades".)

## 6. Page design

**Global**
- Header: logo, menu, "Request Quote" button. Transparent over the hero, turning solid on scroll. On mobile, a full-screen menu.
- **Mobile action bar** (under 1024 px): a slim bar fixed to the bottom of the screen with WhatsApp | Call | Quote. On desktop, a floating WhatsApp button, with Call in the header.
- Footer: logo, navigation, contact details (office only), "Est. 2002".

**Home**
1. Hero, full screen. Headline: "Specialized Tool Steel & Industrial Metal Solutions Since 2002". Buttons: Request Quote, View Products. Background: a generated dark steel texture with slow-moving light and floating plate shapes. It has a video slot ready for the client's footage, which replaces the generated background once supplied.
2. Snapshot strip: Established 2002 · Importer · Stockist · Distributor · Trader.
3. Product categories: large horizontal cards (image left, text right), hover lift and image zoom. They stack on mobile.
4. Why choose us: Imported Grades, Precision Processing, Reliable Supply, Experienced Team, Custom Sourcing. Each is described in plain, factual words, with no numbers.
5. Processing services: 4 services, each linking to its page.
6. Founder story: a minimal large timeline, 2002 → Today, built so more milestones can be inserted later.
7. Infrastructure gallery: masonry grid with hover zoom.
8. Enquiry banner: "Looking For The Right Steel Grade?" with WhatsApp and Request Quote buttons.

**Grade page** (one template for all 9 grades): hero (grade name, category, equivalent designations) → overview → specifications (available forms, hardness as supplied) → applications and industries served → technical data (chemical composition table, mechanical properties, heat treatment) → downloads (datasheet and certificates; the section hides when there are no files) → related grades → enquiry form → WhatsApp message pre-filled with the grade name.

**Service page** (one template for all 4 services): hero → photos → description → quote form with drawing/CAD file picker (the picker works, but nothing is uploaded in Phase 1) → call to action.

**WhatsApp message format**: "Hello, I would like a quotation for {grade} Steel.\nDimensions:\nQuantity:\nPlease contact me." It opens wa.me with the company number.

## 7. Content rules

- Copy is written in a confident, factual and restrained tone. It uses no superlatives that can't be proven.
- **Technical data for the 9 grades** uses typical values from published standards (AISI/DIN/JIS designations). Each table carries "Typical values. Confirm against mill certificate." The client must have the data checked before launch. This is flagged as a launch blocker.
- Contact details not yet supplied appear as clearly marked tokens, such as [PHONE], kept in one settings file.
- **Imagery until the shoot**: generated steel textures and gradients, never stock photos. Every photo slot shows a subtle label with its aspect ratio and what to photograph, and the same list is produced as a shot list for the photographer.

## 8. How it is built (decided)

- Next.js (App Router) with TypeScript, Tailwind CSS, and Framer Motion for animation. Smooth scrolling uses a lightweight library (Lenis), turned off when the user prefers reduced motion.
- Fonts are self-hosted through Next.js font loading, with no layout shift.
- Content lives in typed data files that match the Phase 2 database tables (categories, products, services, gallery, partner logos, settings), so Phase 2 only replaces the data loader.
- Animation budget: only transform and opacity are animated; parallax and reveal animations are disabled when the user prefers reduced motion; the heavy hero effect is reduced on small or low-power screens.
- SEO groundwork in Phase 1: per-page titles and descriptions, Open Graph tags, image alt text, and semantic headings. The sitemap, robots.txt, structured data (JSON-LD) and canonical URLs are finished in Phase 2 once the domain is known.
- **Preview delivery**: a static export of the site, published as a private Artifact link the client can open on any device. If the export's paths don't work at the artifact URL, the builder adjusts the base paths. The fallback is a free preview deployment, which would need the client's account and is raised with the client before use.

## 9. Delivery order and review points

1. Homepage plus global header, footer and action bar → **client review**.
2. Grade page template (H13 fully filled) plus products and category pages → review.
3. About, Services (overview and 4 pages), Contact, Quote, Clients & Partners → review.
4. Responsive and performance pass at all 6 breakpoints. Lighthouse is measured on the preview.

Feedback at each review is applied before the next step starts.

## 10. Left to the builder

The exact copywriting within the rules above, animation timings, card hover details, the generated texture technique, the refinement of logo D, component structure and file layout, and the photo-slot shot list.

## 11. Open items (needed from the client, not blocking Phase 1)

- Mohit Agrawal's phone, WhatsApp number, email and office address (for the map).
- Photos and videos (expected this weekend).
- Verification of the technical data before launch.
- Domain name and hosting (Phase 2).
