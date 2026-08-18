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
    <header className="grid gap-3 border-b border-principal/10 pb-5 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-end">
      <span className="text-xs font-bold text-azulMedio">{index}</span>
      <div>
        <h1 className="text-2xl font-bold text-principal sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-principal/65">{description}</p>
        ) : null}
      </div>
      {action ? <div>{action}</div> : null}
    </header>
  );
}
