import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  expiresIn: SignOptions,
) => {
  const token = jwt.sign(payload, secret, { expiresIn } as SignOptions);
  return token;
};
const verifyToken = (token: string, secret: string) => {
  try {
    const verifedToken = jwt.verify(token, secret);
    return verifedToken;
  } catch (error: any) {
    throw new Error(error.massage);
  }
};
export const jwtUtils = {
  createToken,verifyToken
};
