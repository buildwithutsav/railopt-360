import { maintenanceTasks, simulationSummary } from "@/data/mock-data";
import CorridorMap from "./CorridorMap";
import {
  AlertTriangle,
  CalendarClock,
  Gauge,
  Layers3,
  TrainFront,
  Wrench,
} from "lucide-react";

const summaryItems = [
  {
    label: "Pending Maintenance",
    value: maintenanceTasks.filter((task) => task.status === "PENDING").length,
    detail: "Open maintenance requirements",
    icon: Wrench,
    simulated: false,
  },
  {
    label: "Critical Tasks",
    value: maintenanceTasks.filter((task) => task.priority === "CRITICAL").length,
    detail: "Requires priority planning",
    icon: AlertTriangle,
    simulated: false,
  },
  {
    label: "Candidate Opportunities",
    value: simulationSummary.candidateOpportunities,
    detail: "Feasible planning windows",
    icon: CalendarClock,
    simulated: true,
  },
  {
    label: "Proposed Blocks",
    value: simulationSummary.proposedBlocks,
    detail: "Awaiting planner review",
    icon: Layers3,
    simulated: true,
  },
  {
    label: "Affected Trains",
    value: simulationSummary.affectedTrains,
    detail: "Estimated operational impact",
    icon: TrainFront,
    simulated: true,
  },
  {
    label: "Block Utilisation",
    value: `${simulationSummary.blockUtilisation}%`,
    detail: "Selected candidate window",
    icon: Gauge,
    simulated: true,
  },
];

export function OperationalSummary() {
  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary-text)]">
            Planning Snapshot
          </p>

          <h2 className="mt-1 text-sm font-semibold text-[var(--primary-text)]">
            Operational Summary
          </h2>
        </div>

        <span className="text-[10px] uppercase tracking-[0.14em] text-[var(--secondary-text)]">
          Corridor UDR–MVJ
        </span>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)] lg:grid-cols-3 xl:grid-cols-6">
        {summaryItems.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={`min-w-0 px-4 py-4 ${
                index !== summaryItems.length - 1
                  ? "border-r border-[var(--border)]"
                  : ""
              }`}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  className="text-[var(--secondary-text)]"
                />

                {item.simulated && (
                  <span className="rounded border border-[var(--border)] px-1.5 py-0.5 text-[8px] font-semibold tracking-[0.12em] text-[var(--secondary-text)]">
                    SIM
                  </span>
                )}
              </div>

              <div className="font-mono text-2xl font-semibold leading-none text-[var(--primary-text)]">
                {item.value}
              </div>

              <div className="mt-2 text-[11px] font-medium text-[var(--primary-text)]">
                {item.label}
              </div>

              <div className="mt-1 truncate text-[9px] text-[var(--secondary-text)]">
                {item.detail}
              </div>
            </div>
                  );
      })}
    </div>

    <div className="mt-6 w-full">
      <CorridorMap />
    </div>
  
</section>
);
}