"use client";

import { useState } from "react";
import {
  blockWindows,
  candidatePlans,
  constraintResults,
  maintenanceTasks,
} from "@/data/mock-data";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  GitCompareArrows,
  Info,
  Play,
  ShieldCheck,
  TrainFront,
  Wrench,
  X,
} from "lucide-react";

function priorityClass(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return "text-[var(--critical-red)]";
    case "HIGH":
      return "text-[var(--maintenance-amber)]";
    case "MEDIUM":
      return "text-[var(--planning-blue)]";
    default:
      return "text-[var(--secondary-text)]";
  }
}

function dueLabel(offset: number) {
  if (offset === 0) return "TODAY";
  if (offset === 1) return "+1 DAY";
  return `+${offset} DAYS`;
}

export function PlanningWorkspace() {
  const [selectedPlanId, setSelectedPlanId] = useState("PLAN-A");
  const [showBasis, setShowBasis] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const selectedPlan =
    candidatePlans.find((plan) => plan.id === selectedPlanId) ??
    candidatePlans[0];

  const selectedBlock = blockWindows.find(
    (block) => block.id === selectedPlan.blockWindowId,
  );

  const selectedTasks = maintenanceTasks.filter((task) =>
    selectedPlan.includedTaskIds.includes(task.id),
  );

  const selectedConstraints = constraintResults.filter(
    (constraint) => constraint.planId === "PLAN-A",
  );

  return (
    <>
      <section className="mt-6 grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        {/* Recommended plan */}
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary-text)]">
                Planning Recommendation
              </p>

              <h2 className="mt-1 text-sm font-semibold text-[var(--primary-text)]">
                Recommended Maintenance Block
              </h2>
            </div>

            <span className="rounded border border-[var(--maintenance-amber)]/40 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--maintenance-amber)]">
              Proposed
            </span>
          </div>

          <div className="px-5 py-5">
            <div className="grid gap-5 md:grid-cols-4">
              <div>
                <div className="text-[8px] uppercase tracking-[0.13em] text-[var(--secondary-text)]">
                  Block ID
                </div>
                <div className="mt-1 font-mono text-sm font-semibold text-[var(--primary-text)]">
                  {selectedBlock?.id}
                </div>
              </div>

              <div>
                <div className="text-[8px] uppercase tracking-[0.13em] text-[var(--secondary-text)]">
                  Section
                </div>
                <div className="mt-1 font-mono text-[11px] text-[var(--primary-text)]">
                  S2 · RPN → DBR
                </div>
              </div>

              <div>
                <div className="text-[8px] uppercase tracking-[0.13em] text-[var(--secondary-text)]">
                  Window
                </div>
                <div className="mt-1 font-mono text-[11px] text-[var(--primary-text)]">
                  {selectedBlock?.startTime}–{selectedBlock?.endTime}
                </div>
              </div>

              <div>
                <div className="text-[8px] uppercase tracking-[0.13em] text-[var(--secondary-text)]">
                  Duration
                </div>
                <div className="mt-1 font-mono text-[11px] text-[var(--primary-text)]">
                  {selectedBlock?.durationMinutes} MIN
                </div>
              </div>
            </div>

            {/* Included maintenance */}
            <div className="mt-5 border-t border-[var(--border)] pt-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--secondary-text)]">
                  Included Maintenance
                </span>

                <span className="font-mono text-[9px] text-[var(--secondary-text)]">
                  {selectedTasks.length} TASKS
                </span>
              </div>

              <div className="grid gap-2 md:grid-cols-2">
                {selectedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded border border-[var(--border)] bg-[var(--background)] px-3 py-2"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <Wrench
                        size={12}
                        className={priorityClass(task.priority)}
                      />

                      <div className="min-w-0">
                        <div className="font-mono text-[9px] font-semibold text-[var(--primary-text)]">
                          {task.id}
                        </div>

                        <div className="truncate text-[9px] text-[var(--secondary-text)]">
                          {task.maintenanceType}
                        </div>
                      </div>
                    </div>

                    <span
                      className={`ml-3 text-[8px] font-semibold ${priorityClass(
                        task.priority,
                      )}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact */}
            <div className="mt-5 grid grid-cols-3 overflow-hidden rounded border border-[var(--border)]">
              <div className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <TrainFront
                    size={12}
                    className="text-[var(--secondary-text)]"
                  />
                  <span className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                    Trains Affected
                  </span>
                </div>

                <div className="mt-2 font-mono text-lg text-[var(--primary-text)]">
                  {selectedPlan.affectedTrains}
                </div>

                <span className="text-[7px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  Simulation
                </span>
              </div>

              <div className="border-x border-[var(--border)] px-3 py-3">
                <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  Block Utilisation
                </div>

                <div className="mt-2 font-mono text-lg text-[var(--primary-text)]">
                  {selectedPlan.utilisationPercent}%
                </div>

                <span className="text-[7px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  Simulation
                </span>
              </div>

              <div className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck
                    size={12}
                    className="text-[var(--success-green)]"
                  />

                  <span className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                    Constraints
                  </span>
                </div>

                <div className="mt-2 font-mono text-[11px] font-semibold text-[var(--success-green)]">
                  FEASIBLE
                </div>

                <span className="text-[7px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  Prototype checks
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => setShowBasis(true)}
                className="flex items-center gap-2 rounded border border-[var(--planning-blue)] px-3 py-2 text-[9px] font-semibold text-[var(--planning-blue)] transition hover:bg-[var(--planning-blue)]/10"
              >
                <Info size={12} />
                WHY THIS PLAN
              </button>

              <button
                onClick={() => setShowAlternatives(true)}
                className="flex items-center gap-2 rounded border border-[var(--border)] px-3 py-2 text-[9px] font-semibold text-[var(--primary-text)] transition hover:bg-[var(--panel-hover)]"
              >
                <GitCompareArrows size={12} />
                ALTERNATIVES
              </button>

              <a
                href="/simulation"
                className="flex items-center gap-2 rounded border border-[var(--border)] px-3 py-2 text-[9px] font-semibold text-[var(--primary-text)] transition hover:bg-[var(--panel-hover)]"
              >
                <Play size={12} />
                SIMULATE
              </a>

              <a
                href="/block-planner"
                className="ml-auto flex items-center gap-2 rounded bg-[var(--planning-blue)] px-3 py-2 text-[9px] font-semibold text-white transition hover:opacity-90"
              >
                REVIEW PLAN
                <ArrowRight size={12} />
              </a>
            </div>
          </div>
        </div>

        {/* Maintenance queue */}
        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
          <div className="border-b border-[var(--border)] px-4 py-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary-text)]">
              Maintenance Attention
            </p>

            <h2 className="mt-1 text-sm font-semibold text-[var(--primary-text)]">
              Priority Queue
            </h2>
          </div>

          <div>
            {[...maintenanceTasks]
              .sort((a, b) => {
                const rank = {
                  CRITICAL: 0,
                  HIGH: 1,
                  MEDIUM: 2,
                  LOW: 3,
                };

                return rank[a.priority] - rank[b.priority];
              })
              .map((task) => (
                <a
                  href="/maintenance"
                  key={task.id}
                  className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 last:border-b-0 hover:bg-[var(--panel-hover)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`h-2 w-2 rounded-full ${priorityClass(
                        task.priority,
                      )}`}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-semibold text-[var(--primary-text)]">
                          {task.id}
                        </span>

                        <span
                          className={`text-[7px] font-semibold ${priorityClass(
                            task.priority,
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>

                      <div className="mt-1 truncate text-[9px] text-[var(--secondary-text)]">
                        {task.maintenanceType}
                      </div>
                    </div>
                  </div>

                  <div className="ml-3 flex items-center gap-2">
                    <span className="font-mono text-[8px] text-[var(--secondary-text)]">
                      {dueLabel(task.dueOffsetDays)}
                    </span>

                    <ChevronRight
                      size={12}
                      className="text-[var(--secondary-text)]"
                    />
                  </div>
                </a>
              ))}
          </div>
        </div>
      </section>

      {/* Why this plan drawer */}
      {showBasis && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
          <div className="h-full w-full max-w-md border-l border-[var(--border)] bg-[var(--background)] p-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--secondary-text)]">
                  Decision Support
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[var(--primary-text)]">
                  Why this plan?
                </h2>
              </div>

              <button
                onClick={() => setShowBasis(false)}
                className="rounded border border-[var(--border)] p-2 text-[var(--secondary-text)] hover:text-[var(--primary-text)]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="rounded border border-[var(--border)] p-3">
                <div className="font-mono text-xl text-[var(--primary-text)]">
                  12
                </div>
                <div className="mt-1 text-[8px] uppercase text-[var(--secondary-text)]">
                  Evaluated
                </div>
              </div>

              <div className="rounded border border-[var(--border)] p-3">
                <div className="font-mono text-xl text-[var(--success-green)]">
                  4
                </div>
                <div className="mt-1 text-[8px] uppercase text-[var(--secondary-text)]">
                  Feasible
                </div>
              </div>

              <div className="rounded border border-[var(--border)] p-3">
                <div className="font-mono text-xl text-[var(--critical-red)]">
                  8
                </div>
                <div className="mt-1 text-[8px] uppercase text-[var(--secondary-text)]">
                  Rejected
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--secondary-text)]">
                Recommendation Basis
              </h3>

              <div className="mt-3 space-y-3">
                {[
                  "Same maintenance section",
                  "Compatible maintenance window",
                  "Required resources available",
                  "No dependency violation",
                  "Prototype safety constraints satisfied",
                  "Lower simulated train impact",
                  "Critical Engineering task included",
                ].map((reason) => (
                  <div
                    key={reason}
                    className="flex items-start gap-2 text-[10px] text-[var(--primary-text)]"
                  >
                    <CheckCircle2
                      size={13}
                      className="mt-0.5 shrink-0 text-[var(--success-green)]"
                    />
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-7">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--secondary-text)]">
                Constraint Validation
              </h3>

              <div className="mt-3 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                {selectedConstraints.map((constraint) => (
                  <div
                    key={constraint.id}
                    className="flex items-center justify-between py-3"
                  >
                    <span className="text-[10px] text-[var(--primary-text)]">
                      {constraint.label}
                    </span>

                    <span
                      className={`font-mono text-[8px] font-semibold ${
                        constraint.status === "PASS"
                          ? "text-[var(--success-green)]"
                          : "text-[var(--maintenance-amber)]"
                      }`}
                    >
                      {constraint.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded border border-[var(--maintenance-amber)]/30 bg-[var(--maintenance-amber)]/5 p-3 text-[9px] leading-relaxed text-[var(--secondary-text)]">
              Prototype decision-support output. Operational execution requires
              authorized railway planner validation and applicable safety
              procedures.
            </div>
          </div>
        </div>
      )}

      {/* Alternative plans modal */}
      {showAlternatives && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6">
          <div className="w-full max-w-4xl overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--background)] shadow-2xl">
            <div className="flex items-start justify-between border-b border-[var(--border)] px-5 py-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--secondary-text)]">
                  Simulation Comparison
                </p>

                <h2 className="mt-1 text-lg font-semibold text-[var(--primary-text)]">
                  Candidate Block Plans
                </h2>
              </div>

              <button
                onClick={() => setShowAlternatives(false)}
                className="rounded border border-[var(--border)] p-2 text-[var(--secondary-text)]"
              >
                <X size={15} />
              </button>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-3">
              {candidatePlans.map((plan) => {
                const block = blockWindows.find(
                  (item) => item.id === plan.blockWindowId,
                );

                const selected = selectedPlanId === plan.id;

                return (
                  <button
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`text-left rounded-lg border p-4 transition ${
                      selected
                        ? "border-[var(--planning-blue)] bg-[var(--planning-blue)]/5"
                        : "border-[var(--border)] hover:bg-[var(--panel)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] font-semibold text-[var(--planning-blue)]">
                        {plan.id}
                      </span>

                      {selected && (
                        <CheckCircle2
                          size={14}
                          className="text-[var(--success-green)]"
                        />
                      )}
                    </div>

                    <h3 className="mt-2 text-sm font-semibold text-[var(--primary-text)]">
                      {plan.name}
                    </h3>

                    <div className="mt-4 space-y-2 text-[9px]">
                      <div className="flex justify-between">
                        <span className="text-[var(--secondary-text)]">
                          Window
                        </span>
                        <span className="font-mono text-[var(--primary-text)]">
                          {block?.startTime}–{block?.endTime}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[var(--secondary-text)]">
                          Duration
                        </span>
                        <span className="font-mono text-[var(--primary-text)]">
                          {block?.durationMinutes} min
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[var(--secondary-text)]">
                          Tasks
                        </span>
                        <span className="font-mono text-[var(--primary-text)]">
                          {plan.includedTaskIds.length}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[var(--secondary-text)]">
                          Trains affected
                        </span>
                        <span className="font-mono text-[var(--primary-text)]">
                          {plan.affectedTrains}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-[var(--secondary-text)]">
                          Utilisation
                        </span>
                        <span className="font-mono text-[var(--primary-text)]">
                          {plan.utilisationPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 text-[7px] font-semibold uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                      Simulation metrics
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4">
              <span className="text-[9px] text-[var(--secondary-text)]">
                Selecting a plan updates the Command Center recommendation for
                this session.
              </span>

              <button
                onClick={() => setShowAlternatives(false)}
                className="rounded bg-[var(--planning-blue)] px-4 py-2 text-[9px] font-semibold text-white"
              >
                USE SELECTED PLAN
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}