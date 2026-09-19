import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/connectDB";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import { getCurrentUser } from "@/lib/auth";

const SHIPPING_FEE = 80;

// =====================================================
// GET - Logged-in Customer Orders
// =====================================================

export async function GET() {
  try {
    await dbConnect();

    // ==========================================
    // Check Logged-in Customer
    // ==========================================

    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to view your orders.",
        },
        {
          status: 401,
        }
      );
    }

    // ==========================================
    // Get Only Current User Orders
    // ==========================================

    const orders =
      await Order.find({
        user: currentUser._id,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

    return NextResponse.json(
      {
        success: true,
        orders,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "GET /api/orders ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to fetch orders.",
      },
      {
        status: 500,
      }
    );
  }
}

// =====================================================
// POST - Create Order
// =====================================================

export async function POST(request) {
  try {
    await dbConnect();

    // =================================================
    // Check Logged-in Customer
    // =================================================

    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login before placing an order.",
        },
        {
          status: 401,
        }
      );
    }

    // =================================================
    // Request Body
    // =================================================

    const body =
      await request.json();

    const {
      customer,
      shippingAddress,
      items,
      paymentMethod,
    } = body;

    // =================================================
    // Validate Customer
    // =================================================

    if (
      !customer?.name?.trim() ||
      !customer?.email?.trim() ||
      !customer?.phone?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Customer name, email and phone are required.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // Validate Shipping Address
    // =================================================

    if (
      !shippingAddress?.address?.trim() ||
      !shippingAddress?.city?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Shipping address and city are required.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // Validate Items
    // =================================================

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Your cart is empty.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // Validate Payment Method
    // =================================================

    if (
      !["cod", "bkash"].includes(
        paymentMethod
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid payment method.",
        },
        {
          status: 400,
        }
      );
    }

    // =================================================
    // Validate Product IDs + Quantity
    // =================================================

    for (const item of items) {
      if (
        !item?.productId ||
        !mongoose.Types.ObjectId.isValid(
          item.productId
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product ID.",
          },
          {
            status: 400,
          }
        );
      }

      const quantity =
        Number(item.quantity);

      if (
        !Number.isInteger(quantity) ||
        quantity < 1
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid product quantity.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // =================================================
    // Get Real Products From MongoDB
    // =================================================

    const productIds =
      items.map(
        (item) =>
          item.productId
      );

    const products =
      await Product.find({
        _id: {
          $in: productIds,
        },
        status: "active",
      }).lean();

    // =================================================
    // Product Map
    // =================================================

    const productMap =
      new Map(
        products.map(
          (product) => [
            String(
              product._id
            ),
            product,
          ]
        )
      );

    // =================================================
    // Build Order Items
    // =================================================

    const orderItems = [];

    let subtotal = 0;

    for (const item of items) {
      const product =
        productMap.get(
          String(
            item.productId
          )
        );

      // ===============================================
      // Product Not Found
      // ===============================================

      if (!product) {
        return NextResponse.json(
          {
            success: false,
            message:
              "One or more products are no longer available.",
          },
          {
            status: 400,
          }
        );
      }

      const quantity =
        Number(
          item.quantity
        );

      // ===============================================
      // Stock Check
      // ===============================================

      if (
        Number(
          product.stock || 0
        ) < quantity
      ) {
        return NextResponse.json(
          {
            success: false,
            message: `${product.name} has only ${product.stock} item(s) in stock.`,
          },
          {
            status: 400,
          }
        );
      }

      // ===============================================
      // Database Price
      // ===============================================

      const price =
        Number(
          product.price || 0
        );

      const itemSubtotal =
        price * quantity;

      subtotal +=
        itemSubtotal;

      orderItems.push({
        product:
          product._id,

        name:
          product.name,

        image:
          product.images?.[0] ||
          "",

        price,

        quantity,

        subtotal:
          itemSubtotal,
      });
    }

    // =================================================
    // Calculate Totals
    // =================================================

    const shippingFee =
      subtotal > 0
        ? SHIPPING_FEE
        : 0;

    const discount = 0;

    const total =
      subtotal +
      shippingFee -
      discount;

    // =================================================
    // Generate Order Number
    // =================================================

    const randomPart =
      Math.random()
        .toString(36)
        .substring(2, 7)
        .toUpperCase();

    const orderNumber =
      `DZR-${Date.now()}-${randomPart}`;

    // =================================================
    // Create Order
    // =================================================

    const order =
      await Order.create({
        orderNumber,

        // Logged-in customer
        user:
          currentUser._id,

        // ===============================================
        // Customer Snapshot
        // ===============================================

        customer: {
          name:
            customer.name.trim(),

          email:
            customer.email
              .trim()
              .toLowerCase(),

          phone:
            customer.phone.trim(),
        },

        // ===============================================
        // Shipping Address
        // ===============================================

        shippingAddress: {
          address:
            shippingAddress.address.trim(),

          city:
            shippingAddress.city.trim(),

          postalCode:
            shippingAddress.postalCode
              ?.trim() || "",

          country:
            shippingAddress.country
              ?.trim() ||
            "Bangladesh",
        },

        // ===============================================
        // Order Items
        // ===============================================

        items:
          orderItems,

        subtotal,

        shippingFee,

        discount,

        total,

        // ===============================================
        // Payment
        // ===============================================

        paymentMethod,

        paymentStatus:
          "pending",

        paymentId: "",

        transactionId: "",

        paidAt: null,

        // ===============================================
        // Order Status
        // ===============================================

        orderStatus:
          "pending",

        notes: "",
      });

    // =================================================
    // Clear MongoDB Cart
    // Only for COD
    // =================================================

    if (
      paymentMethod === "cod"
    ) {
      const cartId =
        request.cookies.get(
          "dazro_cart_id"
        )?.value;

      if (cartId) {
        await Cart.findOneAndUpdate(
          {
            cartId,
          },
          {
            $set: {
              items: [],
            },
          }
        );
      }
    }

    // =================================================
    // Success
    // =================================================

    return NextResponse.json(
      {
        success: true,

        message:
          "Order created successfully.",

        order,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/orders ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,

        message:
          error.message ||
          "Failed to create order.",
      },
      {
        status: 500,
      }
    );
  }
}