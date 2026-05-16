import express from "express";

import protect from "../middlewares/auth.middleware.js";

import authorizeRoles from "../middlewares/role.middleware.js";

import {
  getDashboardAnalytics,
} from "../controllers/admin.controller.js";

const router =
  express.Router();

router.get(
  "/analytics",
  protect,
  authorizeRoles("admin"),
  getDashboardAnalytics,
);

export default router;