import { Router } from "express";
import {
  getUserHistory,
  addToHistory,
  login,
  signup,
  cleanupHistory,
  createMeeting,
  checkMeeting,
} from "../Controller/user.controller.js";

const UserRouter = Router();

UserRouter.route("/login").post(login);
UserRouter.route("/signup").post(signup);
UserRouter.route("/add_activity").post(addToHistory);
UserRouter.route("/get_all_activity").get(getUserHistory);
UserRouter.route("/cleanup").delete(cleanupHistory);
UserRouter.route("/create_meeting").post(createMeeting);
UserRouter.route("/check_meeting").get(checkMeeting);
export default UserRouter;
