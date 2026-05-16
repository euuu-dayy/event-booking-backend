import crypto from "crypto";

import razorpay from "../config/razorpay.js";

import Booking from "../models/booking.model.js";

import Seat from "../models/seat.model.js";

import Event from "../models/event.model.js";

import ApiError from "../utils/apiError.js";

import ApiResponse from "../utils/apiResponse.js";

import asyncHandler from "../utils/asyncHandler.js";

import logActivity from "../services/activityLogger.js";

export const createPaymentOrder =
  asyncHandler(async (req, res) => {
    const {
      bookingId,
    } = req.body;

    const booking =
      await Booking.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found",
      );
    }

    if (
      booking.paymentStatus ===
      "PAID"
    ) {
      throw new ApiError(
        400,
        "Booking already paid",
      );
    }

    const options = {
      amount:
        booking.totalAmount *
        100,

      currency: "INR",

      receipt:
        booking._id.toString(),
    };

    const order =
      await razorpay.orders.create(
        options,
      );

    return res.status(200).json(
      new ApiResponse(
        200,
        "Payment order created",
        order,
      ),
    );
  });

export const verifyPayment =
  asyncHandler(async (req, res) => {
    const {
      razorpay_order_id,

      razorpay_payment_id,

      razorpay_signature,

      bookingId,
    } = req.body;

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env
            .RAZORPAY_KEY_SECRET,
        )
        .update(
          razorpay_order_id +
            "|" +
            razorpay_payment_id,
        )
        .digest("hex");

    const isAuthentic =
      generatedSignature ===
      razorpay_signature;

    if (!isAuthentic) {
      throw new ApiError(
        400,
        "Payment verification failed",
      );
    }

    const booking =
      await Booking.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found",
      );
    }

    if (
      booking.paymentStatus ===
      "PAID"
    ) {
      throw new ApiError(
        400,
        "Payment already verified",
      );
    }

    booking.paymentStatus =
      "PAID";

    booking.bookingStatus =
      "CONFIRMED";

    booking.paymentId =
      razorpay_payment_id;

    await booking.save();

    await Seat.updateMany(
      {
        _id: {
          $in:
            booking.seats,
        },
      },

      {
        $set: {
          isBooked: true,

          lockedBy: null,

          lockExpiresAt: null,
        },
      },
    );

    const event =
      await Event.findById(
        booking.event,
      );

    if (event) {
      event.availableSeats -=
        booking.seats.length;

      await event.save();
    }

    await logActivity({
      userId: req.user._id,

      action:
        "PAYMENT_SUCCESS",

      entityType:
        "BOOKING",

      entityId:
        booking._id,

      ipAddress: req.ip,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Payment verified successfully",
      ),
    );
  });

export const markPaymentFailed =
  asyncHandler(async (req, res) => {
    const { bookingId } =
      req.body;

    const booking =
      await Booking.findById(
        bookingId,
      );

    if (!booking) {
      throw new ApiError(
        404,
        "Booking not found",
      );
    }

    booking.paymentStatus =
      "FAILED";

    await booking.save();

    await logActivity({
      userId: req.user._id,

      action:
        "PAYMENT_FAILED",

      entityType:
        "BOOKING",

      entityId:
        booking._id,

      ipAddress: req.ip,
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        "Payment marked failed",
      ),
    );
  });