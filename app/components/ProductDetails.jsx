"use client";
import React, {
  useEffect,
  useState,
  use,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCart } from "./store/cartSlice";
const PRODUCTS_CACHE_KEY = "dazro_products_cache";
async function getJsonResponse(response) {
  const text = await response.text();
  if (!text) {
    throw new Error(
      `Empty server response (${response.status}).`
    );
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    console.error("Invalid JSON response:", text);
    throw new Error(
      `Invalid server response (${response.status}).`
    );
  }
}
function ProductDetails() {
  const rawParams = useParams();
  const params =
    rawParams instanceof Promise
      ? use(rawParams)
      : rawParams;
  const productId = params?.id;
  const dispatch = useDispatch();
  // =====================================================
  // Product States
  // =====================================================
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState("");
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);
  // =====================================================
  // Related Products
  // =====================================================
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedReviewSummaries, setRelatedReviewSummaries] = useState({});
  // =====================================================
  // Fetch Related Product Review Summaries
  // =====================================================
  useEffect(() => {
    if (relatedProducts.length === 0) {
      setRelatedReviewSummaries({});
      return;
    }
    const controller = new AbortController();
    const fetchRelatedReviewSummaries = async () => {
      try {
        const results = await Promise.all(
          relatedProducts.map(async (item) => {
            try {
              const response = await fetch(
                `/api/reviews?productId=${encodeURIComponent(item._id)}`,
                {
                  method: "GET",
                  signal: controller.signal,
                  cache: "no-store",
                }
              );
              const data = await response.json();
              if (!response.ok || !data.success) {
                return {
                  productId: item._id,
                  averageRating: 0,
                  reviewCount: 0,
                };
              }
              return {
                productId: item._id,
                averageRating: Number(
                  data.summary?.averageRating || 0
                ),
                reviewCount: Number(
                  data.summary?.reviewCount || 0
                ),
              };
            } catch (err) {
              if (err.name === "AbortError") {
                throw err;
              }
              console.error(
                `Related review summary error for product ${item._id}:`,
                err
              );
              return {
                productId: item._id,
                averageRating: 0,
                reviewCount: 0,
              };
            }
          })
        );
        const summaryMap = {};
        results.forEach((item) => {
          summaryMap[item.productId] = {
            averageRating: item.averageRating,
            reviewCount: item.reviewCount,
          };
        });
        setRelatedReviewSummaries(summaryMap);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
        console.error(
          "Related review summaries error:",
          err
        );
      }
    };
    fetchRelatedReviewSummaries();
    return () => {
      controller.abort();
    };
  }, [relatedProducts]);
  // =====================================================
  // Review States
  // =====================================================
  const [reviews, setReviews] = useState([]);
  const [visibleReviewCount, setVisibleReviewCount] = useState(5);
  const [averageRating, setAverageRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewMessageType, setReviewMessageType] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [myReview, setMyReview] = useState(null);
  // =====================================================
  // Reset Quantity
  // =====================================================
  useEffect(() => {
    setQuantity(1);
  }, [productId]);
  // =====================================================
  // Check Authentication
  // =====================================================
  useEffect(() => {
    let isMounted = true;
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          cache: "no-store",
        });
        if (!isMounted) return;
        if (response.status === 401) {
          setLoggedIn(false);
          return;
        }
        const data = await getJsonResponse(response);
        setLoggedIn(
          Boolean(response.ok && data.success && data.user)
        );
      } catch (err) {
        console.error("Auth check error:", err);
        if (isMounted) {
          setLoggedIn(false);
        }
      }
    };
    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);
  // =====================================================
  // Fetch Product
  // =====================================================
  useEffect(() => {
    if (!productId) return;
    const controller = new AbortController();
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await fetch(
          `/api/products?id=${productId}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const data = await getJsonResponse(response);
        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch product."
          );
        }
        const currentProduct = data.product;
        setProduct(currentProduct);
        setSelectedImage(
          currentProduct?.images?.[0] || ""
        );
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Product details error:", err);
        setError(
          err.message || "Failed to load product."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchProduct();
    return () => {
      controller.abort();
    };
  }, [productId]);
  // =====================================================
  // Refresh Product When User Returns
  // =====================================================
  useEffect(() => {
    const refreshProduct = async () => {
      if (!productId) return;
      try {
        const response = await fetch(
          `/api/products?id=${productId}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        const data = await getJsonResponse(response);
        if (response.ok && data.success && data.product) {
          setProduct(data.product);
          const firstImage =
            data.product?.images?.[0] || "";
          setSelectedImage((current) =>
            current || firstImage
          );
        }
      } catch (err) {
        console.error("Product refresh error:", err);
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshProduct();
      }
    };
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [productId]);
  // =====================================================
  // Fetch Related Products
  // =====================================================
  useEffect(() => {
    if (!product?._id) return;
    let isMounted = true;
    const findRelatedProducts = async () => {
      try {
        const currentProductId = String(product._id);
        const currentCategoryId = String(
          product.category?._id ||
            product.category ||
            ""
        );
        let allProducts = [];
        // ---------------------------------------------
        // Try Session Cache
        // ---------------------------------------------
        try {
          const cached = sessionStorage.getItem(
            PRODUCTS_CACHE_KEY
          );
          if (cached) {
            const parsed = JSON.parse(cached);
            const list = Array.isArray(parsed)
              ? parsed
              : parsed?.products;
            if (Array.isArray(list)) {
              allProducts = list;
            }
          }
        } catch (cacheError) {
          console.error(
            "Related product cache error:",
            cacheError
          );
        }
        // ---------------------------------------------
        // Fresh API
        // ---------------------------------------------
        if (allProducts.length === 0) {
          const response = await fetch("/api/products", {
            method: "GET",
            cache: "no-store",
          });
          const data = await getJsonResponse(response);
          if (
            response.ok &&
            data.success &&
            Array.isArray(data.products)
          ) {
            allProducts = data.products;
          }
        }
        // ---------------------------------------------
        // Filter Related
        // ---------------------------------------------
        const related = allProducts.filter((item) => {
          const itemId = String(item._id);
          if (itemId === currentProductId) {
            return false;
          }
          const itemCategoryId = String(
            item.category?._id ||
              item.category ||
              ""
          );
          return itemCategoryId === currentCategoryId;
        });
        if (isMounted) {
          setRelatedProducts(related.slice(0, 4));
        }
      } catch (err) {
        console.error(
          "Related products error:",
          err
        );
        if (isMounted) {
          setRelatedProducts([]);
        }
      }
    };
    findRelatedProducts();
    return () => {
      isMounted = false;
    };
  }, [product]);
  // =====================================================
  // Fetch Reviews
  // =====================================================
  useEffect(() => {
    if (!productId) return;
    let isMounted = true;
    const fetchReviewData = async () => {
      try {
        setReviewLoading(true);
        const response = await fetch(
          `/api/reviews?productId=${encodeURIComponent(
            productId
          )}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );
        const data = await getJsonResponse(response);
        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Failed to fetch reviews."
          );
        }
        if (!isMounted) return;
        setReviews(
          Array.isArray(data.reviews)
            ? data.reviews
            : []
        );
        setVisibleReviewCount(5);
        setAverageRating(
          Number(data.summary?.averageRating || 0)
        );
        setReviewCount(
          Number(data.summary?.reviewCount || 0)
        );
        setMyReview(
          data.user?.myReview || null
        );
        if (typeof data.user?.loggedIn === "boolean") {
          setLoggedIn(data.user.loggedIn);
        }
      } catch (err) {
        console.error("Reviews error:", err);
        if (!isMounted) return;
        setReviews([]);
        setAverageRating(0);
        setReviewCount(0);
        setMyReview(null);
      } finally {
        if (isMounted) {
          setReviewLoading(false);
        }
      }
    };
    fetchReviewData();
    return () => {
      isMounted = false;
    };
  }, [productId]);
  // =====================================================
  // Quantity Handlers
  // =====================================================
  const increaseQuantity = () => {
    setQuantity((prev) =>
      Math.min(
        Number(product?.stock || 1),
        prev + 1
      )
    );
  };
  const decreaseQuantity = () => {
    setQuantity((prev) =>
      Math.max(1, prev - 1)
    );
  };
  // =====================================================
  // Add To Cart
  // =====================================================
  const handleAddToCart = async () => {
    if (!product || adding) return;
    const stock = Number(product.stock || 0);
    if (stock <= 0) return;
    if (quantity > stock) {
      setError(
        `Only ${stock} item${
          stock === 1 ? "" : "s"
        } available.`
      );
      return;
    }
    try {
      setAdding(true);
      setError("");
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product._id,
          quantity,
        }),
      });
      const data = await getJsonResponse(response);
      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to add product to cart."
        );
      }
      dispatch(
        setCart(
          data.cart?.items || []
        )
      );
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 1200);
    } catch (err) {
      console.error("Add to cart error:", err);
      setError(
        err.message ||
          "Failed to add product to cart."
      );
    } finally {
      setAdding(false);
    }
  };
  // =====================================================
  // Submit Review
  // =====================================================
  const handleSubmitReview = async () => {
    setReviewMessage("");
    setReviewMessageType("");
    if (!loggedIn) {
      setReviewMessage(
        "Please login to submit a review."
      );
      setReviewMessageType("error");
      return;
    }
    if (
      reviewRating < 1 ||
      reviewRating > 5
    ) {
      setReviewMessage(
        "Please select a rating."
      );
      setReviewMessageType("error");
      return;
    }
    const cleanComment =
      reviewComment.trim();
    if (!cleanComment) {
      setReviewMessage(
        "Please write your review."
      );
      setReviewMessageType("error");
      return;
    }
    if (cleanComment.length > 2000) {
      setReviewMessage(
        "Review cannot exceed 2000 characters."
      );
      setReviewMessageType("error");
      return;
    }
    try {
      setReviewSubmitting(true);
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
            rating: reviewRating,
            comment: cleanComment,
          }),
        }
      );
      const data =
        await getJsonResponse(response);
      if (
        !response.ok ||
        !data.success
      ) {
        if (
          response.status === 409 &&
          data.review
        ) {
          setMyReview(
            data.review
          );
        }
        throw new Error(
          data.message ||
            "Failed to submit review."
        );
      }
      setReviewMessage(
        data.message ||
          "Your review was submitted successfully and is waiting for admin approval."
      );
      setReviewMessageType(
        "success"
      );
      setMyReview(
        data.review || null
      );
      setReviewRating(0);
      setReviewComment("");
    } catch (err) {
      console.error(
        "Submit review error:",
        err
      );
      setReviewMessage(
        err.message ||
          "Failed to submit review."
      );
      setReviewMessageType(
        "error"
      );
    } finally {
      setReviewSubmitting(false);
    }
  };
  // =====================================================
  // Loading
  // =====================================================
  if (loading) {
    return (
      <main className="dazro-product-details-page">
        <div className="container py-5 text-center">
          <div
            className="spinner-border"
            role="status"
          />
          <p className="mt-3 mb-0 text-muted">
            Loading product...
          </p>
        </div>
      </main>
    );
  }
  // =====================================================
  // Error
  // =====================================================
  if (error && !product) {
    return (
      <main className="dazro-product-details-page">
        <div className="container py-5">
          <div className="alert alert-danger">
            {error}
          </div>
        </div>
      </main>
    );
  }
  if (!product) {
    return (
      <main className="dazro-product-details-page">
        <div className="container py-5">
          <div className="alert alert-danger">
            Product not found.
          </div>
        </div>
      </main>
    );
  }
  // =====================================================
  // Product Data
  // =====================================================
  const images = Array.isArray(product.images)
    ? product.images
    : [];
  const stock = Number(product.stock || 0);
  const isOutOfStock = stock <= 0;
  const canWriteReview =
    loggedIn &&
    (!myReview ||
      String(myReview.status || "").toLowerCase() ===
        "rejected");
  return (
    <main className="dazro-product-details-page">
      <div className="container py-4 py-lg-5">
        {/* Back */}
        <Link
          href="/products"
          className="dazro-product-back"
        >
          ← Back to Products
        </Link>
        {/* =================================================
            Product Details
        ================================================= */}
        <div className="row g-4 g-lg-5 mt-1">
          {/* Images */}
          <div className="col-12 col-lg-6">
            <div className="dazro-details-main-image">
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  decoding="async"
                />
              ) : (
                <span>
                  No Image
                </span>
              )}
            </div>
            {images.length > 1 && (
              <div className="d-flex gap-2 mt-3 flex-wrap">
                {images.map(
                  (image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      className={`dazro-details-thumb ${
                        selectedImage ===
                        image
                          ? "active"
                          : ""
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                        loading="lazy"
                        decoding="async"
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </div>
          {/* Product Information */}
          <div className="col-12 col-lg-6">
            {product.brand && (
              <div className="dazro-details-brand">
                {product.brand}
              </div>
            )}
            <h1 className="dazro-details-title">
              {product.name}
            </h1>
            {product.shortDescription && (
              <p className="dazro-details-short">
                {product.shortDescription}
              </p>
            )}
            {/* Rating */}
            <div className="dazro-product-rating-preview">
              <span className="dazro-rating-stars">
                {averageRating > 0
                  ? "★".repeat(
                      Math.round(
                        averageRating
                      )
                    )
                  : "☆☆☆☆☆"}
              </span>
              <span className="dazro-rating-number">
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "No rating"}
              </span>
              <span className="dazro-rating-count">
                ({reviewCount}{" "}
                {reviewCount === 1
                  ? "review"
                  : "reviews"})
              </span>
            </div>
            <div className="dazro-details-price-row">
              <strong>
                ৳
                {Number(
                  product.price || 0
                ).toLocaleString()}
              </strong>
              {Number(
                product.oldPrice || 0
              ) > 0 && (
                <span>
                  ৳
                  {Number(
                    product.oldPrice
                  ).toLocaleString()}
                </span>
              )}
            </div>
            <div className="dazro-details-stock">
              {isOutOfStock ? (
                <span className="out">
                  Out of stock
                </span>
              ) : (
                <span>
                  {stock} available
                </span>
              )}
            </div>
            <hr className="my-4" />
            {error && (
              <div className="alert alert-danger py-2 mb-3">
                {error}
              </div>
            )}
            {/* Quantity */}
            {!isOutOfStock && (
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="dazro-details-quantity">
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1 ||
                      adding
                    }
                  >
                    −
                  </button>
                  <span>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      quantity >=
                        stock ||
                      adding
                    }
                  >
                    +
                  </button>
                </div>
                <span className="text-muted small">
                  Quantity
                </span>
              </div>
            )}
            {/* Add To Cart */}
            <button
              type="button"
              className="btn dazro-details-cart-btn"
              style={{
                backgroundColor:
                  "#ff9898",
              }}
              onClick={
                handleAddToCart
              }
              disabled={
                isOutOfStock ||
                adding
              }
            >
              {isOutOfStock
                ? "Out of Stock"
                : adding
                ? "Adding..."
                : added
                ? "Added to Cart ✓"
                : "Add to Cart"}
            </button>
            {/* Description */}
            {product.description && (
              <div className="mt-5">
                <h3 className="dazro-description-title">
                  Product Description
                </h3>
                <div
                  className="dazro-product-description"
                  dangerouslySetInnerHTML={{
                    __html:
                      product.description,
                  }}
                />
              </div>
            )}
            {/* Meta */}
            <div className="dazro-details-meta mt-4">
              {product.category?.name && (
                <div>
                  <span>
                    Category
                  </span>
                  <strong>
                    {
                      product.category
                        .name
                    }
                  </strong>
                </div>
              )}
              {product.sku && (
                <div>
                  <span>
                    SKU
                  </span>
                  <strong>
                    {product.sku}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* =================================================
            Reviews
        ================================================= */}
        <section className="dazro-reviews-section">
          <div className="dazro-reviews-header">
            <div>
              <span className="dazro-reviews-label">
                Customer Feedback
              </span>
              <h2 className="dazro-reviews-title">
                Customer Reviews
              </h2>
            </div>
            <div className="dazro-reviews-summary">
              <strong>
                {averageRating > 0
                  ? averageRating.toFixed(1)
                  : "0.0"}
              </strong>
              <div>
                <div className="dazro-review-summary-stars">
                  {averageRating > 0
                    ? "★".repeat(
                        Math.round(
                          averageRating
                        )
                      )
                    : "☆☆☆☆☆"}
                </div>
                <span>
                  {reviewCount}{" "}
                  {reviewCount === 1
                    ? "review"
                    : "reviews"}
                </span>
              </div>
            </div>
          </div>
          {/* =================================================
              Review Form / Status
          ================================================= */}
          {reviewLoading ? (
            <div className="dazro-reviews-loading">
              <div
                className="spinner-border spinner-border-sm"
                role="status"
              />
              <span>
                Loading reviews...
              </span>
            </div>
          ) : canWriteReview ? (
            <div className="dazro-write-review-card">
              <div className="dazro-write-review-heading">
                <h3>
                  {myReview?.status ===
                  "rejected"
                    ? "Submit a New Review"
                    : "Write a Review"}
                </h3>
                <p>
                  Share your experience
                  with this product.
                </p>
              </div>
              {/* Rating */}
              <div className="dazro-review-rating-selector">
                <span>
                  Your Rating
                </span>
                <div className="dazro-review-stars-input">
                  {[1, 2, 3, 4, 5].map(
                    (star) => (
                      <button
                        key={star}
                        type="button"
                        className={
                          star <=
                          reviewRating
                            ? "active"
                            : ""
                        }
                        onClick={() =>
                          setReviewRating(
                            star
                          )
                        }
                        aria-label={`${star} star`}
                      >
                        ★
                      </button>
                    )
                  )}
                </div>
              </div>
              {/* Comment */}
              <textarea
                value={
                  reviewComment
                }
                onChange={(e) =>
                  setReviewComment(
                    e.target.value
                  )
                }
                className="form-control dazro-review-textarea"
                rows="5"
                maxLength={2000}
                placeholder="Tell other customers about your experience..."
              />
              {reviewMessage && (
                <div
                  className={`dazro-review-message ${
                    reviewMessageType ===
                    "success"
                      ? "success"
                      : "error"
                  }`}
                >
                  {reviewMessage}
                </div>
              )}
              <button
                type="button"
                className="btn dazro-review-submit-btn"
                onClick={
                  handleSubmitReview
                }
                disabled={
                  reviewSubmitting
                }
              >
                {reviewSubmitting
                  ? "Submitting..."
                  : "Submit Review"}
              </button>
            </div>
          ) : myReview ? (
            <div className="dazro-review-pending-box">
              <strong>
                Review submitted
              </strong>
              <p className="mb-0">
                {myReview.status ===
                "approved"
                  ? "Your review has been approved."
                  : "Your review is waiting for admin approval."}
              </p>
            </div>
          ) : (
            <div className="dazro-review-pending-box">
              <strong>
                Login to write a review
              </strong>
              <p className="mb-2">
                Please login to share your
                experience with this product.
              </p>
              <Link
                href="/login"
                className="btn dazro-review-submit-btn mt-2"
              >
                Login
              </Link>
            </div>
          )}
          {/* =================================================
              Existing Approved Reviews
          ================================================= */}
          {!reviewLoading &&
            (reviews.length > 0 ? (
              <div className="dazro-reviews-list">
                {reviews
                  .slice(0, visibleReviewCount)
                  .map((review) => {
                    const customerName =
                      review.customer?.name ||
                      review.user?.name ||
                      "Customer";
                    const rating = Math.min(
                      5,
                      Math.max(
                        0,
                        Number(
                          review.rating || 0
                        )
                      )
                    );
                    return (
                      <article
                        key={
                          review._id
                        }
                        className="dazro-review-card"
                      >
                        <div className="dazro-review-card-top">
                          <div className="dazro-review-avatar">
                            {customerName
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h4>
                              {
                                customerName
                              }
                            </h4>
                            <div className="dazro-review-stars">
                              <span>
                                {"★".repeat(
                                  rating
                                )}
                              </span>
                              <span
                                style={{
                                  color:
                                    "#ddd",
                                }}
                              >
                                {"★".repeat(
                                  5 -
                                    rating
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p>
                          {review.comment}
                        </p>
                        <small>
                          {review.createdAt
                            ? new Date(
                                review.createdAt
                              ).toLocaleDateString(
                                "en-BD",
                                {
                                  day: "2-digit",
                                  month:
                                    "short",
                                  year:
                                    "numeric",
                                }
                              )
                            : ""}
                        </small>
                      </article>
                    );
                  }
                )}
                {visibleReviewCount < reviews.length && (
                  <div className="text-center mt-4">
                    <button
                      type="button"
                      className="btn dazro-load-more-reviews"
                      onClick={() =>
                        setVisibleReviewCount(
                          (prev) => prev + 5
                        )
                      }
                    >
                      Load More Reviews
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="dazro-no-reviews">
                <div className="dazro-no-reviews-icon">
                  ★
                </div>
                <h3>
                  No reviews yet
                </h3>
                <p>
                  Be the first customer
                  to review this product.
                </p>
              </div>
            ))}
        </section>
        {/* =================================================
            Related Products
        ================================================= */}
        {relatedProducts.length > 0 && (
          <section className="dazro-related-products-section">
            <div className="dazro-related-products-header">
              <div>
                <span className="dazro-related-products-label">
                  You may also like
                </span>
                <h2 className="dazro-related-products-title">
                  Related Products
                </h2>
                <p className="dazro-related-products-subtitle">
                  More products from the same category.
                </p>
              </div>
            </div>
            <div className="row g-4">
              {relatedProducts.map(
                (item) => {
                  const image =
                    item.images?.[0] ||
                    "";
                  const itemStock =
                    Number(
                      item.stock || 0
                    );
                  const itemOutOfStock =
                    itemStock <= 0;
                  const relatedReview =
                    relatedReviewSummaries[item._id] || {
                      averageRating: 0,
                      reviewCount: 0,
                    };
                  const itemAverageRating = Number(
                    relatedReview.averageRating || 0
                  );
                  const itemReviewCount = Number(
                    relatedReview.reviewCount || 0
                  );
                  return (
                    <div
                      key={
                        item._id
                      }
                      className="col-12 col-sm-6 col-lg-3"
                    >
                      <div className="dazro-product-card">
                        <Link
                          href={`/products/${item._id}`}
                          className="text-decoration-none"
                        >
                          <div className="dazro-product-image-wrap">
                            {image ? (
                              <>
                                <img
                                  src={image}
                                  alt={item.name}
                                  className="dazro-product-image"
                                  loading="lazy"
                                  decoding="async"
                                />
                                <span className="dazro-product-shine" />
                              </>
                            ) : (
                              <div className="dazro-product-no-image">
                                No Image
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="p-3">
                          {item.brand && (
                            <small className="dazro-product-brand">
                              {item.brand}
                            </small>
                          )}
                          {itemReviewCount > 0 && (
                            <div className="dazro-product-review-summary">
                              <span className="dazro-product-review-stars">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    className={
                                      star <= Math.round(itemAverageRating)
                                        ? "active"
                                        : ""
                                    }
                                  >
                                    ★
                                  </span>
                                ))}
                              </span>
                              <span className="dazro-product-review-rating">
                                {itemAverageRating.toFixed(1)}
                              </span>
                              <span className="dazro-product-review-count">
                                ({itemReviewCount})
                              </span>
                            </div>
                          )}
                          <Link
                            href={`/products/${item._id}`}
                            className="text-decoration-none"
                          >
                            <h3 className="dazro-product-name">
                              {item.name}
                            </h3>
                          </Link>
                          <div className="dazro-product-price">
                            ৳
                            {Number(
                              item.price || 0
                            ).toLocaleString()}
                          </div>
                          {Number(
                            item.oldPrice || 0
                          ) > 0 && (
                            <div className="dazro-product-old-price">
                              ৳
                              {Number(
                                item.oldPrice
                              ).toLocaleString()}
                            </div>
                          )}
                          {itemOutOfStock ? (
                            <div className="dazro-product-stock-out">
                              Out of stock
                            </div>
                          ) : (
                            <div className="dazro-product-stock">
                              {itemStock} available
                            </div>
                          )}
                          <Link
                            href={`/products/${item._id}`}
                            className="btn dazro-related-view-btn"
                          >
                            View Product
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
export default ProductDetails;