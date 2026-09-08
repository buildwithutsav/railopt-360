import { Suspense } from "react";
import { BlockPlanner } from "@/components/block-planner/BlockPlanner";
import { PageHeader } from "@/components/shared/PageHeader";
import { moduleCopy } from "@/config/modules";

export default function BlockPlannerPage() {
  return (
    <>
      <PageHeader
        title={moduleCopy.blockPlanner.title}
        subtitle={moduleCopy.blockPlanner.subtitle}
      />

      <Suspense fallback={<BlockPlannerLoading />}>
        <BlockPlanner />
      </Suspense>
    </>
  );
}

function BlockPlannerLoading() {
  return (
    <div className="border border-slate-700/70 bg-slate-900/30 p-6">
      <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
        Loading Block Planner...
      </div>
    </div>
  );
}