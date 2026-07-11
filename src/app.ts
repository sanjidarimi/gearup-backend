import bcrypt from "bcryptjs";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, type Request, type Response } from "express";
import httpStatus from "http-status";
import config from "./config";
import { prisma } from "./lib/prisma";
const app: Application = express();

app.use(cors({ origin: config.app_url, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.post("/api/auth/register", async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });
  if (isUserExist) {
    res.status(httpStatus.CONFLICT).json({
      success: false,
      statusCode: httpStatus.CONFLICT,

      message: "user already exited",
    });
  }
  const hashpassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const createUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashpassword,
    },
  });

  const user = await prisma.user.findUnique({
    where: {
      id: createUser.id,
      email: createUser.email || email,
    },
    omit: { password: true },
  });

  res.status(httpStatus.CREATED).json({
    success: true,
    statusCode: httpStatus.CREATED,
    data: { user },
    message: "registation successfull",
  });
});

export default app;
