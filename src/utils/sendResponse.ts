import { Response } from "express";
import { TResponseData } from "../modules/user/user.interface";

export const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
   statusCode : data.statusCode,
    message: data.message,
    data: data.data,
    meta: data.meta,
  });
};