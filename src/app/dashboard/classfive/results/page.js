import ClassResultsList from "@/app/components/ClassResultsList";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classfive", "results");

export default function Page() {
  return <ClassResultsList classSlug="classfive" />;
}
