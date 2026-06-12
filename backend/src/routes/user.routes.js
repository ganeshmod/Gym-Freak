import express from "express";
import { fetchUser, updateUser, removeAddress } from "../controller/user.controller.js";
import { authenticateToken } from "../utils/auth.middleware.js";

const UserRouter = express.Router()

UserRouter.get("/fetchUser", authenticateToken, fetchUser)
UserRouter.post("/updateUser", authenticateToken, updateUser)
UserRouter.post("/removeAddress", authenticateToken, removeAddress)

export default UserRouter;