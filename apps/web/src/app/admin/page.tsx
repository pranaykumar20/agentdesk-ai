import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Platform admin UI will return in a later phase. */
export default async function AdminPage() {
  await requireUser();
  redirect("/dashboard");
}
