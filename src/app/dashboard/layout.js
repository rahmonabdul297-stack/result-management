import { ContextPageProvider } from "../context/page";
import DashboardPathSync from "../components/DashboardPathSync";
import Generalheader from "../Generalheader";
import Navbar from "../navbar";
import { pageMetadata } from "@/lib/siteMetadata";

export const metadata = pageMetadata({
  title: "Teacher Dashboard",
  description:
    "Teacher portal for entering student scores, viewing class results, and printing result slips.",
  path: "/dashboard",
  keywords: ["teacher portal", "class dashboard"],
});

export default function DashboardLayout({ children }) {
  return (
    <ContextPageProvider>
      <DashboardPathSync />
      <div className="dashboard-layout min-h-screen">
        <Generalheader />

        <section className="dashboard-shell flex">
          <aside className="dashboard-sidebar fixed top-16 z-30 lg:top-[68px]">
            <Navbar />
          </aside>

          <main className="dashboard-content w-full px-2 pb-10 pt-16 sm:px-4 lg:ml-52 lg:w-[80%] lg:px-6 lg:pt-[68px]">
            {children}
          </main>
        </section>
      </div>
    </ContextPageProvider>
  );
}
