import bcrypt from "bcryptjs";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { IUser } from "./user.interface";
const createUserIntoDB = async (payload:IUser) => {
  const {name, email, password}  = payload;
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
  return user
};

export const userService = {
  createUserIntoDB,
};
