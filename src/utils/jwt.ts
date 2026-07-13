import jwt, { JwtPayload, SignOptions } from "jsonwebtoken"

const createToken = (payload:JwtPayload, secret : string, expires_in : SignOptions)=>{
 const token = jwt.sign(payload, secret, expires_in)
 return token
}

export const jwtUtils  = {
createToken
}