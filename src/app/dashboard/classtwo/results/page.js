import ClassResultsList from "@/app/components/ClassResultsList";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classtwo", "results");

export default function Page() {
  return <ClassResultsList classSlug="classtwo" />;
}
