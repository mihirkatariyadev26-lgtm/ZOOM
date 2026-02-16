import { useNavigate, useRoutes } from "react-router-dom";
import withAuth from "./utils/withAuth.jsx";
import { useContext, useState } from "react";
import "./home.css";
import Button from "@mui/material/Button";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { AuthContext } from "./context/Authentication.jsx";
import axios from "axios";

function HomeComponent() {
  const [meetingCode, setMeetingCode] = useState("");
  let navigate = useNavigate();
  const { userData } = useContext(AuthContext);

  const generateMeetingCode = async () => {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let code = "";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code += "-";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/create_meeting`,
        {
          token: token,
          meeting_code: code,
        },
      );
      setMeetingCode(code);
    } catch (error) {
      console.error("Error creating meeting:", error);
      alert("Failed to create meeting. Please try again.");
    }
  };

  let handelJoinVideoCall = async () => {
    if (!meetingCode.trim()) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/check_meeting`,
        {
          params: { meeting_code: meetingCode },
        },
      );
      if (response.data.exists) {
        navigate(`/${meetingCode}`);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert(
          "Meeting not found. Please check the code or create a new meeting.",
        );
      } else {
        alert("Error checking meeting. Please try again.");
      }
    }
  };

  return (
    <div className="homepage">
      <div className="navbar">
        <div
          className="logo"
          onClick={() => {
            navigate("/");
          }}>
          Durbhashi
        </div>
        <div className="menu">
          <div
            onClick={() => {
              navigate("/History");
            }}>
            <HistoryRoundedIcon />
            History
          </div>
          <div>
            <Button
              variant="outlined"
              color="white"
              onClick={() => {
                localStorage.removeItem("token");
                navigate("/auth");
              }}>
              Signout
              <ExitToAppOutlinedIcon />
            </Button>
          </div>
        </div>
      </div>
      <div className="content">
        <div className="left">
          <p>
            WE Providing{" "}
            <span style={{ color: "orange" }}>Quality Video Call</span> Just
            Like <span style={{ color: "orange" }}>Quality Education...</span>
          </p>
          <div className="inp">
            <input
              type="text"
              className="MeetingCode"
              value={meetingCode}
              placeholder="Meeting code..."
              onChange={(e) => setMeetingCode(e.target.value)}
            />
            <div className="join" role="button" onClick={handelJoinVideoCall}>
              Join
            </div>
          </div>
          <div
            className="create-btn"
            role="button"
            onClick={generateMeetingCode}>
            Create Meeting
          </div>
        </div>
        <div className="right">
          <img src="../public/home.png" alt="" />
        </div>
      </div>
    </div>
  );
}
export default withAuth(HomeComponent);
