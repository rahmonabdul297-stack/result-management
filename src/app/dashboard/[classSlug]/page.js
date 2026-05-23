import ClassDashboard from "@/app/components/ClassDashboard";
import { classPageMetadata } from "@/lib/siteMetadata";

export async function generateMetadata({ params }) {
  const { classSlug } = await params;
  return classPageMetadata(classSlug, "dashboard");
}

export default async function DynamicClassDashboardPage({ params }) {
  const { classSlug } = await params;
  return <ClassDashboard classSlug={classSlug} />;
}
