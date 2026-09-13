import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import { UserRole } from "../../../generated/prisma/client";
import config from "../../config";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { IUser } from "./auth.interface";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const createUserIntoDB = async (payload: IUser) => {
  const name = payload?.name?.trim();
  const email = payload?.email?.trim().toLowerCase();
  const { password, role } = payload ?? {};

  if (!name || !email || !password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Name, email and password are required",
    );
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Enter a valid email address");
  }
  if (password.length < 6) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Password must be at least 6 characters",
    );
  }
  if (role === UserRole.ADMIN) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot register as Admin directly",
    );
  }
  if (role && role !== UserRole.CUSTOMER && role !== UserRole.PROVIDER) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Role must be either CUSTOMER or PROVIDER",
    );
  }

  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });
  if (isUserExist) {
    throw new AppError(
      httpStatus.CONFLICT,
      "An account with this email already exists",
    );
  }

  const hashpassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds) || 10,
  );

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashpassword,
      role: role ?? UserRole.CUSTOMER,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });

  return newUser;
};

const getUserIntoDB = async (payload: IUser) => {
  const email = payload?.email?.trim().toLowerCase();
  const password = payload?.password;

  if (!email || !password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Email and password are required",
    );
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account has been suspended. Please contact support.",
    );
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expires_in } as SignOptions,
  );

  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    { expiresIn: config.jwt_refresh_expires_in } as SignOptions,
  );
  const loggedInUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };

  return { accessToken, refreshToken, user: loggedInUser };
};

const createRefreshToken = async (refreshToken?: string) => {
  if (!refreshToken) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
  }

  const verifiedRefreshToken = jwtUtils.verifyToken(
    refreshToken,
    config.jwt_refresh_secret,
  );
  if (!verifiedRefreshToken.success) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      verifiedRefreshToken.error || "Invalid refresh token",
    );
  }

  const { id } = verifiedRefreshToken.data as JwtPayload;
  const user = id
    ? await prisma.user.findUnique({
        where: { id },
      })
    : null;

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Account not found");
  }
  if (user.status === "SUSPENDED") {
    throw new AppError(httpStatus.FORBIDDEN, "Your account has been suspended");
  }

  const jwtPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const accessToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_access_secret,
    { expiresIn: config.jwt_access_expires_in } as SignOptions,
  );
  return { accessToken };
};

const getMyProfileIntoDB = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      password: true,
    },
    include: {
      profile: true,
    },
  });
};

export const authService = {
  createUserIntoDB,
  getUserIntoDB,
  getMyProfileIntoDB,
  createRefreshToken,
};
