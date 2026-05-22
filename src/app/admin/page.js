import AdminOverview from "./AdminOverview";
import { adminPageMetadata } from "@/lib/siteMetadata";

export const metadata = adminPageMetadata("overview");

export default function AdminOverviewPage() {
  return <AdminOverview />;
}
