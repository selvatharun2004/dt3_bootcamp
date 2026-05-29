import AppShell from "../../ui/layout/AppShell";
import Card from "../../ui/primitives/Card";
import Segmented from "../../ui/primitives/Segmented";
import Button from "../../ui/primitives/Button";
import { useEffect, useMemo, useRef, useState } from "react";
import StatPill from "../../ui/primitives/StatPill";
import Divider from "../../ui/primitives/Divider";
import { api, ApiError, type AnomalyItem, type KpiItem, type Period } from "../../api/client";

type UiPeriod = "Daily" | "Weekly" | "Monthly";

function uiToApiPeriod(p: UiPeriod): Period {
  switch (p) {
    case "Daily":
      return "daily";
    case "Weekly":
      return "weekly";
    case "Monthly":
      return "monthly";
  }
}

function formatPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

export default function ConsumerDashboardPage() {
  const [period, setPeriod] = useState<UiPeriod>("Weekly");
  const apiPeriod = useMemo(() => uiToApiPeriod(period), [period]);

  // Demo/default site. Next step: site selector + persist selection.
  const siteId = "site_main";

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [kpis, setKpis] = useState<KpiItem[]>([
    // Initial placeholder until fetch completes.
    { label: "Selected site", value: "…" },
    { label: "Baseline deviation", value: "…" },
    { label: "Anomalies (30d)", value: "…" },
    { label: "Benchmark vs peers", value: "…" }
  ]);

  const [anomalies, setAnomalies] = useState<AnomalyItem[]>([]);
  const [thresholdPct] = useState<number>(20);

  const [loading, setLoading] = useState<{ analytics: boolean; anomalies: boolean; upload: boolean; export: boolean }>({
    analytics: false,
    anomalies: false,
    upload: false,
    export: false
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadSummary, setUploadSummary] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();

    async function load() {
      setErrorMsg(null);
      setLoading((s) => ({ ...s, analytics: true, anomalies: true }));
      try {
        const [analyticsRes, anomaliesRes] = await Promise.all([
          api.consumerAnalytics({ siteId, period: apiPeriod, thresholdPct }),
          api.consumerAnomalies({ siteId, thresholdPct })
        ]);

        setKpis(analyticsRes.kpis);
        setAnomalies(anomaliesRes.items);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "Failed to load dashboard data.";
        setErrorMsg(msg);
      } finally {
        setLoading((s) => ({ ...s, analytics: false, anomalies: false }));
      }
    }

    void load();

    return () => ctrl.abort();
  }, [apiPeriod, siteId, thresholdPct]);

  async function handleChooseFileClick() {
    setUploadSummary(null);
    setErrorMsg(null);
    fileInputRef.current?.click();
  }

  async function handleFileSelected(file: File | null) {
    if (!file) return;

    setUploadSummary(null);
    setErrorMsg(null);
    setLoading((s) => ({ ...s, upload: true }));

    try {
      const res = await api.ingestCsv({ siteId, file });
      const summary = `Upload ${res.upload_id}: accepted ${res.rows_accepted}/${res.rows_received} rows (${res.rows_rejected} rejected).`;
      const sampleErrors = res.errors?.length ? ` Sample errors: ${res.errors.slice(0, 3).join(" · ")}` : "";
      setUploadSummary(summary + sampleErrors);

      // Reload analytics/anomalies after ingest (still demo backend, but keeps wiring correct).
      const [analyticsRes, anomaliesRes] = await Promise.all([
        api.consumerAnalytics({ siteId, period: apiPeriod, thresholdPct }),
        api.consumerAnomalies({ siteId, thresholdPct })
      ]);
      setKpis(analyticsRes.kpis);
      setAnomalies(anomaliesRes.items);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Upload failed.";
      setErrorMsg(msg);
    } finally {
      setLoading((s) => ({ ...s, upload: false }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleExport(format: "csv" | "pdf") {
    setErrorMsg(null);
    setLoading((s) => ({ ...s, export: true }));
    try {
      // Export for last 30 days (simple wiring). Next step: date range picker.
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 30);

      const toYmd = (d: Date) => d.toISOString().slice(0, 10);

      const job = await api.createExport({
        site_id: siteId,
        start_date: toYmd(start),
        end_date: toYmd(end),
        format
      });

      // Backend returns a relative download_url under the API prefix.
      window.open(`${api.getApiBaseUrl()}${job.download_url}`, "_blank", "noopener,noreferrer");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Export failed.";
      setErrorMsg(msg);
    } finally {
      setLoading((s) => ({ ...s, export: false }));
    }
  }

  return (
    <AppShell
      header={{
        title: "Consumer Dashboard",
        subtitle: "Trends, baseline vs actual, anomalies, and benchmarking for your site.",
        right: (
          <div className="row gap">
            <Button
              variant="secondary"
              onClick={() => void handleExport("csv")}
              disabled={loading.export}
              title={`Backend: ${api.getApiBaseUrl()}`}
            >
              Export CSV
            </Button>
            <Button onClick={() => void handleExport("pdf")} disabled={loading.export} title={`Backend: ${api.getApiBaseUrl()}`}>
              Export PDF
            </Button>
          </div>
        )
      }}
      nav={{
        active: "consumer"
      }}
    >
      {errorMsg ? (
        <Card title="Error" subtitle="Could not load data from the backend API.">
          <div className="stack">
            <p className="bad">{errorMsg}</p>
            <p className="muted">
              Check <span className="code">VITE_API_BASE_URL</span> and that the backend is running with CORS allowing this origin.
            </p>
            <p className="muted">
              Current base URL: <span className="code">{api.getApiBaseUrl()}</span>
            </p>
          </div>
        </Card>
      ) : null}

      <div className="row wrap gap">
        {kpis.map((k) => (
          <StatPill key={k.label} label={k.label} value={k.value} tone={(k.tone ?? undefined) as any} />
        ))}
      </div>

      <Card
        title="Upload meter readings (CSV)"
        subtitle="Upload a meter-reading file with timestamp and kWh readings."
        right={
          <div className="row gap">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              style={{ display: "none" }}
              onChange={(e) => void handleFileSelected(e.target.files?.[0] ?? null)}
            />
            <Button variant="secondary" onClick={() => void handleChooseFileClick()} disabled={loading.upload}>
              {loading.upload ? "Uploading…" : "Choose file"}
            </Button>
          </div>
        }
      >
        <div className="stack">
          <p className="muted">
            This UI sends the file to the backend ingestion endpoint and shows a basic validation summary.
          </p>

          {uploadSummary ? (
            <p className="muted">
              <span className="label">Last upload:</span> {uploadSummary}
            </p>
          ) : null}

          <Divider />
          <div className="grid cols-2">
            <div>
              <div className="label">Expected columns</div>
              <div className="code">timestamp, kWh</div>
            </div>
            <div>
              <div className="label">Example timestamp</div>
              <div className="code">2026-05-01T00:00:00Z</div>
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Consumption trends"
        subtitle="Switch time periods to view consumption patterns."
        right={
          <Segmented value={period} options={["Daily", "Weekly", "Monthly"]} onChange={(v) => setPeriod(v as UiPeriod)} />
        }
      >
        <div className="chartPlaceholder">
          <div className="chartPlaceholder__title">{period} chart placeholder</div>
          <div className="chartPlaceholder__subtitle">
            {loading.analytics ? "Loading…" : "Backend wired: /api/v1/consumer/analytics (demo series)."}
          </div>
        </div>
      </Card>

      <div className="grid cols-2">
        <Card title="Baseline vs actual" subtitle="Rolling 4-week average baseline alongside actual consumption.">
          <div className="chartPlaceholder">
            <div className="chartPlaceholder__title">Baseline vs actual placeholder</div>
            <div className="chartPlaceholder__subtitle">
              Backend wired (threshold {thresholdPct}%); next step: render the series as a chart.
            </div>
          </div>
        </Card>

        <Card
          title="Anomalies"
          subtitle="Flagged days with deviation details."
          right={<Button variant="ghost" disabled={loading.anomalies}>View all</Button>}
        >
          <div className="stack">
            <div className="table">
              <div className="table__row table__head">
                <div>Date</div>
                <div>Deviation</div>
                <div>Suggested action</div>
              </div>

              {anomalies.length ? (
                anomalies.slice(0, 6).map((a) => (
                  <div className="table__row" key={`${a.date}-${a.suggested_action}`}>
                    <div>{a.date}</div>
                    <div className={a.severity === "high" ? "bad" : "warn"}>{formatPct(a.deviation_pct)}</div>
                    <div>{a.suggested_action}</div>
                  </div>
                ))
              ) : (
                <div className="table__row">
                  <div className="muted">{loading.anomalies ? "Loading…" : "No anomalies returned."}</div>
                  <div />
                  <div />
                </div>
              )}
            </div>

            <p className="muted">
              Data source: <span className="code">GET /api/v1/consumer/anomalies</span>
            </p>
          </div>
        </Card>
      </div>

      <Card title="Peer benchmarking" subtitle="Compare your consumption to an anonymised category average (when available).">
        <div className="chartPlaceholder">
          <div className="chartPlaceholder__title">Benchmark chart placeholder</div>
          <div className="chartPlaceholder__subtitle">
            Backend wired: <span className="code">GET /api/v1/consumer/benchmark</span> (demo series). Next step: render chart.
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
