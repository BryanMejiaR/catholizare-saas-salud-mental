"use client";

import { useActionState } from "react";

import { createManagedUserAction } from "@/app/users/actions";
import { SearchablePersonSelect } from "@/components/forms/searchable-person-select";
import { ActionMessage } from "@/components/users/action-message";
import { SubmitButton } from "@/components/auth/submit-button";
import type { UserRole } from "@/lib/auth/types";
import type { UserManagementProfile } from "@/lib/users/types";

type CreateUserFormProps = {
  allowedRoles: UserRole[];
  professionals?: UserManagementProfile[];
  fixedRole?: UserRole;
};

export function CreateUserForm({
  allowedRoles,
  professionals = [],
  fixedRole
}: CreateUserFormProps) {
  const [state, formAction] = useActionState(createManagedUserAction, {});
  const roleOptions = fixedRole ? [fixedRole] : allowedRoles;

  return (
    <form action={formAction} className="space-y-4 rounded-lg border border-ink/10 bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold text-ink">Crear usuario</h2>
        <p className="mt-1 text-sm text-ink/65">Se enviará una invitación por correo.</p>
      </div>

      <ActionMessage message={state.message} ok={state.ok} />

      <label className="block">
        <span className="text-sm font-medium text-ink">Nombre completo</span>
        <input
          name="fullName"
          required
          className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Correo electrónico</span>
        <input
          name="email"
          type="email"
          required
          className="mt-2 h-10 w-full rounded-md border border-ink/15 px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-ink">Rol</span>
        <select
          name="role"
          defaultValue={roleOptions[0]}
          className="mt-2 h-10 w-full rounded-md border border-ink/15 bg-white px-3 outline-none focus:border-moss focus:ring-2 focus:ring-moss/20"
        >
          {roleOptions.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      </label>

      {professionals.length > 0 ? (
        <SearchablePersonSelect
          name="primaryProfessionalId"
          label="Profesional principal"
          options={professionals.map((professional) => ({
            id: professional.id,
            label: professional.full_name,
            detail: professional.email
          }))}
          placeholder="Buscar profesional por nombre..."
        />
      ) : null}

      <SubmitButton>Enviar invitación</SubmitButton>
    </form>
  );
}
