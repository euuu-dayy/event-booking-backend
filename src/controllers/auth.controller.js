import bcrypt from "bcryptjs";

import User from "../models/user.model.js";

import ApiError from "../utils/apiError.js";

import ApiResponse from "../utils/apiResponse.js";

import asyncHandler from "../utils/asyncHandler.js";

import generateToken from "../utils/generateToken.js";

import logActivity from "../services/activityLogger.js";

export const registerUser =
  asyncHandler(async (req, res) => {
    const { name, email, password } =
      req.body;

    if (!name || !email || !password) {
      throw new ApiError(
        400,
        "All fields are required"
      );
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      throw new ApiError(
        400,
        "User already exists"
      );
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      name,

      email,

      password: hashedPassword,
    });

    await logActivity({
      userId: user._id,

      action: "USER_REGISTERED",

      entityType: "USER",

      entityId: user._id,

      ipAddress: req.ip,
    });

    return res.status(201).json(
      new ApiResponse(
        201,
        "User registered successfully",
        {
          _id: user._id,

          name: user.name,

          email: user.email,

          role: user.role,
        }
      )
    );
  });

export const loginUser =
  asyncHandler(async (req, res) => {
    const { email, password } =
      req.body;

    if (!email || !password) {
      throw new ApiError(
        400,
        "Email and password required"
      );
    }

    const user = await User.findOne({
      email,
    });

    if (!user) {
      throw new ApiError(
        401,
        "Invalid credentials"
      );
    }

    const isPasswordCorrect =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordCorrect) {
      throw new ApiError(
        401,
        "Invalid credentials"
      );
    }

    const token = generateToken(
      user._id
    );

    await logActivity({
      userId: user._id,

      action: "LOGIN_SUCCESS",

      entityType: "USER",

      entityId: user._id,

      ipAddress: req.ip,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Login successful",
        {
          token,

          user: {
            _id: user._id,

            name: user.name,

            email: user.email,

            role: user.role,
          },
        }
      )
    );
  });

  export const logoutUser =
  asyncHandler(async (req, res) => {
    console.log(
      "LOGOUT API HIT",
    );

    console.log(
      "USER:",
      req.user,
    );

    await logActivity({
      userId: req.user._id,

      action:
        "LOGOUT_SUCCESS",

      entityType: "USER",

      entityId: req.user._id,

      ipAddress: req.ip,
    });

    console.log(
      "LOG CREATED",
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Logout successful",
      ),
    );
  });