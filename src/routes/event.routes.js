import express from "express";

import protect from "../middlewares/auth.middleware.js";

import authorizeRoles from "../middlewares/role.middleware.js";

import upload from "../middlewares/upload.middleware.js";

import {
  createEvent,
  getAllEvents,
  getSingleEvent,
  deleteEvent,
  updateEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  upload.single("poster"),
  createEvent,
);

router.get("/", getAllEvents);

router.get("/:id", getSingleEvent);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteEvent
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateEvent
);

export default router;