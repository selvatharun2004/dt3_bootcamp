import { useEffect, useMemo, useState } from "react";
import AppShell from "../../ui/layout/AppShell";
import Card from "../../ui/primitives/Card";
import Button from "../../ui/primitives/Button";
import StatPill from "../../ui/primitives/StatPill";
import Divider from "../../ui/primitives/Divider";
import { api, ApiError, type AlertItem, type PortfolioRankItem } from "../../api/client";

function formatPct(v: number): string {
  const sign = v >= 0 ? "+" : "";
  return `${sign}${v.toFixed(0)}%`;
}

export default function AccountManagerDashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioRankItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<{ portfolio: boolean; alerts: boolean; export: boolean }>({
    portfolio: false,
    alerts: false,
    export: false
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setErrorMsg(null);
      setLoading((s) => ({ ...s, portfolio: true, alerts: true }));
      try {
        const [p, a] = await Promise.all([api.accountManagerPortfolio(), api.accountManagerAlerts()]);
        if (cancelled) return;
        setPortfolio(p.items);
        setAlerts(a.items);
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "Failed to load account manager data.";
        if (!cancelled) setErrorMsg(msg);
      } finally {
        if (!cancelled) setLoading((s) => ({ ...s, portfolio: false, alerts: false }));
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const kpis = useMemo(() => {
    const customers = new Set(portfolio.map((p) => p.customer)).size;
    const alerts7d = alerts.length;
    const highSeverity = alerts.filter((a) => a.severity === "high").length;
    const medianDeviation = (() => {
      if (!alerts.length) return null;
      const sorted = [...alerts].map((a) => a.deviation_pct).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      const med = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      return med;
    })();

    return {
      customers: customers ? String(customers) : loading.portfolio ? "…" : "0",
      alerts7d: alerts7d ? String(alerts7d) : loading.alerts ? "…" : "0",
      highSeverity: highSeverity ? String(highSeverity) : loading.alerts ? "…" : "0",
      medianDeviation: medianDeviation != null ? formatPct(medianDeviation) : loading.alerts ? "…" : "+0%"
    };
  }, [alerts, loading.alerts, loading.portfolio, portfolio]);

  async function handleExport(format: "csv" | "pdf") {
    setErrorMsg(null);
    setLoading((s) => ({ ...s, export: true }));
    try {
      // For account manager export, we still export by a chosen site.
      // Placeholder: export site_main. Next step: pick customer/site and range.
      const siteId = "site_main";
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
        title: "Account Manager Dashboard",
        subtitle: "Portfolio overview, ranked anomalies, and alert review.",
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
        active: "account-manager"
      }}
    >
      {errorMsg ? (
        <Card title="Error" subtitle="Could not load data from the backend API.">
          <div className="stack">
            <p className="bad">{errorMsg}</p>
            <p className="muted">
              Current base URL: <span className="code">{api.getApiBaseUrl()}</span>
            </p>
          </div>
        </Card>
      ) : null}

      <div className="row wrap gap">
        <StatPill label="Customers" value={kpis.customers} />
        <StatPill label="Alerts (7d)" value={kpis.alerts7d} />
        <StatPill label="High severity" value={kpis.highSeverity} tone="danger" />
        <StatPill label="Median deviation" value={kpis.medianDeviation} />
      </div>

      <div className="grid cols-2">
        <Card
          title="Portfolio ranking"
          subtitle="Rank customers by anomaly count and deviation severity."
          right={<Button variant="ghost" disabled={loading.portfolio}>Filters</Button>}
        >
          <div className="stack">
            <div className="table">
              <div className="table__row table__head">
                <div>Customer</div>
                <div>Site</div>
                <div>Anomalies (30d)</div>
                <div>Max deviation</div>
              </div>

              {portfolio.length ? (
                portfolio.slice(0, 10).map((p) => (
                  <div className="table__row" key={`${p.customer}-${p.site}`}>
                    <div>{p.customer}</div>
                    <div>{p.site}</div>
                    <div>{p.anomalies_30d}</div>
                    <div className={p.max_deviation_pct >= 30 ? "bad" : "warn"}>{formatPct(p.max_deviation_pct)}</div>
                  </div>
                ))
              ) : (
                <div className="table__row">
                  <div className="muted">{loading.portfolio ? "Loading…" : "No portfolio rows returned."}</div>
                  <div />
                  <div />
                  <div />
                </div>
              )}
            </div>

            <Divider />
            <p className="muted">
              Data source: <span className="code">GET /api/v1/account-manager/portfolio</span>
            </p>
          </div>
        </Card>

        <Card
          title="Alerts"
          subtitle="Review alerts and suggested actions."
          right={<Button variant="secondary" disabled={loading.alerts}>View queue</Button>}
        >
          <div className="stack">
            <div className="table">
              <div className="table__row table__head">
                <div>Date</div>
                <div>Customer / site</div>
                <div>Deviation</div>
                <div>Suggested action</div>
              </div>

              {alerts.length ? (
                alerts.slice(0, 10).map((a) => (
                  <div className="table__row" key={a.alert_id}>
                    <div>{a.created_at}</div>
                    <div>
                      {a.customer} · {a.site}
                    </div>
                    <div className={a.severity === "high" ? "bad" : "warn"}>{formatPct(a.deviation_pct)}</div>
                    <div>{a.suggested_action}</div>
                  </div>
                ))
              ) : (
                <div className="table__row">
                  <div className="muted">{loading.alerts ? "Loading…" : "No alerts returned."}</div>
                  <div />
                  <div />
                  <div />
                </div>
              )}
            </div>

            <p className="muted">
              Data source: <span className="code">GET /api/v1/account-manager/alerts</span> (status lifecycle placeholder).
            </p>
          </div>
        </Card>
      </div>

      <Card
        title="Consumption drill-down (per customer)"
        subtitle="Select a customer to view baseline vs actual and anomalies."
        right={<Button variant="secondary">Select customer</Button>}
      >
        <div className="chartPlaceholder">
          <div className="chartPlaceholder__title">Customer drill-down placeholder</div>
          <div className="chartPlaceholder__subtitle">
            Next step: choose a customer/site and reuse consumer analytics endpoints with that site_id.
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
