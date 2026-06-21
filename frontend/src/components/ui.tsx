import { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/* ---------------- Button ---------------- */
type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
type Size = 'sm' | 'md' | 'lg' | 'icon';

const variants: Record<Variant, string> = {
  primary: 'bg-forest text-white hover:bg-forest-700 shadow-sm',
  accent: 'bg-accent text-white hover:bg-accent/90 shadow-sm',
  secondary: 'bg-leaf text-white hover:bg-leaf/90 shadow-sm',
  outline: 'border border-line bg-surface text-ink hover:bg-surface-muted dark:border-line dark:bg-surface-elevated dark:hover:bg-slate-800',
  ghost: 'text-content-muted hover:bg-surface-muted dark:hover:bg-surface-elevated',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};
const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-forest/30 disabled:opacity-50 disabled:pointer-events-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

/* ---------------- Card ---------------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('rounded-md border border-line-subtle bg-surface shadow-soft dark:border-line dark:bg-surface-elevated', className)}>
      {children}
    </div>
  );
}
export function CardHeader({ title, subtitle, action }: { title: ReactNode; subtitle?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-3">
      <div>
        <h3 className="font-semibold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-content-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function CardBody({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('px-5 pb-5', className)}>{children}</div>;
}

/* ---------------- Input ---------------- */
export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { label?: string }>(
  ({ className, label, ...props }, ref) => (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-content">{label}</span>}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-content-faint transition focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 dark:border-line dark:bg-surface-elevated dark:focus:bg-surface-elevated',
          className
        )}
        {...props}
      />
    </label>
  )
);
Input.displayName = 'Input';

export function Textarea({ className, label, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-content">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-content-faint transition focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 dark:border-line dark:bg-surface-elevated',
          className
        )}
        {...props}
      />
    </label>
  );
}

export function Select({ className, label, children, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block">
      {label && <span className="mb-1.5 block text-sm font-medium text-content">{label}</span>}
      <select
        className={cn(
          'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm text-ink transition focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20 dark:border-line dark:bg-surface-elevated',
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

/* ---------------- Badge ---------------- */
type Tone = 'green' | 'gray' | 'amber' | 'red' | 'blue';
const tones: Record<Tone, string> = {
  green: 'bg-forest-50 text-forest-700 dark:bg-forest/20 dark:text-leaf',
  gray: 'bg-surface-muted text-content-muted dark:bg-slate-800 dark:text-slate-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  red: 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-300',
  blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
};
export function Badge({ tone = 'gray', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone], className)}>{children}</span>;
}

export function severityTone(s?: string): Tone {
  switch ((s || '').toLowerCase()) {
    case 'critical':
    case 'high':
      return 'red';
    case 'moderate':
      return 'amber';
    case 'low':
      return 'blue';
    default:
      return 'gray';
  }
}

/* ---------------- Modal ---------------- */
export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60" onClick={onClose} />
      <div className={cn('relative z-10 w-full animate-fade-in rounded-2xl bg-surface shadow-card dark:bg-surface-elevated', wide ? 'max-w-3xl' : 'max-w-lg')}>
        <div className="flex items-center justify-between border-b border-line-subtle px-5 py-4 dark:border-line">
          <h3 className="font-semibold text-ink">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-content-faint hover:bg-surface-muted hover:text-content dark:hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------------- Table ---------------- */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">{children}</table>
    </div>
  );
}
export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn('whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-content-faint', className)}>
      {children}
    </th>
  );
}
export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('whitespace-nowrap px-4 py-3 text-content', className)}>{children}</td>;
}

export function Spinner({ className }: { className?: string }) {
  return <div className={cn('h-5 w-5 animate-spin rounded-full border-2 border-line border-t-forest dark:border-slate-700', className)} />;
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="font-medium text-content-muted">{title}</p>
      {hint && <p className="mt-1 text-sm text-content-faint">{hint}</p>}
    </div>
  );
}
