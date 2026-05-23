import CumulativeResultEntry from "@/app/components/CumulativeResultEntry";
import { classPageMetadata } from "@/lib/siteMetadata";

export async function generateMetadata({ params }) {
  const { classSlug } = await params;
  return classPageMetadata(classSlug, "cumulative");
}

export default async function CumulativeResultPage({ params }) {
  const { classSlug } = await params;
  return <CumulativeResultEntry classSlug={classSlug} />;
}
