import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";
import { getBkashToken } from "@/lib/bkash";

export async function POST(request) {
  try {
    await dbConnect();

    const body = await request.json();

    const {
      orderId,
      paymentID,
    } = body;

    if (!orderId || !paymentID) {
      return Response.json(
        {
          success: false,
          message:
            "Order ID and payment ID are required.",
        },
        { status: 400 }
      );
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return Response.json(
        {
          success: false,
          message: "Order not found.",
        },
        { status: 404 }
      );
    }

    if (
      order.paymentId &&
      order.paymentId !== paymentID
    ) {
      return Response.json(
        {
          success: false,
          message:
            "Payment ID does not match this order.",
        },
        { status: 400 }
      );
    }

    const token = await getBkashToken();

    const response = await fetch(
      `${process.env.BKASH_BASE_URL}/checkout/payment/execute/${paymentID}`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: token,
          "X-APP-Key": process.env.BKASH_APP_KEY,
        },
        cache: "no-store",
      }
    );

    const data = await response.json();

    console.log(
      "bKash execute response:",
      data
    );

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          message:
            data?.statusMessage ||
            data?.message ||
            "Failed to execute bKash payment.",
        },
        { status: 500 }
      );
    }

    const transactionStatus =
      String(
        data?.transactionStatus || ""
      ).toLowerCase();

    const returnedAmount = Number(
      data?.amount
    );

    const orderAmount = Number(
      order.total
    );

    const amountMatches =
      Number.isFinite(returnedAmount) &&
      Math.abs(
        returnedAmount - orderAmount
      ) < 0.01;

    const isCompleted =
      transactionStatus ===
      "completed";

    if (
      isCompleted &&
      amountMatches &&
      data?.paymentID === paymentID
    ) {
      order.paymentMethod = "bkash";
      order.paymentStatus = "paid";
      order.paymentId = paymentID;
      order.transactionId =
        data.trxID || "";
      order.paidAt = data.paymentExecuteTime
        ? new Date(
            data.paymentExecuteTime
          )
        : new Date();

      await order.save();

      return Response.json({
        success: true,
        message:
          "bKash payment completed successfully.",
        paymentID,
        transactionId:
          data.trxID || "",
        paymentStatus: "paid",
        order,
        payment: data,
      });
    }

    order.paymentStatus = "failed";
    order.paymentId = paymentID;

    await order.save();

    return Response.json(
      {
        success: false,
        message:
          data?.statusMessage ||
          "bKash payment was not completed.",
        paymentStatus: "failed",
        payment: data,
      },
      { status: 400 }
    );
  } catch (error) {
    console.error(
      "bKash EXECUTE ERROR:",
      error
    );

    return Response.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to execute bKash payment.",
      },
      { status: 500 }
    );
  }
}