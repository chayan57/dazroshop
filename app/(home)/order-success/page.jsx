"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrderSuccessContent() {
  const searchParams = useSearchParams();

  const orderNumber = searchParams.get("order");

  return (
    <main className="dazro-order-success-page">
      <div className="container py-5">
        <div className="dazro-order-success-card">

          {/* Success Icon */}
          <div className="dazro-success-icon">
            ✓
          </div>

          {/* Title */}
          <h1 className="dazro-success-title">
            Order Placed Successfully!
          </h1>

          <p className="dazro-success-text">
            Thank you for shopping with DazroShop.
            Your order has been received successfully.
          </p>

          {/* Order Number */}
          {orderNumber && (
            <div className="dazro-success-order-box">
              <span>Order Number</span>

              <strong>{orderNumber}</strong>
            </div>
          )}

          {/* Info */}
          <div className="dazro-success-info">
            <div>
              <strong>What happens next?</strong>

              <p>
                We will review your order and contact
                you if needed. Your order will then be
                processed for delivery.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="dazro-success-actions ">
            <Link
              href="/products"
              className="btn dazro-shop-btn bg-success"
            >
              Continue Shopping
            </Link>

            <Link
              href="/"
              className="btn dazro-home-btn"
            >
              Back to Home
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}

function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}

export default OrderSuccessPage;