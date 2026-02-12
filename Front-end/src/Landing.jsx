import "./Landing.css";
import { useNavigate } from "react-router-dom";
export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="LandingPage">
      <nav className="Nav">
        <div className="BrandName">
          <h2 className="text-white">Durbhashi</h2>
        </div>
        <div className="NavInfo text-white">
          <p onClick={() => navigate("/hello")} role="button">
            Join as Guest
          </p>
          <p onClick={() => navigate("/auth")}>Register</p>
          <div role="button" onClick={() => navigate("/auth")}>
            Login
          </div>
        </div>
      </nav>

      <div className="MainContainer">
        <div className="Tag-line ">
          <h1 className="text-6xl text-white">
            Let's <span style={{ color: "#ff9839" }}>Connect</span> with the
            Spirite <br /> of Learning
          </h1>
          <p className="text-white">Distance Doesn't Matter For LEARNING</p>
          <div
            className="start text-white"
            role="button"
            onClick={() => navigate("/auth")}>
            Get Started!
          </div>
        </div>
        <div className="Mobile">
          <img src="/mobile.png" className="w-[500px]" />
        </div>
      </div>
    </div>
  );
}
