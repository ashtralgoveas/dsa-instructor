import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import { AppProvider } from "./context/AppProvider";
import { Dashboard } from "./pages/Dashboard";
import { HistoryPage } from "./pages/History";
import { Settings } from "./pages/Settings";
import { Topics } from "./pages/Topics";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="topics" element={<Topics />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
