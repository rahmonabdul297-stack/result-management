import AdminResultsTable from "@/app/components/AdminResultsTable";
import { adminPageMetadata } from "@/lib/siteMetadata";
import { CLASS_SLUGS } from "@/lib/classConfig";

export const metadata = adminPageMetadata("results");

export default async function AdminResultsPage({ searchParams }) {
  const params = await searchParams;
  const classParam = params?.class;
  const initialClassFilter =
    classParam && CLASS_SLUGS.includes(classParam) ? classParam : "all";

  return (
    <AdminResultsTable
      title="All School Results"
      description="Every result slip saved by teachers, organized by class."
      initialClassFilter={initialClassFilter}
    />
  );
}
