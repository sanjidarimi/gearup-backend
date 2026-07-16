import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, type Request, type Response } from "express";
import httpStatus from "http-status";
import config from "./config";
import { AppError } from "./error/AppError";
import { globalErrorHandler } from "./middleware/globalErrorHandler";
import { authRoutes } from "./modules/auth/auth.route";
import { categoryRoutes } from "./modules/category/category.route";
import { gearRoute } from "./modules/gear/gear.route";
import { rentalRoutes } from "./modules/rental/rental.route";

const app: Application = express();

app.use(cors({ origin: config.app_url, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", authRoutes);
app.use("/api", gearRoute);
app.use("/api", categoryRoutes);
app.use("/api", rentalRoutes);

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
