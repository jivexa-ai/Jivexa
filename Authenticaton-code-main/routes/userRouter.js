import express from "express";
import { 
  login, 
  logout, 
  signup, 
  profile, 
  sendOTP, 
  verifyOTP, 
  submitVerification,
  verifyEmail,
  resendVerificationEmail
} from "../controller/userController.js";
import authUserMiddlewares from "../middlewares/authuserMiddlewares.js";

const userRouter = express.Router();

userRouter.post("/login", login);
userRouter.post("/signup", signup);
userRouter.post("/logout", logout);
userRouter.get("/profile", authUserMiddlewares, profile);
userRouter.get("/me", authUserMiddlewares, profile);
userRouter.post("/send-otp", sendOTP);
userRouter.post("/verify-otp", verifyOTP);
userRouter.post("/submit-verification", authUserMiddlewares, submitVerification);
userRouter.post("/verify-email", verifyEmail);
userRouter.post("/resend-verification-email", resendVerificationEmail);

export default userRouter;