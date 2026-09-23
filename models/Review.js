import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    // ==========================================
    // User
    // ==========================================

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ==========================================
    // Product
    // ==========================================

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    // ==========================================
    // Customer Snapshot
    // Existing DB structure compatible
    // ==========================================

    customer: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ==========================================
    // Order
    // Optional for old/existing reviews
    // Required logically for new verified reviews
    // ==========================================

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
      index: true,
    },

    // ==========================================
    // Rating
    // ==========================================

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // ==========================================
    // Comment
    // ==========================================

    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // ==========================================
    // Status
    // ==========================================

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
      ],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "reviews",
  }
);

const Review =
  mongoose.models.Review ||
  mongoose.model(
    "Review",
    reviewSchema
  );

export default Review;