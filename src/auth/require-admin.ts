import "server-only";
import { redirect } from "next/navigation";
import { isAdmin } from "./session";
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}
