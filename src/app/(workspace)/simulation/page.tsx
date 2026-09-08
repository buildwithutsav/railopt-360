import { Suspense } from "react";
import { SimulationLab } from "@/components/simulation/SimulationLab";
import { PageHeader } from "@/components/shared/PageHeader";
import { moduleCopy } from "@/config/modules";

export default function SimulationPage() {
  return (
    <>
      <PageHeader
        title={moduleCopy.simulation.title}
        subtitle={moduleCopy.simulation.subtitle}
      />

      <Suspense fallback={<SimulationLabLoading />}>
        <SimulationLab />
      </Suspense>
    </>
  );
}

function SimulationLabLoading() {
  return (
    <div className="border border-slate-700/70 bg-slate-900/30 p-6">
      <div className="font-mono text-[9px] uppercase tracking-wider text-slate-500">
        Loading Simulation Lab...
      </div>
    </div>
  );
}