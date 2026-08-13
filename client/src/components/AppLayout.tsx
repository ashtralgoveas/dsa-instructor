import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Topics", to: "/topics" },
  { label: "History", to: "/history" },
  { label: "Settings", to: "/settings" },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="mt-8 flex flex-col gap-0.5">
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `nav-link ${isActive ? "nav-link-active" : ""}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell flex h-dvh overflow-hidden">
      <div
        className={`fixed inset-0 z-40 bg-black/45 transition-opacity duration-200 md:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`sidebar fixed inset-y-0 left-0 z-50 flex h-dvh shrink-0 flex-col overflow-y-auto px-4 py-6 transition-transform duration-200 md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between gap-3 px-1">
          <div>
            <p className="text-[0.98rem] font-semibold tracking-tight text-ink">
              DSA Instructor
            </p>
            <p className="mt-1 text-[0.72rem] text-muted">Ask. Learn. Practice.</p>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="btn-text md:hidden"
            aria-label="Close navigation"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <SidebarNav onNavigate={() => setSidebarOpen(false)} />
      </aside>

      <div className="workspace">
        <header className="relative z-10 flex shrink-0 items-center gap-3 border-b border-border px-4 py-3 md:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="btn-text"
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
          <p className="text-sm font-medium text-ink">DSA Instructor</p>
        </header>

        <main className="workspace-scroll">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
