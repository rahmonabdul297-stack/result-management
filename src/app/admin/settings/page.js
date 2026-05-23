import AdminSchoolSettings from "@/app/components/AdminSchoolSettings";
import { adminPageMetadata } from "@/lib/siteMetadata";

export const metadata = adminPageMetadata("settings");

export default function AdminSettingsPage() {
  return <AdminSchoolSettings />;
}
