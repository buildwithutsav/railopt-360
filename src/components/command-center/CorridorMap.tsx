"use client";
import RailwayGeoMap from "./RailwayGeoMap";
import { useState } from "react";

type ViewMode = "map" | "table";

const stations = [
  { code: "UDR", name: "Udaipur City", km: 0 },
  { code: "RPN", name: "Rana Pratap Nagar", km: 7 },
  { code: "DBR", name: "Debari", km: 20 },
  { code: "MVJ", name: "Mavli Junction", km: 42 },
];

const tasks = [
  {
    id: "ENG-024",
    department: "Engineering",
    km: 12.4,
    section: "SEC-S2",
    priority: "CRITICAL",
    score: 83,
    duration: 60,
  },
  {
    id: "OHE-011",
    department: "Traction",
    km: 13.1,
    section: "SEC-S2",
    priority: "HIGH",
    score: 67,
    duration: 45,
  },
  {
    id: "SNT-018",
    department: "S&T",
    km: 13.8,
    section: "SEC-S2",
    priority: "HIGH",
    score: 65,
    duration: 30,
  },
  {
    id: "ENG-031",
    department: "Engineering",
    km: 26.2,
    section: "SEC-S3",
    priority: "MEDIUM",
    score: 44,
    duration: 45,
  },
];

const getTaskColor = (priority: string) => {
  if (priority === "CRITICAL") return "bg-red-500";
  if (priority === "HIGH") return "bg-orange-500";
  if (priority === "MEDIUM") return "bg-yellow-500";
  return "bg-blue-500";
};

const getPriorityText = (priority: string) => {
  if (priority === "CRITICAL") return "text-red-400";
  if (priority === "HIGH") return "text-orange-400";
  if (priority === "MEDIUM") return "text-yellow-400";
  return "text-blue-400";
};

export default function CorridorMap() {
  const [view, setView] = useState<ViewMode>("map");

  const minKm = 0;
  const maxKm = 42;

  const getPosition = (km: number) =>
    ((km - minKm) / (maxKm - minKm)) * 100;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5 shadow-xl">
      {/* Header */}
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-400">
            Corridor Intelligence
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Railway Corridor Planning Map
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            UDR → RPN → DBR → MVJ
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-800 bg-slate-900 p-1">
          <button
            onClick={() => setView("map")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === "map"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Map
          </button>

          <button
            onClick={() => setView("table")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === "table"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {view === "map" ? (
  <>
    <RailwayGeoMap />

    <div className="mt-4 grid gap-3 md:grid-cols-3">
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs text-slate-500">
          Opportunity detected
        </p>
        <p className="mt-1 text-lg font-semibold text-white">
          3 compatible tasks
        </p>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs text-slate-500">
          Departments
        </p>
        <p className="mt-1 text-lg font-semibold text-white">
          ENG · Traction · S&T
        </p>
      </div>

      <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
        <p className="text-xs text-green-400">
          Optimization candidate
        </p>
        <p className="mt-1 text-lg font-semibold text-white">
          SEC-S2 · RPN → DBR
        </p>
      </div>
    </div>
  </>
) : (
        /* Table View */
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left">
            <thead>
              <tr className="border-b border-slate-800 text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-3">Task</th>
                <th className="pb-3">Department</th>
                <th className="pb-3">Section</th>
                <th className="pb-3">Location</th>
                <th className="pb-3">Priority</th>
                <th className="pb-3">Duration</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((task) => (
                <tr
                  key={task.id}
                  className="border-b border-slate-900 text-sm"
                >
                  <td className="py-4 font-semibold text-white">{task.id}</td>
                  <td className="py-4 text-slate-300">{task.department}</td>
                  <td className="py-4 text-slate-300">{task.section}</td>
                  <td className="py-4 text-slate-300">km {task.km}</td>

                  <td
                    className={`py-4 font-semibold ${getPriorityText(
                      task.priority
                    )}`}
                  >
                    {task.priority} ({task.score})
                  </td>

                  <td className="py-4 text-slate-300">{task.duration} min</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}