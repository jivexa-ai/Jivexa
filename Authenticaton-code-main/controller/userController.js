import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from "../model/userSchema.js";
import { signupSchema, loginSchema } from "../validators/userValidators.js";

const Createtoken = (id, email, role = 'PATIENT') => {
  const secret = process.env.JWT_SECRET || 'jivexa_health_jwt_secret_key_2026_super_secure_auth_token_string';
  const token = jwt.sign({ id, email, role }, secret, { expiresIn: "7d" });
  return token;
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
});

export const signup = async (req, res) => {
  try {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Validation failed";
      return res.status(400).json({
        success: false,
        message: firstError,
        errors: result.error.issues
      });
    }

    const {
      name,
      age,
      email,
      password,
      role,
      nmcRegistrationNumber,
      stateMedicalCouncil,
      vehicleNumber,
      drugLicenseNumber,
      gstin
    } = result.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email address is already registered. Please sign in instead."
      });
    }

    const hashpassword = await bcrypt.hash(password, 12);

    const userCreate = await User.create({
      name,
      age,
      email,
      password: hashpassword,
      role: role || 'PATIENT',
      nmcRegistrationNumber,
      stateMedicalCouncil,
      vehicleNumber,
      drugLicenseNumber,
      gstin
    });

    const token = Createtoken(userCreate._id, email, userCreate.role);

    res.cookie("token", token, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        id: userCreate._id.toString(),
        name: userCreate.name,
        email: userCreate.email,
        role: userCreate.role,
        verified: userCreate.verified,
        emailVerified: userCreate.emailVerified,
        accountStatus: userCreate.accountStatus,
        age: userCreate.age,
        usage: userCreate.usage,
        professionalDetails: userCreate.nmcRegistrationNumber ? { nmcRegistrationNumber: userCreate.nmcRegistrationNumber, stateMedicalCouncil: userCreate.stateMedicalCouncil } : undefined,
        vehicleDetails: userCreate.vehicleNumber ? { vehicleNumber: userCreate.vehicleNumber } : undefined,
        licenseDetails: userCreate.drugLicenseNumber ? { drugLicenseNumber: userCreate.drugLicenseNumber, gstin: userCreate.gstin } : undefined
      }
    });
  } catch (error) {
    console.error("[Signup Controller Error]:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error during registration"
    });
  }
};

export const login = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || "Validation failed";
      return res.status(400).json({
        success: false,
        message: firstError,
        errors: result.error.issues
      });
    }

    const { email, password, role } = result.data;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    if (role && existingUser.role !== role) {
      return res.status(401).json({
        success: false,
        message: `This account is registered as a ${existingUser.role}. Please log in using the ${existingUser.role} portal.`
      });
    }

    const token = Createtoken(existingUser._id, email, existingUser.role);

    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: existingUser._id.toString(),
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role || 'PATIENT',
        verified: existingUser.verified,
        emailVerified: existingUser.emailVerified,
        accountStatus: existingUser.accountStatus,
        age: existingUser.age,
        usage: existingUser.usage,
        professionalDetails: existingUser.nmcRegistrationNumber ? { nmcRegistrationNumber: existingUser.nmcRegistrationNumber, stateMedicalCouncil: existingUser.stateMedicalCouncil } : undefined,
        vehicleDetails: existingUser.vehicleNumber ? { vehicleNumber: existingUser.vehicleNumber } : undefined,
        licenseDetails: existingUser.drugLicenseNumber ? { drugLicenseNumber: existingUser.drugLicenseNumber, gstin: existingUser.gstin } : undefined
      }
    });
  } catch (error) {
    console.error("[Login Controller Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login"
    });
  }
};

export const logout = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
  return res.status(200).json({
    success: true,
    message: "User logged out successfully"
  });
};

export const profile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: {
        id: req.user._id.toString(),
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || 'PATIENT',
        verified: req.user.verified,
        emailVerified: req.user.emailVerified,
        accountStatus: req.user.accountStatus,
        age: req.user.age,
        usage: req.user.usage,
        professionalDetails: req.user.nmcRegistrationNumber ? { nmcRegistrationNumber: req.user.nmcRegistrationNumber, stateMedicalCouncil: req.user.stateMedicalCouncil } : undefined,
        vehicleDetails: req.user.vehicleNumber ? { vehicleNumber: req.user.vehicleNumber } : undefined,
        licenseDetails: req.user.drugLicenseNumber ? { drugLicenseNumber: req.user.drugLicenseNumber, gstin: req.user.gstin } : undefined
      }
    });
  } catch (error) {
    console.error("[Profile Controller Error]:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error retrieving user profile"
    });
  }
};

export const sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const masked = normalizedEmail.replace(/(.{2})(.*)(?=@)/, '$1***');

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: `OTP verification code sent to ${masked}`,
        maskedEmail: masked,
        previewUrl: 'https://ethereal.email'
      });
    }

    // Rate limiting: 60 seconds between OTP requests per email
    if (user.otpLastSentAt && (Date.now() - new Date(user.otpLastSentAt).getTime()) < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting another OTP code."
      });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otpCode, 10);
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otpHash = otpHash;
    user.otpExpiresAt = otpExpiresAt;
    user.otpLastSentAt = new Date();
    await user.save();

    console.log(`[OTP Generated for ${normalizedEmail}]: ${otpCode}`);

    return res.status(200).json({
      success: true,
      message: `OTP verification code sent to ${masked}`,
      maskedEmail: masked,
      previewUrl: 'https://ethereal.email'
    });
  } catch (err) {
    console.error("[Send OTP Error]:", err);
    return res.status(500).json({ success: false, message: "Internal server error sending OTP" });
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !user.otpHash || !user.otpExpiresAt) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
    }

    if (new Date() > new Date(user.otpExpiresAt)) {
      user.otpHash = undefined;
      user.otpExpiresAt = undefined;
      await user.save();
      return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
    }

    const isMatch = await bcrypt.compare(code, user.otpHash);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
    }

    user.otpHash = undefined;
    user.otpExpiresAt = undefined;
    user.emailVerified = true;
    await user.save();

    const token = Createtoken(user._id, user.email, user.role);
    res.cookie("token", token, getCookieOptions());

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        verified: user.verified,
        emailVerified: user.emailVerified,
        accountStatus: user.accountStatus
      }
    });
  } catch (err) {
    console.error("[Verify OTP Error]:", err);
    return res.status(400).json({ success: false, message: "Invalid or expired OTP code" });
  }
};

export const submitVerification = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required"
      });
    }

    const { nmcRegistrationNumber, stateMedicalCouncil, vehicleNumber, drugLicenseNumber, gstin } = req.body;

    user.accountStatus = 'PENDING_REVIEW';
    if (nmcRegistrationNumber !== undefined) user.nmcRegistrationNumber = nmcRegistrationNumber;
    if (stateMedicalCouncil !== undefined) user.stateMedicalCouncil = stateMedicalCouncil;
    if (vehicleNumber !== undefined) user.vehicleNumber = vehicleNumber;
    if (drugLicenseNumber !== undefined) user.drugLicenseNumber = drugLicenseNumber;
    if (gstin !== undefined) user.gstin = gstin;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Professional credentials submitted for verification",
      accountStatus: 'PENDING_REVIEW'
    });
  } catch (e) {
    console.error("[Submit Verification Error]:", e);
    return res.status(500).json({
      success: false,
      message: "Error submitting verification details"
    });
  }
};