import { Suspense } from "react";
import ResultViewPageClient from "./ResultViewPageClient";

export default function ResultViewPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="result-view-page min-h-screen flex items-center justify-center text-AppGray">
          Loading result slip…
        </div>
      }
    >
      <ResultViewPageClient params={params} />
    </Suspense>
  );
}
