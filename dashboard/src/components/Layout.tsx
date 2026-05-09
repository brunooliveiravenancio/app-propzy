import { Outlet, NavLink } from "react-router-dom";
import { Users, PhoneCall, Megaphone, Bot, LogOut, Building2 } from "lucide-react";

const nav = [
  { to: "/leads", icon: Users, label: "Leads" },
  { to: "/calls", icon: PhoneCall, label: "Chamadas" },
  { to: "/campaigns", icon: Megaphone, label: "Campanhas" },
  { to: "/prompts", icon: Bot, label: "Editor de Prompts" },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900 flex flex-col shrink-0">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white text-lg tracking-tight">Propzy</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 cursor-pointer transition-colors">
            <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
              BV
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">Bruno Venâncio</p>
              <p className="text-slate-500 text-xs truncate">Administrador</p>
            </div>
            <LogOut size={15} className="shrink-0" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}
