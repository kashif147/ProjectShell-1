import React from "react";
import { MOVEMENT_SERIES } from "./movementChartConfig";

export default function MovementStackLegend() {
  return (
    <ul className="exec-movement-legend" aria-label="Chart legend">
      {MOVEMENT_SERIES.map((s) => (
        <li key={s.key}>
          <span
            className="exec-movement-legend__swatch"
            style={{ background: s.color }}
          />
          <span>{s.label}</span>
        </li>
      ))}
    </ul>
  );
}
