import ClassResultsList from "@/app/components/ClassResultsList";
import { classPageMetadata } from "@/lib/siteMetadata";

export async function generateMetadata({ params }) {
  const { classSlug } = await params;
  return classPageMetadata(classSlug, "results");
}

export default async function DynamicClassResultsPage({ params }) {
  const { classSlug } = await params;
  return <ClassResultsList classSlug={classSlug} />;
}
