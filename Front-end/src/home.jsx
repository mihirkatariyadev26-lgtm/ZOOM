import { useNavigate, useRoutes } from "react-router-dom";
import withAuth from "./utils/withAuth.jsx";
import { useContext, useState } from "react";
import "./home.css";
import Button from "@mui/material/Button";
import ExitToAppOutlinedIcon from "@mui/icons-material/ExitToAppOutlined";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import { AuthContext } from "./context/Authentication.jsx";

function HomeComponent() {
  const [meetingCode, setMeetingCode] = useState("");
  let navigate = useNavigate();
  const { userData } = useContext(AuthContext);
  let handelJoinVideoCall = async () => {
    if (meetingCode.trim()) {
      navigate(`/${meetingCode}`);
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
        </div>
        <div className="right">
          <img src="../public/home.png" alt="" />
        </div>
      </div>
    </div>
  );
}
export default withAuth(HomeComponent);
