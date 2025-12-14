import React from 'react';
import clsx from 'clsx';
import { palette, radii, shadows } from './theme';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; size?: 'sm' | 'md'; }>
= ({ variant = 'primary', size = 'md', className, children, ...props }) => {
  const base = 'font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
  const variants: Record<string, string> = {
    primary: 'bg-cyan-500 hover:bg-cyan-400 text-slate-900',
    ghost: 'bg-slate-800 hover:bg-slate-700 text-slate-100',
    danger: 'bg-red-500 hover:bg-red-400 text-white',
  };
  const sizes: Record<string, string> = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2',
  };
  return (
    <button className={clsx(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
};

export const Card: React.FC<{ title?: string; actions?: React.ReactNode; className?: string }> = ({ title, actions, children, className }) => (
  <div
    className={clsx(
      'bg-slate-900/70 border border-slate-800 rounded-xl shadow-lg p-4 text-slate-100',
      className,
    )}
    style={{ borderRadius: radii.md, boxShadow: shadows.card }}
  >
    {(title || actions) && (
      <div className="flex items-center justify-between mb-3">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

export const Badge: React.FC<{ color?: 'green' | 'red' | 'yellow' | 'default'; label: string }> = ({ color = 'default', label }) => {
  const colors: Record<string, string> = {
    green: 'bg-green-500/20 text-green-300 border-green-500/50',
    red: 'bg-red-500/20 text-red-200 border-red-500/50',
    yellow: 'bg-yellow-500/20 text-yellow-200 border-yellow-500/50',
    default: 'bg-slate-700 text-slate-100 border-slate-600',
  };
  return <span className={clsx('text-xs px-2 py-1 rounded border', colors[color])}>{label}</span>;
};

export const Table: React.FC<{ columns: string[]; rows: React.ReactNode[][] }> = ({ columns, rows }) => (
  <div className="overflow-auto">
    <table className="w-full text-left text-sm">
      <thead className="text-slate-400 uppercase tracking-wide border-b border-slate-800">
        <tr>
          {columns.map((col) => (
            <th key={col} className="py-2 px-2 font-semibold">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx} className="border-b border-slate-800/60 hover:bg-slate-800/40">
            {row.map((cell, cIdx) => (
              <td key={cIdx} className="py-2 px-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const StatWidget: React.FC<{ label: string; value: React.ReactNode; hint?: string }> = ({ label, value, hint }) => (
  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 min-w-[160px]" style={{ boxShadow: shadows.card }}>
    <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
    <p className="text-2xl font-bold text-slate-50">{value}</p>
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

export const Modal: React.FC<{ title: string; onConfirm: () => void; onClose: () => void; confirmText?: string; open: boolean }> = ({
  title,
  onConfirm,
  onClose,
  confirmText = 'Confirmar',
  open,
  children,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100">
            ✕
          </button>
        </div>
        <div className="text-slate-200 text-sm mb-4">{children}</div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={onConfirm}>
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export const Toast: React.FC<{ message: string; tone?: 'success' | 'error' | 'info' }> = ({ message, tone = 'info' }) => {
  const toneClass = {
    success: 'bg-green-600/80',
    error: 'bg-red-600/80',
    info: 'bg-slate-800/90',
  }[tone];
  return <div className={clsx('px-4 py-2 rounded text-sm shadow-lg text-white', toneClass)}>{message}</div>;
};

export const VirtualList = <T,>({
  items,
  itemHeight = 64,
  height = 400,
  render,
}: {
  items: T[];
  itemHeight?: number;
  height?: number;
  render: (item: T, idx: number) => React.ReactNode;
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const visibleCount = Math.ceil(height / itemHeight) + 2;
  const visibleItems = items.slice(startIndex, startIndex + visibleCount);

  return (
    <div
      className="overflow-y-auto" 
      style={{ height }}
      onScroll={(e) => setScrollTop((e.target as HTMLDivElement).scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ position: 'absolute', top: startIndex * itemHeight, left: 0, right: 0 }}>
          {visibleItems.map((item, idx) => (
            <div key={idx} style={{ height: itemHeight }}>
              {render(item, startIndex + idx)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<{ links: Array<{ key: string; label: string; icon?: string }>; active: string; onNavigate: (key: string) => void }>
= ({ links, active, onNavigate }) => (
  <aside className="w-64 bg-slate-950 text-slate-100 h-screen sticky top-0 border-r border-slate-800 flex flex-col" style={{ borderRadius: 0 }}>
    <div className="px-4 py-4 text-xl font-bold tracking-tight border-b border-slate-800">Admin Panel</div>
    <nav className="flex-1 px-2 py-4 flex flex-col gap-1">
      {links.map((link) => (
        <button
          key={link.key}
          onClick={() => onNavigate(link.key)}
          className={clsx(
            'flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors',
            active === link.key ? 'bg-cyan-600 text-slate-900 font-semibold' : 'hover:bg-slate-800 text-slate-200',
          )}
        >
          <span className="text-lg">{link.icon ?? '•'}</span>
          <span>{link.label}</span>
        </button>
      ))}
    </nav>
    <div className="px-3 py-4 text-xs text-slate-500 border-t border-slate-800">NUI & Web unificados</div>
  </aside>
);

export const Topbar: React.FC<{ placeholder?: string; onSearch?: (value: string) => void; actions?: React.ReactNode }> = ({ placeholder = 'Buscar...', onSearch, actions }) => (
  <div className="flex items-center justify-between p-4 border-b border-slate-800 sticky top-0 bg-slate-900/80 backdrop-blur z-10">
    <input
      type="search"
      placeholder={placeholder}
      className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-96"
      onChange={(e) => onSearch?.(e.target.value)}
    />
    <div className="flex items-center gap-2">{actions}</div>
  </div>
);

export const AppLayout: React.FC<{ sidebar: React.ReactNode; topbar: React.ReactNode }> = ({ sidebar, topbar, children }) => (
  <div className="min-h-screen bg-slate-950 text-slate-100 flex" style={{ background: palette.bg }}>
    {sidebar}
    <main className="flex-1 overflow-hidden">
      {topbar}
      <div className="p-4 grid gap-4" style={{ background: `radial-gradient(circle at 10% 20%, rgba(14,165,233,0.08), transparent 35%)` }}>
        {children}
      </div>
    </main>
  </div>
);

export const SectionTitle: React.FC<{ title: string; description?: string; actions?: React.ReactNode }> = ({ title, description, actions }) => (
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-xl font-semibold text-slate-50">{title}</h2>
      {description && <p className="text-sm text-slate-400">{description}</p>}
    </div>
    {actions}
  </div>
);

export const EmptyState: React.FC<{ title: string; description?: string }> = ({ title, description }) => (
  <div className="text-center py-10 text-slate-400">
    <p className="text-lg font-semibold text-slate-200">{title}</p>
    {description && <p className="text-sm text-slate-400">{description}</p>}
  </div>
);

export const FormGroup: React.FC<{ label: string; hint?: string }> = ({ label, hint, children }) => (
  <label className="flex flex-col gap-1 text-sm text-slate-200">
    <span className="font-medium">{label}</span>
    {children}
    {hint && <span className="text-xs text-slate-500">{hint}</span>}
  </label>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={clsx(
      'bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500',
      props.className,
    )}
  />
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className={clsx(
      'bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500',
      props.className,
    )}
  />
);

export const ToastStack: React.FC<{ toasts: Array<{ id: string; message: string; tone?: 'success' | 'error' | 'info' }> }> = ({ toasts }) => (
  <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
    {toasts.map((toast) => (
      <Toast key={toast.id} message={toast.message} tone={toast.tone} />
    ))}
  </div>
);

export const Tabs: React.FC<{ tabs: Array<{ key: string; label: string }>; active: string; onChange: (key: string) => void }> = ({ tabs, active, onChange }) => (
  <div className="flex gap-2 border-b border-slate-800">
    {tabs.map((tab) => (
      <button
        key={tab.key}
        onClick={() => onChange(tab.key)}
        className={clsx(
          'px-3 py-2 text-sm font-semibold border-b-2 transition-colors',
          active === tab.key ? 'border-cyan-500 text-slate-50' : 'border-transparent text-slate-400 hover:text-slate-200',
        )}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export const ActionGrid: React.FC<{ actions: Array<{ key: string; title: string; description: string; onClick: () => void; dangerous?: boolean }> }>
= ({ actions }) => (
  <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
    {actions.map((action) => (
      <button
        key={action.key}
        onClick={action.onClick}
        className={clsx(
          'text-left bg-slate-900/70 border border-slate-800 rounded-xl p-4 hover:border-cyan-500 transition-colors',
          action.dangerous && 'border-red-500/50 hover:border-red-400',
        )}
      >
        <p className="text-sm font-semibold text-slate-100">{action.title}</p>
        <p className="text-xs text-slate-500">{action.description}</p>
      </button>
    ))}
  </div>
);

export const LogList: React.FC<{ logs: AdminLog[] }> = ({ logs }) => (
  <div className="divide-y divide-slate-800">
    {logs.map((log) => (
      <div key={log.id} className="py-3 flex items-center justify-between">
        <div>
          <p className="font-semibold text-slate-100">{log.actionType}</p>
          <p className="text-xs text-slate-500">
            {log.actorName ?? 'Anon'} · {new Date(log.createdAt).toLocaleString()}
          </p>
        </div>
        <Badge
          label={log.status}
          color={log.status === 'DONE' ? 'green' : log.status === 'FAILED' ? 'red' : 'yellow'}
        />
      </div>
    ))}
  </div>
);

export interface AdminLog {
  id: number;
  actionType: string;
  actorName?: string;
  status: string;
  createdAt: string;
}

export const MetricRow: React.FC<{ label: string; value: string | number; accent?: boolean }> = ({ label, value, accent }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-sm text-slate-400">{label}</span>
    <span className={clsx('text-sm font-semibold', accent ? 'text-cyan-400' : 'text-slate-100')}>{value}</span>
  </div>
);

export const ChatList: React.FC<{ messages: Array<{ id: number; name: string; message: string; createdAt: string }> }> = ({ messages }) => (
  <div className="space-y-3">
    {messages.map((msg) => (
      <div key={msg.id} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-200">{msg.name}</span>
          <span>{new Date(msg.createdAt).toLocaleTimeString()}</span>
        </div>
        <p className="text-sm text-slate-100">{msg.message}</p>
      </div>
    ))}
  </div>
);

export const PageGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => <div className="grid gap-4 grid-cols-1 xl:grid-cols-3">{children}</div>;
