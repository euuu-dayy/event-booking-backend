import express from "express";

import protect from "../middlewares/auth.middleware.js";

import authorizeRoles from "../middlewares/role.middleware.js";

import {
  userProfile,
  adminDashboard,
} from "../controllers/test.controller.js";

const router = express.Router();

router.get(
  "/profile",
  protect,
  userProfile
);

router.get(
  "/admin",
  protect,
  authorizeRoles("admin"),
  adminDashboard
);

export default router;