import { AppError } from "../../error/AppError";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";

const paymentCreateIntoStripeAndDB = async (
  userId: string,
  RentalOrderId: string,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });
    const rentalOrder = await tx.rentalOrder.findUniqueOrThrow({
      where: {
        id: RentalOrderId,
      },
    });
    const existingPayment = await tx.payment.findFirst({
      where: {
        rentalOrderId: rentalOrder.id,
      },
    });
    if (existingPayment && existingPayment.status === "COMPLETED") {
      throw new AppError(409, "This order has already been paid");
    }

    const session = await stripe.checkout.sessions.create({
  success_url: 'https://example.com/success',
  
  line_items: [
    {
      price: '{{PRICE_ID}}',
      quantity: 2,
    },
  ],
  mode: 'payment',
});
  });
};
export const paymentService = {
  paymentCreateIntoStripeAndDB,
};
