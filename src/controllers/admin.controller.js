import Event from "../models/event.model.js";

import Booking from "../models/booking.model.js";

import User from "../models/user.model.js";

import ApiResponse from "../utils/apiResponse.js";

import asyncHandler from "../utils/asyncHandler.js";

export const getDashboardAnalytics =
  asyncHandler(async (req, res) => {
    const [
      totalEvents,

      totalBookings,

      totalUsers,

      revenueResult,
    ] = await Promise.all([
      Event.countDocuments(),

      Booking.countDocuments(),

      User.countDocuments({
        role: "user",
      }),

      Booking.aggregate([
        {
          $match: {
            bookingStatus:
              "CONFIRMED",
          },
        },

        {
          $group: {
            _id: null,

            totalRevenue: {
              $sum:
                "$totalAmount",
            },
          },
        },
      ]),
    ]);

    const totalRevenue =
      revenueResult[0]
        ?.totalRevenue || 0;

    return res.status(200).json(
      new ApiResponse(
        200,
        "Analytics fetched successfully",
        {
          totalEvents,

          totalBookings,

          totalUsers,

          totalRevenue,
        },
      ),
    );
  });