export function ProfessionalMembershipPanel() {
  return (
    <section className="rounded-lg border border-ink/10 bg-white p-5">
      <h2 className="text-lg font-semibold text-ink">Membresia</h2>
      <p className="mt-2 text-sm leading-6 text-ink/65">
        Prototipo de gestion de membresia profesional. Aqui se colocara el enlace de Stripe y el
        historial de facturas cuando el flujo de pagos quede activo.
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-grisMuyClaro p-4">
          <p className="text-sm font-semibold text-ink">Link de Stripe</p>
          <p className="mt-1 text-sm text-ink/60">Pendiente de configuracion.</p>
        </div>
        <div className="rounded-md border border-ink/10 bg-grisMuyClaro p-4">
          <p className="text-sm font-semibold text-ink">Facturas</p>
          <p className="mt-1 text-sm text-ink/60">Aqui apareceran tus facturas de membresia.</p>
        </div>
      </div>
    </section>
  );
}
