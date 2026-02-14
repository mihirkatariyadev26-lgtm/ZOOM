import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/Authentication";
import { Route, useNavigate } from "react-router-dom";
import "./history.css";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function History() {
  const { getUserHistory } = useContext(AuthContext);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const routeTo = useNavigate();
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const History = await getUserHistory();
        setMeetings(Array.isArray(History) ? History : []);
      } catch (e) {
        console.log("Error fetching history:", e);
        setMeetings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [getUserHistory]);

  return (
    <div className="history">
      <div
        className="home"
        onClick={() => {
          routeTo("/home");
        }}>
        <HomeOutlinedIcon />
        Home
      </div>
      <div className="cards">
        {loading ? (
          <p>Loading your meetings...</p>
        ) : meetings.length > 0 ? (
          meetings.map((e) => {
            return (
              <div className="card" key={e._id}>
                <div className="code">Code: {e.meeting_code}</div>
                <br />
                <div className="date">{formatDate(e.date)}</div>
              </div>
            );
          })
        ) : (
          <p>No meetings found</p>
        )}
      </div>
    </div>
  );
}
