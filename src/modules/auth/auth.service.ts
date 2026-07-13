import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IUser } from "./auth.interface";
const createUserIntoDB = async (payload: IUser) => {
  const { name, email, password } = payload;
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
  return user;
};
const getUserIntoDB = async (payload: IUser) => {
  const { email, password } = payload;
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });
  const isPasswordMatched = await bcrypt.compare(password, user.password);
  if (!isPasswordMatched) {
    throw new Error("invalid credential");
  }
  const accessToken = jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    config.jwt_access_secret,
    {
      expiresIn: config.jwt_access_expires_in as SignOptions["expiresIn"],
    },
  );
  const refreshToken = jwt.sign({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    config.jwt_refresh_secret,
    {
      expiresIn: config.jwt_refresh_expires_in as SignOptions["expiresIn"],
    },)
  return {refreshToken, accessToken};
};

export const authService = {
  createUserIntoDB,
  getUserIntoDB,
};
