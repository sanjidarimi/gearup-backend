import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, type Request, type Response } from "express";
import httpStatus from "http-status";
import { UserRole } from "../generated/prisma/enums";
import config from "./config";
import { AppError } from "./error/AppError";
import { authorize } from "./middleware/auth";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { adminRoutes } from "./modules/admin/admin.route";
import { authRoutes } from "./modules/auth/auth.route";
import { categoryRoutes } from "./modules/category/category.route";
import { gearRoute } from "./modules/gear/gear.route";
import { paymentRoutes } from "./modules/payment/payment.route";
import { providerRouter } from "./modules/provider/provider.route";
import { rentalRoutes } from "./modules/rental/rental.route";
import { reviewRoutes } from "./modules/review/review.route";

const app: Application = express();
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.set("trust proxy", 1);

// The Next.js frontend proxies API calls server-side, but keep CORS open for
// the configured frontend origins and local development.
const allowedOrigins = Array.from(
  new Set([...config.app_urls, "http://localhost:3000"]),
);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api/gear", gearRoute);
app.use("/api/categories", categoryRoutes);
app.use("/api/provider", authorize(UserRole.PROVIDER), providerRouter);
app.use("/api/admin", authorize(UserRole.ADMIN), adminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/review", reviewRoutes);
// Rental routes live at the API root (/rentals, /my-rentals) and guard each
// route themselves, so they must not block anything mounted above.
app.use("/api", rentalRoutes);

app.get("/api/payments/success", (req, res) => {
  res.send({
    message:
      "Payment completed! You can close this tab and check your order status in the app.",
  });
});

app.use((req, res, next) => {
  next(
    new AppError(
      httpStatus.NOT_FOUND,
      `API route not found: ${req.originalUrl}`,
    ),
  );
});

app.use(globalErrorHandler);

export default app;
