import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";

const login = async (req, res) => {
  const { Username, password } = req.body;

  // Input validation
  if (!Username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Username and password are required",
    });
  }

  try {
    const user = await User.findOne({ Username });
    if (!user) {
      return res
        .status(httpStatus.NOT_FOUND)
        .json({ message: "User not found" });
    }

    let isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (isPasswordCorrect) {
      let token = crypto.randomBytes(20).toString("hex");
      user.token = token;
      await user.save();
      return res.status(httpStatus.OK).json({ token: token });
    } else {
      return res
        .status(httpStatus.UNAUTHORIZED)
        .json({ message: "Invalid Username or Password" });
    }
  } catch (e) {
    console.error("Login error:", e);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred during login",
    });
  }
};

const signup = async (req, res) => {
  const { name, Username, password } = req.body;

  // Input validation
  if (!name || !Username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Name, username, and password are required",
    });
  }

  if (password.length < 6) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: "Password must be at least 6 characters long",
    });
  }

  try {
    const existingUser = await User.findOne({ Username });
    if (existingUser) {
      return res.status(httpStatus.CONFLICT).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newuser = new User({
      name: name,
      Username: Username,
      password: hashedPassword,
    });

    await newuser.save();
    res.status(httpStatus.CREATED).json({
      message: "User registered successfully",
    });
  } catch (e) {
    console.error("Signup error:", e);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred during registration",
    });
  }
};

export { login, signup };
