import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata({
  title: "View Result Slip",
  description: "Print or save a student result slip as PDF.",
  path: "/result",
  noIndex: true,
});

export default function ResultViewLayout({ children }) {
  return children;
}
