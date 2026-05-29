import { ReactNode } from "react";
import { Link } from "react-router-dom";

type HeaderModel = {
  title: string;
  subtitle: string;
  right: ReactNode;
};

type NavModel =
  | {
      active: "consumer" | "account-manager";
    }
  | undefined;

export default function AppShell(props: { header: HeaderModel; nav?: NavModel; children: ReactNode }) {
  const { header, nav, children } = props;

  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar__left">
          <Link to="/" className="brand">
            <span className="brand__mark" aria-hidden="true" />
            <span className="brand__text">Energy Analytics</span>
          </Link>

          {nav ? (
            <nav className="nav" aria-label="Primary">
              <Link className={nav.active === "consumer" ? "nav__link isActive" : "nav__link"} to="/consumer">
                Consumer
              </Link>
              <Link
                className={nav.active === "account-manager" ? "nav__link isActive" : "nav__link"}
                to="/account-manager"
              >
                Account Manager
              </Link>
            </nav>
          ) : null}
        </div>

        <div className="topbar__right">{header.right}</div>
      </header>

      <main className="main">
        <div className="pageHeader">
          <div>
            <h1 className="h1">{header.title}</h1>
            <p className="subtle">{header.subtitle}</p>
          </div>
        </div>

        <div className="content stack">{children}</div>
      </main>

      <footer className="footer">
        <div className="footer__inner">
          <span className="muted">Commercial Energy Consumption Analytics & Anomaly Alerts</span>
          <span className="muted">·</span>
          <span className="muted">UI scaffold (API integration next)</span>
        </div>
      </footer>
    </div>
  );
}
