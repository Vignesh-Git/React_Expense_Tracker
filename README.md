# SpendWise — React Expense Tracker

A modern, client-side expense tracker built with **React 19** and **Vite**. Users sign up or sign in; each account gets its own expense vault in **localStorage**. Add spending via a form, natural language, or voice — then explore totals, charts, and history.

## Tech stack

- React 19 · Vite 8 · React Router 7
- Recharts (dashboard pie chart)
- Web Speech API (voice input)
- localStorage (users, session, per-user expenses)

## Features

### Authentication
- **Sign up** — name, email, password (min 6 characters)
- **Sign in / Sign out** — session persisted until logout
- Passwords stored as **SHA-256** hashes (not plain text)

### Expenses
- **Per-user persistence** — data keyed by `userId`; survives logout and re-login
- **Manual form** — name, amount, category, validation
- **Smart add (NLP + voice)** — parse amount, name, category, date, and paid status from text or speech
- **Paid / unpaid** — toggle on History
- **Dates** — optional `date` field (from smart add or form default: today)
- **Delete** — remove entries from History

### Dashboard & History
- **Pie chart** — spending breakdown by category (Food, Travel, Shopping, Bills)
- **Category filter** — History page (All + each category)
- **Header** — running total, expense count, user info, theme toggle

### UX
- **Dark / light theme** — persisted in localStorage
- **Protected routes** — dashboard and history require login
- **Legacy migration** — old global `expenses` key moves to the first signed-in user, then is removed

## Routes

| Path | Description |
|------|-------------|
| `/login` | Sign in (guests only) |
| `/signup` | Create account (guests only) |
| `/dashboard` | Chart, smart add, manual form |
| `/history` | Filter, list, paid toggle, delete |

## Expense model

```json
{
  "id": "uuid",
  "name": "Lunch at Chipotle",
  "amount": 12.5,
  "category": "Food",
  "paid": false,
  "date": "2026-06-02"
}
```

## localStorage keys

| Key | Purpose |
|-----|---------|
| `expense-tracker:users` | Registered users (`id`, `email`, `displayName`, `passwordHash`, `createdAt`) |
| `expense-tracker:session` | Active session (`userId`, `email`, `displayName`) |
| `expense-tracker:expenses` | Map of `userId → expense[]` |
| `theme` | `light` or `dark` |

Expenses are **only saved on add, edit-via-smart-add, delete, or paid toggle** — not on every render — so re-login does not wipe stored data.

## Project structure

```
src/
├── lib/
│   ├── storage.js          # localStorage helpers & keys
│   ├── auth.js             # sign up, sign in, session, password hash
│   ├── expensesStorage.js  # per-user expense map
│   └── parseExpenseNlp.js  # natural-language parser + voice examples
├── context/
│   └── AuthContext.jsx     # auth state & actions
├── hooks/
│   ├── useUserExpenses.js  # load/save expenses per user (persistent)
│   └── useSpeechRecognition.js
├── layouts/
│   └── MainLayout.jsx      # authenticated shell, routes, theme
├── pages/
│   ├── Auth/               # Login, Signup
│   ├── Dashboard/
│   └── History/
└── components/
    ├── AuthLayout/
    ├── SmartExpenseInput/  # NLP + voice UI
    ├── ExpenseForm/
    ├── ExpenseChart/
    ├── ExpenseList/ · ExpenseItem/
    ├── FilterBar/ · Header/
    ├── ProtectedRoute/ · GuestRoute/
    └── LoadingScreen/
```

## Getting started

Install dependencies:

```bash
npm install
```

Start the dev server:

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

Run lint:

```bash
npm run lint
```

## Smart add — voice & text examples

On the **Dashboard**, use **Smart add** or click an example chip:

| Example | Phrase |
|---------|--------|
| Quick coffee | *Five dollars for coffee* |
| Restaurant | *Spent $12.50 on lunch at Chipotle* |
| Groceries | *Forty two dollars groceries yesterday* |
| Ride share | *Uber ride twenty five dollars* |
| Subscription | *Netflix fifteen bucks bills category* |
| Fuel (paid) | *Paid fifty for gas* |
| Shopping | *Amazon shopping ninety nine dollars* |
| Rent | *Rent twelve hundred dollars bills* |

**Voice tips**

- Use **Chrome** or **Edge** for best support
- Allow microphone access when prompted
- Speak clearly: `$24`, `twenty five dollars`, `twelve hundred dollars`
- Pause briefly so the browser can finalize the transcript

**What the parser detects**

| Input | Detected |
|-------|----------|
| `$42`, `42 dollars`, `twenty five dollars` | Amount |
| `lunch`, `uber`, `netflix`, `amazon`, … | Category (keywords) |
| `category food` | Explicit category |
| `yesterday`, `today`, `last week` | Date |
| `paid` | Marks expense as paid |

## Security note

This is a **client-only demo**. Passwords are hashed, but all data lives in the browser and can be inspected or cleared via DevTools. Do not rely on it for real financial data without a proper backend, HTTPS, and secure authentication.
