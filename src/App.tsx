import { Navigate, Route, Routes } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import ConsumerDashboardPage from "./pages/consumer/ConsumerDashboardPage";
import AccountManagerDashboardPage from "./pages/account-manager/AccountManagerDashboardPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route path="/consumer" element={<ConsumerDashboardPage />} />
      <Route path="/account-manager" element={<AccountManagerDashboardPage />} />

      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
