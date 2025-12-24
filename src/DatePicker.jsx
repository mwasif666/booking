import React, { useMemo, useState } from "react";
import { DateRange } from "react-date-range";
import { startOfMonth, endOfMonth } from "date-fns";
import { enUS } from "date-fns/locale";

import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

import styles from "./DatePicker.module.css";

export default function DatePickerRDR() {
  const today = new Date();

  const [range, setRange] = useState([
    {
      startDate: startOfMonth(today),
      endDate: endOfMonth(today),
      key: "selection",
    },
  ]);

  const shownDate = useMemo(
    () => range?.[0]?.startDate || today,
    [range, today]
  );

  const onWholeMonth = () => {
    const s = startOfMonth(shownDate);
    const e = endOfMonth(shownDate);
    setRange([{ startDate: s, endDate: e, key: "selection" }]);
  };

  return (
    <div className={styles.fullscreen}>
      <div className={styles.topBar}>
        <div className={styles.backArrow}>←</div>
      </div>

      {/* ✅ Bootstrap Grid */}
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-lg-7">
            <div className={styles.stage}>
              <div className={styles.title}>Choose a Date</div>

              <div className={`${styles.card} shadow-sm`}>
                <div className={styles.cardHeader}>
                  <div className={styles.monthTitle}>
                    {shownDate.toLocaleString("en-US", { month: "long" })}
                  </div>

                  <button
                    type="button"
                    className={styles.wholeMonthBtn}
                    onClick={onWholeMonth}
                  >
                    Whole month
                  </button>
                </div>

                <div className={styles.calendarWrap}>
                  <DateRange
                    locale={enUS}
                    ranges={range}
                    onChange={(item) => setRange([item.selection])}
                    moveRangeOnFirstSelection={false}
                    editableDateInputs={false}
                    showDateDisplay={false}
                    showMonthAndYearPickers={false}
                    months={1}
                    direction="horizontal"
                    rangeColors={["#2f67ff"]}
                    weekdayDisplayFormat="EEEEE"
                    monthDisplayFormat="MMMM yyyy"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-5"></div>
        </div>
      </div>
    </div>
  );
}
