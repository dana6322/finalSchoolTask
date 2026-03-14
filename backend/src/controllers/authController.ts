import { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/userModel";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/authMiddleware";

const sendError = (code: number, message: string, res: Response) => {
  res.status(code).json({ message });
};

type GeneratedTokens = {
  token: string;
  refreshToken: string;
};

const generateToken = (userId: string): GeneratedTokens => {
  const secret = process.env.JWT_SECRET || "default_secret";
  //TODO: check if no secret close the server
  const expiresIn = parseInt(process.env.JWT_EXPIRES_IN || "3600");
  const token = jwt.sign({ _id: userId }, secret, { expiresIn: expiresIn });

  const refreshExpiresIn = parseInt(
    process.env.REFRESH_TOKEN_EXPIRES_IN || "1440",
  );
  const rand = Math.floor(Math.random() * 1000);
  const refreshToken = jwt.sign({ _id: userId, rand: rand }, secret, {
    expiresIn: refreshExpiresIn,
  });
  return { token, refreshToken };
};

const register = async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;
  const userName = req.body.userName;
  if (!email || !password) {
    return sendError(400, "Email and password are required", res);
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await User.create({
      email: email,
      password: hashedPassword,
      userName: userName,
    });
    const tokens = generateToken(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.status(201).json({ ...tokens, _id: user._id.toString() });
  } catch (err) {
    return sendError(500, "Internal server error", res);
  }
};
const login = async (req: Request, res: Response) => {
  // Login logic here
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return sendError(400, "Email and password are required", res);
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return sendError(401, "Invalid email or password 1", res);
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return sendError(401, "Invalid email or password 2", res);
    }

    const tokens = generateToken(user._id.toString());
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.status(200).json({ ...tokens, _id: user._id.toString() });
  } catch (err) {
    return sendError(500, "Internal server error", res);
  }
};

//refresh token function to be implemented
const refreshToken = async (req: Request, res: Response) => {
  // Refresh token logic here
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return sendError(400, "Refresh token is required", res);
  }
  const secret = process.env.JWT_SECRET || "default_secret";
  try {
    const decoded = jwt.verify(refreshToken, secret) as { _id: string };
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(401, "Invalid refresh token", res);
    }
    // Check if the refresh token exists in the user's refreshTokens array
    if (!user.refreshTokens.includes(refreshToken)) {
      //clear the refresh tokens array and save
      user.refreshTokens = [];
      await user.save();
      console.log(" **** Possible token theft for user:", user._id);
      return sendError(401, "Invalid refresh token", res);
    }
    const tokens = generateToken(decoded._id);
    //remove old token from user refreshTokens and add the new one
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );
    user.refreshTokens.push(tokens.refreshToken);
    await user.save();
    res.status(200).json(tokens);
  } catch (err) {
    return sendError(401, "Invalid refresh token", res);
  }
};

const logout = async (req: Request, res: Response) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return sendError(400, "Refresh token is required", res);
  }
  try {
    const secret = process.env.JWT_SECRET || "default_secret";
    const decoded = jwt.verify(refreshToken, secret) as { _id: string };
    const user = await User.findById(decoded._id);
    if (!user) {
      return sendError(401, "Invalid refresh token", res);
    }
    // Remove the refresh token from the user's refreshTokens array
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );
    await user.save();
    res.status(200).json({ message: "User successfully logged out" });
  } catch (err) {
    return sendError(401, "Invalid refresh token", res);
  }
};

const changePassword = async (req: AuthRequest, res: Response) => {
  const currentPassword = req.body.currentPassword;
  const newPassword = req.body.newPassword;

  if (!currentPassword || !newPassword) {
    return sendError(
      400,
      "Current password and new password are required",
      res,
    );
  }

  if (currentPassword === newPassword) {
    return sendError(
      400,
      "New password must be different from current password",
      res,
    );
  }

  try {
    if (!req.user) {
      return sendError(401, "Unauthorized", res);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(404, "User not found", res);
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return sendError(401, "Current password is incorrect", res);
    }

    // Hash new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    return sendError(500, "Internal server error", res);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  changePassword,
};
