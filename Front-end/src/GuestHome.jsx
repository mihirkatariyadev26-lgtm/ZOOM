import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./GuestHome.css";

export default function GuestHome() {
  const [meetingCode, setMeetingCode] = useState("");
  const navigate = useNavigate();

  const handleJoinVideoCall = () => {
    if (meetingCode.trim()) {
      navigate(`/${meetingCode}`);
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
