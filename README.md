# Evergreen Expense V11 — Money Guardian Edition

**New in V11:** Smart Transfer Guardian, Bill Shock Detector, Purchases & Refunds, and Fixed Deposit Maturity Calendar. These features build on V10's dashboard, spending calendar, monthly bills, savings, analytics and personalization.

## Run on Windows

```powershell
npm.cmd install
npm.cmd run dev -- --port 5185 --strictPort
```

Open http://localhost:5185. For a build: `npm.cmd run build`. For unit tests: `npm.cmd test`.

## Important accounting rules

- Internal transfers are kept in a separate collection and **excluded** from expense statistics. Existing expenses that resemble transfers are only suggestions; reclassification requires confirmation.
- Bills are a monthly plan. Paid statuses and actual bill charges do not automatically create expense transactions.
- Purchases/returns are reference records and do not add a second expense or automatically deduct refunds from spending totals. Link purchases to existing expenses as references where possible.
- Fixed deposit maturity interest is a **simple estimate** using entered dates, principal, and annual rate. No earned interest is automatically credited.
- All amounts and notices rely on information entered in the browser. No bank accounts are connected and no background notifications are sent.

## Browser data and backend integration

Expenses continue in the previous `expenseRepository`; new collections use localStorage keys `evergreen-transfers-v11` and `evergreen-purchases-v11` through the existing `useFinanceCollection` boundary. Bills use their existing `evergreen-bills-v1` collection with optional per-month `actualAmounts` maps; fixed deposits use their existing `evergreen-assets-v1` records with optional `openedOn`, `maturesOn`, `annualRate`, `renewal` fields. This preserves the original storage format and enables future Flask API replacements. **Do not use localStorage for real sensitive financial data or production multi-user deployment.**

## Team split suggestion

- Frontend: dashboards, page layouts, mobile and accessibility
- Backend: expense, bill, transfer, purchase, and maturity API endpoints
- Database: transactions and normalized records; account moves should be modeled separately
- Testing: analytics, transfer classification, reminders, storage compatibility
- DevOps: GitHub/Jenkins pipeline, test/production deployment and monitoring

---

# Evergreen Expense V9.1 — Personal Finance Hub

A responsive **frontend-only** personal finance prototype for the Software Deployment & Evolution / DevOps team project. Built on React, Vite, Recharts, Lucide and Tailwind; it uses browser localStorage instead of a backend for now.

## Run on Windows (PowerShell)

1. Extract the ZIP (do not open `index.html` directly inside it).
2. Open PowerShell **inside the `evergreen-expense` folder** (the folder containing `package.json`).
3. Run:

```powershell
npm.cmd install
npm.cmd run dev -- --port 5180
```

4. Open `http://localhost:5180/` in Chrome.
5. To stop the development server, press `Ctrl+C`.

Check the project locally before handing it to teammates:

```powershell
npm.cmd test
npm.cmd run build
```

## Pages

| Page | Features |
|------|----------|
| Dashboard | Monthly spending, monthly budget, KPI cards, trends, category chart and recent transactions |
| Spending Calendar | Today, Monday-to-today week, this month and current year; choose any historical month/year; daily bars; payment method breakdown; category breakdown; monthly transaction list |
| Transactions | Add, edit, delete, search, sort and filter by category and payment method; CSV export |
| Insights | Month-over-month spending trend, top category and monthly chart |
| Monthly Bills | Set recurring bill names, monthly amounts, categories and due dates; check off each individual month as paid |
| Savings & Investments | Track savings accounts, fixed deposits and investment balances; set targets; record contributions and withdrawals; view monthly movement history |

### Payment methods
Cash, Debit Card, Credit Card, Touch ‘n Go eWallet, Bank Transfer and Others. Legacy V8 expenses without a payment method are presented as **Others** and can be edited. New demo transactions have sample methods.

### Important accounting distinction
- **Expenses** represent actual spending and count in all spending charts.
- **Recurring bills** are a separate planning/checklist module; marking them paid **does not** create an expense. Record the actual payment in Transactions when it happens. This avoids automatic double-counting.
- **Savings, fixed deposits and investments** contain manually entered balances. Contributions and withdrawals change tracked balances, **not spending**. No live account integration, interest calculation, investment pricing, return forecasting or financial advice is provided.

### Data storage, privacy and development

All data is demo/local browser data saved using localStorage. It is **not shared across team members or devices**, and may be lost if browser site data is cleared. Do not enter real sensitive banking credentials. The sample holdings and bill amounts are fictitious examples. Use **Reset everything to zero** in the sidebar to permanently clear expense transactions, bill plans and history, tracked savings and investments, transfers, purchases, and the monthly budget. It also removes user-created personalization names while retaining built-in suggestions. All financial totals, including the monthly budget, become RM 0.00 and remain empty after refreshing; demo records are not restored.

For a future Flask backend, replace:
- `src/services/expenseRepository.js` for expense endpoints,
- `src/hooks/useFinanceCollections.js` for bill and account endpoints,
- `src/hooks/useBudget.js` for budget persistence.

The UI and all calculations are local for now. Do not confuse Vite localhost with online deployment to the production server.

## Files

```text
src/
  components/
    SpendingExplorer.jsx    # new V9 time/month/payment analysis
    BillsPlanner.jsx        # new V9 recurring bills checklist
    WealthWorkspace.jsx     # new V9 savings, FD, investments
    ExpenseModal.jsx        # payment method field
    ExpenseTable.jsx        # category + payment filters
    DashboardCharts.jsx
    ...
  data/finance.js           # payment types + demo bills/assets
  data/sampleExpenses.js    # sample expense entries
  hooks/useFinanceCollections.js
  hooks/useExpenses.js
  services/expenseRepository.js
  utils/periods.js          # date ranges / payment breakdown
  utils/analytics.js
  utils/csv.js
```

Version control suggestion: keep one team GitHub repository and use feature branches for frontend, API/database, testing, DevOps, and monitoring. The final university demo should include real backend deployment and CI/CD evidence, which are not part of this frontend ZIP.

## V9.1 contrast update

The light navigation sidebar now uses dark, readable text and icons on every page. Brand text, active and inactive navigation, hover states, the Add Expense button and bottom notes were all updated for better contrast. No expense, bills, savings or localStorage logic changed.


## V10 — Personalize your finances

The **Personalize** page lets users maintain their own names for banks and wallets, merchants and brands, expense categories, and investment types. These preferences live under `evergreen-preferences-v1` in localStorage, completely separate from the expense, bill and asset stores.

- Expense form: optional merchant, bank/wallet and comma-separated tags; existing payment methods are unchanged.
- Expense Manager: search new fields, filter by bank/wallet, and export bank/brand/tags to CSV.
- Monthly Bills: optionally record payment provider/bank and recurring merchant.
- Savings & Investments: optionally record institution and an investment subtype.
- Suggested names are just labels, not bank connections. Never enter account numbers or credentials.
- Deleting a preference is blocked while it is used in existing records, to avoid losing track of saved labels.
- Frontend/localStorage only; the Flask API can later store profile settings independently.

**This is an academic finance-management prototype, not a live banking or brokerage service.**


## V11.2 — Reset everything to zero

The left-sidebar reset action now **clears** (rather than restores) all stored finance records after a confirmation: expenses, bills, assets, transfers, purchases, monthly budget, and user-added preferences. It keeps the default option lists so forms can still be used. The empty arrays and a zero budget are saved to browser localStorage; refreshing the page will not recreate the sample transactions. New users still see sample records on their first load unless they reset.
