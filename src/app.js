import express from "express";
import morgan from "morgan";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import testRoutes from "./routes/test.routes.js";
import eventRoutes from "./routes/event.routes.js";
import seatRoutes from "./routes/seat.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

import errorMiddleware from "./middlewares/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5174",

      "https://event-booking-backend-kw0i.onrender.com",
    ],

    credentials: true,
  })
);

app.use(express.json());

app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API running successfully",
  });
});

app.use("/api/auth", authRoutes);

app.use("/api/test", testRoutes);

app.use("/api/events", eventRoutes);

app.use("/api/seats", seatRoutes);

app.use("/api/bookings",bookingRoutes);

app.use(
  "/api/admin",
  adminRoutes,
);

app.use(
  "/api/payments",
  paymentRoutes,
);


app.use(errorMiddleware);

export default app;