import CumulativeResultEntry from "@/app/components/CumulativeResultEntry";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classsix", "cumulative");

export default function Page() {
  return <CumulativeResultEntry classSlug="classsix" />;
}
