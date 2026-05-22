import AuthPageClient from "@/app/auth/AuthPageClient";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata({
  title: "Sign In",
  description:
    "Sign in to the School of Science and Technology result management system as a teacher or administrator.",
  path: "/",
  keywords: ["login", "teacher login", "admin login"],
});

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center">
      <AuthPageClient />
    </div>
  );
}
