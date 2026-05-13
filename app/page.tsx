import { redirect } from "next/navigation";

import { ROLE_HOME_PATH } from "@/lib/auth/types";
import { getCurrentProfile } from "@/lib/auth/profile";

export default async function HomePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/auth/login");
  }

  redirect(ROLE_HOME_PATH[profile.role]);
}
