import User from "../model/userSchema.js";
import jwt from "jsonwebtoken";

const authUserMiddlewares = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first. No authentication token provided."
      });
    }

    const secret = process.env.JWT_SECRET || 'jivexa_health_jwt_secret_key_2026_super_secure_auth_token_string';

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again."
      });
    }

    const existingUser = await User.findById(payload.id);

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User account not found"
      });
    }

    req.user = existingUser;
    next();
  } catch (error) {
    console.error("[Auth Middleware Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication"
    });
  }
};

export default authUserMiddlewares;