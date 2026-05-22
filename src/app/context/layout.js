import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata({
  title: "App Context",
  description: "Internal application context route.",
  noIndex: true,
});

export default function ContextLayout({ children }) {
  return children;
}
