import axios from "axios";
import { createContext, useState } from "react";

import httpStatus from "http-status";

export const AuthContext = createContext();

export const client = axios.create({
  baseURL: "http://localhost:9000/api/v1/users",
});

export const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const handleRegister = async (name, Username, Password) => {
    try {
      let request = await client.post("/signup", {
        name: name,
        Username: Username,
        password: Password,
      });
      if (request.status === httpStatus.CREATED) {
        return request.data.message;
      }
    } catch (error) {
      throw error;
    }
  };
  const handleLogin = async (Username, Password) => {
    try {
      let request = await client.post("/login", {
        Username: Username,
        password: Password,
      });
      if (request.status === httpStatus.OK) {
        localStorage.setItem("token", request.data.token);
        setUserData({ Username, token: request.data.token });
        return { success: true, token: request.data.token };
      }
    } catch (error) {
      throw error;
    }
  };
  const data = {
    userData,
    setUserData,
    handleRegister,
    handleLogin,
  };
  return <AuthContext.Provider value={data}>{children}</AuthContext.Provider>;
};
