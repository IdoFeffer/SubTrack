# SubTrack

A subscription tracker app - shows all monthly subscriptions in one place, with a warning before renewal.

## Current status

**Frontend** (`src/`): a full React + Vite project, RTL (Hebrew UI), with three responsive layouts:
- Mobile (`<640px`): subscription list + full-screen add/edit form.
- Tablet (`640–1023px`): full-width list; "New subscription" opens a modal (X / "Cancel" / click backdrop / Esc, with focus trap).
- Desktop (`≥1024px`): sidebar, subscription table, and a right rail with a category breakdown and an "upcoming renewal" card.

Styled per a colorful design system (violet/fuchsia, tokens in `src/lib/subscriptions.js` and `src/components/*`), Heebo font. Features: add, edit, delete, category (with a category→color mapping, defaulting to violet for unknown categories), custom icon/image per subscription, sorting (renewal date / price / name) on tablet and desktop, empty state, loading skeleton, and an error banner (ready at the UI level; not yet wired to a real fetch — see "Next steps").

**Backend** (`server/`): an Express server with `GET /subscriptions`, `POST /subscriptions`, `DELETE /subscriptions/:id`, backed by **temporary in-memory storage** (not Turso yet).

**Connection between the two**: doesn't exist yet. The frontend runs on local state (doesn't read from the server), as planned in step 3 below.

## Stack

- **Frontend**: React + Vite + Tailwind CSS, icons from `lucide-react`, Heebo font (Google Fonts)
- **Backend**: Node.js + Express
- **DB**: Turso (SQLite) — planned, not yet connected
- UI language: Hebrew, full RTL

## Proposed DB schema (currently implemented as an in-memory array on the server)

```
subscriptions
- id
- name
- price (number)
- next_renewal_date (date)
- category (text, optional) — there's a category→color mapping in code; an unrecognized category defaults to violet
- user_id (foreign key, for future auth)
```

## Next steps (suggested order)

1. ~~Set up a Vite + React project, move `App.jsx` into it~~ ✅
2. ~~Set up a basic Express server with endpoints: `GET /subscriptions`, `POST /subscriptions`, `DELETE /subscriptions/:id`~~ ✅
3. **Connect to Turso, replace local state with real API calls** — including adding `PATCH /subscriptions/:id` for editing (currently only exists as frontend local state), and actually wiring the existing loading/error screens to a real fetch instead of today's simulated timer.
4. (future) "What did I forget" logic - filter subscriptions not updated/checked in over 3 months
5. (future) Email import (Gmail API) - not at this stage, see the note in the original conversation about the complexity
6. (future, non-critical) an "undo delete" toast after removing a subscription

## Design notes

- Subscription cards/rows: icon tile in the category's color (or an uploaded image), name, renewal date (red if ≤3 days), price, and a category chip (tablet/desktop).
- Metric cards at the top: monthly total (gradient), subscription count, and on tablet/desktop also "next renewal" and "yearly total".
- Font: Heebo, full RTL.
- Exact tokens (colors, radii, shadows, spacing) — see `src/lib/subscriptions.js` and `src/components/`, plus the mockup file below.

## Design file

`SubTrack Mockups.dc.html` (project root) — the reference mockup for the three screens (mobile/tablet/desktop), open in a browser to view. Used as the basis for the current implementation in `src/`; not production code.
