import "react-datepicker/dist/react-datepicker.css";
import styles from "./CalendarScreen.module.css";
import Sidebar from "./Sidebar";
import TimePickerPanel from "./TimePickerPanel";
import TimePicker from "./TimePicker";

export default function CalendarScreen() {
  return (
    <div className={styles.page}>
      <div className="row g-0">
        <div className={`col-lg-8 ${styles.left}`}>
          <TimePicker />
        </div>

        <div className="col-12 col-md-4 pe-5 pt-4 bg-dark text-white">
          <Sidebar />
        </div>
      </div>
    </div>
  );
}
