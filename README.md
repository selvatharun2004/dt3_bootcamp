# dt3_bootcamp (React Web App)

Simple, elegant React UI scaffold for the **Commercial Energy Consumption Analytics & Anomaly Alerts** system.

## Backend API base URL (config)

This app calls the FastAPI backend using a configurable base URL:

- Env var: `VITE_API_BASE_URL`
- Default: `http://localhost:8000`

Example:

```bash
export VITE_API_BASE_URL="http://localhost:8000"
npm run dev
```

## What’s included

- Role landing page
- **Consumer Dashboard**
  - CSV upload panel (UI placeholder)
  - Period switching (daily/weekly/monthly)
  - Baseline vs actual placeholder panel
  - Anomaly list placeholder
  - Peer benchmarking placeholder
  - Export buttons (UI placeholder)
- **Account Manager Dashboard**
  - Portfolio ranking placeholder
  - Alerts review placeholder
  - Drill-down placeholder
  - Export buttons (UI placeholder)

> Data shown is placeholder until backend endpoints are wired.

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:5173`.

### Run with backend locally

1) Start backend (default localhost:8000)
2) Start this app (localhost:5173) and ensure the backend allows CORS for `http://localhost:5173`.

## Routes

- `/` Landing
- `/consumer` Consumer dashboard
- `/account-manager` Account Manager dashboard
