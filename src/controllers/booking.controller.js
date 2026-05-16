import mongoose from "mongoose";

import Booking from "../models/booking.model.js";

import Seat from "../models/seat.model.js";

import Event from "../models/event.model.js";

import ApiError from "../utils/apiError.js";

import ApiResponse from "../utils/apiResponse.js";

import asyncHandler from "../utils/asyncHandler.js";

import logActivity from "../services/activityLogger.js";

export const createBooking =
  asyncHandler(async (req, res) => {
    const { eventId, seatIds } =
      req.body;

    if (
      !eventId ||
      !seatIds ||
      !seatIds.length
    ) {
      throw new ApiError(
        400,
        "Event and seats required"
      );
    }

    const session =
      await mongoose.startSession();

    session.startTransaction();

    try {
      const seats = await Seat.find({
        _id: { $in: seatIds },
      }).session(session);

      const now = new Date();

      for (const seat of seats) {
        if (seat.isBooked) {
          throw new ApiError(
            400,
            `Seat ${seat.seatNumber} already booked`
          );
        }

        const isLockedByUser =
          seat.lockedBy &&
          seat.lockedBy.toString() ===
            req.user._id.toString() &&
          seat.lockExpiresAt > now;

        if (!isLockedByUser) {
          throw new ApiError(
            400,
            `Seat ${seat.seatNumber} not locked by you`
          );
        }
      }

      const event =
        await Event.findById(
          eventId
        ).session(session);

      if (!event) {
        throw new ApiError(
          404,
          "Event not found"
        );
      }

      const totalAmount =
        seats.length * event.price;

      const booking =
        await Booking.create(
          [
            {
              user: req.user._id,

              event: eventId,

              seats: seatIds,

              totalAmount,
            },
          ],

          { session }
        );

      event.availableSeats -=
        seats.length;

      await event.save({
        session,
      });

      await session.commitTransaction();

      session.endSession();

      await logActivity({
        userId: req.user._id,

        action:
          "BOOKING_CREATED",

        entityType: "BOOKING",

        entityId: booking[0]._id,

        ipAddress: req.ip,
      });

      return res.status(201).json(
        new ApiResponse(
          201,
          "Booking confirmed",
          booking[0]
        )
      );
    } catch (error) {
      await session.abortTransaction();

      session.endSession();

      throw error;
    }
  });

  export const getMyBookings =
  asyncHandler(async (req, res) => {
    const bookings =
      await Booking.find({
        user: req.user._id,
      })
        .populate(
          "event",
          "title venue eventDate"
        )
        .populate(
          "seats",
          "seatNumber"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Bookings fetched successfully",
        bookings
      )
    );
  });

  export const getBookingById =
  asyncHandler(async (req, res) => {
    const booking =
      await Booking.findById(
        req.params.id
      )
        .populate(
          "event"
        )
        .populate(
          "seats"
        )
        .populate(
          "user",
          "name email"
        );

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found"
      );
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        "Booking fetched successfully",
        booking
      )
    );
  });

  export const cancelBooking =
  asyncHandler(async (req, res) => {
    const session =
      await mongoose.startSession();

    session.startTransaction();

    try {
      const booking =
        await Booking.findById(
          req.params.id
        ).session(session);

      if (!booking) {
        throw new ApiError(
          404,
          "Booking not found"
        );
      }

      if (
        booking.user.toString() !==
        req.user._id.toString()
      ) {
        throw new ApiError(
          403,
          "Unauthorized cancellation"
        );
      }

      if (
        booking.bookingStatus ===
        "cancelled"
      ) {
        throw new ApiError(
          400,
          "Booking already cancelled"
        );
      }

      const seats = await Seat.find({
        _id: {
          $in: booking.seats,
        },
      }).session(session);

      for (const seat of seats) {
        seat.isBooked = false;

        await seat.save({
          session,
        });
      }

      const event =
        await Event.findById(
          booking.event
        ).session(session);

      event.availableSeats +=
        seats.length;

      await event.save({
        session,
      });

      booking.bookingStatus =
        "cancelled";

      await booking.save({
        session,
      });

      await session.commitTransaction();

      session.endSession();

      await logActivity({
        userId: req.user._id,

        action:
          "BOOKING_CANCELLED",

        entityType: "BOOKING",

        entityId: booking._id,

        ipAddress: req.ip,
      });

      return res.status(200).json(
        new ApiResponse(
          200,
          "Booking cancelled successfully"
        )
      );
    } catch (error) {
      await session.abortTransaction();

      session.endSession();

      throw error;
    }
  });