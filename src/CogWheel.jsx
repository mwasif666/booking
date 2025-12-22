import React, { useEffect, useMemo } from "react";
import styles from "./TimePicker.module.css";
import { useCogPhysics } from "./useCogPhysics";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const mod = (n, m) => ((n % m) + m) % m;

/**
 * Fade/depth formula ONLY:
 * opacity = clamp(1 - distance*0.22, 0.12, 1)
 * scale   = clamp(1 - distance*0.05, 0.85, 1)
 * distance is fractional while moving.
 */
function styleForIndex(rawIndex, activeFloat, stepPx) {
  const distance = Math.abs(rawIndex - activeFloat);

  const opacity = clamp(1 - distance * 0.22, 0.12, 1);
  const scale = clamp(1 - distance * 0.05, 0.85, 1);

  // Position law (MANDATORY):
  // y = (index - activeFloat) * STEP_HEIGHT
  const y = (rawIndex - activeFloat) * stepPx;

  return {
    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
    opacity,
  };
}

/**
 * CogWheel
 * - Background layer renders ±6 values
 * - Selection layer renders ONLY active value (no transforms)
 * - No native scrolling, no flowing text
 */
export default function CogWheel({
  values,
  valueIndex,
  onCommit,
  ariaLabel,
  stepPx = 56, // MANDATORY
  snapMs = 180, // MANDATORY
  onHaptic,
}) {
  const steps = values.length;

  const phys = useCogPhysics({ steps, stepPx, snapMs, onHaptic }, valueIndex);

  // Commit snapped index to parent
  useEffect(() => {
    onCommit(phys.activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phys.activeIndex]);

  const RADIUS = 6; // MANDATORY ±6
  const nearby = useMemo(() => {
    const base = Math.round(phys.activeFloat);
    const arr = [];
    for (let k = -RADIUS; k <= RADIUS; k++) arr.push(base + k);
    return arr;
  }, [phys.activeFloat]);

  const activeInt = mod(Math.round(phys.activeFloat), steps);

  return (
    <div
      className={styles.cog}
      onPointerDown={phys.onPointerDown}
      onWheel={phys.onWheel}
      aria-label={ariaLabel}
    >
      {/* Background layer */}
      <div className={styles.cogBgLayer} aria-hidden="true">
        {nearby.map((rawIdx) => {
          const idx = mod(rawIdx, steps);
          return (
            <div
              key={rawIdx}
              className={styles.cogBgItem}
              style={styleForIndex(rawIdx, phys.activeFloat, stepPx)}
            >
              {values[idx]}
            </div>
          );
        })}
      </div>

      {/* Selection layer (ONLY active, centered, no transforms) */}
      <div className={styles.cogSelLayer} aria-hidden="true">
        <div className={styles.cogSelText}>{values[activeInt]}</div>
      </div>
    </div>
  );
}
