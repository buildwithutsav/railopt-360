import type { Department, MaintenancePriority, TaskStatus } from "@/types/railway";

type BadgeTone = "planning" | "maintenance" | "success" | "critical" | "signal" | "neutral";

const toneClass: Record<BadgeTone, string> = {
  planning:
    "border-planning-blue/40 bg-planning-blue/10 text-planning-blue",
  maintenance:
    "border-maintenance-amber/40 bg-maintenance-amber/10 text-maintenance-amber",
  success: "border-success-green/40 bg-success-green/10 text-success-green",
  critical: "border-critical-red/40 bg-critical-red/10 text-critical-red",
  signal: "border-signal-violet/40 bg-signal-violet/10 text-signal-violet",
  neutral: "border-border bg-panel-hover text-secondary-text",
};

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function StatusBadge({ label, tone = "neutral" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-panel border px-1.5 py-0.5 font-mono text-[10px] font-medium tracking-wide ${toneClass[tone]}`}
    >
      {label}
    </span>
  );
}

export function departmentTone(department: Department): BadgeTone {
  if (department === "ENGINEERING") return "maintenance";
  if (department === "TRACTION") return "planning";
  return "signal";
}

export function priorityTone(priority: MaintenancePriority): BadgeTone {
  if (priority === "CRITICAL") return "critical";
  if (priority === "HIGH") return "maintenance";
  if (priority === "MEDIUM") return "planning";
  return "neutral";
}

export function taskStatusTone(status: TaskStatus): BadgeTone {
  if (status === "APPROVED" || status === "COMPLETED") return "success";
  if (status === "IN_PROGRESS" || status === "SCHEDULED") return "planning";
  if (status === "PENDING") return "maintenance";
  return "neutral";
}
