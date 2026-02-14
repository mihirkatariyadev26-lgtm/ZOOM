import { User } from "../models/user.model.js";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import crypto from "crypto";
import Meeting from "../models/meeting.model.js";
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

let getUserHistory = async (req, res) => {
  let { token } = req.query;
  try {
    if (!token) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Token is required",
      });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found",
      });
    }

    console.log(`Fetching history for user: ${user.Username}`);
    const meetings = await Meeting.find({ user_id: user.Username }).sort({
      date: -1,
    });
    console.log(`Found ${meetings.length} meetings for ${user.Username}`);
    res.json(meetings);
  } catch (e) {
    console.error("Get history error:", e);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while retrieving history",
    });
  }
};

const addToHistory = async (req, res) => {
  const { token, meeting_code } = req.body;
  try {
    if (!token || !meeting_code) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: "Token and meeting_code are required",
      });
    }

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: "User not found",
      });
    }

    console.log(`Adding meeting ${meeting_code} for user ${user.Username}`);

    const newMeeting = new Meeting({
      user_id: user.Username,
      meeting_code: meeting_code,
      date: new Date(),
    });

    await newMeeting.save();
    console.log(`Meeting saved successfully for ${user.Username}`);
    res.status(httpStatus.CREATED).json({
      message: "Meeting added to history",
      meeting: newMeeting,
    });
  } catch (e) {
    console.error("Add to history error:", e);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred while adding to history",
    });
  }
};

const cleanupHistory = async (req, res) => {
  try {
    // Delete all meetings created before fix (old ones with user.name)
    const result = await Meeting.deleteMany({});
    console.log(
      `Cleanup: Deleted all old meetings. Count: ${result.deletedCount}`,
    );
    res.status(httpStatus.OK).json({
      message: `Deleted ${result.deletedCount} old meetings. History is now clean!`,
    });
  } catch (e) {
    console.error("Cleanup error:", e);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: "An error occurred during cleanup",
    });
  }
};

export { login, signup, addToHistory, getUserHistory, cleanupHistory };
