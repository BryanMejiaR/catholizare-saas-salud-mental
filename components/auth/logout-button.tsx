type LogoutButtonProps = {
  fullName: string;
};

export function LogoutButton({ fullName }: LogoutButtonProps) {
  return (
    <form
      action="/api/auth/logout"
      method="post"
      className="fixed right-4 top-4 z-50 print:hidden"
    >
      <button
        type="submit"
        className="rounded-md border border-ink/15 bg-white px-3 py-2 text-sm font-medium text-ink shadow-sm transition hover:border-clay hover:text-clay"
        title={`Cerrar sesion de ${fullName}`}
      >
        Cerrar sesion
      </button>
    </form>
  );
}
