import AdminPlaceholder from "@/app/components/AdminPlaceholder";
import { adminPageMetadata } from "@/lib/siteMetadata";

export const metadata = adminPageMetadata("passports");

export default function AdminPassportsPage() {
  return (
    <AdminPlaceholder
      title="Student Passports"
      description="View and manage uploaded student passport photos from result submissions."
      icon="📷"
    />
  );
}
