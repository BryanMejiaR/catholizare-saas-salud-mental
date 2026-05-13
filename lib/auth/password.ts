const PASSWORD_POLICY = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function isValidPassword(password: string) {
  return PASSWORD_POLICY.test(password);
}

export const PASSWORD_POLICY_MESSAGE =
  "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";
