"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function OrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // Fetch Orders
  // ==========================================

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/orders", {
          method: "GET",
          cache: "no-store",
        });

        const text = await response.text();

        let data = {};

        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            throw new Error(
              `Orders API returned invalid data. Status: ${response.status}`
            );
          }
        }

        if (response.status === 401) {
          router.push("/login?redirect=/orders");
          return;
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to load orders."
          );
        }

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : []
        );
      } catch (error) {
        console.error(
          "Fetch orders error:",
          error
        );

        setError(
          error.message ||
            "Failed to load your orders."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // ==========================================
  // Format Date
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const formattedDate = new Date(date);

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
  // Status
  // ==========================================

  const getStatusClass = (status) => {
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
  // Payment Status
  // ==========================================

  const getPaymentClass = (status) => {
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
            />

            <p className="mb-0">
              Loading your orders...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // Error
  // ==========================================

  if (error) {
    return (
      <main className="dazro-orders-page">
        <div className="container py-5">
          <div className="dazro-orders-empty">

            <div className="dazro-orders-empty-icon">
              !
            </div>

            <h2>
              Unable to load orders
            </h2>

            <p>
              {error}
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
                href="/"
                className="btn dazro-orders-secondary-btn"
              >
                Back to Home
              </Link>
            </div>

          </div>
        </div>
      </main>
    );
  }

  // ==========================================
  // Empty Orders
  // ==========================================

  if (orders.length === 0) {
    return (
      <main className="dazro-orders-page">
        <div className="container py-4 py-lg-5">

          <div className="dazro-orders-heading">
            <span className="dazro-orders-heading-badge">
              DazroShop
            </span>

            <h1>
              My Orders
            </h1>

            <p>
              Manage and track your DazroShop
              orders from one place.
            </p>
          </div>

          <div className="dazro-orders-empty">

            <div className="dazro-orders-empty-icon">
              🛍️
            </div>

            <h2>
              No orders yet
            </h2>

            <p>
              You have not placed any orders
              yet. Start shopping and your
              orders will appear here.
            </p>

            <Link
              href="/products"
              className="btn dazro-orders-primary-btn"
            >
              Start Shopping
            </Link>

          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dazro-orders-page">
      <div className="container py-4 py-lg-5">

        {/* ======================================
            Header
        ====================================== */}

        <div className="dazro-orders-heading">

          <span className="dazro-orders-heading-badge">
            DazroShop
          </span>

          <h1>
            My Orders
          </h1>

          <p>
            View your orders, payment status
            and delivery progress.
          </p>

        </div>

        {/* ======================================
            Top Summary
        ====================================== */}

        <div className="dazro-orders-overview">

          <div className="dazro-orders-stat-card">
            <span className="dazro-orders-stat-label">
              Total Orders
            </span>

            <strong>
              {orders.length}
            </strong>
          </div>

          <div className="dazro-orders-stat-card">
            <span className="dazro-orders-stat-label">
              Pending
            </span>

            <strong>
              {
                orders.filter(
                  (order) =>
                    order.orderStatus ===
                    "pending"
                ).length
              }
            </strong>
          </div>

          <div className="dazro-orders-stat-card">
            <span className="dazro-orders-stat-label">
              Delivered
            </span>

            <strong>
              {
                orders.filter(
                  (order) =>
                    order.orderStatus ===
                    "confirmed"
                ).length
              }
            </strong>
          </div>

        </div>

        {/* ======================================
            Orders List
        ====================================== */}

        <div className="dazro-orders-list">

          {orders.map((order) => (
            <article
              key={order._id}
              className="dazro-order-card"
            >

              {/* ==================================
                  Order Header
              ================================== */}

              <div className="dazro-order-card-header">

                <div>
                  <span className="dazro-order-label">
                    Order Number
                  </span>

                  <h2>
                    {order.orderNumber ||
                      "N/A"}
                  </h2>

                  <div className="dazro-order-date">
                    Placed on{" "}
                    {formatDate(
                      order.createdAt
                    )}
                  </div>
                </div>

                <div className="dazro-order-card-badges">

                  <span
                    className={`dazro-order-status-badge ${getStatusClass(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus ||
                      "pending"}
                  </span>

                  <span
                    className={`dazro-payment-status-badge ${getPaymentClass(
                      order.paymentStatus
                    )}`}
                  >
                    Payment:{" "}
                    {order.paymentStatus ||
                      "pending"}
                  </span>

                </div>

              </div>

              {/* ==================================
                  Products
              ================================== */}

              <div className="dazro-order-products">

                {Array.isArray(
                  order.items
                ) &&
                  order.items
                    .slice(0, 3)
                    .map(
                      (
                        item,
                        index
                      ) => (
                        <div
                          key={
                            item._id ||
                            `${order._id}-${index}`
                          }
                          className="dazro-order-product"
                        >

                          {/* Image */}
                          <div className="dazro-order-product-image">

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
                              <div className="dazro-order-no-image">
                                No Image
                              </div>
                            )}

                          </div>

                          {/* Product Info */}
                          <div className="dazro-order-product-info">

                            <h3>
                              {item.name ||
                                "Product"}
                            </h3>

                            <span>
                              Quantity:{" "}
                              {Number(
                                item.quantity ||
                                  0
                              )}
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

                          {/* Item Total */}
                          <strong className="dazro-order-item-total">
                            ৳
                            {Number(
                              item.subtotal ||
                                Number(
                                  item.price ||
                                    0
                                ) *
                                  Number(
                                    item.quantity ||
                                      0
                                  )
                            ).toLocaleString()}
                          </strong>

                        </div>
                      )
                    )}

                {Array.isArray(
                  order.items
                ) &&
                  order.items.length >
                    3 && (
                    <div className="dazro-order-more">
                      +
                      {order.items.length -
                        3}{" "}
                      more items
                    </div>
                  )}

              </div>

              {/* ==================================
                  Footer
              ================================== */}

              <div className="dazro-order-card-footer">

                <div className="dazro-order-footer-item">
                  <span>
                    Payment Method
                  </span>

                  <strong>
                    {order.paymentMethod ===
                    "bkash"
                      ? "bKash"
                      : "Cash on Delivery"}
                  </strong>
                </div>

                <div className="dazro-order-footer-item">
                  <span>
                    Total
                  </span>

                  <strong className="dazro-order-price">
                    ৳
                    {Number(
                      order.total || 0
                    ).toLocaleString()}
                  </strong>
                </div>

                <Link
                  href={`/orders/${order._id}`}
                  className="dazro-order-details-btn"
                >
                  View Details
                  <span>
                    →
                  </span>
                </Link>

              </div>

            </article>
          ))}

        </div>

      </div>
    </main>
  );
}

export default OrdersPage;