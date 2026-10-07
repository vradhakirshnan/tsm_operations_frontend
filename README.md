# TSM Cloud Kitchen Operations & SCM Frontend

A production-grade React + TypeScript application built with Vite and Tailwind CSS for cloud kitchen operations executives, inventory managers, and dispatch dispatchers.

---

## 🏗️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/) (Strict mode enabled)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with high-contrast kitchen operations theme
- **Routing:** [React Router v6](https://reactrouter.com/) (Domain-based routing shell)
- **Server State & Caching:** [TanStack Query v5](https://tanstack.com/query)
- **Client State:** [Zustand](https://github.com/pmndrs/zustand) (Auth, station selection, UI notifications, SSE alert queue)
- **Real-Time Streaming:** Custom `useSSE` hook with auto-reconnection, exponential backoff, and heartbeat watchdog
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/) with JWT authorization interceptors and offline mock fallbacks

---

## 📂 Domain-Driven Architecture

```
frontend/
├── src/
│   ├── api/                           # API Layer
│   │   ├── client.ts                  # Axios instance with auth & error interceptors
│   │   ├── endpoints.ts               # FastAPI backend endpoint constants
│   │   ├── mockData.ts                # Cloud kitchen seed dataset
│   │   ├── customerApi.ts             # Customer & address service
│   │   ├── catalogApi.ts              # Items, menus, BOM recipes & packaging
│   │   ├── ordersApi.ts               # Customer order intake & lifecycle service
│   │   ├── kitchenApi.ts              # Indents, KOT tickets, prepared receipts & packing quota
│   │   ├── inventoryApi.ts            # Stock, GRN receipts, kitchen/packing issues & write-offs
│   │   ├── dispatchApi.ts             # Delivery partner assignment & OTP handover logs
│   │   └── reconciliationApi.ts       # External vs internal billing variance audit
│   ├── components/
│   │   ├── common/                    # Core UI primitives
│   │   │   ├── Badge.tsx              # Status pill badge
│   │   │   ├── Button.tsx             # Action buttons with variants & loading state
│   │   │   ├── Card.tsx               # Content card container
│   │   │   ├── MapPicker.tsx          # Geolocation pin picker with GPS nudge controls
│   │   │   ├── Modal.tsx              # Accessible dialog modal
│   │   │   ├── StatCard.tsx           # KPI metric card with trends
│   │   │   ├── Tabs.tsx               # Segmented view switchers
│   │   │   └── ToastContainer.tsx     # Floating operational alerts
│   │   └── layout/
│   │       ├── AppLayout.tsx          # Main application shell with SSE lifecycle
│   │       ├── Header.tsx             # Station selector & SSE indicator
│   │       ├── Sidebar.tsx            # Navigation rail with live counters
│   │       └── SSEStatusIndicator.tsx # Pulse badge showing SSE connection state
│   ├── domains/
│   │   ├── overview/                  # Operations Command Center
│   │   │   └── OperationsOverview.tsx # Real-time executive KPI dashboard
│   │   ├── customer/                  # Module 1: Customer & Demographics
│   │   │   ├── CustomerManagementPage.tsx
│   │   │   ├── CustomerList.tsx
│   │   │   ├── CustomerFormModal.tsx
│   │   │   └── AddressMapCaptureModal.tsx
│   │   ├── menu/                      # Module 2: Menu, Recipe & Packaging BOM
│   │   │   ├── MenuManagementPage.tsx
│   │   │   ├── ItemMasterView.tsx
│   │   │   ├── MenuMasterView.tsx
│   │   │   └── RecipePackagingView.tsx
│   │   ├── orders/                    # Module 3: Customer Order Capture & Management
│   │   │   ├── OrderManagementPage.tsx
│   │   │   ├── OrderEntryForm.tsx
│   │   │   ├── OrderListView.tsx
│   │   │   └── OrderDetailDrawer.tsx
│   │   ├── kitchen/                   # Module 4: Indent Consolidation & Prep Tracking
│   │   │   ├── KitchenDashboardPage.tsx
│   │   │   ├── PrepBoardView.tsx      # KOT Kanban across Curry, Tandoor & Biryani pods
│   │   │   ├── KitchenIndentView.tsx  # Order consolidation & batch requirement BOM
│   │   │   ├── PreparedReceiptView.tsx# HACCP core temp verification & kitchen handover
│   │   │   └── PackingIndentView.tsx  # Container quota calculation from active orders
│   │   ├── inventory/                 # Module 5: Inventory & Supply Chain
│   │   │   ├── InventoryManagementPage.tsx
│   │   │   ├── StockOverviewView.tsx  # Stock levels & low-stock warning thresholds
│   │   │   ├── PurchaseReceiptsView.tsx# Inward GRN from POs with batch & expiry
│   │   │   ├── KitchenIssuesView.tsx  # Raw ingredients issue to kitchen stations
│   │   │   ├── PackingIssuesView.tsx  # Packaging supplies issue to packing tables
│   │   │   └── ExpiryWriteOffView.tsx # Wastage, spoilage & damaged write-off ledger
│   │   ├── dispatch/                  # Module 6: Dispatch & Handover Tracking
│   │   │   ├── DispatchManagementPage.tsx
│   │   │   ├── PartnerAssignmentView.tsx # Swiggy / Zomato / Fleet rider allocation
│   │   │   └── HandoverLogView.tsx    # Tamper seal & OTP verification logs
│   │   └── reconciliation/            # Module 7: Billing System Reconciliation
│   │       ├── ReconciliationPage.tsx
│   │       ├── VarianceReportView.tsx # Commission mismatches, tax rounding, disputes
│   │       └── ExternalSyncModal.tsx  # Upload aggregator settlement statement
│   ├── hooks/
│   │   ├── useSSE.ts                  # Resilient Server-Sent Events hook
│   │   └── useDebounce.ts             # Instant search filter debounce
│   ├── store/
│   │   ├── authStore.ts               # Executive profile & active kitchen pod
│   │   ├── kitchenStore.ts            # Live SSE alerts queue
│   │   └── uiStore.ts                 # Toasts & navigation collapse
│   └── types/                         # Central TypeScript schemas
│       ├── catalog.ts
│       ├── customer.ts
│       ├── dispatch.ts
│       ├── events.ts
│       ├── index.ts
│       ├── inventory.ts
│       ├── kitchen.ts
│       ├── order.ts
│       └── reconciliation.ts
├── .env                               # Environment configurations
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The application runs on `http://localhost:3000`.

### 3. Build for Production
```bash
npm run build
```

### 4. Run TypeScript Check
```bash
npm run lint
```

---

## 📡 Robust Real-Time SSE Integration (`useSSE`)

The application features a custom `useSSE` hook (`src/hooks/useSSE.ts`) tailored for cloud kitchen displays and operations monitoring:

- **Automatic Reconnection:** Employs exponential backoff with random jitter to gracefully reconnect when network interrupts.
- **Heartbeat Watchdog:** Detects quiet connection drops (default 45s timeout) and resets the socket proactively.
- **Multi-Event Subscriptions:** Listens to backend FastAPI SSE events:
  - `ORDER_CREATED`: Auto-invalidates query caches and updates active order counters.
  - `ORDER_STATUS_CHANGED`: Updates KOT status on kitchen boards.
  - `KITCHEN_ALERT`: Emits urgent audio/visual alerts to operations supervisors.
  - `HEARTBEAT`: Keeps the connection verified and pinged.
- **Resilient Fallback Mode:** In offline demo mode without a running backend, automatically simulates operational pulses so UI remains testable.
