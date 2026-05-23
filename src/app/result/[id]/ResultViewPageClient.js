"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ResultSlipPrintView from "@/app/components/ResultSlipPrintView";
import { fetchStudentResultById } from "@/lib/resultApiClient";
import { toast } from "sonner";

export default function ResultViewPageClient({ params }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const classSlug = searchParams.get("class");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchStudentResultById(id);
        if (!active) return;
        setResult(data);
        setError("");
      } catch (err) {
        if (!active) return;
        const msg = err?.message || "Failed to load result.";
        setError(msg);
        toast.error(msg);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [id]);

  const backHref =
    from === "teacher" && classSlug
      ? `/dashboard/${classSlug}/results`
      : "/admin/results";
  const backLabel =
    from === "teacher" && classSlug ? "Back to class results" : "Back to all results";

  if (loading) {
    return (
      <div className="result-view-page min-h-screen flex items-center justify-center text-AppGray">
        Loading result slip…
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="result-view-page min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-red-500">{error || "Result not found."}</p>
        <a href={backHref} className="btn btn-outline btn-sm">
          {backLabel}
        </a>
      </div>
    );
  }

  return (
    <ResultSlipPrintView result={result} backHref={backHref} backLabel={backLabel} />
  );
}
