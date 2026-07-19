import { Router } from "express";
import userController from "./user.controller.js";
import { protect } from "../../middlewares/auth.js";

const userRouter = Router();

userRouter.get("/me", protect, userController.getMe);

userRouter.get("/me/inventories", protect, userController.getMyInventories);

export default userRouter;
