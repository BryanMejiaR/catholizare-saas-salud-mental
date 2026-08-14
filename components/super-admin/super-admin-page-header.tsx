import type { ReactNode } from "react";

type SuperAdminPageHeaderProps = {
  index: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function SuperAdminPageHeader({
  index,
  title,
  description,
  action
}: SuperAdminPageHeaderProps) {
  return (
    <header className="grid gap-5 border-b border-slate-200 pb-7 sm:grid-cols-[60px_minmax(0,1fr)_auto] sm:items-end">
      <span className="text-sm font-black text-cyan-600">{index}</span>
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
