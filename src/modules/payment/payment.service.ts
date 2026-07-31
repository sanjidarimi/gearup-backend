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

const paymentCreateIntoStripeAndDB = async (
  userId: string,
  rentalOrderId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
  });
  if (!rentalOrder) {
    throw new AppError(404, "Rental order not found");
  }

  if (rentalOrder.customerId !== userId) {
    throw new AppError(403, "You can only pay for your own order");
  }

  if (
    rentalOrder.status !== RentalStatus.CONFIRMED &&
    rentalOrder.status !== RentalStatus.PLACED
  ) {
    throw new AppError(400, "Order is not ready for payment");
  }

  const existingPayment = await prisma.payment.findUnique({
    where: { rentalOrderId: rentalOrder.id },
  });

  if (existingPayment?.status === PaymentStatus.COMPLETED) {
    throw new AppError(409, "This order has already been paid");
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
    success_url: `${config.client_success_url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.client_cencel_url}`,
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

const handleCheckoutSessionCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const rentalOrderId = session.metadata?.rentalOrderId;
  const transactionId = session.id;

  if (!rentalOrderId) {
    throw new AppError(400, "Missing rentalOrderId in session metadata");
  }

  await prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findFirst({
      where: { transactionId },
    });

    if (!payment) {
      throw new AppError(
        404,
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
        paidAt: new Date(),
      },
    });

    await tx.rentalOrder.update({
      where: { id: rentalOrderId },
      data: { status: RentalStatus.PAID },
    });
  });
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
    throw new AppError(404, "Payment not found");
  }

  if (
    userRole !== UserRole.ADMIN &&
    payment.rentalOrder.customerId !== userId
  ) {
    throw new AppError(403, "You are not allowed to view this payment");
  }

  return payment;
};

export const paymentService = {
  paymentCreateIntoStripeAndDB,
  handleCheckoutSessionCompleted,
  getMyPayments,
  getPaymentById,
};
