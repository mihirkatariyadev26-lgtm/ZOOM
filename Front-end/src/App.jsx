import "./App.css";
import VideoMeetComponent from "./VideoMeet.jsx";
import LandingPage from "./Landing";
import History from "./history.jsx";
import HomeComponent from "./home.jsx";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
// import Dashboard from "../components/Dashboard/Dashboard";
import { AuthProvider } from "./context/Authentication";
import Authentication from "./authentication";
function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          <Route path="/home" element={<HomeComponent />} />
          <Route path="/History" element={<History />} />
          <Route path="/:url" element={<VideoMeetComponent />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
