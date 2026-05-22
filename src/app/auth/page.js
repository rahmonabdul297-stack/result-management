import AuthPageClient from "./AuthPageClient";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata({
  title: "Sign In",
  description:
    "Teacher and administrator login for managing student results and report slips.",
  path: "/auth",
  keywords: ["login", "authentication"],
});

export default function AuthPage() {
  return <AuthPageClient />;
}
