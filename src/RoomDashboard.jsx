// RoomDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import styles from "./RoomDashboard.module.css";

import {
  FaUsers,
  FaClock,
  FaRegCalendarAlt,
  FaArrowRight,
  FaArrowUp,
} from "react-icons/fa";
import { HiArrowUpRight, HiArrowRight } from "react-icons/hi2";
import { Link } from "react-router-dom";

const bookingsSample = [
  {
    id: 1,
    title: "Boobmoard",
    dateOffset: 0,
    start: "08:37",
    end: "09:37",
    thumb: null,
  },
  {
    id: 2,
    title: "Boobmoard",
    dateOffset: 1,
    start: "08:37",
    end: "09:37",
    thumb: null,
  },
  {
    id: 3,
    title: "Boobmoard",
    dateOffset: 2,
    start: "08:37",
    end: "09:37",
    thumb: null,
  },
  {
    id: 4,
    title: "Boobmoard",
    dateOffset: 3,
    start: "08:37",
    end: "09:37",
    thumb: null,
  },
];

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function formatTimeHHMM(t) {
  const [hh, mm] = t.split(":").map(Number);
  let period = hh >= 12 ? "PM" : "AM";
  let hour = hh % 12 || 12;
  return `${pad(hour)}:${pad(mm)}${period}`;
}

function buildDateFromTime(dateBase, timeStr) {
  const [hh, mm] = timeStr.split(":").map(Number);
  const d = new Date(dateBase);
  d.setHours(hh, mm, 0, 0);
  return d;
}

export default function RoomDashboard() {
  const [now, setNow] = useState(new Date());

  // build booking list with real Date objects
  const bookings = useMemo(() => {
    return bookingsSample.map((b) => {
      const date = new Date();
      date.setDate(date.getDate() + b.dateOffset);
      const startDT = buildDateFromTime(date, b.start);
      const endDT = buildDateFromTime(date, b.end);
      return { ...b, dateObj: date, startDT, endDT };
    });
  }, []);

  // pick next upcoming booking
  const nextBooking = useMemo(() => {
    const sorted = bookings.slice().sort((a, b) => a.startDT - b.startDT);
    return sorted.find((b) => b.startDT > now) || null;
  }, [bookings, now]);

  const [countdown, setCountdown] = useState({
    mm: "10",
    ss: "00",
    totalSeconds: 600,
  });

  // live time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // 10-minute free time countdown
  useEffect(() => {
    let remaining = 600;
    const id = setInterval(() => {
      remaining -= 1;
      if (remaining < 0) remaining = 0;
      const mm = Math.floor((remaining % 3600) / 60);
      const ss = remaining % 60;
      setCountdown({
        mm: pad(mm),
        ss: pad(ss),
        totalSeconds: remaining,
      });
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const isFree = countdown.totalSeconds > 0;

  // formatted clock
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
    <div className={styles.wrapper}>
      <div className="container-fluid h-100">
        <div className="row gy-4">
          {/* Left Section */}
          <div className="col-12 col-md-8">
            <div className={styles.leftCard}>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className={styles.brand}>BoobMoard</div>
                  <h1 className={styles.title}>Conference Room 01</h1>

                  <div className="mt-3 d-flex gap-2 flex-wrap">
                    <span className={styles.pill}>08 People</span>
                    <span className={styles.pill}>Smart TV</span>
                    <span className={styles.pill}>Whiteboard</span>
                    <span className={styles.pill}>24/7 Access</span>
                  </div>
                </div>
              </div>

              <hr className={styles.sep} />

              <div>
                <div className={styles.statusBig}>
                  {isFree ? "Free" : "Booked"}
                </div>

                <div className="d-flex align-items-center gap-4 mt-3">
                  <div className={styles.forNext}>For Next</div>
                  <div className={styles.countdown}>
                    00:{countdown.mm}:{countdown.ss} Minutes
                  </div>

                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${(countdown.totalSeconds / 600) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <div className={styles.iconplustext}>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <FaUsers className={styles.icon} /> <span>Boobmoard</span>
                    </div>
                    <div className="d-flex align-items-center gap-3 mb-2">
                      <FaClock className={styles.icon} />{" "}
                      <span>06:00PM - 09:00PM</span>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <FaRegCalendarAlt className={styles.icon} />{" "}
                      <span>Thursday, 18 September 2025</span>
                    </div>
                  </div>
                </div>

                <hr className={styles.sep} />

                <div className="mt-5 d-flex justify-content-start gap-4">
                  <Link to="/pin" className={styles.bookButton}>
                    <span>Book Now</span>
                    <span className={styles.arrow}>
                      <HiArrowRight />
                    </span>
                  </Link>
                  <button className={styles.bookButton}>
                    <span>Contact MGMT</span>
                    <span className={styles.arrow}>
                      <HiArrowUpRight />
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="col-12 col-md-4">
            <div className="row">
              <div className="col-12">
                <div className={styles.currentTimeBox}>
                  <div className={styles.smallText}>Current Time</div>
                  <div className={styles.bigTime}>{currentTimeFormatted}</div>
                  <div className={styles.tinyDate}>{currentDateLong}</div>
                </div>
              </div>
              <div className={` scrollcard ${styles.heightScroll}`}>
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
                          {[
                            ...bookings.slice(0, 1),
                            ...bookings.slice(0, 1),
                          ].map((b, i) => (
                            <div key={i} className={styles.smallCard}>
                              <div className={styles.thumb}></div>
                              <div className={styles.cardContent}>
                                <div className={styles.cardTitle}>
                                  {b.title}
                                </div>
                                <div className={styles.cardTime}>
                                  {formatTimeHHMM(b.start)}{" "}
                                  <img src="/Arrow.svg" alt="" />
                                  {formatTimeHHMM(b.end)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                                <div className={styles.cardTitle}>
                                  {b.title}
                                </div>
                                <div className={styles.cardTime}>
                                  {formatTimeHHMM(b.start)}{" "}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
