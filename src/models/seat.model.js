import mongoose from "mongoose";

const seatSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Event",

      required: true,
    },

    seatNumber: {
      type: String,

      required: true,
    },

    isBooked: {
      type: Boolean,

      default: false,
    },

    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },

    lockExpiresAt: {
      type: Date,

      default: null,
    },
  },

  {
    timestamps: true,
  }
);

const Seat = mongoose.model(
  "Seat",
  seatSchema
);

export default Seat;