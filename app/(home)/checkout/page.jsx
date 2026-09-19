"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  clearCart,
  setCart,
} from "@/app/components/store/cartSlice";

// =====================================================
// bKash SDK Loader
// =====================================================

let bkashSdkPromise = null;

function loadBkashSdk() {
  if (
    typeof window !== "undefined" &&
    window.bKash
  ) {
    return Promise.resolve(
      window.bKash
    );
  }

  if (bkashSdkPromise) {
    return bkashSdkPromise;
  }

  bkashSdkPromise = new Promise(
    (resolve, reject) => {
      const loadBkashScript = () => {
        const existingScript =
          document.querySelector(
            'script[data-bkash-sdk="true"]'
          );

        if (existingScript) {
          if (
            typeof window !== "undefined" &&
            window.bKash
          ) {
            resolve(
              window.bKash
            );

            return;
          }

          existingScript.addEventListener(
            "load",
            () => {
              if (
                typeof window !==
                  "undefined" &&
                window.bKash
              ) {
                resolve(
                  window.bKash
                );
              } else {
                reject(
                  new Error(
                    "bKash SDK loaded but bKash object was not found."
                  )
                );
              }
            },
            {
              once: true,
            }
          );

          return;
        }

        const script =
          document.createElement(
            "script"
          );

        script.src =
          "https://scripts.sandbox.bka.sh/versions/1.2.0-beta/checkout/bKash-checkout-sandbox.js";

        script.async = true;

        script.dataset.bkashSdk =
          "true";

        script.onload = () => {
          if (
            typeof window !==
              "undefined" &&
            window.bKash
          ) {
            resolve(
              window.bKash
            );
          } else {
            reject(
              new Error(
                "bKash SDK loaded but bKash object was not found."
              )
            );
          }
        };

        script.onerror = () => {
          reject(
            new Error(
              "Failed to load bKash SDK."
            )
          );
        };

        document.body.appendChild(
          script
        );
      };

      // bKash demo uses jQuery to load/use the SDK
      if (
        typeof window !==
          "undefined" &&
        window.jQuery
      ) {
        loadBkashScript();
        return;
      }

      const existingJquery =
        document.querySelector(
          'script[data-jquery="true"]'
        );

      if (existingJquery) {
        existingJquery.addEventListener(
          "load",
          loadBkashScript,
          {
            once: true,
          }
        );

        return;
      }

      const jqueryScript =
        document.createElement(
          "script"
        );

      jqueryScript.src =
        "https://code.jquery.com/jquery-3.7.1.min.js";

      jqueryScript.async = true;

      jqueryScript.dataset.jquery =
        "true";

      jqueryScript.onload =
        loadBkashScript;

      jqueryScript.onerror = () => {
        reject(
          new Error(
            "Failed to load jQuery."
          )
        );
      };

      document.body.appendChild(
        jqueryScript
      );
    }
  );

  return bkashSdkPromise;
}

// =====================================================
// Safe API JSON Parser
// =====================================================

async function parseApiResponse(
  response
) {
  const contentType =
    response.headers.get(
      "content-type"
    ) || "";

  const text =
    await response.text();

  if (
    !contentType.includes(
      "application/json"
    )
  ) {
    console.error(
      "Non-JSON API response:",
      {
        status:
          response.status,

        contentType,

        response:
          text.slice(
            0,
            500
          ),
      }
    );

    throw new Error(
      `Server returned ${response.status} instead of JSON.`
    );
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    console.error(
      "Invalid JSON response:",
      text
    );

    throw new Error(
      "Server returned invalid JSON."
    );
  }
}

// =====================================================
// Checkout Page
// =====================================================

