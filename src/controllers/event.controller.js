import Event from "../models/event.model.js";

import ApiError from "../utils/apiError.js";

import ApiResponse from "../utils/apiResponse.js";

import asyncHandler from "../utils/asyncHandler.js";

import logActivity from "../services/activityLogger.js";

import Seat from "../models/seat.model.js";

import generateSeats from "../utils/generateSeats.js";

import Booking from "../models/booking.model.js";

export const createEvent = asyncHandler(async (req, res) => {
  const { title, description, venue, eventDate, totalSeats, price } = req.body;

  if (!title || !description || !venue || !eventDate || !totalSeats || !price) {
    throw new ApiError(400, "All fields are required");
  }

  const event = await Event.create({
    
    poster: req.file?.path || "",

    title,

    description,

    venue,

    eventDate,

    totalSeats,

    availableSeats: totalSeats,

    price,

    createdBy: req.user._id,
  });

  const generatedSeats = generateSeats(totalSeats);

  const seatsToInsert = generatedSeats.map((seat) => ({
    ...seat,

    event: event._id,
  }));

  await Seat.insertMany(seatsToInsert);

  await logActivity({
    userId: req.user._id,

    action: "EVENT_CREATED",

    entityType: "EVENT",

    entityId: event._id,

    ipAddress: req.ip,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Event created successfully", event));
});

export const getAllEvents = asyncHandler(async (req, res) => {
  const events = await Event.find()
    .sort({
      createdAt: -1,
    })
    .populate("createdBy", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, "Events fetched successfully", events));
});

export const getSingleEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id).populate(
    "createdBy",
    "name email",
  );

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Event fetched successfully", event));
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  const existingBookings = await Booking.exists({
    event: event._id,
  });

  if (existingBookings) {
    throw new ApiError(400, "Cannot delete booked event");
  }

  await Seat.deleteMany({
    event: event._id,
  });

  await event.deleteOne();

  await logActivity({
    userId: req.user._id,

    action: "EVENT_DELETED",

    entityType: "EVENT",

    entityId: event._id,

    ipAddress: req.ip,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Event deleted successfully"));
});

export const updateEvent = asyncHandler(async (req, res) => {
  const { title, description, venue, eventDate, price } = req.body;

  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new ApiError(404, "Event not found");
  }

  event.title = title || event.title;

  event.description = description || event.description;

  event.venue = venue || event.venue;

  event.eventDate = eventDate || event.eventDate;

  event.price = price || event.price;

  await event.save();

  await logActivity({
    userId: req.user._id,

    action: "EVENT_UPDATED",

    entityType: "EVENT",

    entityId: event._id,

    ipAddress: req.ip,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Event updated successfully", event));
});
