import { Link } from "react-router-dom";
import AppShell from "../ui/layout/AppShell";
import Button from "../ui/primitives/Button";
import Card from "../ui/primitives/Card";

export default function NotFoundPage() {
  return (
    <AppShell header={{ title: "Page not found", subtitle: "The page you requested doesn’t exist.", right: null }}>
      <Card title="404" subtitle="Try one of the dashboards instead.">
        <div className="row gap">
          <Link to="/">
            <Button variant="secondary">Home</Button>
          </Link>
          <Link to="/consumer">
            <Button>Consumer</Button>
          </Link>
          <Link to="/account-manager">
            <Button variant="secondary">Account Manager</Button>
          </Link>
        </div>
      </Card>
    </AppShell>
  );
}
