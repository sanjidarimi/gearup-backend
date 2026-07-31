import { Request, Response } from "express";
import Stripe from "stripe";
import config from "../../config";
import { AppError } from "../../error/AppError";
import { stripe } from "../../lib/stripe";
import { catchAsync } from "../../utils/CatchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

const createPayment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const { rentalOrderId } = req.body;

  if (!rentalOrderId) {
    throw new AppError(400, "Rental Order ID is required");
  }

  const result = await paymentService.paymentCreateIntoStripeAndDB(
    userId,
    rentalOrderId,
  );

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Payment checkout session created successfully",
    data: result,
  });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers["stripe-signature"] as string;

  if (!sig) {
    throw new AppError(400, "Missing Stripe signature header");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      config.stripe_webhook_secret as string,
    );
  } catch (err: any) {
    throw new AppError(400, `Webhook Signature Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    await paymentService.handleCheckoutSessionCompleted(session);
  }

  res.status(200).json({ received: true });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const sessionId = req.query.session_id as string;

  if (!sessionId) {
    throw new AppError(400, "Session ID is required");
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment session status retrieved",
    data: {
      status: session.payment_status,
      customerEmail: session.customer_details?.email,
    },
  });
});

const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id as string;
  const result = await paymentService.getMyPayments(userId);

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment history fetched successfully",
    data: result,
  });
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.id as string;
  const role = req.user?.role as string;

  const result = await paymentService.getPaymentById(
    id as string,
    userId,
    role,
  );

  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Payment details fetched successfully",
    data: result,
  });
});

export const paymentController = {
  createPayment,
  handleStripeWebhook,
  getMyPayments,
  getPaymentById,
  confirmPayment,
};
