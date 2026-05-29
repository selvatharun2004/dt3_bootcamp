const DEFAULT_API_BASE_URL = "http://localhost:8000";

/**
 * Returns the backend API base URL.
 *
 * Uses Vite env var `VITE_API_BASE_URL` when provided, else defaults to localhost.
 */
function getApiBaseUrl(): string {
  const raw = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? DEFAULT_API_BASE_URL;
  return raw.replace(/\/+$/, "");
}

export type ApiErrorPayload = {
  detail?: string;
  title?: string;
  status?: number;
};

export class ApiError extends Error {
  status: number;
  payload?: ApiErrorPayload;

  constructor(message: string, status: number, payload?: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type Json = Record<string, unknown> | unknown[] | string | number | boolean | null;

/**
 * Fetch wrapper that:
 * - prefixes with API base URL
 * - throws a typed ApiError on non-2xx responses
 * - parses JSON responses
 */
async function apiFetch<TResponse extends Json>(
  path: string,
  init?: RequestInit & { signal?: AbortSignal }
): Promise<TResponse> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      // If we're sending FormData, do NOT set Content-Type; browser sets boundary.
      ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" })
    }
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    let payload: ApiErrorPayload | undefined;
    try {
      payload = contentType.includes("application/json")
        ? ((await res.json()) as ApiErrorPayload)
        : { detail: await res.text() };
    } catch {
      payload = undefined;
    }

    const msg =
      payload?.detail ||
      payload?.title ||
      `Request failed with status ${res.status}`;

    throw new ApiError(msg, res.status, payload);
  }

  // Some endpoints could return an empty body; handle gracefully.
  if (res.status === 204) return null as TResponse;

  if (contentType.includes("application/json")) {
    return (await res.json()) as TResponse;
  }

  // Fallback to text if not JSON.
  return (await res.text()) as unknown as TResponse;
}

export type Period = "daily" | "weekly" | "monthly";

export type KpiItem = { label: string; value: string; tone?: "default" | "danger" | null };
export type TimeseriesPoint = { ts: string; kwh: number };
export type BaselinePoint = {
  ts: string;
  actual_kwh: number;
  baseline_kwh: number;
  deviation_pct: number;
  is_anomaly: boolean;
};

export type AnalyticsResponse = {
  site_id: string;
  site_name: string;
  period: Period;
  kpis: KpiItem[];
  trends: TimeseriesPoint[];
  baseline_vs_actual: BaselinePoint[];
  threshold_pct: number;
};

export type AnomalyItem = {
  date: string;
  deviation_pct: number;
  suggested_action: string;
  severity: "medium" | "high";
};

export type AnomaliesResponse = {
  site_id: string;
  threshold_pct: number;
  items: AnomalyItem[];
};

export type BenchmarkSeriesPoint = { ts: string; site_kwh: number; peer_avg_kwh: number };
export type BenchmarkResponse = {
  site_id: string;
  category: string;
  period: Period;
  series: BenchmarkSeriesPoint[];
};

export type PortfolioRankItem = {
  customer: string;
  site: string;
  anomalies_30d: number;
  max_deviation_pct: number;
};

export type PortfolioResponse = { items: PortfolioRankItem[] };

export type AlertItem = {
  alert_id: string;
  created_at: string;
  customer: string;
  site: string;
  deviation_pct: number;
  suggested_action: string;
  severity: "medium" | "high";
  status: "open" | "acknowledged" | "resolved";
};

export type AlertsListResponse = { items: AlertItem[] };

export type IngestSummary = {
  upload_id: string;
  site_id: string;
  rows_received: number;
  rows_accepted: number;
  rows_rejected: number;
  errors: string[];
};

export type ExportFormat = "csv" | "pdf";
export type ExportRequest = {
  site_id: string;
  start_date: string; // YYYY-MM-DD
  end_date: string; // YYYY-MM-DD
  format: ExportFormat;
};
export type ExportJobResponse = {
  job_id: string;
  status: "complete";
  download_url: string;
};

export const api = {
  getApiBaseUrl,

  // Consumer
  consumerAnalytics: (params: { siteId: string; period: Period; thresholdPct?: number }) => {
    const qs = new URLSearchParams({
      site_id: params.siteId,
      period: params.period,
      ...(params.thresholdPct != null ? { threshold_pct: String(params.thresholdPct) } : {})
    });
    return apiFetch<AnalyticsResponse>(`/api/v1/consumer/analytics?${qs.toString()}`);
  },

  consumerAnomalies: (params: { siteId: string; thresholdPct?: number }) => {
    const qs = new URLSearchParams({
      site_id: params.siteId,
      ...(params.thresholdPct != null ? { threshold_pct: String(params.thresholdPct) } : {})
    });
    return apiFetch<AnomaliesResponse>(`/api/v1/consumer/anomalies?${qs.toString()}`);
  },

  consumerBenchmark: (params: { siteId: string; period: Period }) => {
    const qs = new URLSearchParams({
      site_id: params.siteId,
      period: params.period
    });
    return apiFetch<BenchmarkResponse>(`/api/v1/consumer/benchmark?${qs.toString()}`);
  },

  // Ingestion
  ingestCsv: async (params: { siteId: string; file: File }) => {
    const form = new FormData();
    form.append("file", params.file);

    const qs = new URLSearchParams({ site_id: params.siteId });
    return apiFetch<IngestSummary>(`/api/v1/ingest/csv?${qs.toString()}`, {
      method: "POST",
      body: form
    });
  },

  // Account manager
  accountManagerPortfolio: () => apiFetch<PortfolioResponse>(`/api/v1/account-manager/portfolio`),

  accountManagerAlerts: (params?: { status?: "open" | "acknowledged" | "resolved" }) => {
    const qs = new URLSearchParams();
    if (params?.status) qs.set("status", params.status);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return apiFetch<AlertsListResponse>(`/api/v1/account-manager/alerts${suffix}`);
  },

  // Exports
  createExport: (req: ExportRequest) =>
    apiFetch<ExportJobResponse>(`/api/v1/exports`, {
      method: "POST",
      body: JSON.stringify(req)
    })
};
