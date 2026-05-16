import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",

      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Event",

      required: true,
    },

    seats: [
      {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Seat",
      },
    ],

    totalAmount: {
      type: Number,

      required: true,
    },

    bookingStatus: {
      type: String,

      enum: ["PENDING", "CONFIRMED", "CANCELLED"],

      default: "PENDING",
    },

    paymentStatus: {
      type: String,

      enum: ["PENDING", "PAID", "FAILED"],

      default: "PENDING",
    },

    paymentId: {
      type: String,

      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
