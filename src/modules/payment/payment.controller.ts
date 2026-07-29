import { NextFunction, Request, Response } from "express";
import httpStaus from "http-status";
import config from "../../config";
import { AppError } from "../../error/AppError";
import { stripe } from "../../lib/stripe";
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

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body as Buffer;
  const signature = req.headers["stripe-signature"] as string;
  const endpointSecret = config.stripe_webhook_secret;
  if (signature) {
    return res.status(400).send("Missing Stripe signature header");
  }
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      await paymentService.handleCheckoutSessionCompleted(session);
      break;
    }
    case "payment_intent.payment_failed": {
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }
  res.status(200).json({ received: true });
});

export const paymentController = {
  createPaymentCheckout,
  handleStripeWebhook,
};
