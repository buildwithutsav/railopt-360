import {
  blockWindows,
  maintenanceTasks,
  railwaySections,
  stations,
  trainPositions,
  trains,
} from "@/data/mock-data";
import { TrainFront, Wrench } from "lucide-react";

const CORRIDOR_LENGTH = 42;

function positionFromKm(km: number) {
  return `${(km / CORRIDOR_LENGTH) * 100}%`;
}

function getTrain(trainId: string) {
  return trains.find((train) => train.id === trainId);
}

function priorityClass(priority: string) {
  if (priority === "CRITICAL") {
    return "border-[var(--critical-red)] text-[var(--critical-red)]";
  }

  if (priority === "HIGH") {
    return "border-[var(--maintenance-amber)] text-[var(--maintenance-amber)]";
  }

  return "border-[var(--border)] text-[var(--secondary-text)]";
}

export function CorridorOperations() {
  const proposedBlock = blockWindows.find(
    (block) => block.id === "BLK-2026-042",
  );

  const blockSection = railwaySections.find(
    (section) => section.id === proposedBlock?.sectionId,
  );

  const blockLeft = blockSection
    ? (blockSection.startKm / CORRIDOR_LENGTH) * 100
    : 0;

  const blockWidth = blockSection
    ? ((blockSection.endKm - blockSection.startKm) / CORRIDOR_LENGTH) * 100
    : 0;

  return (
    <section className="mt-6">
      <div className="mb-3 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--secondary-text)]">
            Corridor Operations
          </p>

          <h2 className="mt-1 text-sm font-semibold text-[var(--primary-text)]">
            Udaipur City – Mavli Junction
          </h2>
        </div>

        <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
          <span>42 KM</span>
          <span>3 Sections</span>
          <span>Simulation View</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--panel)]">
        {/* Section header */}
        <div className="grid grid-cols-[120px_1fr] border-b border-[var(--border)]">
          <div className="border-r border-[var(--border)] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--secondary-text)]">
            Corridor
          </div>

          <div className="relative h-12">
            {railwaySections.map((section) => {
              const left = (section.startKm / CORRIDOR_LENGTH) * 100;
              const width =
                ((section.endKm - section.startKm) / CORRIDOR_LENGTH) * 100;

              return (
                <div
                  key={section.id}
                  className="absolute top-0 flex h-full items-center justify-center border-r border-[var(--border)]"
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                >
                  <div className="text-center">
                    <div className="font-mono text-[10px] font-semibold text-[var(--primary-text)]">
                      {section.code}
                    </div>

                    <div className="mt-0.5 text-[8px] text-[var(--secondary-text)]">
                      KM {section.startKm}–{section.endKm}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main corridor schematic */}
        <div className="grid grid-cols-[120px_1fr]">
          <div className="border-r border-[var(--border)]">
            <div className="flex h-16 items-center border-b border-[var(--border)] px-4">
              <div>
                <div className="text-[10px] font-semibold text-[var(--primary-text)]">
                  DOWN LINE
                </div>
                <div className="mt-1 text-[8px] text-[var(--secondary-text)]">
                  UDR → MVJ
                </div>
              </div>
            </div>

            <div className="flex h-16 items-center border-b border-[var(--border)] px-4">
              <div>
                <div className="text-[10px] font-semibold text-[var(--primary-text)]">
                  UP LINE
                </div>
                <div className="mt-1 text-[8px] text-[var(--secondary-text)]">
                  MVJ → UDR
                </div>
              </div>
            </div>

            <div className="flex h-24 items-center px-4">
              <div>
                <div className="text-[10px] font-semibold text-[var(--primary-text)]">
                  MAINTENANCE
                </div>
                <div className="mt-1 text-[8px] text-[var(--secondary-text)]">
                  Work locations
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Proposed block */}
            {proposedBlock && (
              <div
                className="pointer-events-none absolute top-0 z-0 h-full border-x border-[var(--planning-blue)] bg-[var(--planning-blue)]/5"
                style={{
                  left: `${blockLeft}%`,
                  width: `${blockWidth}%`,
                }}
              >
                <div className="absolute right-1 top-1 rounded border border-[var(--planning-blue)]/40 bg-[var(--panel)] px-1.5 py-0.5 font-mono text-[8px] text-[var(--planning-blue)]">
                  {proposedBlock.id}
                </div>
              </div>
            )}

            {/* DOWN track */}
            <div className="relative h-16 border-b border-[var(--border)]">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border)]" />

              {trainPositions
                .filter((position) => position.direction === "DOWN")
                .map((position) => {
                  const train = getTrain(position.trainId);

                  return (
                    <div
                      key={position.trainId}
                      className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: positionFromKm(position.km) }}
                    >
                      <div className="flex items-center gap-1 rounded border border-[var(--planning-blue)] bg-[var(--panel)] px-2 py-1">
                        <TrainFront
                          size={11}
                          className="text-[var(--planning-blue)]"
                        />

                        <span className="font-mono text-[9px] text-[var(--primary-text)]">
                          {train?.number}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* UP track */}
            <div className="relative h-16 border-b border-[var(--border)]">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border)]" />

              {trainPositions
                .filter((position) => position.direction === "UP")
                .map((position) => {
                  const train = getTrain(position.trainId);

                  return (
                    <div
                      key={position.trainId}
                      className="absolute top-1/2 z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: positionFromKm(position.km) }}
                    >
                      <div className="flex items-center gap-1 rounded border border-[var(--signal-violet)] bg-[var(--panel)] px-2 py-1">
                        <TrainFront
                          size={11}
                          className="text-[var(--signal-violet)]"
                        />

                        <span className="font-mono text-[9px] text-[var(--primary-text)]">
                          {train?.number}
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Maintenance row */}
            <div className="relative h-24">
              <div className="absolute left-0 right-0 top-1/2 h-px bg-[var(--border)]" />

              {maintenanceTasks.map((task, index) => (
                <div
                  key={task.id}
                  className="absolute z-20 -translate-x-1/2"
                  style={{
                    left: positionFromKm(task.km),
                    top: index % 2 === 0 ? "15px" : "49px",
                  }}
                >
                  <div
                    className={`flex items-center gap-1 whitespace-nowrap rounded border bg-[var(--panel)] px-1.5 py-1 ${priorityClass(
                      task.priority,
                    )}`}
                  >
                    <Wrench size={9} />

                    <span className="font-mono text-[8px]">{task.id}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Station markers */}
            {stations.map((station) => (
              <div
                key={station.id}
                className="pointer-events-none absolute bottom-0 top-0 z-10 border-l border-dashed border-[var(--border)]"
                style={{ left: positionFromKm(station.km) }}
              >
                <div className="absolute bottom-1 left-1 whitespace-nowrap font-mono text-[8px] text-[var(--secondary-text)]">
                  {station.code} · {station.km} KM
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block information footer */}
        {proposedBlock && (
          <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3">
            <div className="flex items-center gap-6">
              <div>
                <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  Proposed Block
                </div>
                <div className="mt-1 font-mono text-[10px] text-[var(--primary-text)]">
                  {proposedBlock.id}
                </div>
              </div>

              <div>
                <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  Section
                </div>
                <div className="mt-1 font-mono text-[10px] text-[var(--primary-text)]">
                  S2 · RPN → DBR
                </div>
              </div>

              <div>
                <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  Window
                </div>
                <div className="mt-1 font-mono text-[10px] text-[var(--primary-text)]">
                  {proposedBlock.startTime}–{proposedBlock.endTime}
                </div>
              </div>

              <div>
                <div className="text-[8px] uppercase tracking-[0.12em] text-[var(--secondary-text)]">
                  Bundled Work
                </div>
                <div className="mt-1 font-mono text-[10px] text-[var(--primary-text)]">
                  {proposedBlock.includedTaskIds.length} tasks / 3 departments
                </div>
              </div>
            </div>

            <span className="rounded border border-[var(--maintenance-amber)]/40 px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-[var(--maintenance-amber)]">
              Simulation · Proposed
            </span>
          </div>
        )}
      </div>
    </section>
  );
}