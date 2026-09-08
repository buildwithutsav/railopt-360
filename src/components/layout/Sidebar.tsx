"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  CalendarClock,
  FlaskConical,
  LayoutDashboard,
  Radar,
  Settings,
  Users,
  Wrench,
} from "lucide-react";
import { navSections, settingsNavItem, type NavItem } from "@/config/navigation";
import { SectionLabel } from "@/components/shared/SectionLabel";

const icons: Record<NavItem["icon"], LucideIcon> = {
  layoutDashboard: LayoutDashboard,
  wrench: Wrench,
  radar: Radar,
  calendarClock: CalendarClock,
  flaskConical: FlaskConical,
  users: Users,
  activity: Activity,
  barChart3: BarChart3,
  settings: Settings,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[232px] shrink-0 flex-col border-r border-border bg-panel">
      <div className="border-b border-border px-3 py-3">
        <p className="text-[15px] font-semibold tracking-[0.04em] text-primary-text">
          RAILOPT 360
        </p>
        <p className="mt-0.5 text-[11px] leading-4 text-secondary-text">
          Integrated Maintenance Planning
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {navSections.map((section) => (
          <div key={section.id} className="mb-3">
            <SectionLabel>{section.label}</SectionLabel>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.href}>
                  <NavLink item={item} pathname={pathname} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border px-2 py-3">
        <SectionLabel>System Status</SectionLabel>
        <div className="mb-2 rounded-panel border border-border bg-background px-2 py-2">
          <p className="flex items-center gap-1.5 text-[12px] text-primary-text">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-green" />
            Prototype client
          </p>
          <p className="mt-1 font-mono text-[10px] leading-4 text-secondary-text">
            DATA: LOCAL MOCK
          </p>
          <p className="font-mono text-[10px] leading-4 text-secondary-text">
            API: NOT CONNECTED
          </p>
        </div>
        <NavLink item={settingsNavItem} pathname={pathname} />
      </div>
    </aside>
  );
}

function NavLink({
  item,
  pathname,
}: {
  item: NavItem;
  pathname: string;
}) {
  const Icon = icons[item.icon];
  const active = pathname === item.href;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-2 rounded-panel px-2 py-1.5 text-[13px] ${
        active
          ? "bg-planning-blue/15 text-primary-text"
          : "text-secondary-text hover:bg-panel-hover hover:text-primary-text"
      }`}
    >
      <Icon
        size={15}
        aria-hidden
        className={active ? "text-planning-blue" : "opacity-80"}
        strokeWidth={1.75}
      />
      <span>{item.label}</span>
    </Link>
  );
}
