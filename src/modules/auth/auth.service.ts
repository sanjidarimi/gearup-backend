import bcrypt from "bcryptjs";
import { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { jwtUtils } from "../../utils/jwt";
import { IUser } from "./auth.interface";

const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password, role } = payload;
  const isUserExist = await prisma.user.findUnique({
    where: { email },
  });
  if (isUserExist) {
    throw new Error("user already existed");
  }
  const hashpassword = await bcrypt.hash(
    password,
    Number(config.bcrypt_salt_rounds),
  );

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashpassword,
      role: role,
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
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  if (user.status === "SUSPENDED") {
    throw new Error("your account has been suspended");
  }
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("invalid email or password");
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
    config.jwt_access_expires_in as SignOptions,
  );
  const refreshToken = jwtUtils.createToken(
    jwtPayload,
    config.jwt_refresh_secret,
    config.jwt_refresh_expires_in as SignOptions,
  );
  return { refreshToken, accessToken };
};
const getMyProfileIntoDB = (userId: string) => {
  const userProfile = prisma.user.findFirstOrThrow({
    where: { id: userId },
    omit: { password: true },
    include: {
      profile: true,
    },
  });
  return userProfile;
};
export const authService = {
  createUserIntoDB,
  getUserIntoDB,
  getMyProfileIntoDB,
};
