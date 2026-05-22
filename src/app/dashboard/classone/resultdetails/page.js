import ResultdetailsPage from "@/app/components/ResultdetailsPage";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classone", "entry");

export default function Page() {
  return <ResultdetailsPage classSlug="classone" />;
}
