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

const handleStripeWebhook = async (
  rawBody: Buffer,
  signature: string,
  webhookSecret: string,
) => {
  let event: import("stripe").Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }

  switch (event.type) {
    //  event for Checkout Session (was payment_intent.succeeded)
    case "checkout.session.completed": {
      const session = event.data
        .object as import("stripe").Stripe.Checkout.Session;
      await handlePaymentSuccess(session.id, session.metadata);
      break;
    }

    // failure event for Checkout Session
    case "checkout.session.expired": {
      const session = event.data
        .object as import("stripe").Stripe.Checkout.Session;
      await handlePaymentFailure(session.id);
      break;
    }

    default:
      break;
  }

  return { received: true };
};

const handlePaymentSuccess = async (
  sessionId: string,
  metadata: import("stripe").Stripe.Metadata | null,
) => {
  // look up by session.id (stored in stripePaymentIntentId field)
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: sessionId },
  });

  if (!payment) {
    // Stripe may fire before our DB write in rare race conditions — safe to return
    // Stripe will retry delivery automatically
    console.warn(`Webhook received for unknown session: ${sessionId}`);
    return;
  }

  // Idempotency guard — Stripe retries webhooks, don't process twice
  if (payment.status === PaymentStatus.COMPLETED) {
    return;
  }

  // get propertyId from metadata (passed when creating session)
  const propertyId = metadata?.propertyId;

  // Atomic transaction — all three updates succeed or all fail together
  await prisma.$transaction([
    // 1. Mark payment as completed
    prisma.payment.update({
      where: { stripePaymentIntentId: sessionId },
      data: { status: PaymentStatus.COMPLETED },
    }),

    // 2. Move rental APPROVED → ACTIVE
    prisma.rentalRequest.update({
      where: { id: payment.rentalRequestId },
      data: { status: RentalStatus.ACTIVE },
    }),

    // 3. Mark property as unavailable — it's now rented
    // Only runs if propertyId exists in metadata
    ...(propertyId
      ? [
          prisma.property.update({
            where: { id: propertyId },
            data: { isAvailable: false },
          }),
        ]
      : []),
  ]);
};
const handlePaymentFailure = async (sessionId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { stripePaymentIntentId: sessionId },
  });

  if (!payment) {
    return;
  }

  // Don't overwrite a COMPLETED payment
  if (payment.status === PaymentStatus.PENDING) {
    await prisma.payment.update({
      where: { stripePaymentIntentId: sessionId },
      data: { status: PaymentStatus.FAILED },
    });
    // Rental stays APPROVED — tenant can create a new payment and retry
  }
};

const getUserPayments = async (
  tenantId: string,
  role: string,
  query: IPaymentQuery,
) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder || "desc";

  const whereCondition = role === "ADMIN" ? {} : { tenantId };

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
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
    }),
    prisma.payment.count({ where: whereCondition }),
  ]);

  return {
    meta: {
      page,
      limit,
      total,
      totalPage: Math.ceil(total / limit),
    },
    data: payments,
  };
};

export const paymentService = {
  createPayment,
  handleStripeWebhook,
  getUserPayments,
};
