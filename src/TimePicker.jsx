import React, { useMemo, useState } from "react";
import styles from "./TimePicker.module.css";
import CogWheel from "./CogWheel";

const pad2 = (n) => (n < 10 ? `0${n}` : `${n}`);

export default function TimePicker() {
  const hours = useMemo(
    () => Array.from({ length: 12 }, (_, i) => pad2(i === 0 ? 12 : i)),
    []
  );
  const minutes = useMemo(
    () => Array.from({ length: 60 }, (_, i) => pad2(i)),
    []
  );
  const ampm = useMemo(() => ["AM", "PM"], []);

  // Independent cogs (no inference)
  const [sH, setSH] = useState(1); // "02"
  const [sM, setSM] = useState(35);
  const [sP, setSP] = useState(0);

  const [eH, setEH] = useState(2); // "03"
  const [eM, setEM] = useState(35);
  const [eP, setEP] = useState(0);

  // Haptic stub
  const haptic = () => {
    // navigator.vibrate?.(5);
  };

  const startLabel = `${hours[sH]} : ${minutes[sM]} ${ampm[sP]}`;
  const endLabel = `${hours[eH]} : ${minutes[eM]} ${ampm[eP]}`;

  return (
    <div className={styles.fullscreen}>
      <div className={styles.stage}>
        <div className={styles.title}>Choose a Time</div>

        {/* 6 cogs */}
        <div className={styles.cogsRow}>
          <div className={styles.cogGroup}>
            <CogWheel
              values={hours}
              valueIndex={sH}
              onCommit={setSH}
              onHaptic={haptic}
              ariaLabel="Start hour"
            />
            <CogWheel
              values={minutes}
              valueIndex={sM}
              onCommit={setSM}
              onHaptic={haptic}
              ariaLabel="Start minute"
            />
            <CogWheel
              values={ampm}
              valueIndex={sP}
              onCommit={setSP}
              onHaptic={haptic}
              ariaLabel="Start AM/PM"
            />
          </div>

          <div className={styles.cogGroup}>
            <CogWheel
              values={hours}
              valueIndex={eH}
              onCommit={setEH}
              onHaptic={haptic}
              ariaLabel="End hour"
            />
            <CogWheel
              values={minutes}
              valueIndex={eM}
              onCommit={setEM}
              onHaptic={haptic}
              ariaLabel="End minute"
            />
            <CogWheel
              values={ampm}
              valueIndex={eP}
              onCommit={setEP}
              onHaptic={haptic}
              ariaLabel="End AM/PM"
            />
          </div>
        </div>

        {/* Selection Window */}
        <div className={styles.selectionWindow} aria-hidden="true">
          <div className={styles.selectionText}>
            <span className={styles.selectedValue}>{startLabel}</span>
            <span className={styles.arrow}>→</span>
            <span className={styles.selectedValue}>{endLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
