# 💸 Friend Expense Tracker

A full-stack SaaS app for tracking shared expenses with friends. Built with **Next.js 14 (App Router)**, **Supabase**, **Tailwind CSS**, and **Recharts**.

---

## ✨ Features

- 🔐 **Auth** — Email/password signup & login via Supabase Auth
- 👤 **Profiles** — Auto-created on signup, editable name/email
- 👥 **Groups** — Create groups, add members by email
- 💳 **Transactions** — Lend/borrow money with notes inside groups
- ♻️ **Repayments** — Record partial or full repayments, auto-status update
- 📊 **Dashboard** — Total owed, total lent, net balance, per-friend balances
- 📈 **Charts** — Area chart (spending trends), Bar chart, Pie chart (status)
- 📅 **Calendar** — View transactions by date with monthly summaries
- 🔒 **RLS** — Row-level security on all tables

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone <repo-url>
cd friend-expense-tracker
npm install
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run `supabase-setup.sql` (included in this repo)
3. Copy your project URL and anon key from **Settings > API**

### 3. Environment Variables

```bash
cp .env.local.example .env.local
```

Fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🗂 Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/page.tsx         # Login page
│   │   └── signup/page.tsx        # Signup page
│   ├── dashboard/
│   │   ├── layout.tsx             # Dashboard layout (sidebar + topbar)
│   │   ├── page.tsx               # Overview stats + charts
│   │   ├── loading.tsx            # Loading skeleton
│   │   └── error.tsx              # Error boundary
│   ├── groups/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Groups list
│   │   └── [id]/page.tsx          # Group detail + transactions
│   ├── transactions/
│   │   ├── layout.tsx
│   │   └── page.tsx               # All transactions with filters
│   ├── calendar/
│   │   ├── layout.tsx
│   │   └── page.tsx               # Calendar view
│   └── api/
│       ├── groups/route.ts        # REST: GET/POST groups
│       ├── transactions/route.ts  # REST: GET/POST transactions
│       └── repayments/route.ts    # REST: POST repayments
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx            # Navigation sidebar
│   │   └── TopBar.tsx             # Top header bar
│   ├── dashboard/
│   │   ├── StatCards.tsx          # Summary stat cards
│   │   ├── FriendBalances.tsx     # Per-friend balance list
│   │   └── RecentTransactions.tsx # Latest transaction feed
│   ├── groups/
│   │   ├── CreateGroupModal.tsx   # Create group dialog
│   │   ├── GroupList.tsx          # Group cards grid
│   │   └── GroupTransactions.tsx  # Transactions in a group
│   ├── transactions/
│   │   ├── AddTransactionModal.tsx # Add transaction dialog
│   │   ├── RepaymentModal.tsx      # Record repayment dialog
│   │   └── TransactionTable.tsx   # Filterable transaction table
│   ├── charts/
│   │   ├── SpendingChart.tsx       # Area chart (7-day trend)
│   │   ├── GroupBarChart.tsx       # Bar chart (per-group)
│   │   └── StatusPieChart.tsx      # Pie chart (status split)
│   ├── calendar/
│   │   └── CalendarView.tsx        # Interactive calendar
│   └── ui/
│       └── LoadingSkeleton.tsx     # Reusable skeleton loaders
├── hooks/
│   ├── useTransactions.ts          # Real-time transactions hook
│   └── useGroups.ts                # Groups data hook
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Browser Supabase client
│   │   └── server.ts               # Server Supabase client
│   └── utils.ts                    # cn, formatCurrency, etc.
├── types/
│   └── index.ts                    # TypeScript types
└── middleware.ts                   # Auth route protection
```

---

## 🗄 Database Schema

```sql
profiles        — id, name, email, created_at
groups          — id, name, created_by, created_at
group_members   — id, group_id, user_id
transactions    — id, group_id, from_user, to_user, amount, remaining_amount, note, status, created_at
repayments      — id, transaction_id, amount_paid, created_at
```

All tables have **Row Level Security** enabled. See `supabase-setup.sql` for full policy definitions.

---

## 🔌 API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | List user's groups |
| POST | `/api/groups` | Create a group |
| GET | `/api/transactions` | List user's transactions |
| POST | `/api/transactions` | Create a transaction |
| POST | `/api/repayments` | Record a repayment |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Database + Auth | Supabase (PostgreSQL + GoTrue) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Lucide React |
| Date utils | date-fns |
| Language | TypeScript |

---

## 🔑 Key Patterns

- **Server Components** for data fetching (dashboard, groups, transactions, calendar pages)
- **Client Components** for interactivity (modals, forms, filters, charts)
- **Supabase SSR** client for server-side auth and queries
- **Middleware** for protecting all dashboard routes
- **Real-time** subscriptions via `useTransactions` hook (Supabase Realtime)

---

## 📄 License

MIT
