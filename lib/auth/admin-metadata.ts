import "server-only";

import type { AccountStatus, UserRole } from "@/lib/auth/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function updateAuthUserAccessMetadata(
  userId: string,
  access: {
    role: UserRole;
    accountStatus: AccountStatus;
  }
) {
  const supabaseAdmin = createSupabaseAdminClient();
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  const currentAppMetadata =
    data.user?.app_metadata && typeof data.user.app_metadata === "object"
      ? data.user.app_metadata
      : {};

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    app_metadata: {
      ...currentAppMetadata,
      role: access.role,
      account_status: access.accountStatus
    }
  });

  if (error) {
    throw new Error(`Unable to update auth metadata: ${error.message}`);
  }
}
