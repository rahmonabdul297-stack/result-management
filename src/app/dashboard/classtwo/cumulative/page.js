import CumulativeResultEntry from "@/app/components/CumulativeResultEntry";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classtwo", "cumulative");

export default function Page() {
  return <CumulativeResultEntry classSlug="classtwo" />;
}
