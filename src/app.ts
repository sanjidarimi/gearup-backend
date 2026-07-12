import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, type Request, type Response } from "express";
import config from "./config";
import { userRoutes } from "./modules/user/user.route";
const app: Application = express();

app.use(cors({ origin: config.app_url, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", userRoutes);

export default app;
