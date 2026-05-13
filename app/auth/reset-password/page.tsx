import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace temporal con vigencia de una hora si tu cuenta existe."
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
