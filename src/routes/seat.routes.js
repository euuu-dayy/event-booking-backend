import express from "express";

import protect from "../middlewares/auth.middleware.js";

import verifyJWT from "../middlewares/auth.middleware.js";

import {
  getEventSeats,
  lockSeat,
  unlockSeat,
} from "../controllers/seat.controller.js";

const router = express.Router();

router.get(
  "/:eventId",
  getEventSeats
);

router.post(
  "/lock/:seatId",
  protect,
  lockSeat
);

router.post(
  "/unlock/:seatId",
  verifyJWT,
  unlockSeat
);

export default router;