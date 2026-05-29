import AppShell from "../../ui/layout/AppShell";
import Card from "../../ui/primitives/Card";
import Button from "../../ui/primitives/Button";
import StatPill from "../../ui/primitives/StatPill";
import Divider from "../../ui/primitives/Divider";

export default function AccountManagerDashboardPage() {
  return (
    <AppShell
      header={{
        title: "Account Manager Dashboard",
        subtitle: "Portfolio overview, ranked anomalies, and alert review.",
        right: (
          <div className="row gap">
            <Button variant="secondary">Export CSV</Button>
            <Button>Export PDF</Button>
          </div>
        )
      }}
      nav={{
        active: "account-manager"
      }}
    >
      <div className="row wrap gap">
        <StatPill label="Customers" value="24" />
        <StatPill label="Alerts (7d)" value="12" />
        <StatPill label="High severity" value="4" tone="danger" />
        <StatPill label="Median deviation" value="+18%" />
      </div>

      <div className="grid cols-2">
        <Card
          title="Portfolio ranking"
          subtitle="Rank customers by anomaly count and deviation severity."
          right={<Button variant="ghost">Filters</Button>}
        >
          <div className="stack">
            <div className="table">
              <div className="table__row table__head">
                <div>Customer</div>
                <div>Site</div>
                <div>Anomalies (30d)</div>
                <div>Max deviation</div>
              </div>

              <div className="table__row">
                <div>Acme Logistics</div>
                <div>Warehouse A</div>
                <div>7</div>
                <div className="bad">+41%</div>
              </div>
              <div className="table__row">
                <div>Bright Retail</div>
                <div>Store 12</div>
                <div>5</div>
                <div className="bad">+34%</div>
              </div>
              <div className="table__row">
                <div>Northside Manufacturing</div>
                <div>Plant 3</div>
                <div>4</div>
                <div className="warn">+23%</div>
              </div>
            </div>

            <Divider />
            <p className="muted">
              This will be backed by a portfolio analytics endpoint that aggregates anomalies per customer/site.
            </p>
          </div>
        </Card>

        <Card
          title="Alerts"
          subtitle="Review alerts and suggested actions."
          right={<Button variant="secondary">View queue</Button>}
        >
          <div className="stack">
            <div className="table">
              <div className="table__row table__head">
                <div>Date</div>
                <div>Customer / site</div>
                <div>Deviation</div>
                <div>Suggested action</div>
              </div>

              <div className="table__row">
                <div>2026-05-27</div>
                <div>Acme Logistics · Warehouse A</div>
                <div className="bad">+41%</div>
                <div>Schedule customer check-in</div>
              </div>
              <div className="table__row">
                <div>2026-05-25</div>
                <div>Bright Retail · Store 12</div>
                <div className="bad">+34%</div>
                <div>Investigate refrigeration load</div>
              </div>
              <div className="table__row">
                <div>2026-05-22</div>
                <div>Northside Manufacturing · Plant 3</div>
                <div className="warn">+23%</div>
                <div>Confirm operational changes</div>
              </div>
            </div>

            <p className="muted">
              Next: connect to backend alert endpoints (status lifecycle TBD) and allow acknowledging / resolving alerts.
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
            Will mirror the consumer analytics view but scoped to a chosen customer/site.
          </div>
        </div>
      </Card>
    </AppShell>
  );
}
