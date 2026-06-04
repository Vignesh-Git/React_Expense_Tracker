# SpendWise — React Expense Tracker

SpendWise is a modern, client-side expense tracker built with **React 19** and **Vite**. It includes local sign up/sign in, per-user storage, smart expense entry, OCR bill scanning, recurring expenses, budgets, advanced filtering, and a responsive product-style dashboard.

All application data is stored in the browser with `localStorage`, scoped by user.

## Tech Stack

- React 19, Vite 8, React Router 7
- Recharts for dashboard charts
- Web Speech API for voice expense capture
- Tesseract.js for client-side OCR
- ExcelJS for `.xlsx` export
- localStorage for users, sessions, expenses, settings, budgets, and recurring rules

## Core Features

### Authentication
- Local **sign up / sign in / sign out**
- Passwords stored as **SHA-256 hashes**, not plain text
- Protected app routes for authenticated users
- Session persistence until logout

### Expense Entry
- Manual add form with validation
- Voice add with natural-language parsing
- OCR bill upload with receipt total extraction
- Editable confirmation dialog before saving voice/OCR results
- Recurring monthly expense rules
- Dynamic per-user categories
- Paid/unpaid tracking

### Expense Management
- Edit existing expenses from History
- Delete confirmation popup for expenses and categories
- Undo last deleted expense with toast action
- Advanced filtering by:
  - Date range
  - Category
  - Amount range
  - Paid/unpaid status
  - Search text
- Excel export for filtered results with total row and locked exported-date column

### Smart Dashboard
- Total spent this month
- Remaining monthly budget
- Category-wise spending
- Monthly trends chart
- Top expenses
- Category budget warnings
- Forecasted month-end spend
- Previous month comparison
- Daily spending heatmap

### Setup
- Currency selector with `$` as default
- Per-user category management
- Per-category monthly budgets
- Dark/light theme support

### Responsive Product UI
- Desktop side navigation
- Mobile bottom navigation
- Slide-out mobile drawer
- Sticky top bar with total
- Mobile-friendly cards, dialogs, filters, and forms

## Routes

| Path | Description |
|------|-------------|
| `/login` | Sign in |
| `/signup` | Create account |
| `/dashboard` | Smart dashboard insights |
| `/add-expense` | Add expense, scan bill, voice add, recurring rules, all-time category mix |
| `/history` | Advanced filters, edit/delete, paid toggle, Excel export |
| `/settings` | Currency setup, category management, category budgets |

## Data Models

### Expense

```json
{
  "id": "uuid",
  "name": "Lunch at Chipotle",
  "amount": 12.5,
  "category": "Food",
  "paid": false,
  "date": "2026-06-02",
  "recurringRuleId": "optional-rule-id",
  "recurringMonth": "2026-06"
}
```

### Recurring Rule

```json
{
  "id": "uuid",
  "name": "Netflix",
  "amount": 15,
  "category": "Bills",
  "startDate": "2026-06-01",
  "paid": true,
  "active": true,
  "lastGeneratedMonth": "2026-06"
}
```

### Budget

```json
{
  "monthlyBudget": 5000,
  "categoryBudgets": {
    "Food": 1000,
    "Travel": 1500
  }
}
```

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `expense-tracker:users` | Registered users |
| `expense-tracker:session` | Active session |
| `expense-tracker:expenses` | Map of `userId → expense[]` |
| `expense-tracker:categories` | Map of `userId → category[]` |
| `expense-tracker:budgets` | Map of `userId → budget` |
| `expense-tracker:preferences` | Map of `userId → currencyCode` |
| `expense-tracker:recurring-rules` | Map of `userId → recurringRule[]` |
| `theme` | `light` or `dark` |

Legacy global `expenses` data is migrated into the first signed-in user’s vault, then removed.

## Project Structure

```text
src/
├── components/
│   ├── AuthLayout/
│   ├── CategoryBudgetManager/
│   ├── CategoryManager/
│   ├── ConfirmationDialog/
│   ├── ExpenseChart/
│   ├── ExpenseEditDialog/
│   ├── ExpenseForm/
│   ├── ExpenseItem/
│   ├── ExpenseList/
│   ├── MobileBottomNav/
│   ├── RecurringManager/
│   ├── SideNav/
│   ├── SmartDashboard/
│   ├── Toast/
│   ├── TopBar/
│   └── VoiceExpenseDialog/
├── context/
│   └── AuthContext.jsx
├── hooks/
│   ├── useRecurringExpenses.js
│   ├── useSpeechRecognition.js
│   ├── useUserBudget.js
│   ├── useUserCategories.js
│   ├── useUserExpenses.js
│   └── useUserPreferences.js
├── layouts/
│   └── MainLayout.jsx
├── lib/
│   ├── auth.js
│   ├── budgetStorage.js
│   ├── categoriesStorage.js
│   ├── categoryColors.js
│   ├── currency.js
│   ├── expenseAnalytics.js
│   ├── expensesStorage.js
│   ├── exportExpensesExcel.js
│   ├── ocrExpense.js
│   ├── parseExpenseNlp.js
│   ├── recurringStorage.js
│   └── storage.js
└── pages/
    ├── AddExpense/
    ├── Auth/
    ├── Dashboard/
    ├── History/
    └── Settings/
```

## Getting Started

```bash
npm install
npm run dev
```

Build and preview:

```bash
npm run build
npm run preview
```

Lint:

```bash
npm run lint
```

## Voice Add Examples

Use the microphone button on `/add-expense`.

| Say something like | Result |
|--------------------|--------|
| `Five dollars for coffee` | Amount + Food |
| `Spent 12.50 on lunch at Chipotle` | Food expense |
| `Forty two dollars groceries yesterday` | Food + yesterday date |
| `Uber ride twenty five dollars` | Travel |
| `Paid fifty for gas` | Travel + paid |
| `Netflix fifteen bucks bills` | Bills |

## Bill OCR

Use the bill upload icon on `/add-expense`.

1. Upload a clear JPG, PNG, or WEBP bill image.
2. Tesseract.js reads the bill locally in the browser.
3. The app prioritizes totals such as `Grand Total`, `Amount Due`, and `Total`.
4. Review and edit the parsed expense before confirming.

## Notes

- This is a client-only demo app.
- localStorage is not secure storage for production financial data.
- A production version should use a backend, secure authentication, encrypted persistence, and server-side backup/sync.
