import { Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { AuthRequest } from "../middleware/authMiddleware.js";
import jwt from "jsonwebtoken";

export const cookieLogin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Cookie login successful",
    });
  } catch (error) {
    next(error);
  }
};

export const cookieMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authenticated",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
      role: string;
    };

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired cookie",
    });
  }
};

export const cookieLogout = (
  req: AuthRequest,
  res: Response
) => {
  res.clearCookie("token");

  res.status(200).json({
    message: "Logged out successfully",
  });
};