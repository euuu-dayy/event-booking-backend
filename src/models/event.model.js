import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,

      required: true,

      trim: true,
    },

    description: {
      type: String,

      required: true,
    },

    venue: {
      type: String,

      required: true,
    },

    eventDate: {
      type: Date,

      required: true,
    },

    bannerImage: {
      type: String,

      default: "",
    },

    totalSeats: {
      type: Number,

      required: true,
    },

    availableSeats: {
      type: Number,

      required: true,
    },

    price: {
      type: Number,

      required: true,
    },

    poster: {
      type: String,

      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },
  },

  {
    timestamps: true,
  },
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
