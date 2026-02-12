import { Router } from "express";
import { login, signup } from "../Controller/user.controller.js";

const UserRouter = Router();

UserRouter.route("/login").post(login);
UserRouter.route("/signup").post(signup);

export default UserRouter;
