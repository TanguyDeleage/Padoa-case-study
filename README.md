# padoa · AMT detail prototype

Minimal flow: **Suivi des AMT** list → click an AMT → full-page detail dialog.

```sh
npm install
npm run dev        # http://localhost:5173  (?amt=32337 opens a dialog directly)
```

- `src/list/` — AMT list, rebuilt from the screenshot (static).
- `src/amt/` — the dialog, from the Claude Design direction (“AMT — MVP 2”) and `SPECS.md`.
  - `model.ts` — types, seed data, derived rules (event status, issues, times).
  - `useAmt.ts` — state, activity log, toast + undo.
- Tokens from the original dialog live in `src/index.css` (`@theme`).

Today is frozen to 28 Oct 2026 (`TODAY` in `model.ts`) so the demo data stays consistent.
