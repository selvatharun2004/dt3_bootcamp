import AppShell from "../../ui/layout/AppShell";
import Card from "../../ui/primitives/Card";
import Segmented from "../../ui/primitives/Segmented";
import Button from "../../ui/primitives/Button";
import { useMemo, useState } from "react";
import StatPill from "../../ui/primitives/StatPill";
import Divider from "../../ui/primitives/Divider";

type Period = "Daily" | "Weekly" | "Monthly";

export default function ConsumerDashboardPage() {
  const [period, setPeriod] = useState<Period>("Weekly");

  // Placeholder values until backend integration is implemented.
  const kpis = useMemo(
    () => [
      { label: "Selected site", value: "Main Warehouse" },
      { label: "Baseline deviation", value: "+14.2%" },
      { label: "Anomalies (30d)", value: "3" },
      { label: "Benchmark vs peers", value: "-6.1%" }
    ],
    []
  );

  return (
    <AppShell
      header={{
        title: "Consumer Dashboard",
        subtitle: "Trends, baseline vs actual, anomalies, and benchmarking for your site.",
        right: (
          <div className="row gap">
            <Button variant="secondary">Export CSV</Button>
            <Button>Export PDF</Button>
          </div>
        )
      }}
      nav={{
        active: "consumer"
      }}
    >
      <div className="row wrap gap">
        {kpis.map((k) => (
          <StatPill key={k.label} label={k.label} value={k.value} />
        ))}
      </div>

      <Card
        title="Upload meter readings (CSV)"
        subtitle="Upload a meter-reading file with timestamp and kWh readings."
        right={<Button variant="secondary">Choose file</Button>}
      >
        <div className="stack">
          <p className="muted">
            CSV ingestion and validation will be handled by the backend. This UI will send the file and show parsing
            results (rows accepted/rejected).
          </p>
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
          <Segmented
            value={period}
            options={["Daily", "Weekly", "Monthly"]}
            onChange={(v) => setPeriod(v as Period)}
          />
        }
      >
        <div className="chartPlaceholder">
          <div className="chartPlaceholder__title">{period} chart placeholder</div>
          <div className="chartPlaceholder__subtitle">Will render time-series chart from backend analytics.</div>
        </div>
      </Card>

      <div className="grid cols-2">
        <Card
          title="Baseline vs actual"
          subtitle="Rolling 4-week average baseline alongside actual consumption."
        >
          <div className="chartPlaceholder">
            <div className="chartPlaceholder__title">Baseline vs actual placeholder</div>
            <div className="chartPlaceholder__subtitle">
              Highlights days exceeding baseline by threshold (default 20%).
            </div>
          </div>
        </Card>

        <Card
          title="Anomalies"
          subtitle="Flagged days with deviation details."
          right={<Button variant="ghost">View all</Button>}
        >
          <div className="stack">
            <div className="table">
              <div className="table__row table__head">
                <div>Date</div>
                <div>Deviation</div>
                <div>Suggested action</div>
              </div>
              <div className="table__row">
                <div>2026-05-18</div>
                <div className="bad">+28%</div>
                <div>Check HVAC scheduling</div>
              </div>
              <div className="table__row">
                <div>2026-05-22</div>
                <div className="bad">+24%</div>
                <div>Inspect overnight load</div>
              </div>
              <div className="table__row">
                <div>2026-05-27</div>
                <div className="warn">+21%</div>
                <div>Verify operational changes</div>
              </div>
            </div>
            <p className="muted">
              This list will be sourced from anomaly detection results and alert creation logic in the backend.
            </p>
          </div>
        </Card>
      </div>

      <Card
        title="Peer benchmarking"
        subtitle="Compare your consumption to an anonymised category average (when available)."
      >
        <div className="chartPlaceholder">
          <div className="chartPlaceholder__title">Benchmark chart placeholder</div>
          <div className="chartPlaceholder__subtitle">Shows your series vs category average series.</div>
        </div>
      </Card>
    </AppShell>
  );
}
