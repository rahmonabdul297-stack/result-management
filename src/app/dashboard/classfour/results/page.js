import ClassResultsList from "@/app/components/ClassResultsList";
import { classPageMetadata } from "@/lib/siteMetadata";

export const metadata = classPageMetadata("classfour", "results");

export default function Page() {
  return <ClassResultsList classSlug="classfour" />;
}