function CheckoutPage() {
  const router = useRouter();
  const dispatch = useDispatch();

  // =====================================================
  // Redux Cart
  // =====================================================

  const cartItems = useSelector(
    (state) => state.cart.items
  );

  // =====================================================
  // States
  // =====================================================

  const [cartLoading, setCartLoading] =
    useState(true);

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // =====================================================
  // Load Cart
  // =====================================================

  useEffect(() => {
    const fetchCart = async () => {
      try {
        setCartLoading(true);
        setError("");

        const response =
          await fetch("/api/cart", {
            cache: "no-store",
          });

        const data =
          await parseApiResponse(
            response
          );

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
          "Checkout cart error:",
          error
        );

        setError(
          error.message ||
            "Failed to load your cart."
        );
      } finally {
        setCartLoading(false);
      }
    };

    fetchCart();
  }, [dispatch]);

  // =====================================================
  // Load bKash SDK when selected
  // =====================================================

  useEffect(() => {
    if (
      paymentMethod !==
      "bkash"
    ) {
      return;
    }

    loadBkashSdk().catch(
      (error) => {
        console.error(
          "bKash SDK loading error:",
          error
        );

        setError(
          error.message ||
            "Unable to load bKash checkout."
        );
      }
    );
  }, [paymentMethod]);

  // =====================================================
  // Price
  // =====================================================

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (
        sum,
        item
      ) => {
        return (
          sum +
          Number(
            item.price || 0
          ) *
            Number(
              item.quantity || 0
            )
        );
      },
      0
    );
  }, [cartItems]);

  const shippingFee =
    subtotal > 0 ? 80 : 0;

  const total =
    subtotal +
    shippingFee;

  // =====================================================
  // Input Change
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  // =====================================================
  // Start bKash Checkout
  // =====================================================

  const startBkashCheckout =
    async (order) => {
      try {
        setError("");

        const bKash =
          await loadBkashSdk();

        if (!bKash) {
          throw new Error(
            "bKash checkout is not available."
          );
        }

        const bkashButton =
          document.getElementById(
            "bKash_button"
          );

        if (!bkashButton) {
          throw new Error(
            "bKash button was not found."
          );
        }

        let paymentID = "";

        // =================================================
        // bKash Init
        // =================================================

        bKash.init({
          paymentMode:
            "checkout",

          paymentRequest: {
            amount:
              Number(
                order.total
              ).toFixed(2),

            intent: "sale",
          },

          // ===============================================
          // Create Payment
          // ===============================================

          createRequest:
            async function () {
              try {
                console.log(
                  "Creating bKash payment..."
                );

                const response =
                  await fetch(
                    "/api/payment/bkash/create",
                    {
                      method:
                        "POST",

                      headers: {
                        "Content-Type":
                          "application/json",
                      },

                      body: JSON.stringify(
                        {
                          orderId:
                            order._id,
                        }
                      ),
                    }
                  );

                const data =
                  await parseApiResponse(
                    response
                  );

                console.log(
                  "bKash create response:",
                  data
                );

                if (
                  !response.ok ||
                  !data.success
                ) {
                  throw new Error(
                    data.message ||
                      "Failed to create bKash payment."
                  );
                }

                const createResponse =
                  data.createResponse ||
                  data;

                paymentID =
                  data.paymentID ||
                  createResponse.paymentID ||
                  "";

                if (!paymentID) {
                  throw new Error(
                    "bKash payment ID was not returned."
                  );
                }

                console.log(
                  "bKash Payment ID:",
                  paymentID
                );

                // =========================================
                // Send create response to bKash
                // =========================================

                bKash
                  .create()
                  .onSuccess(
                    createResponse
                  );
              } catch (error) {
                console.error(
                  "bKash create error:",
                  error
                );

                setError(
                  error.message ||
                    "Failed to start bKash payment."
                );

                setLoading(
                  false
                );

                bKash
                  .create()
                  .onError();
              }
            },

          // ===============================================
          // Execute Payment
          // ===============================================

          executeRequestOnAuthorization:
            async function () {
              try {
                if (!paymentID) {
                  throw new Error(
                    "bKash payment ID is missing."
                  );
                }

                console.log(
                  "Executing bKash payment...",
                  paymentID
                );

                const response =
                  await fetch(
                    "/api/payment/bkash/execute",
                    {
                      method:
                        "POST",

                      headers: {
                        "Content-Type":
                          "application/json",
                      },

                      body: JSON.stringify(
                        {
                          orderId:
                            order._id,

                          paymentID,
                        }
                      ),
                    }
                  );

                const data =
                  await parseApiResponse(
                    response
                  );

                console.log(
                  "bKash execute response:",
                  data
                );

                if (
                  !response.ok ||
                  !data.success
                ) {
                  throw new Error(
                    data.message ||
                      "bKash payment execution failed."
                  );
                }

                // =========================================
                // Payment Successful
                // =========================================

                dispatch(
                  clearCart()
                );

                router.push(
                  `/order-success?order=${encodeURIComponent(
                    order.orderNumber
                  )}`
                );
              } catch (error) {
                console.error(
                  "bKash execute error:",
                  error
                );

                setError(
                  error.message ||
                    "bKash payment failed."
                );

                setLoading(
                  false
                );

                try {
                  bKash
                    .execute()
                    .onError();
                } catch {}
              }
            },

          // ===============================================
          // Popup Close
          // ===============================================

          onClose:
            function () {
              console.log(
                "bKash checkout closed."
              );

              setLoading(
                false
              );
            },
        });

        // =================================================
        // Trigger bKash
        // =================================================

        setTimeout(() => {
          bkashButton.click();
        }, 300);
      } catch (error) {
        console.error(
          "bKash checkout error:",
          error
        );

        setError(
          error.message ||
            "Unable to start bKash checkout."
        );

        setLoading(
          false
        );
      }
    };

  // =====================================================
  // Submit
  // =====================================================

  const handleSubmit = async (
    e
  ) => {
    e.preventDefault();

    setError("");

    // ===================================================
    // Validate Cart
    // ===================================================

    if (
      cartItems.length === 0
    ) {
      setError(
        "Your cart is empty. Please add a product before checkout."
      );

      return;
    }

    // ===================================================
    // Validate Form
    // ===================================================

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim()
    ) {
      setError(
        "Please fill in all required fields."
      );

      return;
    }

    try {
      setLoading(true);

      // =================================================
      // Create Order
      // =================================================

      const orderResponse =
        await fetch(
          "/api/orders",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              customer: {
                name:
                  formData.name.trim(),

                email:
                  formData.email
                    .trim()
                    .toLowerCase(),

                phone:
                  formData.phone.trim(),
              },

              shippingAddress: {
                address:
                  formData.address.trim(),

                city:
                  formData.city.trim(),

                postalCode:
                  formData.postalCode.trim(),

                country:
                  "Bangladesh",
              },

              items:
                cartItems.map(
                  (item) => ({
                    productId:
                      item.productId,

                    quantity:
                      Number(
                        item.quantity ||
                          1
                      ),
                  })
                ),

              paymentMethod,
            }),
          }
        );

      const orderData =
        await parseApiResponse(
          orderResponse
        );

      if (
        !orderResponse.ok ||
        !orderData.success
      ) {
        throw new Error(
          orderData.message ||
            "Failed to create order."
        );
      }

      const order =
        orderData.order;

      if (!order?._id) {
        throw new Error(
          "Order ID was not returned from server."
        );
      }

      // =================================================
      // bKash
      // =================================================

      if (
        paymentMethod ===
        "bkash"
      ) {
        await startBkashCheckout(
          order
        );

        return;
      }

      // =================================================
      // COD
      // =================================================

      dispatch(
        clearCart()
      );

      router.push(
        `/order-success?order=${encodeURIComponent(
          order.orderNumber
        )}`
      );
    } catch (error) {
      console.error(
        "Checkout error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  };

  // =====================================================
  // Loading
  // =====================================================

  if (cartLoading) {
    return (
      <main className="dazro-checkout-page">
        <div className="container py-5">
          <div className="dazro-cart-loading">

            <div
              className="spinner-border"
              role="status"
            />

            <p className="mt-3 mb-0">
              Loading checkout...
            </p>

          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // Empty Cart
  // =====================================================

  if (
    !cartLoading &&
    cartItems.length === 0
  ) {
    return (
      <main className="dazro-checkout-page">
        <div className="container py-5">

          <div className="dazro-empty-checkout">

            <div className="dazro-empty-checkout-icon">
              🛒
            </div>

            <h5>
              Your cart is empty
            </h5>

            <p>
              Add products before continuing
              to checkout.
            </p>

            <Link
              href="/products"
              className="btn dazro-shop-btn"
            >
              Continue Shopping
            </Link>

          </div>

        </div>
      </main>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <main className="dazro-checkout-page">

      {/* =================================================
          Hidden bKash SDK Trigger
      ================================================= */}

      <button
        id="bKash_button"
        type="button"
        style={{
          position: "fixed",
          width: "1px",
          height: "1px",
          opacity: 0,
          pointerEvents:
            "none",
          overflow: "hidden",
        }}
        tabIndex={-1}
        aria-hidden="true"
      >
        Pay With bKash
      </button>

      <div className="container py-4 py-lg-5">

        {/* Header */}

        <div className="mb-4 mb-lg-5">

          <div className="d-flex align-items-center gap-2 mb-2">

            <Link
              href="/cart"
              className="text-decoration-none dazro-checkout-back"
            >
              ← Back to Cart
            </Link>

          </div>

          <h1 className="dazro-checkout-title">
            Checkout
          </h1>

          <p className="dazro-checkout-subtitle mb-0">
            Complete your information and
            choose your preferred payment method.
          </p>

        </div>

        {/* Error */}

        {error && (
          <div
            className="alert alert-danger border-0 rounded-3 mb-4"
            role="alert"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={
            handleSubmit
          }
        >

          <div className="row g-4">

            {/* =================================================
                LEFT
            ================================================= */}

            <div className="col-12 col-lg-7">

              {/* Customer */}

              <section className="dazro-checkout-card mb-4">

                <div className="dazro-checkout-section-header">

                  <div className="dazro-checkout-number">
                    01
                  </div>

                  <div>

                    <h2 className="dazro-checkout-section-title">
                      Customer Information
                    </h2>

                    <p className="dazro-checkout-section-subtitle">
                      Enter your contact details.
                    </p>

                  </div>

                </div>

                <div className="row g-3">

                  <div className="col-12">

                    <label className="dazro-input-label">
                      Full Name
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={
                        formData.name
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control dazro-input"
                      placeholder="Enter your full name"
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="dazro-input-label">
                      Email Address
                      <span>*</span>
                    </label>

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control dazro-input"
                      placeholder="you@example.com"
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="dazro-input-label">
                      Phone Number
                      <span>*</span>
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control dazro-input"
                      placeholder="01XXXXXXXXX"
                      required
                    />

                  </div>

                </div>

              </section>

              {/* Shipping */}

              <section className="dazro-checkout-card mb-4">

                <div className="dazro-checkout-section-header">

                  <div className="dazro-checkout-number">
                    02
                  </div>

                  <div>

                    <h2 className="dazro-checkout-section-title">
                      Shipping Address
                    </h2>

                    <p className="dazro-checkout-section-subtitle">
                      Where should we deliver your order?
                    </p>

                  </div>

                </div>

                <div className="row g-3">

                  <div className="col-12">

                    <label className="dazro-input-label">
                      Full Address
                      <span>*</span>
                    </label>

                    <textarea
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control dazro-input"
                      rows="4"
                      placeholder="House / Road / Area"
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="dazro-input-label">
                      City
                      <span>*</span>
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={
                        formData.city
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control dazro-input"
                      placeholder="Dhaka"
                      required
                    />

                  </div>

                  <div className="col-12 col-md-6">

                    <label className="dazro-input-label">
                      Postal Code
                    </label>

                    <input
                      type="text"
                      name="postalCode"
                      value={
                        formData.postalCode
                      }
                      onChange={
                        handleChange
                      }
                      className="form-control dazro-input"
                      placeholder="1200"
                    />

                  </div>

                  <div className="col-12">

                    <label className="dazro-input-label">
                      Country
                    </label>

                    <input
                      type="text"
                      className="form-control dazro-input"
                      value="Bangladesh"
                      readOnly
                    />

                  </div>

                </div>

              </section>

              {/* Payment */}

              <section className="dazro-checkout-card">

                <div className="dazro-checkout-section-header">

                  <div className="dazro-checkout-number">
                    03
                  </div>

                  <div>

                    <h2 className="dazro-checkout-section-title">
                      Payment Method
                    </h2>

                    <p className="dazro-checkout-section-subtitle">
                      Choose how you want to pay.
                    </p>

                  </div>

                </div>

                <div className="dazro-payment-options">

                  {/* COD */}

                  <button
                    type="button"
                    className={`dazro-payment-option ${
                      paymentMethod ===
                      "cod"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setPaymentMethod(
                        "cod"
                      );
                      setError("");
                    }}
                  >

                    <div className="dazro-payment-radio">
                      <span />
                    </div>

                    <div className="dazro-payment-content">

                      <strong>
                        Cash on Delivery
                      </strong>

                      <small>
                        Pay when your order arrives.
                      </small>

                    </div>

                    <div className="dazro-payment-badge">
                      COD
                    </div>

                  </button>

                  {/* bKash */}

                  <button
                    type="button"
                    className={`dazro-payment-option dazro-bkash-option ${
                      paymentMethod ===
                      "bkash"
                        ? "active"
                        : ""
                    }`}
                    onClick={() => {
                      setPaymentMethod(
                        "bkash"
                      );
                      setError("");
                    }}
                  >

                    <div className="dazro-payment-radio">
                      <span />
                    </div>

                    <div className="dazro-payment-content">

                      <strong>
                        Pay with bKash
                      </strong>

                      <small>
                        Secure online payment with bKash.
                      </small>

                    </div>

                    <div className="dazro-bkash-logo">
                      bKash
                    </div>

                  </button>

                </div>

                {paymentMethod ===
                  "bkash" && (
                  <div className="dazro-bkash-info">

                    <div className="dazro-bkash-info-icon">
                      ✓
                    </div>

                    <div>

                      <strong>
                        bKash payment selected
                      </strong>

                      <p className="mb-0">
                        Click “Continue to bKash”
                        to open the secure bKash
                        checkout.
                      </p>

                    </div>

                  </div>
                )}

              </section>

            </div>

            {/* =================================================
                RIGHT
            ================================================= */}

            <div className="col-12 col-lg-5">

              <div className="dazro-order-summary">

                <div className="dazro-summary-header">

                  <h2>
                    Order Summary
                  </h2>

                  <p>
                    {cartItems.length}{" "}
                    {cartItems.length ===
                    1
                      ? "item"
                      : "items"}{" "}
                    in your cart
                  </p>

                </div>

                <div className="dazro-checkout-products">

                  {cartItems.map(
                    (item) => (
                      <div
                        key={
                          item.productId
                        }
                        className="dazro-checkout-product"
                      >

                        <div className="dazro-product-thumb">

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

                        <div className="dazro-product-info">

                          <h6>
                            {
                              item.name
                            }
                          </h6>

                          <span>
                            Qty:{" "}
                            {
                              item.quantity
                            }
                          </span>

                        </div>

                        <strong>
                          ৳
                          {(
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

                </div>

                <hr />

                <div className="dazro-summary-row">

                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ৳
                    {subtotal.toLocaleString()}
                  </strong>

                </div>

                <div className="dazro-summary-row">

                  <span>
                    Shipping
                  </span>

                  <strong>
                    ৳
                    {shippingFee.toLocaleString()}
                  </strong>

                </div>

                <div className="dazro-summary-total">

                  <span>
                    Total
                  </span>

                  <strong>
                    ৳
                    {total.toLocaleString()}
                  </strong>

                </div>

                <button
                  type="submit"
                  className="btn dazro-place-order-btn bg-success fs-5"
                  disabled={
                    loading
                  }
                >

                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />

                      Processing...
                    </>
                  ) : paymentMethod ===
                    "bkash" ? (
                    "Continue to bKash"
                  ) : (
                    "Place Order"
                  )}

                </button>

                <p className="dazro-secure-note text-success">
                  🔒 Your checkout information is
                  securely processed.
                </p>

              </div>

            </div>

          </div>
        </form>

      </div>
    </main>
  );
}

export default CheckoutPage;