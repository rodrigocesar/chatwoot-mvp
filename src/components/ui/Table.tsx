import type { ReactNode } from 'react';

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">{children}</table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">{children}</thead>;
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-200">{children}</tbody>;
}

export function TableRow({ children }: { children: ReactNode }) {
  return <tr className="hover:bg-slate-50">{children}</tr>;
}

export function TableHeaderCell({ children }: { children: ReactNode }) {
  return <th className="px-4 py-3">{children}</th>;
}

export function TableCell({ children }: { children: ReactNode }) {
  return <td className="px-4 py-3 text-slate-700">{children}</td>;
}
