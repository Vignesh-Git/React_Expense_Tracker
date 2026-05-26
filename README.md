# React Expense Tracker

A modern expense tracker built with React and Vite.

## Features

- Add expenses with a controlled form and validation
- Track name, amount, category, and paid/unpaid status
- Expense history rendered with `.map()` and delete/toggle actions
- Category filter on the History page (All / Food / Travel / Shopping / Bills)
- Running total displayed in the header
- `localStorage` persistence with lazy initialization
- Dashboard chart built with `recharts`
- Dark / light theme toggle
- Client-side routing between `/dashboard` and `/history` using React Router

## Project structure

- `src/App.jsx` — app state and routes
- `src/components/Header.jsx` — total display, navigation, theme toggle
- `src/components/ExpenseForm.jsx` — controlled add expense form
- `src/components/FilterBar.jsx` — category filter buttons
- `src/components/ExpenseList.jsx` — list rendering
- `src/components/ExpenseItem.jsx` — single expense row
- `src/components/ExpenseChart.jsx` — category breakdown pie chart
- `src/pages/Dashboard.jsx` — dashboard view (chart + form)
- `src/pages/History.jsx` — history view (filter + list)

## Getting started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Notes

- The app uses `crypto.randomUUID()` for safe unique IDs.
- The dashboard shows the chart and form in the same row with equal-height cards.
- The history page hosts the compact filter UI above the expense list.
