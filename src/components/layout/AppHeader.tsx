import { corridor, PLANNING_DATE } from "@/data/mock-data";

export function AppHeader() {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-panel px-4">
      <div className="flex items-center gap-3">
        <span className="font-mono text-[12px] text-planning-blue">
          {corridor.id}
        </span>
        <span className="h-3 w-px bg-border" />
        <span className="text-[13px] text-primary-text">{corridor.name}</span>
      </div>
      <div className="flex items-center gap-4 text-[12px] text-secondary-text">
        <span>
          Planning date{" "}
          <span className="font-mono text-primary-text">{PLANNING_DATE}</span>
        </span>
        <span className="rounded-panel border border-border px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-maintenance-amber">
          SIMULATION DATASET
        </span>
      </div>
    </header>
  );
}
