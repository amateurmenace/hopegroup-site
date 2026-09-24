# hopegroup.ai — The Hope Group

The public website for **The Hope Group, an ethical AI lab in Boston**. A fast static site with a
content management panel the whole team can use, no Squarespace required.

- **Site generator:** [Eleventy 3](https://www.11ty.dev/) (Node). Templates are Nunjucks (`.njk`); content is Markdown + JSON.
- **CMS:** [Decap CMS](https://decapcms.org/) at `/admin/`. Edits become git commits, drafts become pull requests.
- **Hosting:** GitHub Pages via GitHub Actions (see below). Live at https://amateurmenace.github.io/hopegroup-site/ until hopegroup.ai is pointed at it.
- **No trackers, no cookies, no third-party scripts on public pages.** Fonts come from Google Fonts; swap to self-hosted files if you want zero third parties.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:8080, live reload
npm run build      # writes the site to _site/
```

## Where things live

| You want to change… | Edit this |
| --- | --- |
| Hero, “work with us” band, section intros, closing CTA | `src/_data/home.json` |
| Five things we hold to, and the spinning-wheel note | `src/_data/beliefs.json` |
| Site name, email, address, booking link, funding note | `src/_data/site.json` |
| Vision / Digital Beloved Community copy | `src/_data/vision.json` |
| The six values and their "in practice" lines | `src/_data/values.json` |
| The Hope Standard (5 pillars, how we check them) | `src/_data/standard.json` |
| Tech stack layers (local AI etc., shown on the Philosophy page) | `src/_data/stack.json` |
| Stats, certifications, marquee | `src/_data/recognition.json` |
| Partner quotes | `src/_data/testimonials.json` |
| Menus and footer columns | `src/_data/navigation.json` |
| Lab notes (blog) | `src/lab-notes/*.md` |
| News | `src/news/*.md` |
| Press coverage, talks, videos | `src/press/*.md` |
| Projects, including Project Lookout and Driftwood (tools carry extra fields: capabilities, licensing, standard_applied) | `src/work/*.md` |
| Team bios | `src/team/*.md` |
| Images | `src/assets/img/` (CMS uploads go to `src/assets/img/uploads/`) |
| Styles / scripts | `src/assets/css/main.css`, `src/assets/js/main.js` |
| Page layouts | `src/_includes/layouts/`, sections in `src/_includes/partials/` |

Every one of the content files above is also editable from the CMS at `/admin/` once the site is deployed.

Adding a lab note by hand:

```md
---
title: A short, specific title
date: 2026-10-01
author: Stephen Walter
topics: [Local AI, Privacy]
summary: One or two sentences shown in lists.
featured: true
---
Body in Markdown.
```

Set `draft: true` on anything to hide it from the site without deleting it.

## Hosting: GitHub Pages

The repo is `github.com/amateurmenace/hopegroup-site`. Every push to `main` runs `.github/workflows/pages.yml`, which builds the site and publishes it to GitHub Pages at **https://amateurmenace.github.io/hopegroup-site/**.

### Pointing hopegroup.ai at it

1. Add a file named `CNAME` at the repo root containing exactly `hopegroup.ai` and push. The workflow then builds with the site at `/` instead of `/hopegroup-site/`.
2. In the repo: **Settings → Pages → Custom domain** → `hopegroup.ai`, and tick *Enforce HTTPS* once the certificate is issued.
3. At the DNS host (currently Squarespace): four `A` records for the apex pointing to GitHub Pages (`185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and a `CNAME` for `www` → `amateurmenace.github.io`. The Squarespace site keeps serving until DNS flips.
4. Old Squarespace URLs (`/about`, `/portfolio`, `/ai-agents`, `/products/*`, …) are covered by small redirect pages generated from `src/_data/redirects.json`.

### Contact form

GitHub Pages cannot receive form posts. By default the form opens an email draft to `hello@hopegroup.ai` with the fields filled in. To collect submissions in a dashboard instead, create a free [Formspree](https://formspree.io) form and paste its endpoint into **Site settings → Contact form endpoint** (`form_action` in `src/_data/site.json`).

### CMS logins (one-time setup, about 5 minutes)

Decap CMS at `/admin/` uses the GitHub backend, so editors log in with GitHub accounts that have write access to the repo. GitHub OAuth needs a small relay; the easiest free one is Netlify's:

1. In GitHub: **Settings → Developer settings → OAuth Apps → New OAuth App.** Homepage `https://amateurmenace.github.io/hopegroup-site/`, callback URL `https://api.netlify.com/auth/done`.
2. In Netlify (any site on the account works, even an empty one): **Site configuration → Access & security → OAuth → Install provider → GitHub**, paste the Client ID and secret.
3. Invite each editor to the GitHub repo as a collaborator. They log in at `/admin/` with GitHub.

`netlify.toml` is kept only in case you ever move hosting; it does nothing on GitHub Pages.

## Editing content (for the team)

1. Go to `hopegroup.ai/admin/` and log in.
2. Pick a collection on the left (Lab notes, News, Press, Work & impact, Team, or Site settings).
3. Write, then **Save**. New entries start as *Draft*. Move them to *In review* and then *Ready*, and press **Publish**. The site rebuilds itself in about a minute.
4. Publishing triggers the Pages workflow; the live site updates in about two minutes.
5. Images: use the *Cover image* / *Photo* fields, or the media library. Keep photos under ~1 MB and about 1000 px on the long side.

## Things to confirm before launch

The site was assembled from the current hopegroup.ai, Rev. Hope's homepage copy email (Sep 23, 2026),
hopecoded.com, and weirdmachine.org. Please check these before the DNS flip:

- **Driftwood.** The copy follows the email ("our business CRM"). weirdmachine.org describes Driftwood as an open-source design-research platform. Make the product page match the product, and confirm the "no hidden training on your information" claim.
- **Project Lookout** is presented as the platform previously marketed as "The HOPE Bot". Confirm the merge and the "100+ portals" figure.
- **Tech stack** (`src/_data/stack.json`): local AI is described as something the lab is pioneering inside its apps, not its default. The zero-training terms and export claims are still written as commitments; make sure each is true today or soften it.
- **Values "in practice" lines** (`src/_data/values.json`) and **Hope Standard checks** (`src/_data/standard.json`): these are operational claims (named owners, changelogs, session surveys, re-test schedules). Keep the ones you do; edit the rest.
- **The Hope Standard name.** If it is not ready to be public, rename it in `src/_data/standard.json` ("Our ethical AI standards") — the templates pick up the name everywhere.
- **Team bios** were expanded from the old site plus public bios; each person should read theirs. Kaytlyn's bio has no email on record. Photos were matched to names from the old site's page order; double-check Kaytlyn's.
- **Civic AI Access Lab** is written from the 2026 Digital Equity Fund proposal (with The Loop Lab). Confirm its funding status and the “2026” status line. **Civic AI Corps** is marked “In development”; adjust once it has a launch date.
- **JEWN BUG and Unicorn PO Dispenser** are summarized from Stephen's weirdmachine.org write-up (which is not publicly listed there). Check the portal count, the stack description, and the “live in production” status lines before launch.
- **Founded 2021** (the email) vs "Since 2020" (old site). The email wins here; change `founded` and `eyebrow` in `src/_data/site.json` if needed.
- **Dates on seeded news/press items** are approximate where the source only gave a month ("May 2026"). The `date_display` field controls what shows.
- **Booking link.** `booking_url` in `src/_data/site.json` is blank, so CTAs go to the contact form. Paste a Calendly/HubSpot link to send them straight to the calendar.
- **Open Graph image.** `src/assets/img/og.jpg` is a screenshot of the hero; replace with a designed 1200×630 image whenever.

## Why not Squarespace code blocks?

Squarespace code injection can host a single page's HTML, but not a multi-page site with a blog,
portfolio collections, team pages, redirects, and forms, and every editor would have to edit raw
HTML. This setup keeps the design fully custom, gives the team a real editor, and costs less.
