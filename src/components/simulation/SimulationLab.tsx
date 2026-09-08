"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  blockWindows,
  maintenanceTasks,
  trains,
} from "@/data/mock-data";

type Scenario =
  | "NORMAL"
  | "HEAVY_TRAFFIC"
  | "RESOURCE_DELAY"
  | "EMERGENCY";

interface ScenarioConfig {
  label: string;
  description: string;
  trainImpactFactor: number;
  utilizationAdjustment: number;
  risk: "LOW" | "MEDIUM" | "HIGH";
}

const scenarioConfig: Record<Scenario, ScenarioConfig> = {
  NORMAL: {
    label: "Normal Operations",
    description:
      "Standard traffic density with expected resource availability.",
    trainImpactFactor: 1,
    utilizationAdjustment: 0,
    risk: "LOW",
  },

  HEAVY_TRAFFIC: {
    label: "Heavy Traffic",
    description:
      "Higher train density increases operational sensitivity around the block window.",
    trainImpactFactor: 1.8,
    utilizationAdjustment: -7,
    risk: "HIGH",
  },

  RESOURCE_DELAY: {
    label: "Resource Delay",
    description:
      "One maintenance team reaches the work zone later than planned.",
    trainImpactFactor: 1.25,
    utilizationAdjustment: -12,
    risk: "MEDIUM",
  },

  EMERGENCY: {
    label: "Emergency Maintenance",
    description:
      "Critical maintenance receives higher priority with greater operational disruption.",
    trainImpactFactor: 2.2,
    utilizationAdjustment: -16,
    risk: "HIGH",
  },
};

