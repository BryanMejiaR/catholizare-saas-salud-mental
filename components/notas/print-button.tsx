"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center justify-center rounded-md bg-moss px-4 text-sm font-semibold text-white transition hover:bg-ink print:hidden"
    >
      Guardar como PDF
    </button>
  );
}
