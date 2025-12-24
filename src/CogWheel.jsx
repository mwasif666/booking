import React, { useEffect, useMemo } from "react";
import styles from "./TimePicker.module.css";
import { useCogPhysics } from "./useCogPhysics";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const mod = (n, m) => ((n % m) + m) % m;

/**
 * Improved depth curve:
 * - Near items: readable
 * - Far items: fade out nicely
 * - Center: bigger + crisp
 *
 * IMPORTANT:
 * y = (index - activeFloat) * stepPx  (keep this)
 */
function styleForIndex(rawIndex, activeFloat, stepPx) {
  const dist = Math.abs(rawIndex - activeFloat); // fractional while moving
  // const y = (rawIndex - activeFloat) * stepPx;
  const EXTRA_GAP = 70; // jitna gap chahiye
  const y = (rawIndex - activeFloat) * (stepPx + EXTRA_GAP);

  // Clamp distance so very far items behave same
  const d = Math.min(dist, 4);

  // ✅ Better curve (more noticeable than your 0.05 scale)
  // 0: 1.00
  // 1: 0.92
  // 2: 0.84
  // 3: 0.78
  // 4+: 0.74
  const scale = clamp(1 - d * 0.08, 0.74, 1);

  // ✅ Opacity curve (clean fade)
  // 0: 0.65 (because active is shown in SelLayer, bg should not overpower)
  // 1: 0.40
  // 2: 0.22
  // 3: 0.12
  // 4+: 0.08
  const opacity = clamp(0.65 - d * 0.18, 0.08, 0.65);

  // Optional: slightly blur far text via CSS class if you want (not required)
  return {
    transform: `translate3d(0, ${y}px, 0) scale(${scale})`,
    opacity,
  };
}

/**
 * CogWheel
 * - Background layer renders ±6 values
 * - Selection layer renders ONLY active value (centered, crisp)
 */
export default function CogWheel({
  values,
  valueIndex,
  onCommit,
  ariaLabel,
  stepPx = 56,
  snapMs = 180,
  onHaptic,
}) {
  const steps = values.length;

  const phys = useCogPhysics({ steps, stepPx, snapMs, onHaptic }, valueIndex);

  // Commit snapped index to parent
  useEffect(() => {
    onCommit(phys.activeIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phys.activeIndex]);

  const RADIUS = 6;
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
      role="listbox"
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

      {/* Selection layer */}
      <div className={styles.cogSelLayer} aria-hidden="true">
        <div className={styles.cogSelText}>{values[activeInt]}</div>
      </div>
    </div>
  );
}
