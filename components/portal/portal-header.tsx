import Link from "next/link";

type PortalHeaderProps = {
  fullName: string;
};

function initialsForName(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function PortalHeader({ fullName }: PortalHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-principal/10 bg-blanco/95 backdrop-blur">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/portal" className="group flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-principal text-sm font-bold text-blanco"
          >
            C
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-bold text-principal sm:text-lg">
              Catholizare OS
            </span>
            <span className="block text-xs font-medium text-grisTextos">Espacio personal</span>
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-3 sm:flex">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-enfasis/25 text-xs font-bold text-principal">
              {initialsForName(fullName)}
            </span>
            <span className="max-w-44 truncate text-sm font-semibold text-principal">{fullName}</span>
          </div>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="min-h-10 rounded-md border border-principal/15 bg-blanco px-3 text-sm font-semibold text-principal transition hover:border-rojoRompe hover:text-rojoRompe sm:px-4"
            >
              Cerrar sesion
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
