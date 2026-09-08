import { Suspense } from "react";
import { OpportunityRadar } from "@/components/opportunity-radar/OpportunityRadar";
import { PageHeader } from "@/components/shared/PageHeader";
import { moduleCopy } from "@/config/modules";

export default function OpportunityRadarPage() {
  return (
    <>
      <PageHeader
        title={moduleCopy.opportunityRadar.title}
        subtitle={moduleCopy.opportunityRadar.subtitle}
      />

      <Suspense fallback={<OpportunityRadarLoading />}>
        <OpportunityRadar />
      </Suspense>
    </>
  );
}

function OpportunityRadarLoading() {
  return (
    <div className="border border-slate-700/70 bg-slate-900/30 p-6">
      <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
        Loading Opportunity Radar...
      </div>
    </div>
  );
}