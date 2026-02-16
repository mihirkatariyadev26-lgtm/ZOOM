import "./Landing.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
export default function LandingPage() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  const handleSignout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <div className="LandingPage">
      <nav className="Nav">
        <div className="BrandName">
          <h2 className="text-white">Durbhashi</h2>
        </div>
        <div className="NavInfo text-white">
          <p onClick={() => navigate("/home")} role="button">
            Home
          </p>
          <p onClick={() => navigate("/guest")} role="button">
            Join as Guest
          </p>
          {isLoggedIn ? (
            <p onClick={handleSignout} role="button">
              Signout
            </p>
          ) : (
            <>
              <p onClick={() => navigate("/auth")}>Register</p>
              <p role="button" onClick={() => navigate("/auth")}>
                Login
              </p>
            </>
          )}
        </div>
      </nav>

      <div className="MainContainer">
        <div className="Tag-line ">
          <h1 className="text-6xl text-white">
            Let's <span style={{ color: "#ff9839" }}>Connect</span> with the
            Spirite <br />
            of Learning
          </h1>
          <p className="text-white">
            Distance Doesn't Matter For{" "}
            <span style={{ color: "#ff9839" }}>Learning</span>
          </p>
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
