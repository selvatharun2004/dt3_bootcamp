import { Link } from "react-router-dom";
import AppShell from "../ui/layout/AppShell";
import Button from "../ui/primitives/Button";
import Card from "../ui/primitives/Card";

export default function LandingPage() {
  return (
    <AppShell
      header={{
        title: "Energy Analytics",
        subtitle: "Consumption trends, baselines, anomalies, benchmarking, and exports.",
        right: null
      }}
    >
      <div className="grid cols-2">
        <Card
          title="Consumer Dashboard"
          subtitle="Track consumption trends, baseline vs actual, anomalies, benchmarking, and exports."
        >
          <div className="stack">
            <p className="muted">
              For commercial energy customers monitoring a site’s usage and deviations from expected baseline.
            </p>
            <div className="row gap">
              <Link to="/consumer">
                <Button>Open Consumer</Button>
              </Link>
            </div>
          </div>
        </Card>

        <Card
          title="Account Manager Dashboard"
          subtitle="Portfolio view, ranked anomalies, and alert review."
        >
          <div className="stack">
            <p className="muted">
              For account managers overseeing multiple customers, prioritizing outreach based on alerts and deviation severity.
            </p>
            <div className="row gap">
              <Link to="/account-manager">
                <Button variant="secondary">Open Account Manager</Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Note" subtitle="This UI is currently using placeholder data.">
        <p className="muted">
          Backend API wiring (CSV upload, analytics, alerts, exports) will be connected next once endpoints are confirmed.
        </p>
      </Card>
    </AppShell>
  );
}
