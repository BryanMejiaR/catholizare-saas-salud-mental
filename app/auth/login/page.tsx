import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Usa el correo y contraseña asociados a tu invitación de Catholizare."
    >
      <LoginForm />
    </AuthShell>
  );
}
