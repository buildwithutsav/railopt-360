export interface ModuleCopy {
  title: string;
  subtitle: string;
}

export const moduleCopy = {
  dashboard: {
    title: "Command Center",
    subtitle:
      "Operational overview for maintenance block planning on the UDR–MVJ corridor.",
  },
  maintenance: {
    title: "Maintenance Hub",
    subtitle:
      "Engineering, Traction, and S&T work backlog awaiting block assignment.",
  },
  opportunityRadar: {
    title: "Opportunity Radar",
    subtitle:
      "Identify feasible possession windows against traffic and resource constraints.",
  },
  blockPlanner: {
    title: "Block Planner",
    subtitle:
      "Compose and review candidate maintenance blocks before simulation.",
  },
  simulation: {
    title: "Simulation Lab",
    subtitle:
      "Evaluate candidate plans. Outputs here will be simulation values, not live IR results.",
  },
  resources: {
    title: "Resources",
    subtitle:
      "Track teams, OHE gangs, S&T parties, and inspection vehicles for the corridor.",
  },
  execution: {
    title: "Execution Monitoring",
    subtitle:
      "Monitor approved blocks and field progress once a plan is released.",
  },
  analytics: {
    title: "Analytics & Benchmarking",
    subtitle:
      "Compare planned versus executed blocks after the planning cycle is complete.",
  },
  settings: {
    title: "Settings",
    subtitle:
      "Workspace preferences for the RAILOPT 360 planning client. No authentication yet.",
  },
} as const satisfies Record<string, ModuleCopy>;
