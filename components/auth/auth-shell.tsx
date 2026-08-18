type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="catholizare-app min-h-screen overflow-x-hidden bg-grisMuyClaro px-4 py-4 text-principal sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-32px)] w-full max-w-6xl overflow-hidden rounded-lg border border-principal/10 bg-blanco shadow-sm sm:min-h-[calc(100vh-48px)] lg:grid-cols-[minmax(0,1fr)_440px]">
        <section className="relative hidden overflow-hidden bg-principal px-10 py-12 text-blanco lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-lg bg-blanco text-sm font-bold text-principal">
                C
              </span>
              <div>
                <p className="font-bold">Catholizare OS</p>
                <p className="text-xs text-blanco/65">Gestion clinica y operativa</p>
              </div>
            </div>
            <h1 className="mt-20 max-w-xl text-4xl font-bold leading-tight">
              Tu trabajo y tu proceso, organizados con calma y claridad.
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-7 text-blanco/70">
              Un espacio protegido para pacientes, profesionales y el equipo Catholizare.
            </p>
          </div>
          <div className="border-l-4 border-enfasis pl-4 text-sm leading-6 text-blanco/70">
            La informacion clinica se mantiene separada de la operacion administrativa.
          </div>
        </section>

        <section className="min-w-0 flex items-center px-5 py-8 sm:px-10 lg:px-12">
          <div className="min-w-0 w-full">
            <Link href="/auth/login" className="mb-10 flex items-center gap-3 lg:hidden">
              <span className="grid h-10 w-10 place-items-center rounded-lg bg-principal text-sm font-bold text-blanco">
                C
              </span>
              <span>
                <span className="block font-bold text-principal">Catholizare OS</span>
                <span className="block text-xs text-grisTextos">Acceso protegido</span>
              </span>
            </Link>
            <p className="text-xs font-bold uppercase tracking-wider text-azulMedio">Bienvenido</p>
            <h2 className="mt-2 text-2xl font-bold text-principal sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-principal/65">{subtitle}</p>
            <div className="mt-8">{children}</div>
            <p className="mt-8 border-t border-principal/10 pt-5 text-xs leading-5 text-grisTextos">
              Acceso exclusivo para cuentas autorizadas de Catholizare.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
import Link from "next/link";
