import { activityEvents } from "@/data/mock-data";
import { CheckCircle2, Circle, Clock3 } from "lucide-react";

const workflow = [
  { label: "Opportunity Identified", done: true },
  { label: "Constraints Checked", done: true },
  { label: "Plan Recommended", done: true, current: true },
  { label: "Planner Review", done: false },
  { label: "Approval", done: false },
];

export function CommandFooter() {
  return (
    <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <div className="border-b border-[var(--border)] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary-text)]">
            Decision Workflow
          </p>

          <h2 className="mt-1 text-sm font-semibold text-[var(--primary-text)]">
            Planner Validation State
          </h2>
        </div>

        <div className="px-4 py-5">
          <div className="flex flex-wrap items-center gap-3">
            {workflow.map((step, index) => (
              <div key={step.label} className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {step.done ? (
                    <CheckCircle2
                      size={14}
                      className={
                        step.current
                          ? "text-[var(--planning-blue)]"
                          : "text-[var(--success-green)]"
                      }
                    />
                  ) : (
                    <Circle
                      size={14}
                      className="text-[var(--secondary-text)]"
                    />
                  )}

                  <span
                    className={`text-[9px] ${
                      step.current
                        ? "font-semibold text-[var(--planning-blue)]"
                        : "text-[var(--primary-text)]"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index !== workflow.length - 1 && (
                  <span className="text-[var(--secondary-text)]">→</span>
                )}
              </div>
            ))}
          </div>

          <div className="mt-5 rounded border border-[var(--maintenance-amber)]/25 bg-[var(--maintenance-amber)]/5 px-3 py-3 text-[9px] leading-relaxed text-[var(--secondary-text)]">
            Planning recommendations are decision-support outputs and require
            authorized planner validation before execution.
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        <div className="border-b border-[var(--border)] px-4 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary-text)]">
            Prototype Activity
          </p>

          <h2 className="mt-1 text-sm font-semibold text-[var(--primary-text)]">
            Recent Planning Activity
          </h2>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {activityEvents.map((event) => (
            <div key={event.id} className="flex gap-3 px-4 py-3">
              <Clock3
                size={12}
                className="mt-0.5 shrink-0 text-[var(--secondary-text)]"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[9px] text-[var(--primary-text)]">
                    {event.message}
                  </span>

                  <span className="font-mono text-[8px] text-[var(--secondary-text)]">
                    {event.timestamp}
                  </span>
                </div>

                <div className="mt-1 text-[7px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  {event.category}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}