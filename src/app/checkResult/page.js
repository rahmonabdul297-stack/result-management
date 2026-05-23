import ResultCheckClient from "@/app/components/ResultCheckClient";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata({
  title: "Check Student Result",
  description:
    "Students and parents can view result slips online using admission number, academic year, and term.",
  path: "/checkResult",
  keywords: ["check result", "student result", "report card"],
});

export default function CheckResultPage() {
  return <ResultCheckClient />;
}
