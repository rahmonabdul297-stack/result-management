import ClassDashboard from "@/app/components/ClassDashboard";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classfour", "dashboard");

export default function Page() {
  return <ClassDashboard classSlug="classfour" />;
}
