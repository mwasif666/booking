import React, { useState, useEffect, useMemo } from "react";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import { ImCross } from "react-icons/im";
import { Link, useNavigate } from "react-router-dom";
import styles from "./RoomDashboard.module.css";

const bookingsSample = [
  { id: 1, title: "Boobmoard", dateOffset: 0, start: "08:37", end: "09:37" },
  { id: 2, title: "Boobmoard", dateOffset: 1, start: "08:37", end: "09:37" },
  { id: 3, title: "Boobmoard", dateOffset: 2, start: "08:37", end: "09:37" },
  { id: 4, title: "Boobmoard", dateOffset: 3, start: "08:37", end: "09:37" },
];

// ---------------- Helpers ------------------
function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTimeHHMM(t) {
  const [hh, mm] = t.split(":").map(Number);
  const period = hh >= 12 ? "PM" : "AM";
  const hour = hh % 12 || 12;
  return `${pad(hour)}:${pad(mm)}${period}`;
}

function buildDateFromTime(dateBase, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const d = new Date(dateBase);
  d.setHours(hh, mm, 0, 0);
  return d;
}

// ---------------- Component ------------------
const Sidebar = () => {
  const [pin, setPin] = useState("");
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();

  const handleInput = (value) => {
    if (pin.length < 6) setPin(pin + value);
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleSubmit = () => {
    alert(`Entered PIN: ${pin}`);
    navigate("/date");
  };

  // Build booking dates
  const bookings = useMemo(() => {
    return bookingsSample.map((b) => {
      const date = new Date();
      date.setDate(date.getDate() + b.dateOffset);

      const startDT = buildDateFromTime(date, b.start);
      const endDT = buildDateFromTime(date, b.end);

      return { ...b, dateObj: date, startDT, endDT };
    });
  }, []);

  // Live time
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Current time formatted
  const currentTimeFormatted = (() => {
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    const period = h >= 12 ? "PM" : "AM";
    const hh = h % 12 || 12;

    return `${pad(hh)}:${pad(m)}:${pad(s)}${period}`;
  })();

  const currentDateLong = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="">
      <div className="row">
        {/* ---------------- Right Side ---------------- */}
        <div className="col-12 pe-5 pt-4 bg-dark text-white">
          <div className="row">
            {/* Clock Box */}
            <div className="col-12">
              <div className={styles.currentTimeBox}>
                <div className={styles.smallText}>Current Time</div>
                <div className={styles.bigTime}>{currentTimeFormatted}</div>
                <div className={styles.tinyDate}>{currentDateLong}</div>
              </div>
            </div>

            {/* Scrollable Section */}
            <div className={`scrollcard ${styles.heightScroll}`}>
              {/* Up Next Today */}
              <div className="col-12">
                <div className={styles.rightCol}>
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className={styles.sideHeading}>Up Next Today</div>
                      <div className={styles.sideDate}>
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>

                    <div className={styles.marqueeContainer}>
                      <div className={styles.marqueeTrack}>
                        {[...bookings.slice(0, 1), ...bookings.slice(0, 1)].map(
                          (b, i) => (
                            <div key={i} className={styles.smallCard}>
                              <div className={styles.thumb}></div>

                              <div className={styles.cardContent}>
                                <div className={styles.cardTitle}>
                                  {b.title}
                                </div>
                                <div className={styles.cardTime}>
                                  {formatTimeHHMM(b.start)}
                                  <img src="/Arrow.svg" alt="" />
                                  {formatTimeHHMM(b.end)}
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tomorrow */}
              <div className="col-12">
                <div>
                  <div className="mb-3 d-flex justify-content-between align-items-center">
                    <div className={styles.sideHeading}>Tomorrow</div>
                    <div className={styles.sideDate}>
                      {new Date(Date.now() + 86400000).toLocaleDateString()}
                    </div>
                  </div>

                  <div className={styles.marqueeContainer}>
                    <div className={styles.marqueeTrack}>
                      {[...bookings.slice(1), ...bookings.slice(1)].map(
                        (b, i) => (
                          <div key={i} className={styles.smallCard}>
                            <div className={styles.thumb}></div>

                            <div className={styles.cardContent}>
                              <div className={styles.cardTitle}>{b.title}</div>
                              <div className={styles.cardTime}>
                                {formatTimeHHMM(b.start)}
                                <img src="/Arrow.svg" alt="" />
                                {formatTimeHHMM(b.end)}
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* End Right Section */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
