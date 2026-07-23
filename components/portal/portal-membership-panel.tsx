export function PortalMembershipPanel() {
  return (
    <section className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Membresia</h2>
        <p className="mt-2 text-sm leading-6 text-ink/65">
          Prototipo de gestion de membresia. Aqui se colocara el enlace de Stripe cuando el flujo
          de pagos quede activo.
        </p>
      </div>

      <div className="rounded-md border border-ink/10 bg-linen p-4">
        <p className="text-sm font-semibold text-ink">Link de Stripe</p>
        <p className="mt-1 text-sm text-ink/60">Pendiente de configuracion.</p>
      </div>

      <div className="rounded-md border border-ink/10 bg-linen p-4">
        <p className="text-sm font-semibold text-ink">Facturas</p>
        <p className="mt-1 text-sm text-ink/60">
          Aqui apareceran las facturas relacionadas con la membresia.
        </p>
      </div>
    </section>
  );
}
