import { PaymentStatus, RentalStatus } from "generated/prisma/enums";
import { prisma } from "src/lib/prisma";
import { stripe } from "src/lib/stripe";
import { ICreatePaymentPayload, IPaymentQuery } from "./payment.interface";



const createPayment = async (
  payload: ICreatePaymentPayload,
  tenantId: string,
) => {
  const { rentalRequestId } = payload;

  const rentalRequest = await prisma.rentalRequest.findUnique({
    where: { id: rentalRequestId },
    include: { property: true },
  });

  if (!rentalRequest) {
    throw new Error("Rental request not found");
  }

  if (rentalRequest.tenantId !== tenantId) {
    throw new Error(
      "Forbidden. You do not have permission to pay for this rental",
    );
  }

  if (rentalRequest.status !== RentalStatus.APPROVED) {
    throw new Error("Payment is only allowed for approved rental requests");
  }

  const existingPayment = await prisma.payment.findFirst({
    where: {
      rentalRequestId,
      status: { in: [PaymentStatus.PENDING, PaymentStatus.COMPLETED] },
    },
  });

  if (existingPayment) {
    if (existingPayment.status === PaymentStatus.COMPLETED) {
      throw new Error("This rental has already been paid");
    }
    throw new Error("A payment is already in progress for this rental request");
  }

  const amountInCents = Math.round(rentalRequest.property.price * 100);

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amountInCents,
          product_data: {
            name: rentalRequest.property.title,
            description: `Rental payment for ${rentalRequest.property.title} in ${rentalRequest.property.city}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.APP_URL}/payment-cancel`,
    
    metadata: {
      rentalRequestId,
      tenantId,
      propertyId: rentalRequest.propertyId,
    },
  });

  const payment = await prisma.payment.create({
    data: {
      amount: rentalRequest.property.price,
      currency: "usd",
      status: PaymentStatus.PENDING,
      stripePaymentIntentId: session.id, // storing session.id
      tenantId,
      rentalRequestId,
    },
    include: {
      rentalRequest: {
        include: {
          property: {
            select: {
              id: true,
              title: true,
              city: true,
              price: true,
            },
          },
        },
      },
    },
  });

  return {
    paymentUrl: session.url,
    sessionId: session.id,
    paymentId: payment.id,
    amount: rentalRequest.property.price,
    currency: "usd",
    payment,
  };
};


export const paymentService = {
  createPayment,

};
