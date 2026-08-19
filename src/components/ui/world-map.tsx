"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "motion/react";
import { gsap } from "gsap";
import DottedMap from "dotted-map";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface MapProps {
  dots?: Array<{
    start: { lat: number; lng: number; label?: string };
    end: { lat: number; lng: number; label?: string };
  }>;
  lineColor?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants — accurate geographic centres for each country
// ─────────────────────────────────────────────────────────────────────────────

const COUNTRY_COORDS: Array<{ name: string; lat: number; lng: number }> = [
  { name: "USA", lat: 25.5, lng: -105.0 },
  { name: "Canada", lat: 54.0, lng: -110.0 },
  { name: "Coloumbia", lat: -17.0, lng: -80.0 },
  { name: "Chile", lat: -65.0, lng: -76.0 },
  { name: "UK", lat: 54.0, lng: -5.0 },
  { name: "Germany", lat: 45.2, lng: 10.5 },
  { name: "France", lat: 37.0, lng: 1.0 },
  { name: "Italy", lat: 28.5, lng: 15.5 },
  { name: "Morocco", lat: 15.0, lng: -8.0 },
  { name: "China", lat: 35.0, lng: 103.0 },
  { name: "Russia", lat: 60.0, lng: 100.0 },
  { name: "Japan", lat: 30.0, lng: 150.0 },
  { name: "India", lat: 8.0, lng: 80.5 },
  { name: "South Korea", lat: 20.0, lng: 135.0 },
  { name: "UAE", lat: 5.0, lng: 50.0 },
  { name: "Australia", lat: -47.0, lng: 135.0 },
  { name: "Angola", lat: -38.0, lng: 15.0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Projection — module-level so both render and animation share it
// ─────────────────────────────────────────────────────────────────────────────

const projectPoint = (lat: number, lng: number) => ({
  x: (lng + 180) * (800 / 360),
  y: (90 - lat) * (400 / 180),
});

// ─────────────────────────────────────────────────────────────────────────────
// Flight route — India first, loops through every pinned country
// ─────────────────────────────────────────────────────────────────────────────

const FLIGHT_ORDER = [
  "India",
  "Coloumbia", // South Asia → South America
  "UK", // South America → Europe
  "Australia", // Europe → Oceania
  "France", // Oceania → Europe (west)
  "USA", // Europe → North America
  "Russia", // North America → North Asia
  "South Korea", // North Asia → East Asia
  "Germany", // East Asia → Europe (central)
  "Japan", // Europe → East Asia
  "Canada", // East Asia → North America
  "UAE", // North America → Middle East
  "Italy", // Middle East → Europe (south)
  "China", // Europe → East Asia
  "Morocco", // East Asia → North Africa
  "Angola", // North Africa → South Africa
  "Chile", // South Africa → South America
  "India", // close the loop
];

// ─────────────────────────────────────────────────────────────────────────────
// Pre-computed values (module-level — computed once, not every render)
// ─────────────────────────────────────────────────────────────────────────────

const createCurvedPath = (
  start: { x: number; y: number },
  end: { x: number; y: number },
) => {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
};

const indiaPos = {
  x: Math.round(
    projectPoint(
      COUNTRY_COORDS.find((c) => c.name === "India")!.lat,
      COUNTRY_COORDS.find((c) => c.name === "India")!.lng,
    ).x,
  ),
  y: Math.round(
    projectPoint(
      COUNTRY_COORDS.find((c) => c.name === "India")!.lat,
      COUNTRY_COORDS.find((c) => c.name === "India")!.lng,
    ).y,
  ),
};

const countryLabels = COUNTRY_COORDS.map(({ name, lat, lng }) => ({
  name,
  ...projectPoint(lat, lng),
}));

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function WorldMap({
  dots = [],
  lineColor = "#000000",
}: MapProps) {
  // ── State & Refs ────────────────────────────────────────────────────────────

  const svgRef = useRef<SVGSVGElement>(null);
  const planeRef = useRef<SVGGElement>(null);
  const shadowRef = useRef<SVGGElement>(null);
  const trailRef = useRef<SVGPathElement>(null);

  const svgMap = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    return map.getSVG({
      radius: 0.16,
      color: "#babee0",
      shape: "circle",
      backgroundColor: "transparent",
    });
  }, []);

  // ── Airplane flight animation ───────────────────────────────────────────────

  useEffect(() => {
    const plane = planeRef.current;
    const shadow = shadowRef.current;
    const trail = trailRef.current;
    const svg = svgRef.current;
    if (!plane || !shadow || !trail || !svg) return;

    const waypoints = FLIGHT_ORDER.map((name) => {
      const c = COUNTRY_COORDS.find((cc) => cc.name === name);
      if (!c) return projectPoint(0, 0);
      return projectPoint(c.lat, c.lng);
    });

    // Build curved arcs between waypoints using quadratic beziers
    // Control point is offset perpendicular to the midpoint for a nice arc
    let d = `M${waypoints[0].x},${waypoints[0].y}`;
    for (let i = 1; i < waypoints.length; i++) {
      const p0 = waypoints[i - 1];
      const p1 = waypoints[i];
      const midX = (p0.x + p1.x) / 2;
      const midY = (p0.y + p1.y) / 2;
      // Arc upward — control point raised above midpoint
      const dist = Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
      const cpY = midY - dist * 0.15; // gentle upward curve
      d += `Q${midX},${cpY},${p1.x},${p1.y}`;
    }

    // Hidden path for getPointAtLength sampling
    const NS = "http://www.w3.org/2000/svg";
    const pathEl = document.createElementNS(NS, "path");
    pathEl.setAttribute("d", d);
    pathEl.setAttribute("fill", "none");
    pathEl.setAttribute("stroke", "none");
    svg.appendChild(pathEl);

    const totalLen = pathEl.getTotalLength();

    // Find each waypoint's progress (0 → 1) by walking the path forward
    const wpProgress: number[] = [];
    let searchFrom = 0;
    const SAMPLES = 800;
    for (const wp of waypoints) {
      let best = searchFrom,
        bestD = Infinity;
      for (let s = Math.floor(searchFrom * SAMPLES); s <= SAMPLES; s++) {
        const t = s / SAMPLES;
        const pt = pathEl.getPointAtLength(t * totalLen);
        const dd = (pt.x - wp.x) ** 2 + (pt.y - wp.y) ** 2;
        if (dd < bestD) {
          bestD = dd;
          best = t;
        }
      }
      wpProgress.push(best);
      searchFrom = best;
    }

    // Proxy drives position; leg tracks segment for altitude calc
    const proxy = { t: wpProgress[0] };

    // Trail collects visited positions
    const trailPoints: { x: number; y: number }[] = [];
    let lastTrailX = -999,
      lastTrailY = -999;

    // Find which leg we're on based on proxy.t
    const getLeg = () => {
      for (let i = 0; i < wpProgress.length - 1; i++) {
        if (proxy.t <= wpProgress[i + 1] + 0.0001) {
          return { from: wpProgress[i], to: wpProgress[i + 1] };
        }
      }
      return {
        from: wpProgress[wpProgress.length - 2],
        to: wpProgress[wpProgress.length - 1],
      };
    };

    // Smooth rotation — lerps toward target to avoid snap-turns at landings
    let smoothRot = 0;
    let rotInitialised = false;

    const place = () => {
      const len = proxy.t * totalLen;
      const p1 = pathEl.getPointAtLength(len);
      const p2 = pathEl.getPointAtLength(Math.min(len + 0.5, totalLen));
      const targetRot =
        Math.atan2(p2.y - p1.y, p2.x - p1.x) * (180 / Math.PI) + 45;

      // First call: jump to target instantly; after that lerp smoothly
      if (!rotInitialised) {
        smoothRot = targetRot;
        rotInitialised = true;
      } else {
        let delta = targetRot - smoothRot;
        // Normalise to -180…180 so it always takes the short way round
        while (delta > 180) delta -= 360;
        while (delta < -180) delta += 360;
        smoothRot += delta * 0.12;
      }

      // Compute altitude within current leg segment
      const leg = getLeg();
      const range = leg.to - leg.from;
      const legProgress = range === 0 ? 0 : (proxy.t - leg.from) / range;
      const altitude = Math.sin(legProgress * Math.PI);
      const sc = 1 + 0.4 * altitude;
      const sdx = 1.5 + 1.5 * altitude;
      const sdy = 1.5 + 1.5 * altitude;
      const sop = 0.45 - 0.2 * altitude;

      // Use SVG transform attribute directly (not CSS) so rotation/scale
      // always pivot around the airplane center (0,0 after inner translate)
      plane.setAttribute(
        "transform",
        `translate(${p1.x}, ${p1.y}) rotate(${smoothRot}) scale(${sc})`,
      );
      shadow.setAttribute(
        "transform",
        `translate(${p1.x + sdx}, ${p1.y + sdy}) rotate(${smoothRot}) scale(${sc})`,
      );
      shadow.setAttribute("opacity", String(sop));

      // Add trail points as the plane moves
      const dx = p1.x - lastTrailX,
        dy = p1.y - lastTrailY;
      if (dx * dx + dy * dy > 4) {
        trailPoints.push({ x: p1.x, y: p1.y });
        lastTrailX = p1.x;
        lastTrailY = p1.y;
      }
      // Build trail path — append live plane position so dashes connect to plane center
      if (trailPoints.length > 0) {
        let td = `M${trailPoints[0].x},${trailPoints[0].y}`;
        for (let k = 1; k < trailPoints.length; k++) {
          td += `L${trailPoints[k].x},${trailPoints[k].y}`;
        }
        td += `L${p1.x},${p1.y}`;
        trail.setAttribute("d", td);

        // Update gradient direction so it fades from trail start → plane
        const grad = svg.getElementById(
          "trail-grad",
        ) as SVGLinearGradientElement | null;
        if (grad) {
          grad.setAttribute("x1", String(trailPoints[0].x));
          grad.setAttribute("y1", String(trailPoints[0].y));
          grad.setAttribute("x2", String(p1.x));
          grad.setAttribute("y2", String(p1.y));
        }
      }
    };

    place();

    const totalFlightDur = 90; // total time for all flying legs combined
    const tl = gsap.timeline({ repeat: -1 });

    // Per-leg tweens with 3s pause at each landing
    for (let i = 0; i < wpProgress.length - 1; i++) {
      const segFrac = wpProgress[i + 1] - wpProgress[i];
      const dur =
        (segFrac * totalFlightDur) / (wpProgress[wpProgress.length - 1] || 1);
      tl.to(proxy, {
        t: wpProgress[i + 1],
        duration: Math.max(dur, 0.5),
        ease: "none",
        onUpdate: place,
      });
      // Clear trail during pause so it fades, then 3s wait
      tl.call(() => {
        trailPoints.length = 0;
        trail.setAttribute("d", "");
      });
      if (i < wpProgress.length - 2) {
        tl.to(proxy, { duration: 3, onUpdate: place }); // 3s pause — plane turns to face next dest
      }
    }

    return () => {
      tl.kill();
      pathEl.remove();
    };
  }, []);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-[75svh] md:h-auto md:aspect-2/1 bg-transparent rounded-lg relative font-sans overflow-hidden">
      {/* Inner wrapper — scales up on mobile to crop/zoom the map */}
      <div className="absolute inset-0 scale-[2.6] md:scale-100 origin-[62%_42%] md:origin-center">
        {/* ── Layer 1: dotted world map (generated via dotted-map) ── */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
          className="h-full w-full mask-[linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)] pointer-events-none select-none"
          alt="world map"
          height="495"
          width="1056"
          draggable={false}
          loading="eager"
          decoding="async"
        />

        {/* ── Layer 2: SVG overlay (paths, markers, labels) ── */}
        <svg
          ref={svgRef}
          viewBox="0 0 800 400"
          className="w-full h-full absolute inset-0 pointer-events-none select-none"
        >
          {/* Gradient used by animated flight paths */}
          <defs>
            <linearGradient
              id="path-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="5%" stopColor={lineColor} stopOpacity="1" />
              <stop offset="95%" stopColor={lineColor} stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <filter
              id="plane-glow"
              x="-50%"
              y="-50%"
              width="200%"
              height="200%"
            >
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="3"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                type="matrix"
                values="0 0 0 0 0.56  0 0 0 0 0.58  0 0 0 0 0.95  0 0 0 0.6 0"
                result="glow"
              />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="trail-grad" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#424396" stopOpacity="0" />
              <stop offset="100%" stopColor="#424396" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* ── Animated flight paths ── */}
          {dots.map((dot, i) => {
            const startPoint = projectPoint(dot.start.lat, dot.start.lng);
            const endPoint = projectPoint(dot.end.lat, dot.end.lng);

            return (
              <g key={`path-group-${i}`}>
                <motion.path
                  d={createCurvedPath(startPoint, endPoint)}
                  fill="none"
                  stroke="url(#path-gradient)"
                  strokeWidth="1"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 * i, ease: "easeOut" }}
                  key={`start-upper-${i}`}
                />
              </g>
            );
          })}

          {/* ── Pulsing start / end markers ── */}
          {dots.map((dot, i) => {
            const start = projectPoint(dot.start.lat, dot.start.lng);
            const end = projectPoint(dot.end.lat, dot.end.lng);

            return (
              <g key={`points-group-${i}`}>
                {/* Start marker */}
                <g key={`start-${i}`}>
                  <circle cx={start.x} cy={start.y} r="2" fill={lineColor} />
                  <circle
                    cx={start.x}
                    cy={start.y}
                    r="2"
                    fill={lineColor}
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="2"
                      to="8"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>

                {/* End marker */}
                <g key={`end-${i}`}>
                  <circle cx={end.x} cy={end.y} r="2" fill={lineColor} />
                  <circle
                    cx={end.x}
                    cy={end.y}
                    r="2"
                    fill={lineColor}
                    opacity="0.5"
                  >
                    <animate
                      attributeName="r"
                      from="2"
                      to="8"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      from="0.5"
                      to="0"
                      dur="1.5s"
                      begin="0s"
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              </g>
            );
          })}

          {/* ── Country labels (pin + name) ── */}
          {countryLabels.map((country) => (
            <g
              key={country.name}
              transform={`translate(${country.x}, ${country.y})`}
            >
              {/* Pulsing glow behind pin */}
              <circle r="3" fill="#9FA0FF" opacity="0.25">
                <animate
                  attributeName="r"
                  from="3"
                  to="8"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.25"
                  to="0"
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="2" fill="#8E94F2" opacity="0.15">
                <animate
                  attributeName="r"
                  from="2"
                  to="6"
                  dur="2.5s"
                  begin="0.8s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  from="0.15"
                  to="0"
                  dur="2.5s"
                  begin="0.8s"
                  repeatCount="indefinite"
                />
              </circle>
              {/* Location pin — location-svgrepo-com.svg path
                scale(0.3125) → pin 10 SVG units tall (2× fontSize=5 text)
                translate(-36.25,-138.44) plants the tip exactly at (0,0)   */}
              <g transform="translate(-36.25, -138.44) scale(0.3125)">
                <path
                  fill="#babee0"
                  d={
                    "M116,426 C114.343,426 113,424.657 113,423 C113,421.343 114.343,420 116,420 C117.657,420 119,421.343 119,423 C119,424.657 117.657,426 116,426 L116,426 Z M116,418 C113.239,418 111,420.238 111,423 C111,425.762 113.239,428 116,428 C118.761,428 121,425.762 121,423 C121,420.238 118.761,418 116,418 L116,418 Z M116,440 C114.337,440.009 106,427.181 106,423 C106,417.478 110.477,413 116,413 C121.523,413 126,417.478 126,423 C126,427.125 117.637,440.009 116,440 L116,440 Z M116,411 C109.373,411 104,416.373 104,423 C104,428.018 114.005,443.011 116,443 C117.964,443.011 128,427.95 128,423 C128,416.373 122.627,411 116,411 L116,411 Z"
                  }
                />
              </g>

              {/* Country name — starts after pin's right edge (~3.75) + small gap */}
              <text
                x="5.5"
                y="-4"
                fill="#8895B3"
                fontSize="5"
                fontWeight="600"
                className="uppercase"
                style={{
                  paintOrder: "stroke",
                  stroke: "#FAF9F7",
                  strokeWidth: 0.5,
                }}
              >
                {country.name}
              </text>
            </g>
          ))}
          {/* ── Dashed trail behind airplane ── */}
          <path
            ref={trailRef}
            fill="none"
            stroke="url(#trail-grad)"
            strokeWidth="0.7"
            strokeDasharray="2.5 2"
            strokeLinecap="round"
          />
          {/* ── Shadow (gray copy of airplane, offset slightly) ── */}
          <g
            ref={shadowRef}
            transform={`translate(${indiaPos.x + 1.5}, ${indiaPos.y + 1.5})`}
            opacity={0.45}
          >
            <g transform="scale(0.2) translate(-32, -32)">
              <path
                d="M7.212 12.752l8.132-8.132l1.98 1.98l-8.132 8.132z"
                fill="#666"
              />
              <path
                d="M21.421 14.797l8.133-8.13l1.98 1.98l-8.133 8.13z"
                fill="#666"
              />
              <path
                d="M49.31 54.854l8.134-8.13l1.98 1.981l-8.134 8.13z"
                fill="#666"
              />
              <path
                d="M47.279 40.557l8.134-8.13l1.98 1.981l-8.135 8.13z"
                fill="#666"
              />
              <path
                d="M56.4 60.7l-4.7-42.1l-6.3-6.3L3.3 7.6c-2-.2-1.6 4.8.7 5.9l31.7 14.8L50.5 60c1.1 2.3 6.1 2.7 5.9.7"
                fill="#888"
              />
              <path
                d="M61.3 8.1c2.2-4.3-1.1-7.6-5.4-5.4c-5.5 2.8-13.6 9.1-21.8 17.2c-12.8 12.8-21 25.5-18.3 28.3c2.7 2.7 15.5-5.5 28.3-18.3c8.1-8.1 14.4-16.3 17.2-21.8"
                fill="#999"
              />
              <path
                d="M22.4 60.2l-1.6-14.8l-2.2-2.2l-14.8-1.6c-.7-.1-.6 1.7.2 2.1l11.1 5.2L20.3 60c.4.8 2.2.9 2.1.2"
                fill="#888"
              />
              <path
                d="M20.2 46.2c-4.5 4.5-8.6 7.6-9.2 6.9c-.6-.6 2.5-4.8 6.9-9.3c4.5-4.5 8.6-7.6 9.3-6.9c.5.6-2.6 4.8-7 9.3"
                fill="#666"
              />
              <path
                d="M59.8 9.7c.5-1.8.3-3.5-.8-4.7c-1.1-1.1-2.9-1.4-4.6-.8L51 6.3c1.7-.6 4.2.3 5.3 1.4c1.2 1.2 2 3.6 1.4 5.3l2.1-3.3"
                fill="#555"
              />
              <path
                d="M53.664 9.695l5.654-5.659l.637.636l-5.655 5.66z"
                fill="#999"
              />
            </g>
          </g>
          {/* ── Airplane (airplane-svgrepo-com.svg, 64×64 → scaled 0.2) ── */}
          <g
            ref={planeRef}
            transform={`translate(${indiaPos.x}, ${indiaPos.y})`}
            filter="url(#plane-glow)"
          >
            <g transform="scale(0.2) translate(-32, -32)">
              <g fill="#9995b3">
                <path d="M7.212 12.752l8.132-8.132l1.98 1.98l-8.132 8.132z" />
                <path d="M21.421 14.797l8.133-8.13l1.98 1.98l-8.133 8.13z" />
                <path d="M49.31 54.854l8.134-8.13l1.98 1.981l-8.134 8.13z" />
                <path d="M47.279 40.557l8.134-8.13l1.98 1.981l-8.135 8.13z" />
              </g>
              <path
                d="M56.4 60.7l-4.7-42.1l-6.3-6.3L3.3 7.6c-2-.2-1.6 4.8.7 5.9l31.7 14.8L50.5 60c1.1 2.3 6.1 2.7 5.9.7"
                fill="#8e94f2"
              />
              <path
                d="M61.3 8.1c2.2-4.3-1.1-7.6-5.4-5.4c-5.5 2.8-13.6 9.1-21.8 17.2c-12.8 12.8-21 25.5-18.3 28.3c2.7 2.7 15.5-5.5 28.3-18.3c8.1-8.1 14.4-16.3 17.2-21.8"
                fill="#bbadff"
              />
              <path
                d="M22.4 60.2l-1.6-14.8l-2.2-2.2l-14.8-1.6c-.7-.1-.6 1.7.2 2.1l11.1 5.2L20.3 60c.4.8 2.2.9 2.1.2"
                fill="#8e94f2"
              />
              <path
                d="M20.2 46.2c-4.5 4.5-8.6 7.6-9.2 6.9c-.6-.6 2.5-4.8 6.9-9.3c4.5-4.5 8.6-7.6 9.3-6.9c.5.6-2.6 4.8-7 9.3"
                fill="#9995b3"
              />
              <path
                d="M59.8 9.7c.5-1.8.3-3.5-.8-4.7c-1.1-1.1-2.9-1.4-4.6-.8L51 6.3c1.7-.6 4.2.3 5.3 1.4c1.2 1.2 2 3.6 1.4 5.3l2.1-3.3"
                fill="#000000"
              />
              <path
                d="M53.664 9.695l5.654-5.659l.637.636l-5.655 5.66z"
                fill="#bbadff"
              />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
}
