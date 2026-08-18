export function PortalCustomerSupportPanel() {
  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Atencion al cliente</h2>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          Usa esta seccion para ubicar ayuda operativa sobre acceso, citas, pagos o uso del portal.
          No compartas datos clinicos sensibles por canales de soporte.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <a
          href="https://catholizare.com/contacto/"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-ink/10 p-4 transition hover:border-azulMedio"
        >
          <p className="text-sm font-semibold text-ink">Contactar a Catholizare</p>
          <p className="mt-1 text-xs text-ink/60">Abre el canal de contacto publico.</p>
        </a>
        <a
          href="https://catholizare.com/"
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-ink/10 p-4 transition hover:border-azulMedio"
        >
          <p className="text-sm font-semibold text-ink">Centro Catholizare</p>
          <p className="mt-1 text-xs text-ink/60">Consulta informacion general de la plataforma.</p>
        </a>
      </div>
    </section>
  );
}
