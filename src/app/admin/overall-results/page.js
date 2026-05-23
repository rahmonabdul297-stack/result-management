import AdminOverallResultsTable from "@/app/components/AdminOverallResultsTable";
import { adminPageMetadata } from "@/lib/siteMetadata";

export const metadata = adminPageMetadata("overallResults");

export default function AdminOverallResultsPage() {
  return <AdminOverallResultsTable />;
}
