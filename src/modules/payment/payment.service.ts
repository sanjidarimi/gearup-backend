import Stripe from "stripe";
import config from "../../config";
import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const paymentCreateIntoStripeAndDB = async (
  userId: string,
  RentalOrderId: string,
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  const rentalOrder = await prisma.rentalOrder.findUnique({
    where: { id: RentalOrderId },
  });
  if (!rentalOrder) {
    throw new AppError(404, "Rental order not found");
  }
  if (rentalOrder.customerId !== userId) {
    throw new AppError(403, "You can only pay for your own order");
  }

 if (rentalOrder.status !== "CONFIRMED" && rentalOrder.status !== "PLACED") {
  throw new AppError(400, "Order is not ready for payment");
}

  const existingPayment = await prisma.payment.findUnique({
    where: { rentalOrderId: rentalOrder.id },
  });

  if (existingPayment?.status === "COMPLETED") {
    throw new AppError(409, "This order has already been paid");
  }
  const amountInCents = Math.round(Number(rentalOrder.totalAmount)*100);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Rental order ${rentalOrder.id}`,
            description: `Payment for rental order ID : ${rentalOrder.id}`,
          },
          unit_amount: amountInCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${config.client_success_url}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.client_success_url}`,
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
      status: "PENDING",
    },
    create: {
      transactionId: session.id,
      rentalOrderId: rentalOrder.id,
      amount: rentalOrder.totalAmount,
      status: "PENDING",
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
      where: {
        transactionId,
      },
    });
    if (!payment) {
      throw new AppError(
        404,
        `Payment record not found for transaction: ${transactionId}`,
      );
    }
    if (payment.status === "COMPLETED") {
      return;
    }
    await tx.payment.update({
      where: {
        id: payment.id,
      },
      data: {
        status: "COMPLETED",
        paidAt: new Date(),
      },
    });
    await tx.rentalOrder.update({
      where: { id: rentalOrderId },
      data: { status: "PAID" },
    });
  });
};
export const paymentService = {
  paymentCreateIntoStripeAndDB,
  handleCheckoutSessionCompleted,
};
