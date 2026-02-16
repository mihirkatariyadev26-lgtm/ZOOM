import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./GuestHome.css";
import axios from "axios";

export default function GuestHome() {
  const [meetingCode, setMeetingCode] = useState("");
  const navigate = useNavigate();

  const handleJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    try {
      const response = await axios.get(
        "http://localhost:9000/api/v1/users/check_meeting",
        {
          params: { meeting_code: meetingCode },
        },
      );
      if (response.data.exists) {
        navigate(`/${meetingCode}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("Meeting not found. Please check the meeting code.");
      } else {
        alert("Error checking meeting. Please try again.");
      }
    }
  };

  return (
    <div className="guest-homepage">
      <div className="guest-navbar">
        <div className="guest-logo" onClick={() => navigate("/")}>
          Durbhashi
        </div>
        <div className="guest-menu">
          <button
            className="guest-auth-btn guest-login-btn"
            onClick={() => navigate("/auth")}>
            Login
          </button>
          <button
            className="guest-auth-btn guest-signup-btn"
            onClick={() => navigate("/auth")}>
            Sign Up
          </button>
        </div>
      </div>
      <div className="guest-content">
        <div className="guest-left">
          <p>
            WE Providing{" "}
            <span style={{ color: "orange" }}>Quality Video Call</span> Just
            Like <span style={{ color: "orange" }}>Quality Education...</span>
          </p>
          <div className="guest-inp">
            <input
              type="text"
              className="guest-MeetingCode"
              value={meetingCode}
              placeholder="Enter Meeting Code..."
              onChange={(e) => setMeetingCode(e.target.value)}
            />
            <div
              className="guest-join"
              role="button"
              onClick={handleJoinVideoCall}>
              Join
            </div>
          </div>
        </div>
        <div className="guest-right">
          <img src="../public/home.png" alt="" />
        </div>
      </div>
    </div>
  );
}
