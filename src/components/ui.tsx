import { useEffect } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { formatRelativeTime } from '@/utils/format';

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle: string;
  actions?: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} | Axelle Sentinel`;
  }, [title]);

  return (
    <header className="flex min-w-0 flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold tracking-tight text-base-100 sm:text-2xl">{title}</h1>
        <p className="mt-1 text-xs text-base-400 sm:text-sm">{subtitle}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const variantClass = {
    primary: 'bg-accent-500 text-base-950 hover:bg-accent-400',
    secondary: 'border border-base-700 bg-base-800 text-base-200 hover:border-base-600 hover:bg-base-750',
    ghost: 'text-base-300 hover:bg-base-800 hover:text-base-100',
  }[variant];

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-base-950 disabled:cursor-not-allowed disabled:opacity-50 ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Timestamp({ value }: { value: string }) {
  const date = new Date(value);
  return (
    <time dateTime={value} title={date.toLocaleString()}>
      {formatRelativeTime(value)}
    </time>
  );
}
