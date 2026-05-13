type AuthShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <main className="min-h-screen bg-linen">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl px-6 py-8 lg:grid-cols-[1fr_420px] lg:gap-12">
        <section className="flex flex-col justify-between py-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-moss">
              Catholizare OS
            </p>
            <h1 className="mt-10 max-w-2xl text-4xl font-semibold leading-tight text-ink md:text-5xl">
              Expediente, proceso terapéutico y operación clínica en un solo lugar.
            </h1>
          </div>
          <p className="mt-12 max-w-xl text-base leading-7 text-ink/70">
            Acceso protegido para pacientes, profesionales, administradores y equipo
            Catholizare.
          </p>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-lg border border-ink/10 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-ink/65">{subtitle}</p>
            <div className="mt-8">{children}</div>
          </div>
        </section>
      </div>
    </main>
  );
}
