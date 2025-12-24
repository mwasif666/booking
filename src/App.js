import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RoomDashboard from "./RoomDashboard";
import PinEntry from "./PIn";
import CalendarScreen from "./DatePick";
import Sidebar from "./Sidebar";
import TimePicker from "./TimePicker";
import DatePickerRDR from "./DatePicker";

const App = () => {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<RoomDashboard />} />
          <Route path="/pin" element={<PinEntry />} />
          <Route path="/date" element={<CalendarScreen />} />
          <Route path="/sidebar" element={<Sidebar />} />
          <Route path="/usecog" element={<TimePicker />} />
          <Route path="/datepick" element={<DatePickerRDR />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;
