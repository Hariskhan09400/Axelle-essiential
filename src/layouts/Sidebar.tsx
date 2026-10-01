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
  X,
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

export function Sidebar({
  collapsed = false,
  onToggle,
  mobile = false,
  onClose,
}: {
  collapsed?: boolean;
  onToggle?: () => void;
  mobile?: boolean;
  onClose?: () => void;
}) {
  return (
    <aside
      className={`${mobile ? 'w-[82vw] max-w-[300px]' : collapsed ? 'w-16' : 'w-60'} flex h-full shrink-0 flex-col border-r border-base-700 bg-base-900 transition-all duration-200`}
    >
      <div className="flex h-14 items-center justify-between border-b border-base-700 px-3">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-accent-500/30 bg-accent-500/10">
            <ShieldCheck className="h-5 w-5 text-accent-400" />
          </div>
          {!collapsed && !mobile && (
            <div className="overflow-hidden">
              <div className="text-sm font-semibold text-base-100 leading-tight whitespace-nowrap">Axelle Sentinel</div>
              <div className="text-2xs text-base-400 leading-tight whitespace-nowrap">SOC / SIEM Lab</div>
            </div>
          )}
        </div>

        {mobile && (
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-base-300 transition hover:bg-base-800 hover:text-base-100"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : ''} ${collapsed && !mobile ? 'justify-center' : ''}`
              }
              title={collapsed && !mobile ? item.label : undefined}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {(!collapsed || mobile) && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {!mobile && (
        <div className="border-t border-base-700 p-2">
          <button
            type="button"
            onClick={onToggle}
            className="sidebar-link w-full justify-center"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? <span className="text-sm text-base-400">{'>>'}</span> : <span className="text-2xs text-base-400">{'<< Collapse'}</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
