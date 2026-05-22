import AdminTeachersSettings from "@/app/components/AdminTeachersSettings";
import { adminPageMetadata } from "@/lib/siteMetadata";

export const metadata = adminPageMetadata("teachers");

export default function AdminTeachersPage() {
  return <AdminTeachersSettings />;
}
