import AdminLayoutShell from "./AdminLayoutShell";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata({
  title: "Admin Portal",
  description:
    "Administrator portal for school-wide result oversight, settings, and staff management.",
  path: "/admin",
  keywords: ["admin portal", "school admin"],
});

export default function AdminLayout({ children }) {
  return <AdminLayoutShell>{children}</AdminLayoutShell>;
}
