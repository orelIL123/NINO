import { adminAuthConfigured, isAdminAuthenticated } from "@/lib/admin/auth";
import { shopifyAdminConfigured } from "@/lib/shopify/admin";

import AdminPanel from "./AdminPanel";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  return (
    <AdminPanel
      initialAuthenticated={await isAdminAuthenticated()}
      authConfigured={adminAuthConfigured()}
      shopifyConfigured={shopifyAdminConfigured()}
    />
  );
}
