import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/connectDB";
import Order from "@/models/Order";

import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request,
  { params }
) {
  try {
    await dbConnect();

    // ==========================================
    // Logged-in User
    // ==========================================

    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to view this order.",
        },
        { status: 401 }
      );
    }

    // ==========================================
    // Order ID
    // ==========================================

    const { id } = await params;

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid order ID.",
        },
        { status: 400 }
      );
    }

    // ==========================================
    // Find Own Order Only
    // ==========================================

    const order =
      await Order.findOne({
        _id: id,
        user: currentUser._id,
      }).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Order not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(
      "GET /api/orders/[id] ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to fetch order.",
      },
      { status: 500 }
    );
  }
}