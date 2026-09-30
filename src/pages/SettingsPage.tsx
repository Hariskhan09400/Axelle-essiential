import { useHealth } from '@/services/hooks';
import { Settings, Server, Shield, Cpu } from 'lucide-react';

export function SettingsPage() {
  const { data: health } = useHealth();

  const settingsGroups = [
    {
      title: 'Backend Connection',
      icon: Server,
      items: [
        { label: 'API URL', value: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' },
        { label: 'Mode', value: health?.mode?.toUpperCase() ?? 'DEMO' },
          { label: 'Mode', value: health?.mode?.toUpperCase() ?? 'unknown' },
        { label: 'Status', value: health?.status ?? 'unknown' },
      ],
    },
    {
      title: 'Integration Status',
      icon: Shield,
      items: [
        { label: 'Wazuh SIEM', value: 'Not configured (Phase 3)' },
        { label: 'Telegram Alerts', value: 'Not configured (Phase 5)' },
        { label: 'Real-time Transport', value: 'Not enabled (Phase 4)' },
      ],
    },
    {
      title: 'System',
      icon: Cpu,
      items: [
        { label: 'Storage', value: 'In-memory (Phase 1)' },
        { label: 'Authentication', value: 'Not enabled' },
        { label: 'Version', value: '0.1.0 — Phase 1' },
      ],
    },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-[1200px] mx-auto">
      <div>
        <h1 className="text-lg font-semibold text-base-100">Settings</h1>
        <p className="text-xs text-base-400 mt-0.5">System configuration and integration status</p>
      </div>

      <div className="space-y-4">
        {settingsGroups.map((group) => {
          const Icon = group.icon;
          return (
            <div key={group.title} className="card p-4">
              <div className="flex items-center gap-2 mb-3">
                <Icon className="w-4 h-4 text-base-400" />
                <h3 className="text-sm font-semibold text-base-200">{group.title}</h3>
              </div>
              <div className="space-y-2">
                {group.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-base-700/30 last:border-0">
                    <span className="text-xs text-base-400">{item.label}</span>
                    <span className="text-xs text-base-200 mono">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Phase info */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Settings className="w-4 h-4 text-base-400" />
          <h3 className="text-sm font-semibold text-base-200">Phase Roadmap</h3>
        </div>
        <div className="space-y-2">
          {[
            { phase: 'Phase 1', label: 'Architecture, dashboard, mock events', done: true },
            { phase: 'Phase 2', label: 'Alerts, filtering, search, statistics', done: true },
            { phase: 'Phase 3', label: 'Wazuh integration', done: false },
            { phase: 'Phase 4', label: 'Real-time updates (SSE/WebSocket)', done: false },
            { phase: 'Phase 5', label: 'Telegram alerts', done: false },
            { phase: 'Phase 6', label: 'MITRE ATT&CK section', done: true },
            { phase: 'Phase 7', label: 'Incident management', done: false },
            { phase: 'Phase 8', label: 'Host monitoring', done: false },
            { phase: 'Phase 9', label: 'Advanced detection & correlation', done: false },
          ].map((p) => (
            <div key={p.phase} className="flex items-center gap-3 py-1.5">
              <span className={`w-2 h-2 rounded-full ${p.done ? 'bg-status-resolved' : 'bg-base-600'}`} />
              <span className="text-xs mono text-base-400 w-16">{p.phase}</span>
              <span className={`text-xs ${p.done ? 'text-base-200' : 'text-base-400'}`}>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
