import ResultdetailsPage from "@/app/components/ResultdetailsPage";
import { classPageMetadata } from "@/lib/siteMetadata";

export async function generateMetadata({ params }) {
  const { classSlug } = await params;
  return classPageMetadata(classSlug, "entry");
}

export default async function DynamicClassResultDetailsPage({ params }) {
  const { classSlug } = await params;
  return <ResultdetailsPage classSlug={classSlug} />;
}
