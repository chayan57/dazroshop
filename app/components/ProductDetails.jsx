"use client";

import React, {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useDispatch } from "react-redux";

import { setCart } from "./store/cartSlice";

const PRODUCTS_CACHE_KEY =
  "dazro_products_cache";

function ProductDetails() {
  const params = useParams();
  const dispatch = useDispatch();

  const [product, setProduct] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [quantity, setQuantity] =
    useState(1);

  const [selectedImage, setSelectedImage] =
    useState("");

  const [added, setAdded] =
    useState(false);

  const [adding, setAdding] =
    useState(false);

  const [relatedProducts, setRelatedProducts] =
    useState([]);

  // =========================
  // Fetch Product
  // =========================

  useEffect(() => {
    if (!params?.id) return;

    const controller =
      new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `/api/products?id=${params.id}`,
            {
              cache: "force-cache",
              signal:
                controller.signal,
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
              "Failed to fetch product."
          );
        }

        const currentProduct =
          data.product;

        setProduct(
          currentProduct
        );

        setSelectedImage(
          currentProduct?.images?.[0] ||
            ""
        );
      } catch (error) {
        if (
          error.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "Product details error:",
          error
        );

        setError(
          error.message ||
            "Failed to load product."
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      controller.abort();
    };
  }, [params?.id]);

  // =========================
  // Fetch Related Products
  // =========================

  useEffect(() => {
    if (!product?._id) {
      return;
    }

    const findRelatedProducts =
      async () => {
        try {
          const currentProductId =
            String(product._id);

          const currentCategoryId =
            product.category?._id ||
            product.category ||
            "";

          const categoryId =
            String(
              currentCategoryId
            );

          // =================================================
          // First Try Session Cache
          // =================================================

          let allProducts = [];

          try {
            const cached =
              sessionStorage.getItem(
                PRODUCTS_CACHE_KEY
              );

            if (cached) {
              const parsed =
                JSON.parse(cached);

              if (
                Array.isArray(
                  parsed?.products
                )
              ) {
                allProducts =
                  parsed.products;
              }
            }
          } catch (cacheError) {
            console.error(
              "Related product cache error:",
              cacheError
            );
          }

          // =================================================
          // Fallback API Fetch
          // =================================================

          if (
            allProducts.length === 0
          ) {
            const response =
              await fetch(
                "/api/products",
                {
                  cache:
                    "force-cache",
                }
              );

            const data =
              await response.json();

            if (
              response.ok &&
              data.success &&
              Array.isArray(
                data.products
              )
            ) {
              allProducts =
                data.products;
            }
          }

          // =================================================
          // Filter Same Category
          // =================================================

          const related =
            allProducts.filter(
              (item) => {
                const itemId =
                  String(
                    item._id
                  );

                if (
                  itemId ===
                  currentProductId
                ) {
                  return false;
                }

                const itemCategoryId =
                  item.category?._id ||
                  item.category ||
                  "";

                return (
                  String(
                    itemCategoryId
                  ) === categoryId
                );
              }
            );

          // =================================================
          // Maximum 4
          // =================================================

          setRelatedProducts(
            related.slice(0, 4)
          );
        } catch (error) {
          console.error(
            "Related products error:",
            error
          );

          setRelatedProducts([]);
        }
      };

    findRelatedProducts();
  }, [product]);

  // =========================
  // Increase Quantity
  // =========================

  const increaseQuantity = () => {
    setQuantity((prev) =>
      Math.min(
        Number(
          product?.stock || 1
        ),
        prev + 1
      )
    );
  };

  // =========================
  // Decrease Quantity
  // =========================

  const decreaseQuantity = () => {
    setQuantity((prev) =>
      Math.max(
        1,
        prev - 1
      )
    );
  };

  // =========================
  // Add To Cart
  // =========================

  const handleAddToCart =
    async () => {
      if (!product || adding) {
        return;
      }

      const stock =
        Number(
          product.stock || 0
        );

      if (stock <= 0) {
        return;
      }

      try {
        setAdding(true);
        setError("");

        const response =
          await fetch(
            "/api/cart",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                productId:
                  product._id,

                quantity,
              }),
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
              "Failed to add product to cart."
          );
        }

        // =================================================
        // Update Redux with MongoDB Cart
        // =================================================

        dispatch(
          setCart(
            data.cart?.items ||
              []
          )
        );

        setAdded(true);

        setTimeout(() => {
          setAdded(false);
        }, 1200);
      } catch (error) {
        console.error(
          "Add to cart error:",
          error
        );

        setError(
          error.message ||
            "Failed to add product to cart."
        );
      } finally {
        setAdding(false);
      }
    };

  // =========================
  // Loading
  // =========================

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

  // =========================
  // Error
  // =========================

  if (
    error &&
    !product
  ) {
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

  // =========================
  // Product Images
  // =========================

  const images =
    Array.isArray(
      product.images
    ) &&
    product.images.length > 0
      ? product.images
      : [];

  // =========================
  // Stock
  // =========================

  const stock =
    Number(
      product.stock || 0
    );

  const isOutOfStock =
    stock <= 0;

  return (
    <main className="dazro-product-details-page">

      <div className="container py-4 py-lg-5">

        {/* =========================
            Back
        ========================= */}

        <Link
          href="/products"
          className="dazro-product-back"
        >
          ← Back to Products
        </Link>

        {/* =========================
            Product Details
        ========================= */}

        <div className="row g-4 g-lg-5 mt-1">

          {/* =========================
              Product Images
          ========================= */}

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

          {/* =========================
              Product Information
          ========================= */}

          <div className="col-12 col-lg-6">

            {/* Brand */}

            {product.brand && (
              <div className="dazro-details-brand">
                {product.brand}
              </div>
            )}

            {/* Name */}

            <h1 className="dazro-details-title">
              {product.name}
            </h1>

            {/* Short Description */}

            {product.shortDescription && (
              <p className="dazro-details-short">
                {
                  product.shortDescription
                }
              </p>
            )}

            {/* Price */}

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

            {/* Stock */}

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

            {/* =========================
                Error
            ========================= */}

            {error && (
              <div className="alert alert-danger py-2 mb-3">
                {error}
              </div>
            )}

            {/* =========================
                Quantity
            ========================= */}

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

            {/* =========================
                Add To Cart
            ========================= */}

            <button
              type="button"
              className="btn dazro-details-cart-btn"
              style={{backgroundColor:"#ff9898"}}
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

            {/* =========================
                Description
            ========================= */}

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

            {/* =========================
                Meta
            ========================= */}

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

                  return (
                    <div
                      key={item._id}
                      className="col-12 col-sm-6 col-lg-3"
                    >
                      <div className="dazro-product-card">

                        {/* Image */}

                        <Link
                          href={`/products/${item._id}`}
                          className="text-decoration-none"
                        >
                          <div className="dazro-product-image-wrap">

                            {image ? (
                              <>
                                <img
                                  src={
                                    image
                                  }
                                  alt={
                                    item.name
                                  }
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

                        {/* Info */}

                        <div className="p-3">

                          {item.brand && (
                            <small className="dazro-product-brand">
                              {
                                item.brand
                              }
                            </small>
                          )}

                          <Link
                            href={`/products/${item._id}`}
                            className="text-decoration-none"
                          >
                            <h3 className="dazro-product-name">
                              {
                                item.name
                              }
                            </h3>
                          </Link>

                          <div className="dazro-product-price">
                            ৳
                            {Number(
                              item.price ||
                                0
                            ).toLocaleString()}
                          </div>

                          {Number(
                            item.oldPrice ||
                              0
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
                              {
                                itemStock
                              }{" "}
                              available
                            </div>
                          )}

                          <Link
                            href={`/products/${item._id}`}
                            className="btn dazro-related-view-btn"
                          >
                            View Product
                            <span>
                              →
                            </span>
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