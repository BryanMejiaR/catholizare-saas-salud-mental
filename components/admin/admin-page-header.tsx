import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

export function AdminPageHeader({
  eyebrow = "Administracion",
  title,
  description,
  action
}: AdminPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-principal/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">{eyebrow}</p>
        <h1 className="mt-1 text-2xl font-bold text-principal sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-principal/65">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  );
}
