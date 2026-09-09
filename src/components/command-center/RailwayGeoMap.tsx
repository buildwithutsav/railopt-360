"use client";

import {
  CircleMarker,
  MapContainer,
  Popup,
  Polyline,
  TileLayer,
} from "react-leaflet";

type LatLng = [number, number];

const stations = [
  {
    code: "UDR",
    name: "Udaipur City",
    position: [24.5685, 73.6995] as LatLng,
  },
  {
    code: "RPN",
    name: "Rana Pratap Nagar",
    position: [24.5857, 73.7213] as LatLng,
  },
  {
    code: "DBR",
    name: "Debari",
    position: [24.6305, 73.803] as LatLng,
  },
  {
    code: "MVJ",
    name: "Mavli Junction",
    position: [24.786, 73.981] as LatLng,
  },
];

/*
 Prototype visualization coordinates.
 Maintenance positions are illustrative and correspond
 to the synthetic RAILOPT corridor dataset.
*/
const maintenanceTasks = [
  {
    id: "ENG-024",
    department: "Engineering",
    work: "Rail Defect Inspection",
    priority: "CRITICAL",
    score: 83,
    duration: 60,
    km: 12.4,
    position: [24.604, 73.755] as LatLng,
    color: "#ef4444",
  },
  {
    id: "OHE-011",
    department: "Traction",
    work: "Contact Wire Inspection",
    priority: "HIGH",
    score: 67,
    duration: 45,
    km: 13.1,
    position: [24.608, 73.762] as LatLng,
    color: "#f97316",
  },
  {
    id: "SNT-018",
    department: "S&T",
    work: "Signal Equipment Test",
    priority: "HIGH",
    score: 65,
    duration: 30,
    km: 13.8,
    position: [24.612, 73.769] as LatLng,
    color: "#f97316",
  },
  {
    id: "ENG-031",
    department: "Engineering",
    work: "Track Geometry Check",
    priority: "MEDIUM",
    score: 44,
    duration: 45,
    km: 26.2,
    position: [24.692, 73.875] as LatLng,
    color: "#eab308",
  },
];

const railwayRoute: LatLng[] = [
  [24.5685, 73.6995],
  [24.5857, 73.7213],
  [24.604, 73.755],
  [24.612, 73.769],
  [24.6305, 73.803],
  [24.692, 73.875],
  [24.786, 73.981],
];

const proposedBlock: LatLng[] = [
  [24.5857, 73.7213],
  [24.604, 73.755],
  [24.612, 73.769],
  [24.6305, 73.803],
];

export default function RailwayGeoMap() {
  return (
    <div className="relative h-[520px] w-full overflow-hidden rounded-xl border border-slate-800">
      <MapContainer
        center={[24.67, 73.84]}
        zoom={10}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Full corridor */}
        <Polyline
          positions={railwayRoute}
          pathOptions={{
            color: "#38bdf8",
            weight: 4,
            opacity: 0.75,
          }}
        />

        {/* Proposed maintenance block */}
        <Polyline
          positions={proposedBlock}
          pathOptions={{
            color: "#22c55e",
            weight: 9,
            opacity: 0.8,
          }}
        >
          <Popup>
            <div>
              <strong>BLK-2026-042</strong>
              <br />
              RPN → DBR
              <br />
              14:10 – 16:10
              <br />
              120 minutes
              <br />
              3 coordinated tasks
            </div>
          </Popup>
        </Polyline>

        {/* Stations */}
        {stations.map((station) => (
          <CircleMarker
            key={station.code}
            center={station.position}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#0ea5e9",
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <div>
                <strong>{station.code}</strong>
                <br />
                {station.name}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Maintenance tasks */}
        {maintenanceTasks.map((task) => (
          <CircleMarker
            key={task.id}
            center={task.position}
            radius={10}
            pathOptions={{
              color: "#ffffff",
              fillColor: task.color,
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Popup>
              <div style={{ minWidth: "180px" }}>
                <strong>{task.id}</strong>
                <br />
                {task.work}
                <hr />
                Department: {task.department}
                <br />
                Priority: {task.priority} ({task.score})
                <br />
                Location: km {task.km}
                <br />
                Duration: {task.duration} min
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Map legend */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-[1000] rounded-lg border border-slate-700 bg-slate-950/90 px-4 py-3 shadow-xl backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
          Corridor Legend
        </p>

        <div className="space-y-1 text-xs text-slate-300">
          <div>🔵 Railway Station</div>
          <div>🔴 Critical Maintenance</div>
          <div>🟠 High Priority</div>
          <div>🟡 Medium Priority</div>
          <div>🟢 Proposed Integrated Block</div>
        </div>
      </div>

      {/* Prototype label */}
      <div className="pointer-events-none absolute right-4 top-4 z-[1000] rounded-lg border border-blue-500/30 bg-slate-950/90 px-3 py-2 text-xs text-blue-300 backdrop-blur">
        SIMULATION / PROTOTYPE DATA
      </div>
    </div>
  );
}