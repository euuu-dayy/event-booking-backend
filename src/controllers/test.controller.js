import asyncHandler from "../utils/asyncHandler.js";

import ApiResponse from "../utils/apiResponse.js";

export const userProfile =
  asyncHandler(async (req, res) => {
    return res.status(200).json(
      new ApiResponse(
        200,
        "User profile fetched",
        req.user
      )
    );
  });

export const adminDashboard =
  asyncHandler(async (req, res) => {
    return res.status(200).json(
      new ApiResponse(
        200,
        "Welcome Admin",
        {
          admin: req.user.name,
        }
      )
    );
  });