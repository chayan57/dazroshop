import { NextResponse } from "next/server";
import mongoose from "mongoose";

import dbConnect from "@/lib/connectDB";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { getCurrentUser } from "@/lib/auth";

// =====================================================
// GET - Product Reviews
// =====================================================

export async function GET(request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(productId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid product ID is required.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // Approved Reviews
    // =================================================

    const reviews = await Review.find({
      product: productId,
      status: "approved",
    })
      .populate("user", "name")
      .sort({ createdAt: -1 })
      .lean();

    const reviewCount = reviews.length;

    const totalRating = reviews.reduce(
      (sum, review) =>
        sum + Number(review.rating || 0),
      0
    );

    const averageRating =
      reviewCount > 0
        ? Number(
            (totalRating / reviewCount).toFixed(1)
          )
        : 0;

    // =================================================
    // Current User
    // =================================================

    let loggedIn = false;
    let myReview = null;

    const currentUser =
      await getCurrentUser();

    if (currentUser) {
      loggedIn = true;

      myReview =
        await Review.findOne({
          user: currentUser._id,
          product: productId,
        })
          .sort({ createdAt: -1 })
          .lean();
    }

    return NextResponse.json(
      {
        success: true,

        reviews,

        summary: {
          averageRating,
          reviewCount,
        },

        user: {
          loggedIn,
          myReview,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "GET /api/reviews ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to fetch reviews.",
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Submit Review
// =====================================================

export async function POST(request) {
  try {
    await dbConnect();

    // =================================================
    // Login Check
    // =================================================

    const currentUser =
      await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Please login to submit a review.",
        },
        { status: 401 }
      );
    }

    // =================================================
    // Body
    // =================================================

    const body =
      await request.json();

    const {
      productId,
      rating,
      comment,
    } = body;

    // =================================================
    // Product ID
    // =================================================

    if (
      !productId ||
      !mongoose.Types.ObjectId.isValid(
        productId
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Valid product ID is required.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // Rating
    // =================================================

    const numericRating =
      Number(rating);

    if (
      !Number.isInteger(
        numericRating
      ) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Rating must be between 1 and 5.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // Comment
    // =================================================

    const cleanComment =
      String(comment || "").trim();

    if (!cleanComment) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review comment is required.",
        },
        { status: 400 }
      );
    }

    if (cleanComment.length > 2000) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Review cannot exceed 2000 characters.",
        },
        { status: 400 }
      );
    }

    // =================================================
    // Product Check
    // =================================================

    const product =
      await Product.findOne({
        _id: productId,
        status: "active",
      }).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    // =================================================
    // Existing Review
    // =================================================

    const existingReview =
      await Review.findOne({
        user: currentUser._id,
        product: productId,
      });

    if (existingReview) {
      // -----------------------------------------------
      // Rejected review can be submitted again
      // -----------------------------------------------

      if (
        String(
          existingReview.status || ""
        ).toLowerCase() ===
        "rejected"
      ) {
        existingReview.rating =
          numericRating;

        existingReview.comment =
          cleanComment;

        existingReview.customer = {
          name:
            currentUser.name || "",
          email:
            currentUser.email || "",
          phone:
            currentUser.phone || "",
        };

        existingReview.status =
          "pending";

        // Keep old order value if it exists
        await existingReview.save();

        return NextResponse.json(
          {
            success: true,
            message:
              "Your review was resubmitted successfully and is waiting for admin approval.",
            review:
              existingReview,
          },
          { status: 200 }
        );
      }

      // -----------------------------------------------
      // Pending / Approved
      // -----------------------------------------------

      return NextResponse.json(
        {
          success: false,
          message:
            "You have already reviewed this product.",
          review: existingReview,
        },
        { status: 409 }
      );
    }

    // =================================================
    // Customer Snapshot
    // =================================================

    const customer = {
      name:
        currentUser.name || "",
      email:
        currentUser.email || "",
      phone:
        currentUser.phone || "",
    };

    // =================================================
    // Create Review
    // =================================================

    const review =
      await Review.create({
        user: currentUser._id,
        product: productId,
        customer,
        rating: numericRating,
        comment: cleanComment,
        status: "pending",
      });

    return NextResponse.json(
      {
        success: true,
        message:
          "Your review was submitted successfully and is waiting for admin approval.",
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/reviews ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error.message ||
          "Failed to submit review.",
      },
      { status: 500 }
    );
  }
}