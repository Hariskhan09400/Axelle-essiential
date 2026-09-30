import { AlertOctagon, Flame, Zap, Shield, Info } from 'lucide-react';

export function CriticalIcon(props: React.SVGProps<SVGSVGElement>) {
  return <AlertOctagon {...props} />;
}
export function HighIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Flame {...props} />;
}
export function MediumIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Zap {...props} />;
}
export function LowIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Shield {...props} />;
}
export function InfoIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Info {...props} />;
}
export function StatusIcon(props: React.SVGProps<SVGSVGElement>) {
  return <Info {...props} />;
}