export function SimulationLab() {
  const searchParams = useSearchParams();

  const requestedBlockId =
    searchParams.get("block") ?? blockWindows[0]?.id ?? "BLK-DRAFT";

  const block =
    blockWindows.find((item) => item.id === requestedBlockId) ??
    blockWindows[0];

  const [scenario, setScenario] = useState<Scenario>("NORMAL");
  const [simulationRun, setSimulationRun] = useState(false);

  const config = scenarioConfig[scenario];

  const blockTasks = useMemo(() => {
    if (!block) return [];

    return maintenanceTasks.filter((task) =>
      block.includedTaskIds.includes(task.id),
    );
  }, [block]);

  const baseAffectedTrains = Math.min(2, trains.length);

  const affectedTrains = Math.min(
    trains.length,
    Math.max(
      1,
      Math.round(baseAffectedTrains * config.trainImpactFactor),
    ),
  );

  const baseDelayMinutes = 8;

  const estimatedDelayMinutes = Math.round(
    baseDelayMinutes * config.trainImpactFactor,
  );

  const baseUtilization = 87;

  const blockUtilization = Math.max(
    40,
    Math.min(
      100,
      baseUtilization + config.utilizationAdjustment,
    ),
  );

  const consolidatedTasks = blockTasks.length;

  const traditionalBlocks = Math.max(
    consolidatedTasks,
    1,
  );

  const optimizedBlocks = consolidatedTasks > 0 ? 1 : 0;

  const avoidedBlocks = Math.max(
    0,
    traditionalBlocks - optimizedBlocks,
  );

  return (
    <section className="space-y-5">
      {/* Simulation context */}
      <div className="flex flex-wrap items-center justify-between gap-3 border border-blue-500/20 bg-blue-500/[0.03] px-4 py-3">
        <div>
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-blue-400">
            Simulation Target
          </div>

          <div className="mt-1 text-xs text-slate-300">
            Evaluating candidate block{" "}
            <span className="font-mono font-semibold text-slate-100">
              {requestedBlockId}
            </span>
          </div>
        </div>

        <span className="border border-amber-500/30 bg-amber-500/5 px-2 py-1 font-mono text-[8px] font-semibold uppercase text-amber-400">
          Simulation Only
        </span>
      </div>

      {/* Scenario controls */}
      <div className="border border-slate-700/70 bg-slate-900/30">
        <div className="border-b border-slate-700 px-5 py-4">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Scenario Configuration
          </div>

          <h2 className="mt-1 text-sm font-semibold text-slate-200">
            What-If Simulation Lab
          </h2>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-[280px_1fr_auto]">
          <div>
            <label className="text-[8px] uppercase tracking-wider text-slate-600">
              Operating Scenario
            </label>

            <select
              value={scenario}
              onChange={(event) => {
                setScenario(event.target.value as Scenario);
                setSimulationRun(false);
              }}
              className="mt-2 w-full border border-slate-700 bg-[#0b121b] px-3 py-2.5 text-xs text-slate-300 outline-none focus:border-blue-500"
            >
              <option value="NORMAL">Normal Operations</option>
              <option value="HEAVY_TRAFFIC">Heavy Traffic</option>
              <option value="RESOURCE_DELAY">Resource Delay</option>
              <option value="EMERGENCY">Emergency Maintenance</option>
            </select>
          </div>

          <div className="border border-slate-800 bg-[#0b121b] px-4 py-3">
            <div className="text-[8px] uppercase tracking-wider text-slate-600">
              Scenario Description
            </div>

            <p className="mt-2 text-[9px] leading-relaxed text-slate-400">
              {config.description}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSimulationRun(true)}
            className="self-end bg-blue-600 px-5 py-3 text-[9px] font-semibold text-white transition hover:bg-blue-500"
          >
            RUN SIMULATION
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Metric
          label="Affected Trains"
          value={simulationRun ? String(affectedTrains) : "—"}
          note="Simulated"
        />

        <Metric
          label="Estimated Delay"
          value={
            simulationRun
              ? `${estimatedDelayMinutes} MIN`
              : "—"
          }
          note="Prototype estimate"
        />

        <Metric
          label="Block Utilization"
          value={
            simulationRun
              ? `${blockUtilization}%`
              : "—"
          }
          note="Simulated"
        />

        <Metric
          label="Tasks Consolidated"
          value={
            simulationRun
              ? String(consolidatedTasks)
              : "—"
          }
          note="Candidate block"
        />

        <Metric
          label="Scenario Risk"
          value={simulationRun ? config.risk : "—"}
          note="Simulation"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Train impact */}
        <div className="border border-slate-700/70 bg-slate-900/30">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Train Impact Intelligence
            </div>

            <div className="mt-1 text-xs text-slate-400">
              Prototype operational impact assessment
            </div>
          </div>

          {!simulationRun ? (
            <EmptySimulationState />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px]">
                <thead>
                  <tr className="border-b border-slate-800 text-left">
                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Train
                    </th>

                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Category
                    </th>

                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Interaction
                    </th>

                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Estimated Impact
                    </th>

                    <th className="px-4 py-3 text-[8px] uppercase text-slate-600">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {trains.slice(0, affectedTrains).map((train, index) => {
                    const delay = Math.max(
                      2,
                      Math.round(
                        estimatedDelayMinutes /
                          Math.max(affectedTrains, 1) +
                          index,
                      ),
                    );

                    return (
                      <tr
                        key={train.id}
                        className="border-b border-slate-800 last:border-b-0"
                      >
                        <td className="px-4 py-3 font-mono text-[9px] font-semibold text-slate-200">
                          {train.number}
                        </td>

                        <td className="px-4 py-3 text-[9px] text-slate-400">
                          {train.category}
                        </td>

                        <td className="px-4 py-3 text-[9px] text-slate-400">
                          Candidate block overlap
                        </td>

                        <td className="px-4 py-3 font-mono text-[9px] text-amber-400">
                          +{delay} min
                        </td>

                        <td className="px-4 py-3">
                          <span className="text-[8px] font-semibold text-amber-400">
                            REVIEW
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Block simulation */}
        <div className="border border-slate-700/70 bg-slate-900/30">
          <div className="border-b border-slate-700 px-5 py-4">
            <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Maintenance Block Simulation
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-3">
              <Info
                label="Block ID"
                value={block?.id ?? "BLK-DRAFT"}
              />

              <Info
                label="Window"
                value={
                  block
                    ? `${block.startTime}–${block.endTime}`
                    : "—"
                }
              />

              <Info
                label="Duration"
                value={
                  block
                    ? `${block.durationMinutes} MIN`
                    : "—"
                }
              />

              <Info
                label="Tasks"
                value={String(blockTasks.length)}
              />
            </div>

            <div className="border border-slate-800 bg-[#0b121b] p-4">
              <div className="flex items-center justify-between">
                <span className="text-[8px] uppercase tracking-wider text-slate-600">
                  Block Utilization
                </span>

                <span className="font-mono text-[10px] text-blue-400">
                  {simulationRun
                    ? `${blockUtilization}%`
                    : "NOT RUN"}
                </span>
              </div>

              <div className="mt-3 h-2 bg-slate-800">
                <div
                  className="h-full bg-blue-500 transition-all duration-500"
                  style={{
                    width: simulationRun
                      ? `${blockUtilization}%`
                      : "0%",
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {blockTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between border border-slate-800 px-3 py-2.5"
                >
                  <div>
                    <div className="font-mono text-[9px] font-semibold text-slate-200">
                      {task.id}
                    </div>

                    <div className="mt-1 text-[8px] text-slate-500">
                      {task.maintenanceType}
                    </div>
                  </div>

                  <span className="font-mono text-[8px] text-slate-500">
                    {task.estimatedDurationMinutes} MIN
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Before vs after */}
      <div className="border border-slate-700/70 bg-slate-900/30">
        <div className="border-b border-slate-700 px-5 py-4">
          <div className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Planning Comparison
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Independent maintenance planning vs consolidated candidate block
          </div>
        </div>

        <div className="grid gap-px bg-slate-800 md:grid-cols-3">
          <ComparisonColumn
            title="Independent Planning"
            primary={
              simulationRun
                ? `${traditionalBlocks} Blocks`
                : "—"
            }
            secondary="Department-wise maintenance requests"
          />

          <ComparisonColumn
            title="RAILOPT Candidate"
            primary={
              simulationRun
                ? `${optimizedBlocks} Block`
                : "—"
            }
            secondary={`${consolidatedTasks} tasks consolidated`}
            highlighted
          />

          <ComparisonColumn
            title="Planning Reduction"
            primary={
              simulationRun
                ? `${avoidedBlocks} Blocks`
                : "—"
            }
            secondary="Prototype scenario comparison"
          />
        </div>
      </div>

      {/* Recommendation */}
      {simulationRun && (
        <div
          className={`border p-5 ${
            config.risk === "HIGH"
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-emerald-500/30 bg-emerald-500/5"
          }`}
        >
          <div
            className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${
              config.risk === "HIGH"
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            Simulation Recommendation
          </div>

          <p className="mt-3 max-w-4xl text-[9px] leading-relaxed text-slate-400">
            {config.risk === "HIGH"
              ? "The candidate block remains technically useful for maintenance consolidation, but the selected scenario produces elevated operational impact. Planner review, alternative timing and train-impact mitigation should be evaluated before approval."
              : "The simulated scenario indicates that the candidate block can consolidate multiple maintenance requirements with manageable prototype operational impact. The result should proceed to human planner review and authorized safety validation."}
          </p>
        </div>
      )}

      {/* disclaimer */}
      <div className="border border-amber-500/20 bg-amber-500/[0.03] px-4 py-3">
        <p className="text-[8px] leading-relaxed text-slate-500">
          Simulation outputs are synthetic prototype values for SIH
          demonstration. They do not represent live Indian Railways
          traffic, authorized block schedules, or operational delay
          predictions.
        </p>
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="border border-slate-700/70 bg-slate-900/30 px-4 py-4">
      <div className="text-[8px] uppercase tracking-[0.14em] text-slate-600">
        {label}
      </div>

      <div className="mt-2 font-mono text-lg font-semibold text-slate-100">
        {value}
      </div>

      <div className="mt-1 text-[8px] uppercase tracking-wider text-slate-500">
        {note}
      </div>
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border border-slate-800 bg-[#0b121b] p-3">
      <div className="text-[8px] uppercase tracking-wider text-slate-600">
        {label}
      </div>

      <div className="mt-2 font-mono text-[10px] font-semibold text-slate-300">
        {value}
      </div>
    </div>
  );
}

function EmptySimulationState() {
  return (
    <div className="flex min-h-[250px] items-center justify-center p-8">
      <div className="text-center">
        <div className="font-mono text-[10px] text-slate-500">
          SIMULATION NOT STARTED
        </div>

        <p className="mt-2 max-w-sm text-[9px] leading-relaxed text-slate-600">
          Select an operating scenario and run the simulation to
          evaluate train impact and maintenance block performance.
        </p>
      </div>
    </div>
  );
}

function ComparisonColumn({
  title,
  primary,
  secondary,
  highlighted = false,
}: {
  title: string;
  primary: string;
  secondary: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`p-5 ${
        highlighted
          ? "bg-blue-500/[0.04]"
          : "bg-[#0d151f]"
      }`}
    >
      <div
        className={`text-[8px] uppercase tracking-[0.14em] ${
          highlighted
            ? "text-blue-400"
            : "text-slate-600"
        }`}
      >
        {title}
      </div>

      <div className="mt-3 font-mono text-xl font-semibold text-slate-100">
        {primary}
      </div>

      <div className="mt-2 text-[8px] text-slate-500">
        {secondary}
      </div>
    </div>
  );
}