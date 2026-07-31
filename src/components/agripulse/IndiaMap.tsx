import { useEffect, useMemo, useState } from "react";
import { StateGlut, GlutLevel } from "./types";

/** Real state boundaries fetched at runtime; simplified polygons as offline fallback. */
const GEOJSON_URL = "https://cdn.jsdelivr.net/npm/india-geojson@1.0.0/state_boundary.geojson";

const LON_MIN = 68, LON_MAX = 97, LAT_MIN = 8, LAT_MAX = 37.5;

function project(lon: number, lat: number, w: number, h: number): [number, number] {
  const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * w;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * h;
  return [x, y];
}

// Simplified lon/lat polygons for major states (fallback + always available legend targets)
const FALLBACK: Record<string, number[][][]> = {
  "Punjab": [[[73.9, 29.8], [76.9, 29.8], [76.5, 32.5], [73.9, 32.3]]],
  "Haryana": [[[74.5, 27.7], [77.8, 27.7], [77.2, 30.9], [74.5, 30.7]]],
  "Rajasthan": [[[69.5, 23.5], [78.2, 23.7], [77.5, 30.2], [69.6, 29.4]]],
  "Uttar Pradesh": [[[77.1, 24.0], [84.6, 24.2], [84.0, 30.4], [77.2, 29.8]]],
  "Bihar": [[[83.3, 24.4], [88.3, 24.6], [87.9, 27.5], [83.4, 27.2]]],
  "West Bengal": [[[85.8, 21.6], [89.6, 21.8], [89.4, 27.0], [86.0, 26.8]]],
  "Gujarat": [[[68.1, 20.1], [74.4, 20.5], [74.2, 24.7], [68.4, 23.9]]],
  "Madhya Pradesh": [[[74.0, 21.2], [82.5, 21.4], [82.2, 26.9], [74.2, 26.5]]],
  "Maharashtra": [[[72.6, 15.6], [80.9, 15.9], [80.6, 21.8], [72.8, 21.5]]],
  "Chhattisgarh": [[[80.2, 17.8], [84.0, 18.0], [83.8, 23.9], [80.4, 23.6]]],
  "Odisha": [[[81.9, 17.8], [87.5, 18.2], [87.2, 22.5], [82.1, 22.2]]],
  "Telangana": [[[77.1, 15.8], [81.0, 16.0], [80.8, 19.9], [77.3, 19.7]]],
  "Andhra Pradesh": [[[76.8, 12.6], [84.7, 12.8], [84.4, 19.6], [77.0, 19.2]]],
  "Karnataka": [[[74.1, 11.6], [78.5, 11.9], [78.3, 18.3], [74.3, 18.0]]],
  "Tamil Nadu": [[[76.2, 8.0], [80.3, 8.2], [80.0, 13.6], [76.4, 13.3]]],
  "Kerala": [[[74.9, 8.3], [77.4, 8.5], [77.2, 12.8], [75.1, 12.6]]],
  "Assam": [[[89.7, 24.2], [96.5, 24.4], [96.1, 28.0], [89.9, 27.8]]],
  "Jharkhand": [[[83.4, 21.9], [87.9, 22.1], [87.5, 25.4], [83.6, 25.1]]],
};

const LEVEL_COLORS: Record<GlutLevel, string> = {
  critical: "#EF4444",
  high: "#F59E0B",
  normal: "#10B981",
  deficit: "#3B82F6",
};

export const LEVEL_LABELS: Record<GlutLevel, { labelKey: string; color: string }> = {
  critical: { labelKey: "glut.critical", color: "#EF4444" },
  high: { labelKey: "glut.high", color: "#F59E0B" },
  normal: { labelKey: "glut.normal", color: "#10B981" },
  deficit: { labelKey: "glut.deficit", color: "#3B82F6" },
};

interface Feature {
  id: string;
  name: string;
  polygons: number[][][]; // lon/lat rings
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, "");
}

export default function IndiaMap({
  data,
  selected,
  onSelect,
  width = 620,
  height = 700,
}: {
  data: StateGlut[];
  selected?: string | null;
  onSelect: (state: string) => void;
  width?: number;
  height?: number;
}) {
  const [geojson, setGeojson] = useState<Feature[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(GEOJSON_URL)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (!alive || !json?.features) return;
        const feats: Feature[] = json.features
          .map((f: any, i: number) => {
            const name = f.properties?.state_name || f.properties?.name || f.properties?.ST_NM || f.properties?.NAME_1 || "";
            const polys = f.geometry?.type === "Polygon" ? [f.geometry.coordinates] : f.geometry?.coordinates || [];
            return { id: `${i}-${norm(name)}`, name: String(name), polygons: polys };
          })
          .filter((f: Feature) => f.name && f.polygons.length > 0);
        setGeojson(feats);
      })
      .catch(() => setGeojson(null));
    return () => {
      alive = false;
    };
  }, []);

  const features: Feature[] = useMemo(() => {
    if (geojson && geojson.length > 0) return geojson;
    return Object.entries(FALLBACK).map(([name, polys]) => ({ id: `fb-${norm(name)}`, name, polygons: polys }));
  }, [geojson]);

  const levelFor = (name: string): GlutLevel => {
    const d = data.find((s) => norm(s.state) === norm(name));
    return d?.level ?? "normal";
  };

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto select-none" role="img" aria-label="India regional surplus map">
        {/* Ocean background */}
        <rect x={0} y={0} width={width} height={height} rx={16} fill="rgba(10, 14, 24, 0.6)" />
        {features.map((f) => {
          const level = levelFor(f.name);
          const color = LEVEL_COLORS[level];
          const isSel = selected && norm(selected) === norm(f.name);
          const critical = level === "critical" || level === "high";
          return (
            <g
              key={f.id}
              onClick={() => onSelect(f.name)}
              className="cursor-pointer transition-opacity hover:opacity-90"
              role="button"
              aria-label={`${f.name} — ${level} surplus`}
            >
              {f.polygons.map((ring, ri) => {
                const path = ring
                  .map((pt, i) => `${i === 0 ? "M" : "L"}${project(pt[0], pt[1], width, height).map((n) => n.toFixed(1)).join(" ")}`)
                  .join(" ") + " Z";
                return (
                  <path
                    key={ri}
                    d={path}
                    fill={color}
                    fillOpacity={isSel ? 0.95 : 0.55}
                    stroke={isSel ? "#ffffff" : "rgba(255,255,255,0.35)"}
                    strokeWidth={isSel ? 1.6 : 0.7}
                  />
                );
              })}
              {/* Pulsing alert dot on critical/high states */}
              {critical && (
                <g>
                  <circle className="map-pulse-dot" cx={project(74.5, 20, width, height)[0]} cy={project(74.5, 20, width, height)[1]} r={6} fill={color} fillOpacity={0.5} />
                  <circle cx={project(74.5, 20, width, height)[0]} cy={project(74.5, 20, width, height)[1]} r={5} fill={color} />
                </g>
              )}
              {/* State label */}
              <text
                x={project(74.5, 20, width, height)[0]}
                y={project(74.5, 20, width, height)[1] + 3}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill="#e5e7eb"
                style={{ pointerEvents: "none" }}
              >
                {f.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="mt-2 text-center text-[9px] text-gray-600">
        {geojson ? "Real state boundaries — Source: india-geojson (live fetch)" : "Simplified boundaries (offline fallback)"}
      </p>
    </div>
  );
}
