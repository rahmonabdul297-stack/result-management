import AdminPlaceholder from "@/app/components/AdminPlaceholder";
import { adminPageMetadata } from "@/lib/siteMetadata";

export const metadata = adminPageMetadata("settings");

export default function AdminSettingsPage() {
  return (
    <AdminPlaceholder
      title="School Settings"
      description="Configure school name, logo, address, and grading rules."
      icon="⚙️"
    />
  );
}
