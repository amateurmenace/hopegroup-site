---
client: The Hope Group
short_client: Driftwood
name: Driftwood
kind: Tool
sector: Design research platform
title: "Software drifts. Driftwood catches it."
summary: An open source design research platform for running a beta without losing the plot. A calm Stream where testers report what drifted loose, a board with real working lanes, two drawers for wild ideas, and a field guide, all from one container and one config file. It runs the live Project Lookout beta today.
order: 2
featured: true
status: Open source · Live at cmd-z.com · Running the Lookout beta
glyph: driftwood
audience: Small teams shipping a product to real testers who need one page a non-technical tester can open, point at what is wrong, and get on with their day. And one board the team can actually run the fix from.
app_url: https://cmd-z.com
app_label: the live demo at cmd-z.com
services:
  - Design
  - Development
  - Open source
image: /assets/img/driftwood/home.jpg
image_alt: The Driftwood home dashboard, watching over the Project Lookout beta.
outcome: A beta that gets run instead of ignored. Raw reports become steerable cards in one tap, nothing synthetic is ever shown as live, and the whole tool retargets to a new product by editing one file.
facts:
  - { label: "Live at", value: "cmd-z.com, with a one-tap private demo sandbox" }
  - { label: "Source", value: "github.com/amateurmenace/driftwood, open source" }
  - { label: "Built by", value: "Stephen Walter, designed and developed end to end" }
  - { label: "Runs", value: "The Project Lookout beta, its worked example and first tenant" }
  - { label: "Stack", value: "Python · FastAPI · React · Postgres · one Docker image on Cloud Run" }
  - { label: "Cost per tester", value: "$0, self-hosted, no seat licenses" }
stats:
  - { value: 32, suffix: "", label: "API endpoints" }
  - { value: 22, suffix: "", label: "React views and components" }
  - { value: 14, suffix: "", label: "Hand-built animations, no UI kit, all reduced-motion safe" }
  - { value: 1, suffix: "", label: "Docker image, one command to deploy" }
screens:
  - { image: /assets/img/driftwood/home.jpg, caption: "The home dashboard. Board status at a glance over a live Project Lookout analytics layer. Anything not wired to a real source is badged \"illustrative\" instead of faked." }
  - { image: /assets/img/driftwood/board.jpg, caption: "The Board. Drag-and-drop working lanes only: Bugs, Chores, In Progress, Completed, Backlog. Every card carries a type, a system area, a priority, and its age." }
  - { image: /assets/img/driftwood/stream.jpg, caption: "The Stream. Raw reports drift in uncategorized. Each gets a \"steer it to\" panel, Bug, Chore, Feature, or Bouncy House, and one tap hauls it onto the board." }
  - { image: /assets/img/driftwood/guide.jpg, caption: "The Field Guide. A whole interactive testing playbook baked in: the drift cycle, a first-patrol checklist, a severity quiz you can actually flunk, and the golden rules." }
  - { image: /assets/img/driftwood/list.jpg, caption: "The same board as a list. Three views, Board, List, and Table, for however your team likes to look at the work." }
how_it_works:
  - { title: "Sight it", text: "A tester taps \"Send feedback\" inside the app. Page, URL, screenshot, and console errors attach automatically." }
  - { title: "Reel it in", text: "One POST to the ingest endpoint turns the raw report into a Stream card. Retries are de-duplicated so nothing files twice." }
  - { title: "Bring it ashore", text: "A human looks at each report in the Stream and steers it: Bug, Chore, Feature, or Idea, with an area and a priority." }
  - { title: "Build it back in", text: "The card moves through the working lanes to Completed. Idle for more than seven days and it sweeps itself to the Backlog." }
capabilities:
  - title: The Stream
    text: A calm place to sight raw reports as they float by, never a board column. Look at each one and steer it.
  - title: The Board
    text: Just the working lanes. Drop a card in Completed and the whole thing celebrates. Brought ashore.
  - title: Idea drawers
    text: New Features and the Bouncy House live off to the side in slide-out drawers, so wild ideas never clutter the board and never get lost.
  - title: Field Guide
    text: An interactive testing playbook for non-technical testers, baked in. No manual required.
  - title: Feedback ingest
    text: One small endpoint turns a message, page, screenshot, and browser details into a triage-ready card.
  - title: Config-driven
    text: Columns, areas, types, priorities, and phases live in one file. Point it at a different product and the whole board becomes theirs. No code surgery.
