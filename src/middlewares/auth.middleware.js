import jwt from "jsonwebtoken";

import User from "../models/user.model.js";

import ApiError from "../utils/apiError.js";

import asyncHandler from "../utils/asyncHandler.js";

const protect = asyncHandler(
  async (req, res, next) => {
    let token;

    const authHeader =
      req.headers.authorization;

    if (
      authHeader &&
      authHeader.startsWith("Bearer")
    ) {
      token =
        authHeader.split(" ")[1];
    }

    if (!token) {
      throw new ApiError(
        401,
        "Unauthorized access"
      );
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      req.user = await User.findById(
        decoded.id
      ).select("-password");

      if (!req.user) {
        throw new ApiError(
          401,
          "User not found"
        );
      }

      next();
    } catch (error) {
      throw new ApiError(
        401,
        "Invalid or expired token"
      );
    }
  }
);

export default protect;