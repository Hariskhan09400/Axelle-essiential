import { useStatistics } from '@/services/hooks';
import { ChartSkeleton } from '@/components/Skeletons';
import { ErrorState } from '@/components/EmptyError';
import { Network, Shield, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui';

const mitreInfo: Record<string, { tactic: string; description: string }> = {
  'T1110.001': {
    tactic: 'Credential Access',
    description: 'Adversaries attempt to guess credentials without prior knowledge. Typically involves automated tools trying many password combinations against SSH or other authentication services.',
  },
  'T1046': {
    tactic: 'Discovery',
    description: 'Adversaries attempt to discover network services by scanning open ports and identifying running services on target systems.',
  },
  'T1078': {
    tactic: 'Defense Evasion, Persistence, Privilege Escalation, Initial Access',
    description: 'Adversaries use credentials with established access to systems, potentially bypassing access controls.',
  },
  'T1548.003': {
    tactic: 'Privilege Escalation, Defense Evasion',
    description: 'Adversaries perform sudo operations to execute commands with elevated privileges, potentially caching credentials for persistence.',
  },
};

export function MitrePage() {
  const { data: stats, isLoading, isError, refetch } = useStatistics();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-3 sm:p-4 lg:space-y-6 lg:p-6">
      <PageHeader title="MITRE ATT&CK" subtitle="Detected techniques mapped to the MITRE ATT&CK framework" />

      {/* MITRE matrix overview */}
      <div className="card p-4">
        <div className="mb-4 flex items-center gap-2">
          <Network className="w-4 h-4 text-accent-400" />
          <h3 className="text-sm font-semibold text-base-200">Detected Techniques</h3>
        </div>

        {isLoading ? (
          <ChartSkeleton />
        ) : isError ? (
          <ErrorState message="Failed to load MITRE data" onRetry={() => refetch()} />
        ) : !stats || stats.top_techniques.length === 0 ? (
          <div className="py-8 text-center text-xs text-base-400">No MITRE-mapped techniques detected yet. Review incoming events for ATT&amp;CK mappings.</div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
            {stats.top_techniques.map((tech) => {
              const info = mitreInfo[tech.technique_id];
              return (
                <div key={tech.technique_id} className="card min-w-0 space-y-3 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-accent-500/10 border border-accent-500/30 flex items-center justify-center">
                        <Shield className="w-4.5 h-4.5 text-accent-400" />
                      </div>
                      <div>
                        <span className="text-sm font-mono text-accent-300">{tech.technique_id}</span>
                        <h4 className="text-sm font-medium text-base-100">{tech.technique_name}</h4>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded bg-base-800 border border-base-700 text-xs mono text-base-200">
                      {tech.count} events
                    </span>
                  </div>

                  {info && (
                    <>
                      <div className="text-xs text-base-400">
                        <span className="text-base-300 font-medium">Tactic: </span>
                        {info.tactic}
                      </div>
                      <p className="text-xs text-base-300 leading-relaxed">{info.description}</p>
                    </>
                  )}

                  <a
                    href={`https://attack.mitre.org/techniques/${tech.technique_id.replace('.', '/')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-1 text-xs text-accent-400 transition-colors hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                  >
                    View on MITRE ATT&CK
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
