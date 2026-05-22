import AdminPlaceholder from "@/app/components/AdminPlaceholder";
import { adminPageMetadata } from "@/lib/siteMetadata";

export const metadata = adminPageMetadata("broadcast");

export default function AdminBroadcastPage() {
  return (
    <AdminPlaceholder
      title="Staff Broadcast"
      description="Send announcements to all teachers and staff."
      icon="💬"
    />
  );
}
