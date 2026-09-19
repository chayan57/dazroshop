"use client";

import React, {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import {
  useParams,
  useRouter,
} from "next/navigation";

function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [order, setOrder] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ==========================================
  // Fetch Order Details
  // ==========================================

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        setError("");

        if (!params?.id) {
          throw new Error(
            "Order ID is missing."
          );
        }

        const response =
          await fetch(
            `/api/orders/${params.id}`,
            {
              method: "GET",
              cache: "no-store",
            }
          );

        const text =
          await response.text();

        let data = {};

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            console.error(
              "Invalid JSON response:",
              text
            );

            throw new Error(
              `Order API returned invalid data. Status: ${response.status}`
            );
          }
        }

        // ======================================
        // Login Required
        // ======================================

        if (
          response.status === 401
        ) {
          router.push(
            `/login?redirect=/orders/${params.id}`
          );

          return;
        }

        // ======================================
        // API Error
        // ======================================

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Order not found."
          );
        }

        setOrder(
          data.order || null
        );
      } catch (error) {
        console.error(
          "Order details error:",
          error
        );

        setError(
          error.message ||
            "Failed to load order."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [
    params?.id,
    router,
  ]);

  // ==========================================
  // Format Date
  // ==========================================

  const formatDate = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    const formattedDate =
      new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "N/A";
    }

    return formattedDate.toLocaleDateString(
      "en-BD",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ==========================================
  // Format Date + Time
  // ==========================================

  const formatDateTime = (
    date
  ) => {
    if (!date) {
      return "N/A";
    }

    const formattedDate =
      new Date(date);

    if (
      Number.isNaN(
        formattedDate.getTime()
      )
    ) {
      return "N/A";
    }

    return formattedDate.toLocaleString(
      "en-BD",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // ==========================================
  // Order Status Class
  // ==========================================

  const getStatusClass = (
    status
  ) => {
    switch (status) {
      case "confirmed":
        return "confirmed";

      case "processing":
        return "processing";

      case "shipped":
        return "shipped";

      case "delivered":
        return "delivered";

      case "cancelled":
        return "cancelled";

      default:
        return "pending";
    }
  };

  // ==========================================
  // Payment Status Class
  // ==========================================

  const getPaymentClass = (
    status
  ) => {
    switch (status) {
      case "paid":
        return "paid";

      case "failed":
        return "failed";

      case "refunded":
        return "refunded";

      default:
        return "pending";
    }
  };

  // ==========================================
  // Payment Method
  // ==========================================

  const getPaymentMethod = (
    method
  ) => {
    if (method === "bkash") {
      return "bKash";
    }

    return "Cash on Delivery";
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <main className="dazro-orders-page">
        <div className="container py-5">
          <div className="dazro-orders-loading">
            <div
              className="spinner-border"
              role="status"
              aria-label="Loading"
            />

            <p className="mb-0">
              Loading order details...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error || !order) {
    return (
      <main className="dazro-orders-page">
        <div className="container py-5">

          <div className="dazro-orders-empty">

            <div className="dazro-orders-empty-icon">
              !
            </div>

            <h2>
              Unable to load order
            </h2>

            <p>
              {error ||
                "This order could not be found."}
            </p>

            <div className="d-flex justify-content-center gap-2 flex-wrap">

              <button
                type="button"
                className="btn dazro-orders-primary-btn"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

              <Link
                href="/orders"
                className="btn dazro-orders-secondary-btn"
              >
                Back to My Orders
              </Link>

            </div>

          </div>

        </div>
      </main>
    );
  }

  const orderItems =
    Array.isArray(order.items)
      ? order.items
      : [];

  return (
    <main className="dazro-orders-page">
      <div className="container py-4 py-lg-5">

        {/* ======================================
            Back
        ====================================== */}

        <Link
          href="/orders"
          className="dazro-orders-back"
        >
          ← Back to My Orders
        </Link>

        {/* ======================================
            Header
        ====================================== */}

        <div className="dazro-order-detail-header">

          <div className="dazro-order-detail-main">

            <span className="dazro-order-small-label">
              Order Number
            </span>

            <h1>
              {order.orderNumber ||
                "N/A"}
            </h1>

            <p>
              Placed on{" "}
              {formatDate(
                order.createdAt
              )}
            </p>

          </div>

          <div className="dazro-order-detail-statuses">

            <div className="dazro-order-detail-status-block">

              <span className="dazro-order-small-label bg-warning">
                Order Status
              </span>

              <span
                className={`dazro-order-status ${getStatusClass(
                  order.orderStatus
                )}`}
              >
                {order.orderStatus ||
                  "pending"}
              </span>

            </div>

            <div className="dazro-order-detail-status-block">

              <span className="dazro-order-small-label bg-warning">
                Payment
              </span>

              <span
                className={`dazro-payment-status ${getPaymentClass(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus ||
                  "pending"}
              </span>

            </div>

          </div>

        </div>

        <div className="row g-4">

          {/* ======================================
              Left Side
          ====================================== */}

          <div className="col-12 col-lg-7">

            {/* ====================================
                Order Items
            ==================================== */}

            <section className="dazro-order-section-card">

              <div className="dazro-order-section-title">

                <div>
                  <h3>
                    Order Items
                  </h3>

                  <p className="dazro-order-section-subtext">
                    Products included in this order
                  </p>
                </div>

                <span>
                  {orderItems.length}{" "}
                  {orderItems.length ===
                  1
                    ? "item"
                    : "items"}
                </span>

              </div>

              <div className="dazro-order-detail-items">

                {orderItems.map(
                  (
                    item,
                    index
                  ) => {
                    const itemTotal =
                      Number(
                        item.subtotal ||
                          0
                      ) ||
                      Number(
                        item.price ||
                          0
                      ) *
                        Number(
                          item.quantity ||
                            0
                        );

                    return (
                      <div
                        key={
                          item._id ||
                          `${order._id}-${index}`
                        }
                        className="dazro-order-detail-item"
                      >

                        {/* Image */}

                        <div className="dazro-order-detail-image">

                          {item.image ? (
                            <img
                              src={
                                item.image
                              }
                              alt={
                                item.name ||
                                "Product"
                              }
                            />
                          ) : (
                            <div className="dazro-order-detail-no-image">
                              No Image
                            </div>
                          )}

                        </div>

                        {/* Info */}

                        <div className="dazro-order-detail-item-info">

                          <h4>
                            {item.name ||
                              "Product"}
                          </h4>

                          <div className="dazro-order-detail-item-meta">
                            <span>
                              Quantity:{" "}
                              {
                                item.quantity
                              }
                            </span>

                            <span>
                              ৳
                              {Number(
                                item.price ||
                                  0
                              ).toLocaleString()}{" "}
                              each
                            </span>
                          </div>

                        </div>

                        {/* Total */}

                        <strong className="dazro-order-detail-item-total">
                          ৳
                          {itemTotal.toLocaleString()}
                        </strong>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* ====================================
                Delivery Information
            ==================================== */}

            <section className="dazro-order-section-card mt-4">

              <div className="dazro-order-section-title">

                <div>
                  <h3>
                    Delivery Information
                  </h3>

                  <p className="dazro-order-section-subtext">
                    Your order will be delivered to
                  </p>
                </div>

              </div>

              <div className="dazro-delivery-grid">

                <div className="dazro-delivery-item">

                  <span>
                    Customer
                  </span>

                  <strong>
                    {order.customer
                      ?.name ||
                      "N/A"}
                  </strong>

                </div>

                <div className="dazro-delivery-item">

                  <span>
                    Phone
                  </span>

                  <strong>
                    {order.customer
                      ?.phone ||
                      "N/A"}
                  </strong>

                </div>

                <div className="dazro-delivery-item">

                  <span>
                    Email
                  </span>

                  <strong>
                    {order.customer
                      ?.email ||
                      "N/A"}
                  </strong>

                </div>

                <div className="dazro-delivery-item dazro-delivery-address">

                  <span>
                    Address
                  </span>

                  <strong>
                    {order.shippingAddress
                      ?.address ||
                      "N/A"}
                  </strong>

                  <strong>
                    {order.shippingAddress
                      ?.city ||
                      "N/A"}

                    {order.shippingAddress
                      ?.postalCode
                      ? ` - ${order.shippingAddress.postalCode}`
                      : ""}
                  </strong>

                  <strong>
                    {order.shippingAddress
                      ?.country ||
                      "Bangladesh"}
                  </strong>

                </div>

              </div>

            </section>

          </div>

          {/* ======================================
              Right Side
          ====================================== */}

          <div className="col-12 col-lg-5">

            <section className="dazro-order-section-card dazro-order-summary-card">

              <div className="dazro-order-section-title">
                <div>
                  <h3>
                    Order Summary
                  </h3>

                  <p className="dazro-order-section-subtext">
                    Payment and order information
                  </p>
                </div>
              </div>

              {/* Subtotal */}

              <div className="dazro-summary-row">

                <span>
                  Subtotal
                </span>

                <strong>
                  ৳
                  {Number(
                    order.subtotal ||
                      0
                  ).toLocaleString()}
                </strong>

              </div>

              {/* Shipping */}

              <div className="dazro-summary-row">

                <span>
                  Shipping
                </span>

                <strong>
                  ৳
                  {Number(
                    order.shippingFee ||
                      0
                  ).toLocaleString()}
                </strong>

              </div>

              {/* Discount */}

              {Number(
                order.discount ||
                  0
              ) > 0 && (
                <div className="dazro-summary-row">

                  <span>
                    Discount
                  </span>

                  <strong className="dazro-discount-value">
                    -৳
                    {Number(
                      order.discount
                    ).toLocaleString()}
                  </strong>

                </div>
              )}

              {/* Total */}

              <div className="dazro-order-total-row">

                <span>
                  Total
                </span>

                <strong>
                  ৳:{""}
                  {Number(
                    order.total ||
                      0
                  ).toLocaleString()}
                </strong>

              </div>

              <div className="dazro-order-meta">

                {/* Payment Method */}

                <div>
                  <span>
                    Payment Method :
                  </span>

                  <strong>
                    {getPaymentMethod(
                      order.paymentMethod
                    )}
                  </strong>
                </div>

                {/* Payment Status */}

                <div>
                  <span>
                    Payment Status :
                  </span>

                  <strong
                    className={`dazro-payment-status ${getPaymentClass(
                      order.paymentStatus
                    )}`}
                  >
                    {order.paymentStatus ||
                      "pending"}
                  </strong>
                </div>

                {/* Transaction */}

                {order.transactionId && (
                  <div>
                    <span>
                      Transaction ID :
                    </span>

                    <strong className="dazro-order-break">
                      {
                        order.transactionId
                      }
                    </strong>
                  </div>
                )}

                {/* Paid At */}

                {order.paidAt && (
                  <div>
                    <span>
                      Paid At :
                    </span>

                    <strong>
                      {formatDateTime(
                        order.paidAt
                      )}
                    </strong>
                  </div>
                )}

                {/* Order Status */}

                <div>
                  <span>
                    Order Status :
                  </span>

                  <strong
                    className={`dazro-order-status ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus ||
                      "pending"}
                  </strong>
                </div>

                {/* Created */}

                <div>
                  <span>
                    Order Date :
                  </span>

                  <strong>
                    {formatDateTime(
                      order.createdAt
                    )}
                  </strong>
                </div>

              </div>

            </section>

            {/* Continue Shopping */}

            <Link
              href="/products"
              className="btn dazro-shop-btn w-100 mt-3 bg-success pt-2 fs-5 p-1"
            >
              Continue Shopping
            </Link>

          </div>

        </div>

      </div>
    </main>
  );
}

export default OrderDetailsPage;