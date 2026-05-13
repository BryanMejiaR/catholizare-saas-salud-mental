import { AuthShell } from "@/components/auth/auth-shell";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export default function UpdatePasswordPage() {
  return (
    <AuthShell
      title="Crear nueva contraseña"
      subtitle="Define una contraseña segura para activar o recuperar tu cuenta."
    >
      <UpdatePasswordForm />
    </AuthShell>
  );
}
