import { NextResponse } from "next/server";

import dbConnect from "@/lib/connectDB";
import Order from "@/models/Order";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();
    const orderId = body?.orderId;

    // ==========================================
    // Validate Order ID
    // ==========================================

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          message: "Order ID is required.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // Find Order
    // ==========================================

    const order =
      await Order.findById(orderId);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    // ==========================================
    // Validate Payment Method
    // ==========================================

    if (
      order.paymentMethod !==
      "bkash"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order is not configured for bKash payment.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // Already Paid
    // ==========================================

    if (
      order.paymentStatus ===
      "paid"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "This order has already been paid.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // Get bKash Token
    // ==========================================

    const token =
      await getBkashToken();

    // ==========================================
    // Create bKash Payment
    // ==========================================

    const bkashResponse =
      await fetch(
        `${process.env.BKASH_BASE_URL}/checkout/payment/create`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Accept:
              "application/json",

            Authorization:
              token,

            "X-APP-Key":
              process.env.BKASH_APP_KEY,
          },

          body: JSON.stringify({
            mode: "0011",

            payerReference:
              order.customer?.phone ||
              "customer",

            callbackURL:
              `${process.env.NEXT_PUBLIC_APP_URL}/checkout`,

            amount: Number(
              order.total
            ).toFixed(2),

            currency: "BDT",

            intent: "sale",

            merchantInvoiceNumber:
              order.orderNumber,
          }),

          cache: "no-store",
        }
      );

    // ==========================================
    // Read bKash Response Safely
    // ==========================================

    const responseText =
      await bkashResponse.text();

    let data = null;

    try {
      data =
        JSON.parse(
          responseText
        );
    } catch {
      console.error(
        "bKash returned non-JSON:",
        responseText
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "bKash server returned an invalid response.",
          status:
            bkashResponse.status,
          rawResponse:
            responseText.slice(
              0,
              500
            ),
        },
        {
          status: 502,
        }
      );
    }

    // ==========================================
    // bKash Error
    // ==========================================

    if (
      !bkashResponse.ok ||
      !data?.paymentID
    ) {
      console.error(
        "bKash create failed:",
        data
      );

      return NextResponse.json(
        {
          success: false,
          message:
            data?.statusMessage ||
            data?.message ||
            "Failed to create bKash payment.",

          details: data,
        },
        {
          status:
            bkashResponse.status ||
            500,
        }
      );
    }

    // ==========================================
    // Save Payment ID
    // ==========================================

    order.paymentId =
      data.paymentID;

    await order.save();

    // ==========================================
    // Success
    // ==========================================

    return NextResponse.json(
      {
        success: true,

        paymentID:
          data.paymentID,

        createResponse:
          data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "POST /api/payment/bkash/create ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to create bKash payment.",
      },
      { status: 500 }
    );
  }
}