import express from "express";

import protect from "../middlewares/auth.middleware.js";

import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  createBooking
);

router.get(
  "/my-bookings",
  protect,
  getMyBookings
);

router.get(
  "/:id",
  protect,
  getBookingById
);

router.patch(
  "/cancel/:id",
  protect,
  cancelBooking
);

export default router;