import mongoose from "mongoose";


// Order Item Schema

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String,
      trim: true,
      default: "",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);


// Order Schema

const orderSchema = new mongoose.Schema(
  {
    
    // Order Number
    
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    
    // User
    
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    
    // Customer
    
    customer: {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      phone: {
        type: String,
        required: true,
        trim: true,
      },
    },

    
    // Shipping Address
    
    shippingAddress: {
      address: {
        type: String,
        required: true,
        trim: true,
      },

      city: {
        type: String,
        required: true,
        trim: true,
      },

      postalCode: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "Bangladesh",
      },
    },

    
    // Order Items
    
    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: (items) =>
          Array.isArray(items) &&
          items.length > 0,

        message:
          "Order must contain at least one item.",
      },
    },

    
    // Price Summary
    
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    
    // Payment Method
    
    paymentMethod: {
      type: String,
      enum: ["cod", "bkash"],
      default: "cod",
    },

    
    // Payment Status
    
    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],
      default: "pending",
    },

    
    // bKash Payment ID
    
    paymentId: {
      type: String,
      trim: true,
      default: "",
    },

    
    // bKash Transaction ID
    
    transactionId: {
      type: String,
      trim: true,
      default: "",
    },

    
    // Payment Date
    
    paidAt: {
      type: Date,
      default: null,
    },

    
    // Order Status
    
    orderStatus: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    
    // Order Notes
    
    notes: {
      type: String,
      trim: true,
      default: "",
    },

    
    // Delivered Date
    
    deliveredAt: {
      type: Date,
      default: null,
    },

    
    // Cancelled Date
    
    cancelledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// Model

const Order =
  mongoose.models.Order ||
  mongoose.model("Order", orderSchema);

export default Order;