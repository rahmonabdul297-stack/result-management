import ClassDashboard from "@/app/components/ClassDashboard";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classone", "dashboard");

export default function Page() {
  return <ClassDashboard classSlug="classone" />;
}
