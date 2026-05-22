import ClassResultsList from "@/app/components/ClassResultsList";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classone", "results");

export default function Page() {
  return <ClassResultsList classSlug="classone" />;
}
