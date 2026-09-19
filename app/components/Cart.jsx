"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  setCart,
} from "./store/cartSlice";

function Cart() {
  const dispatch = useDispatch();

  const cartItems = useSelector(
    (state) => state.cart.items
  );

  const [loading, setLoading] =
    useState(true);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =========================
  // Load Cart From MongoDB
  // =========================
  useEffect(() => {
    const fetchCart = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/cart",
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to load cart."
          );
        }

        dispatch(
          setCart(
            data.cart?.items || []
          )
        );
      } catch (error) {
        console.error(
          "Cart load error:",
          error
        );

        setError(
          error.message ||
            "Failed to load cart."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [dispatch]);

  // =========================
  // Update Quantity
  // =========================
  const updateQuantity = async (
    productId,
    quantity
  ) => {
    try {
      setActionLoading(true);
      setError("");

      const response =
        await fetch("/api/cart", {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            productId,
            quantity,
          }),
        });

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to update cart."
        );
      }

      dispatch(
        setCart(
          data.cart?.items || []
        )
      );
    } catch (error) {
      console.error(
        "Cart update error:",
        error
      );

      setError(
        error.message ||
          "Failed to update cart."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // Increase Quantity
  // =========================
  const handleIncrease = (item) => {
    const stock = Number(
      item.stock || 0
    );

    const nextQuantity =
      Number(item.quantity || 0) +
      1;

    if (
      stock > 0 &&
      nextQuantity > stock
    ) {
      setError(
        `Only ${stock} item(s) available.`
      );

      return;
    }

    updateQuantity(
      item.productId,
      nextQuantity
    );
  };

  // =========================
  // Decrease Quantity
  // =========================
  const handleDecrease = (item) => {
    const currentQuantity =
      Number(
        item.quantity || 1
      );

    if (currentQuantity <= 1) {
      return;
    }

    updateQuantity(
      item.productId,
      currentQuantity - 1
    );
  };

  // =========================
  // Remove Item
  // =========================
  const removeItem = async (
    productId
  ) => {
    try {
      setActionLoading(true);
      setError("");

      const response =
        await fetch(
          `/api/cart?productId=${encodeURIComponent(
            productId
          )}`,
          {
            method: "DELETE",
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Failed to remove product."
        );
      }

      dispatch(
        setCart(
          data.cart?.items || []
        )
      );
    } catch (error) {
      console.error(
        "Remove cart item error:",
        error
      );

      setError(
        error.message ||
          "Failed to remove product."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // Clear Cart
  // =========================
  const handleClearCart =
    async () => {
      try {
        setActionLoading(true);
        setError("");

        const response =
          await fetch(
            "/api/cart",
            {
              method: "DELETE",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Failed to clear cart."
          );
        }

        dispatch(
          setCart([])
        );
      } catch (error) {
        console.error(
          "Clear cart error:",
          error
        );

        setError(
          error.message ||
            "Failed to clear cart."
        );
      } finally {
        setActionLoading(false);
      }
    };

  // =========================
  // Subtotal
  // =========================
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (
        sum,
        item
      ) =>
        sum +
        Number(
          item.price || 0
        ) *
          Number(
            item.quantity || 0
          ),
      0
    );
  }, [cartItems]);

  // =========================
  // Shipping
  // =========================
  const shippingFee =
    subtotal > 0
      ? 80
      : 0;

  // =========================
  // Total
  // =========================
  const total =
    subtotal +
    shippingFee;

  // =========================
  // Loading
  // =========================
  if (loading) {
    return (
      <main className="dazro-cart-page">
        <div className="container py-5">
          <div className="dazro-cart-loading">
            <div
              className="spinner-border"
              role="status"
            />

            <p className="mt-3 mb-0">
              Loading cart...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="dazro-cart-page">
      <div className="container py-4 py-lg-5">

        {/* =========================
            Header
        ========================= */}
        <div className="mb-4">
          <Link
            href="/products"
            className="dazro-cart-back"
          >
            ← Continue Shopping
          </Link>

          <h1 className="dazro-cart-title">
            Shopping Cart
          </h1>

          <p className="dazro-cart-subtitle mb-0">
            {cartItems.length}{" "}
            {cartItems.length ===
            1
              ? "item"
              : "items"}{" "}
            in your cart
          </p>
        </div>

        {/* =========================
            Error
        ========================= */}
        {error && (
          <div className="alert alert-danger border-0">
            {error}
          </div>
        )}

        {/* =========================
            Empty Cart
        ========================= */}
        {cartItems.length ===
        0 ? (
          <div className="dazro-empty-cart">
            <div className="dazro-empty-cart-icon">
              🛒
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Looks like you haven't
              added anything to your
              cart yet.
            </p>

            <Link
              href="/products"
              className="btn dazro-cart-shop-btn"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="row g-4">

            {/* =========================
                Cart Products
            ========================= */}
            <div className="col-12 col-lg-8">
              <div className="dazro-cart-card">

                {/* Header */}
                <div className="dazro-cart-card-header">
                  <h2>
                    Your Products
                  </h2>

                  <button
                    type="button"
                    className="dazro-clear-cart-btn"
                    onClick={
                      handleClearCart
                    }
                    disabled={
                      actionLoading
                    }
                  >
                    Clear Cart
                  </button>
                </div>

                {/* Items */}
                <div className="dazro-cart-items">
                  {cartItems.map(
                    (item) => {
                      const price =
                        Number(
                          item.price ||
                            0
                        );

                      const quantity =
                        Number(
                          item.quantity ||
                            0
                        );

                      const stock =
                        Number(
                          item.stock ||
                            0
                        );

                      const itemTotal =
                        price *
                        quantity;

                      return (
                        <div
                          key={
                            item.productId
                          }
                          className="dazro-cart-item"
                        >

                          {/* Image */}
                          <div className="dazro-cart-product-image">
                            {item.image ? (
                              <img
                                src={
                                  item.image
                                }
                                alt={
                                  item.name
                                }
                              />
                            ) : (
                              <span>
                                No Image
                              </span>
                            )}
                          </div>

                          {/* Product Info */}
                          <div className="dazro-cart-product-info">
                            <h3>
                              {
                                item.name
                              }
                            </h3>

                            <div className="dazro-cart-product-price">
                              ৳
                              {price.toLocaleString()}
                            </div>

                            {stock > 0 && (
                              <small className="dazro-cart-stock">
                                {stock} available
                              </small>
                            )}
                          </div>

                          {/* Quantity */}
                          <div className="dazro-cart-quantity">

                            <button
                              type="button"
                              onClick={() =>
                                handleDecrease(
                                  item
                                )
                              }
                              disabled={
                                actionLoading ||
                                quantity <= 1
                              }
                            >
                              −
                            </button>

                            <span>
                              {
                                quantity
                              }
                            </span>

                            <button
                              type="button"
                              onClick={() =>
                                handleIncrease(
                                  item
                                )
                              }
                              disabled={
                                actionLoading ||
                                quantity >=
                                  stock
                              }
                            >
                              +
                            </button>

                          </div>

                          {/* Total */}
                          <div className="dazro-cart-item-total">
                            ৳
                            {itemTotal.toLocaleString()}
                          </div>

                          {/* Remove */}
                          <button
                            type="button"
                            className="dazro-remove-item-btn"
                            onClick={() =>
                              removeItem(
                                item.productId
                              )
                            }
                            disabled={
                              actionLoading
                            }
                            aria-label={`Remove ${item.name}`}
                          >
                            ×
                          </button>

                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* =========================
                Summary
            ========================= */}
            <div className="col-12 col-lg-4">
              <div className="dazro-cart-summary">

                <h2>
                  Order Summary
                </h2>

                <div className="dazro-cart-summary-row">
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ৳
                    {subtotal.toLocaleString()}
                  </strong>
                </div>

                <div className="dazro-cart-summary-row">
                  <span>
                    Shipping
                  </span>

                  <strong>
                    ৳
                    {shippingFee.toLocaleString()}
                  </strong>
                </div>

                <div className="dazro-cart-summary-total">
                  <span>
                    Total
                  </span>

                  <strong>
                    ৳
                    {total.toLocaleString()}
                  </strong>
                </div>

                <Link
                  href="/checkout"
                  className="btn dazro-checkout-btn"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  href="/products"
                  className="dazro-summary-continue"
                >
                  Continue Shopping
                </Link>

                <div className="dazro-cart-secure">
                  🔒 Secure checkout
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}

export default Cart;