import React, { useMemo, useRef, useState } from "react";
import styles from "./TimePickerPanel.module.css";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const HOURS_12 = Array.from({ length: 12 }, (_, i) => (i === 0 ? 12 : i));
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const PERIODS = ["AM", "PM"];

const ITEM_H = 46;
const VISIBLE = 7;
const PAD = Math.floor(VISIBLE / 2);

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function to24(h12, p) {
  if (p === "AM") return h12 === 12 ? 0 : h12;
  return h12 === 12 ? 12 : h12 + 12;
}

function from24(h24) {
  const p = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 || 12;
  return { h12, p };
}

function totalMin(h12, m, p) {
  return to24(h12, p) * 60 + m;
}

function addMinutes(h12, m, p, add) {
  const base = totalMin(h12, m, p);
  const t = (((base + add) % (24 * 60)) + 24 * 60) % (24 * 60);
  const h24 = Math.floor(t / 60);
  const mm = t % 60;
  const { h12: nh12, p: np } = from24(h24);
  return { h12: nh12, m: mm, p: np };
}

function buildDisplay(list, fmt = (x) => x) {
  const pad = Array.from({ length: PAD }, () => "");
  return [...pad, ...list.map(fmt), ...pad];
}

/**
 * Wheel (GSAP)
 * - onChangeIndex: live update (during scroll)
 * - onCommitIndex: only when snap completes (use this for end-time update)
 */
function Wheel({
  list,
  display,
  valueIndex,
  onChangeIndex,
  onCommitIndex,
  className,
  enabled = true,
}) {
  const ref = useRef(null);
  const snapTimer = useRef(null);
  const tweenRef = useRef(null);
  const maxIdx = list.length - 1;

  // Set position when valueIndex changes (for right side when end updates)
  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.scrollTop = valueIndex * ITEM_H; // instant
  }, [valueIndex]);

  const snapTo = (el) => {
    const idx = clamp(Math.round(el.scrollTop / ITEM_H), 0, maxIdx);
    const snapY = idx * ITEM_H;

    tweenRef.current?.kill();
    tweenRef.current = gsap.to(el, {
      scrollTo: { y: snapY, autoKill: false },
      duration: 0.25,
      ease: "power3.out",
      onUpdate: () => {
        const liveIdx = clamp(Math.round(el.scrollTop / ITEM_H), 0, maxIdx);
        onChangeIndex?.(liveIdx);
      },
      onComplete: () => {
        onChangeIndex?.(idx);
        onCommitIndex?.(idx); // ✅ only here commit
      },
    });
  };

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e) => {
      if (!enabled) return;
      e.preventDefault();

      tweenRef.current?.kill();

      const delta = e.deltaY;
      const target = clamp(el.scrollTop + delta, 0, maxIdx * ITEM_H);

      tweenRef.current = gsap.to(el, {
        scrollTo: { y: target, autoKill: false },
        duration: 0.22,
        ease: "power2.out",
        onUpdate: () => {
          const liveIdx = clamp(Math.round(el.scrollTop / ITEM_H), 0, maxIdx);
          onChangeIndex?.(liveIdx);
        },
        onComplete: () => {
          clearTimeout(snapTimer.current);
          snapTimer.current = setTimeout(() => snapTo(el), 90);
        },
      });
    };

    const onScroll = () => {
      if (!enabled) return;
      const idx = clamp(Math.round(el.scrollTop / ITEM_H), 0, maxIdx);
      onChangeIndex?.(idx);

      clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => snapTo(el), 140);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("scroll", onScroll);
      clearTimeout(snapTimer.current);
      tweenRef.current?.kill();
    };
  }, [enabled, maxIdx, onChangeIndex]);

  const selectedDisplayIndex = PAD + valueIndex;

  return (
    <div className={`${styles.wheel} ${className || ""}`}>
      <div className={styles.fadeTop} />
      <div className={styles.fadeBottom} />
      <div className={styles.centerMarker} />

      <div className={styles.scroller} ref={ref}>
        {display.map((txt, i) => {
          const isSel = i === selectedDisplayIndex;
          const isEmpty = txt === "";
          return (
            <div
              key={`${i}-${txt}`}
              className={[
                styles.item,
                isSel ? styles.itemActive : "",
                isEmpty ? styles.itemEmpty : "",
              ].join(" ")}
            >
              {txt}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TimePickerPanel() {
  // Start (live)
  const [startH, setStartH] = useState(7);
  const [startM, setStartM] = useState(45);
  const [period, setPeriod] = useState("AM");

  // End (ONLY update on COMMIT)
  const initEnd = useMemo(() => addMinutes(7, 45, "AM", 60), []);
  const [endH, setEndH] = useState(initEnd.h12);
  const [endM, setEndM] = useState(initEnd.m);
  const [endP, setEndP] = useState(initEnd.p);

  // display lists
  const hoursDisplay = useMemo(() => buildDisplay(HOURS_12, pad2), []);
  const minsDisplay = useMemo(() => buildDisplay(MINUTES, pad2), []);
  const perDisplay = useMemo(() => buildDisplay(PERIODS), []);

  // indexes
  const startHIdx = HOURS_12.indexOf(startH);
  const startMIdx = startM;
  const perIdx = PERIODS.indexOf(period);

  const endHIdx = HOURS_12.indexOf(endH);
  const endMIdx = endM;

  // ✅ Commit handler: only when left wheel snaps
  const commitEndFromStart = (
    nextH = startH,
    nextM = startM,
    nextP = period
  ) => {
    const next = addMinutes(nextH, nextM, nextP, 60);
    setEndH(next.h12);
    setEndM(next.m);
    setEndP(next.p);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.topTitle}>Choose a Time</div>

      <div className={styles.pickerArea}>
        <div className={styles.wheelsRow}>
          {/* Start */}
          <div className={styles.group}>
            <Wheel
              list={HOURS_12}
              display={hoursDisplay}
              valueIndex={startHIdx}
              onChangeIndex={(idx) => setStartH(HOURS_12[idx])}
              onCommitIndex={(idx) =>
                commitEndFromStart(HOURS_12[idx], startM, period)
              }
            />
            <Wheel
              list={MINUTES}
              display={minsDisplay}
              valueIndex={startMIdx}
              onChangeIndex={(idx) => setStartM(MINUTES[idx])}
              onCommitIndex={(idx) =>
                commitEndFromStart(startH, MINUTES[idx], period)
              }
            />
          </div>

          {/* Period */}
          <div className={styles.periodCol}>
            <Wheel
              list={PERIODS}
              display={perDisplay}
              valueIndex={perIdx}
              onChangeIndex={(idx) => setPeriod(PERIODS[idx])}
              onCommitIndex={(idx) =>
                commitEndFromStart(startH, startM, PERIODS[idx])
              }
              className={styles.periodWheel}
            />
          </div>

          {/* End (faded BUT active stays white) */}
          <div className={styles.group}>
            <Wheel
              list={HOURS_12}
              display={hoursDisplay}
              valueIndex={startHIdx}
              onChangeIndex={(idx) => setStartH(HOURS_12[idx])}
              onCommitIndex={(idx) =>
                commitEndFromStart(HOURS_12[idx], startM, period)
              }
            />
            <Wheel
              list={MINUTES}
              display={minsDisplay}
              valueIndex={startMIdx}
              onChangeIndex={(idx) => setStartM(MINUTES[idx])}
              onCommitIndex={(idx) =>
                commitEndFromStart(startH, MINUTES[idx], period)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
