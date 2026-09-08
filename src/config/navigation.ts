export interface NavItem {
  label: string;
  href: string;
  icon:
    | "layoutDashboard"
    | "wrench"
    | "radar"
    | "calendarClock"
    | "flaskConical"
    | "users"
    | "activity"
    | "barChart3"
    | "settings";
}

export interface NavSection {
  id: string;
  label: string;
  items: NavItem[];
}

export const navSections: NavSection[] = [
  {
    id: "command",
    label: "Command",
    items: [
      { label: "Command Center", href: "/dashboard", icon: "layoutDashboard" },
    ],
  },
  {
    id: "planning",
    label: "Planning",
    items: [
      { label: "Maintenance Hub", href: "/maintenance", icon: "wrench" },
      { label: "Opportunity Radar", href: "/opportunity-radar", icon: "radar" },
      { label: "Block Planner", href: "/block-planner", icon: "calendarClock" },
      { label: "Simulation Lab", href: "/simulation", icon: "flaskConical" },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    items: [
      { label: "Resources", href: "/resources", icon: "users" },
      { label: "Execution", href: "/execution", icon: "activity" },
    ],
  },
  {
    id: "intelligence",
    label: "Intelligence",
    items: [{ label: "Analytics", href: "/analytics", icon: "barChart3" }],
  },
];

export const settingsNavItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: "settings",
};
