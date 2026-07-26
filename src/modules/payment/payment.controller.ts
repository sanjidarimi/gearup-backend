import { NextFunction, Request, Response } from "express";
import httpStaus from "http-status";
import { AppError } from "../../error/AppError";
import { catchAsync } from "../../utils/CatchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";
const createPaymentCheckout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!req.body.rentalOrderId)
      throw new AppError(400, "rentalOrderId is required");
    const result = await paymentService.paymentCreateIntoStripeAndDB(
      userId as string,
      req.body.RentalOrderId,
    );
    sendResponse(res, {
      success: true,
      statusCode: httpStaus.OK,
      message: "create checkout successfully",
      data: result,
    });
  },
);

export const paymentController = {
  createPaymentCheckout,
};
