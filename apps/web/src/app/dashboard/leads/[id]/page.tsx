import { redirect } from "next/navigation";

export default function LeadDetailRedirect() {
  redirect("/dashboard/leads");
}
