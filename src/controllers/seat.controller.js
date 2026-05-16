import Seat from "../models/seat.model.js";

import ApiError from "../utils/apiError.js";

import ApiResponse from "../utils/apiResponse.js";

import asyncHandler from "../utils/asyncHandler.js";

export const getEventSeats = asyncHandler(async (req, res) => {
  const now = new Date();

  await Seat.updateMany(
    {
      isBooked: false,

      lockedBy: {
        $ne: null,
      },

      lockExpiresAt: {
        $lt: now,
      },
    },

    {
      $set: {
        lockedBy: null,

        lockExpiresAt: null,
      },
    },
  );

  const seats = await Seat.find({
    event: req.params.eventId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Seats fetched successfully", seats));
});

export const lockSeat = asyncHandler(async (req, res) => {
  const { seatId } = req.params;

  const seat = await Seat.findById(seatId);

  if (!seat) {
    throw new ApiError(404, "Seat not found");
  }

  if (seat.isBooked) {
    throw new ApiError(400, "Seat already booked");
  }

  const now = new Date();

  const isLocked = seat.lockedBy && seat.lockExpiresAt > now;

  if (isLocked) {
    throw new ApiError(400, "Seat temporarily locked");
  }

  seat.lockedBy = req.user._id;

  seat.lockExpiresAt = new Date(now.getTime() + 5 * 60 * 1000);

  await seat.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Seat locked successfully", seat));
});

export const unlockSeat =
  asyncHandler(async (req, res) => {
    const seat =
      await Seat.findById(
        req.params.seatId
      );

    if (!seat) {
      throw new ApiError(
        404,
        "Seat not found"
      );
    }

    if (
      seat.lockedBy?.toString() !==
      req.user._id.toString()
    ) {
      throw new ApiError(
        403,
        "Unauthorized"
      );
    }

    seat.lockedBy = null;

    seat.lockExpiresAt = null;

    await seat.save();

    return res.status(200).json(
      new ApiResponse(
        200,
        "Seat unlocked successfully"
      )
    );
  });
