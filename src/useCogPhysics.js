import { useCallback, useEffect, useRef, useState } from "react";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const mod = (n, m) => ((n % m) + m) % m;

/**
 * Cubic-bezier(0.22, 1, 0.36, 1) evaluator.
 * We solve x(t)=time to return y(t)=progress (close to CSS cubic-bezier).
 */
function cubicBezierFactory(x1, y1, x2, y2) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t) => ((ay * t + by) * t + cy) * t;
  const sampleDX = (t) => (3 * ax * t + 2 * bx) * t + cx;

  const solveTForX = (x) => {
    let t = x;
    for (let i = 0; i < 6; i++) {
      const xEst = sampleX(t) - x;
      const d = sampleDX(t);
      if (Math.abs(xEst) < 1e-6) return t;
      if (Math.abs(d) < 1e-6) break;
      t = t - xEst / d;
      t = clamp(t, 0, 1);
    }
    // bisection fallback
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      const xMid = sampleX(mid);
      if (xMid < x) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  };

  return (x) => sampleY(solveTForX(clamp(x, 0, 1)));
}

const snapEase = cubicBezierFactory(0.22, 1, 0.36, 1);

/**
 * useCogPhysics (NO SCROLL)
 * Source of truth: positionPx (continuous)
 * Active float index: positionPx / stepPx
 * Commit index: round(positionPx / stepPx)
 */
export function useCogPhysics(
  { steps, stepPx, snapMs, onHaptic },
  initialIndex
) {
  const [positionPx, setPositionPxState] = useState(initialIndex * stepPx);

  const posRef = useRef(initialIndex * stepPx);
  const velRef = useRef(0); // px/sec
  const draggingRef = useRef(false);

  const rafRef = useRef(null);
  const lastTRef = useRef(0);

  const lastYRef = useRef(0);
  const lastMoveTRef = useRef(0);

  const snapRef = useRef({ active: false, from: 0, to: 0, start: 0 });
  const wheelDebounceRef = useRef(null);

  const setPositionPx = useCallback((v) => {
    posRef.current = v;
    setPositionPxState(v);
  }, []);

  const stopRaf = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const startRaf = useCallback(
    (tick) => {
      // ensure ONE rAF loop only
      stopRaf();
      const loop = (t) => {
        tick(t);
        rafRef.current = requestAnimationFrame(loop);
      };
      rafRef.current = requestAnimationFrame(loop);
    },
    [stopRaf]
  );

  const startSnap = useCallback(
    (nowMs) => {
      const from = posRef.current;
      const targetIndex = Math.round(from / stepPx); // nearest grid index
      const to = targetIndex * stepPx; // exact grid position
      snapRef.current = { active: true, from, to, start: nowMs };
      velRef.current = 0;
    },
    [stepPx]
  );

  const tick = useCallback(
    (t) => {
      const now = t;
      const last = lastTRef.current || now;
      const dtSec = Math.min(0.05, (now - last) / 1000);
      lastTRef.current = now;

      if (draggingRef.current) return;

      // Snap phase
      if (snapRef.current.active) {
        const { from, to, start } = snapRef.current;
        const p = clamp((now - start) / snapMs, 0, 1);
        const eased = snapEase(p);
        setPositionPx(from + (to - from) * eased);

        if (p >= 1) {
          snapRef.current.active = false;
          setPositionPx(to); // final exact
          stopRaf();
        }
        return;
      }

      // Inertia phase: exponential friction (weighted feel)
      const v = velRef.current;
      if (Math.abs(v) > 8) {
        const speedNorm = clamp(Math.abs(v) / 2200, 0, 1);
        const friction = 10 + 14 * speedNorm; // heavier at higher speeds
        const decay = Math.exp(-friction * dtSec);

        const v2 = v * decay;
        velRef.current = v2;

        setPositionPx(posRef.current + v2 * dtSec);

        if (Math.abs(v2) < 18) startSnap(now);
      } else {
        stopRaf();
      }
    },
    [setPositionPx, snapMs, startSnap, stopRaf]
  );

  const onPointerDown = useCallback(
    (e) => {
      e.currentTarget.setPointerCapture(e.pointerId);

      draggingRef.current = true;
      snapRef.current.active = false;
      velRef.current = 0;

      lastYRef.current = e.clientY;
      lastMoveTRef.current = performance.now();
      lastTRef.current = performance.now();

      startRaf(tick);

      const onMove = (ev) => {
        const now = performance.now();
        const dy = ev.clientY - lastYRef.current;
        const dt = Math.max(1, now - lastMoveTRef.current);

        // No scroll. Direct position update in px.
        setPositionPx(posRef.current + dy);

        // Velocity in px/sec
        velRef.current = dy / (dt / 1000);

        lastYRef.current = ev.clientY;
        lastMoveTRef.current = now;
      };

      const onUp = () => {
        draggingRef.current = false;

        // slow release snaps immediately; fast flick uses inertia then snaps
        if (Math.abs(velRef.current) < 120) startSnap(performance.now());

        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerup", onUp, { passive: true });
      window.addEventListener("pointercancel", onUp, { passive: true });
    },
    [setPositionPx, startRaf, startSnap, tick]
  );

  const onWheel = useCallback(
    (e) => {
      e.preventDefault();
      if (draggingRef.current) return;

      snapRef.current.active = false;

      // wheel delta -> px position
      setPositionPx(posRef.current + e.deltaY);

      // wheel impulse -> velocity
      velRef.current = clamp(e.deltaY * 14, -3200, 3200);

      startRaf(tick);

      if (wheelDebounceRef.current != null)
        clearTimeout(wheelDebounceRef.current);
      wheelDebounceRef.current = setTimeout(
        () => startSnap(performance.now()),
        80
      );
    },
    [setPositionPx, startRaf, startSnap, tick]
  );

  const setIndex = useCallback(
    (idx) => {
      if (wheelDebounceRef.current != null)
        clearTimeout(wheelDebounceRef.current);
      snapRef.current.active = false;
      velRef.current = 0;
      stopRaf();

      // commit exactly to grid
      const ii = mod(idx, steps);
      if (onHaptic) onHaptic();
      setPositionPx(ii * stepPx);
    },
    [onHaptic, setPositionPx, stepPx, steps, stopRaf]
  );

  useEffect(() => {
    return () => {
      if (wheelDebounceRef.current != null)
        clearTimeout(wheelDebounceRef.current);
      stopRaf();
    };
  }, [stopRaf]);

  const activeFloat = positionPx / stepPx;
  const activeIndex = mod(Math.round(activeFloat), steps);

  return {
    positionPx,
    activeFloat,
    activeIndex,
    setIndex,
    onPointerDown,
    onWheel,
  };
}
