import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  Activity,
  FolderClosed,
  Server,
  Network,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/alerts', label: 'Alerts', icon: ShieldAlert },
  { to: '/events', label: 'Events', icon: Activity },
  { to: '/incidents', label: 'Incidents', icon: FolderClosed },
  { to: '/hosts', label: 'Hosts', icon: Server },
  { to: '/mitre', label: 'MITRE ATT&CK', icon: Network },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-60'} shrink-0 bg-base-900 border-r border-base-700 flex flex-col transition-all duration-200`}
    >
      {/* Logo */}
      <div className="h-14 flex items-center px-3 border-b border-base-700">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-md bg-accent-500/10 border border-accent-500/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-accent-400" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-base-100 leading-tight whitespace-nowrap">Axelle Sentinel</div>
              <div className="text-2xs text-base-400 leading-tight whitespace-nowrap">SOC / SIEM Lab</div>
            </div>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-base-700">
        <button
          onClick={onToggle}
          className="sidebar-link w-full justify-center"
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <span className="text-base-400 text-sm">{'>>'}</span> : <span className="text-2xs text-base-400">{'<< Collapse'}</span>}
        </button>
      </div>
    </aside>
  );
}
