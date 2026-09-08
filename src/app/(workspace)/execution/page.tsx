import { Suspense } from "react";
import { ExecutionCenter } from "@/components/execution/ExecutionCenter";

export default function ExecutionPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 text-sm text-slate-400">
          Loading Execution Center...
        </div>
      }
    >
      <ExecutionCenter />
    </Suspense>
  );
}