principles:
  - { title: "Opinionated on purpose", text: "A Stream, a board, two drawers, one guide. It is not trying to run your company, just your beta, so it says no to nearly everything a big project tool would add." }
  - { title: "One metaphor, all the way down", text: "Software drifts, so every surface is a beat in the drift cycle and the design system is coastal: warm paper, river blue, tide lines, a bobbing piece of driftwood." }
  - { title: "Motion is never load-bearing", text: "Content is always on the page; reveal, parallax, and ripples are decoration you can switch off. Every animation respects reduced motion and print." }
  - { title: "Honest or omitted", text: "Never present a synthetic number as live. Placeholder data is labelled. A tile with no honest number is dropped, not faked." }
  - { title: "Config over code", text: "One file retargets the entire board to a new product. Driftwood ships pointed at Project Lookout as a worked example, with zero hard dependency on it." }
  - { title: "Tenant-scope everything", text: "Every row carries a tenant and every query is scoped by it. Cross-tenant reads fail instead of leaking, and reads never quietly rewrite the board." }
challenges:
  - { kicker: "Honesty", title: "Real data without ever lying", text: "Showing live Lookout metrics on the dashboard meant a decoupled contract: read-only database views, a locked-down role that cannot see raw tables, a four-second timeout, and a clearly labelled placeholder fallback. Live versus illustrative is always on the badge." }
  - { kicker: "Isolation", title: "Many sandboxes on a single database", text: "One board is real; demo sandboxes are throwaway tenants on the same database, poured from a scrubbed snapshot and reaped automatically. Isolation is a tenant column on every row plus a scope on every query." }
  - { kicker: "Safety", title: "Shipping next to a production sibling", text: "Driftwood shares a cloud project with the live Lookout service. Deploys are a scoped, single-service source deploy verified on the real domain, so the sibling app is never at risk." }
  - { kicker: "Dogfooding", title: "The tool tests itself", text: "Driftwood runs the actual Project Lookout beta. Every rough edge in triage got felt first-hand, then filed into its own Stream." }
standard_applied:
  - pillar: Transparency
    how: Nothing synthetic is ever shown as live. Every figure on the dashboard says whether it comes from a real source, and the badge is enforced in code.
  - pillar: Privacy by design
    how: Tester reports stay in a database the team controls. Every row is tenant-scoped and demo sandboxes wash clean on their own.
  - pillar: Human judgment leads
    how: Nothing is triaged automatically. A person sights every report and decides where it goes.
  - pillar: Shared prosperity
    how: Open source and self-hosted, with no per-tester bill. A community organization can run its own beta without buying seats.
links:
  - { label: "Source on GitHub", url: "https://github.com/amateurmenace/driftwood" }
  - { label: "Read the full case study on weirdmachine.org", url: "https://weirdmachine.org/work/driftwood" }
cta_label: Talk to us about running your beta
---
We were running a beta out of a spreadsheet, and it was not going well. The bug tracker was a sheet everyone ignored and a chat channel that swallowed every report by Tuesday. We did not want a heavyweight project tool. We wanted one page a non-technical tester could open, point at what is wrong, and get on with their day, and one board the team could actually run the fix from.

That is all Driftwood is. The Stream for raw reports, a board with real working lanes, and two drawers for the wild ideas that always show up and never fit. No sprints, no story points, no forty-field forms. It runs from one container and one config file, and the whole thing is built on a single idea: software drifts. Every release knocks pieces loose; they float downstream, and someone has to sight them, reel them in, bring them ashore, and build them back into the structure they came from.

Driftwood is the shore patrol for Project Lookout. It runs the live Lookout beta today, and its home dashboard watches over real, anonymized Lookout metrics through read-only views, with a badge that always says whether a number is live or illustrative. Because the board is config-driven, it can be pointed at any product without touching code, and because it is open source and self-hosted, a small organization can run its own beta without paying for a single seat.

There is a one-tap live demo at cmd-z.com: no sign-up, a private copy of the board with real cards and real drag-and-drop. Poke it, break it; it washes clean on its own.
