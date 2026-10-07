Create a production-grade React + TypeScript frontend application using Vite for our internal cloud kitchen operations and supply chain management system. 

Please read and adhere to the project rules defined in the root AGENTS.md file.

The application serves operations executives and handles these core modules:
1. Internal customer order capture & management.
2. Customer address input and map/geolocation coordinate capture.
3. Kitchen Order Ticket (KOT) and preparation tracking boards.
4. Packing material indents and kitchen requirement views.
5. Dispatch details tracking (delivery partner assignment, handover logs).
6. Billing system reconciliation dashboard (viewing discrepancies/variances against external billing data).
7. Purchase order and incoming stock management.
8. Recipe viewer and management.

Tech Stack Requirements:
- Vite, React, TypeScript, and Tailwind CSS.
- React Router v6 for routing.
- TanStack Query (React Query) for server-state and caching.
- Zustand for lightweight local state.
- Lucide React for UI icons.
- A robust custom SSE hook (`useSSE`) with auto-reconnection logic to handle real-time backend updates.
- Axios API client configured with environment base URLs and auth token interceptors.

Please generate:
- The complete directory tree matching the domain-driven structure (src/domains/orders, src/domains/kitchen, src/domains/inventory, src/domains/dispatch, src/domains/reconciliation, src/api, src/hooks, src/store, src/types).
- Configuration files (package.json, tsconfig.json, vite.config.ts, Tailwind setup).
- Base API client, the robust `useSSE` hook implementation, and boilerplate layout components to kick off development brick-by-brick.
