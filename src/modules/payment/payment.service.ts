import httpStatus from "http-status";
import Stripe from "stripe";
import {
  PaymentStatus,
  RentalStatus,
  UserRole,
} from "../../../generated/prisma/enums";
import config from "../../config";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const withSessionId = (url: string) =>
  `${url}${url.includes("?") ? "&" : "?"}session_id={CHECKOUT_SESSION_ID}`;

const paymentCreateIntoStripeAndDB = async (
  userId: string,
  rentalOrderId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { payment: true },
  });
  if (!rentalOrder) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental order not found");
  }

  if (rentalOrder.customerId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You can only pay for your own order",
    );
  }

  if (rentalOrder.payment?.status === PaymentStatus.COMPLETED) {
    throw new AppError(httpStatus.CONFLICT, "This order has already been paid");
  }

  // Customers pay once the provider has confirmed the booking.
  if (rentalOrder.status !== RentalStatus.CONFIRMED) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      rentalOrder.status === RentalStatus.PLACED
        ? "The provider needs to confirm this order before you can pay"
        : "Order is not ready for payment",
    );
  }

  const amountInCents = Math.round(Number(rentalOrder.totalAmount) * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Rental Order #${rentalOrder.id.slice(0, 8)}`,
            description: `Payment for rental order ID: ${rentalOrder.id}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    success_url: withSessionId(config.client_success_url),
    cancel_url: config.client_cencel_url,
    metadata: {
      rentalOrderId: rentalOrder.id,
      userId: user.id,
    },
  });

  const payment = await prisma.payment.upsert({
    where: { rentalOrderId: rentalOrder.id },
    update: {
      transactionId: session.id,
      amount: rentalOrder.totalAmount,
      status: PaymentStatus.PENDING,
    },
    create: {
      transactionId: session.id,
      rentalOrderId: rentalOrder.id,
      amount: rentalOrder.totalAmount,
      status: PaymentStatus.PENDING,
      provider: "STRIPE",
    },
  });

  return {
    checkoutUrl: session.url,
    paymentId: payment.id,
  };
};

// Idempotent: used by both the Stripe webhook and the success page
// confirmation, whichever arrives first.
const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalOrderId = session.metadata?.rentalOrderId;
  const transactionId = session.id;

  if (!rentalOrderId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing rentalOrderId in session metadata",
    );
  }

  if (session.payment_status !== "paid") return;

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { transactionId },
    });

    if (!payment) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        `Payment record not found for transaction: ${transactionId}`,
      );
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      return;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        method: session.payment_method_types?.[0] ?? "card",
        paidAt: new Date(),
      },
    });

    const order = await tx.rentalOrder.findUnique({
      where: { id: rentalOrderId },
    });

    // Don't resurrect an order the provider cancelled meanwhile.
    if (
      order &&
      (order.status === RentalStatus.CONFIRMED ||
        order.status === RentalStatus.PLACED)
    ) {
      await tx.rentalOrder.update({
        where: { id: rentalOrderId },
        data: { status: RentalStatus.PAID },
      });
    }
  });
};

const confirmCheckoutSession = async (
  sessionId: string,
  userId: string,
  userRole: string,
) => {
  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    throw new AppError(httpStatus.NOT_FOUND, "Payment session not found");
  }

  if (userRole !== UserRole.ADMIN && session.metadata?.userId !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this payment session",
    );
  }

  // Sync the order right away so it doesn't depend on the webhook alone
  // (handy locally, where webhooks need the Stripe CLI).
  if (session.payment_status === "paid") {
    await handleCheckoutSessionCompleted(session);
  }

  return {
    status: session.payment_status,
    customerEmail: session.customer_details?.email,
    rentalOrderId: session.metadata?.rentalOrderId,
  };
};

const getMyPayments = async (userId: string) => {
  return prisma.payment.findMany({
    where: { rentalOrder: { customerId: userId } },
    include: {
      rentalOrder: {
        select: { id: true, startDate: true, endDate: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getPaymentById = async (id: string, userId: string, userRole: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: { rentalOrder: true },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (
    userRole !== UserRole.ADMIN &&
    payment.rentalOrder.customerId !== userId
  ) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not allowed to view this payment",
    );
  }

  return payment;
};

export const paymentService = {
  paymentCreateIntoStripeAndDB,
  handleCheckoutSessionCompleted,
  confirmCheckoutSession,
  getMyPayments,
  getPaymentById,
};
