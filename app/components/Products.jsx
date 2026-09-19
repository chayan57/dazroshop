"use client";

import React, {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { useDispatch } from "react-redux";

import {
  setCart,
} from "./store/cartSlice";

const PRODUCTS_CACHE_KEY =
  "dazro_products_cache";

const PRODUCTS_CACHE_TIME =
  5 * 60 * 1000; // 5 minutes

function Products() {
  const dispatch = useDispatch();

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [addingId, setAddingId] =
    useState(null);

  // =====================================================
  // Load Cached Products First
  // =====================================================

  useEffect(() => {
    try {
      const cached =
        sessionStorage.getItem(
          PRODUCTS_CACHE_KEY
        );

      if (!cached) {
        return;
      }

      const parsed =
        JSON.parse(cached);

      if (
        !parsed?.products ||
        !Array.isArray(parsed.products)
      ) {
        return;
      }

      setProducts(
        parsed.products
      );

      setLoading(false);
    } catch (error) {
      console.error(
        "Product cache error:",
        error
      );
    }
  }, []);

  // =====================================================
  // Fetch Products
  // =====================================================

  useEffect(() => {
    const controller =
      new AbortController();

    const fetchProducts =
      async () => {
        try {
          setError("");

          const response =
            await fetch(
              "/api/products",
              {
                method: "GET",
                signal:
                  controller.signal,

                // Browser can reuse
                // existing response cache.
                cache: "force-cache",
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
                "Failed to fetch products."
            );
          }

          const productList =
            Array.isArray(
              data.products
            )
              ? data.products
              : [];

          setProducts(
            productList
          );

          // =================================================
          // Save Products To Session Cache
          // =================================================

          try {
            sessionStorage.setItem(
              PRODUCTS_CACHE_KEY,
              JSON.stringify({
                products:
                  productList,
                cachedAt:
                  Date.now(),
              })
            );
          } catch (cacheError) {
            console.error(
              "Product session cache error:",
              cacheError
            );
          }

        } catch (error) {
          // Ignore abort error
          if (
            error.name ===
            "AbortError"
          ) {
            return;
          }

          console.error(
            "Products error:",
            error
          );

          // Don't remove cached products
          // if API temporarily fails.
          if (
            products.length === 0
          ) {
            setError(
              error.message ||
                "Failed to load products."
            );
          }
        } finally {
          if (
            !controller.signal
              .aborted
          ) {
            setLoading(false);
          }
        }
      };

    fetchProducts();

    return () => {
      controller.abort();
    };
  }, []);

  // =====================================================
  // Add To Cart
  // =====================================================

  const handleAddToCart =
    async (product) => {
      if (
        addingId ===
        product._id
      ) {
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
        setAddingId(
          product._id
        );

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

                quantity: 1,
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
        // Sync Redux With MongoDB Cart
        // =================================================

        dispatch(
          setCart(
            data.cart?.items ||
              []
          )
        );
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
        setTimeout(() => {
          setAddingId(
            null
          );
        }, 500);
      }
    };

  // =====================================================
  // Loading
  // =====================================================

  if (
    loading &&
    products.length === 0
  ) {
    return (
      <main className="dazro-products-page">
        <div className="container py-5 text-center">

          <div
            className="spinner-border"
            role="status"
          />

          <p className="mt-3 mb-0 text-muted">
            Loading products...
          </p>

        </div>
      </main>
    );
  }

  // =====================================================
  // Products
  // =====================================================

  return (
    <main className="dazro-products-page">
      <div className="container py-5">

        {/* =========================
            Header
        ========================= */}

        <div className="mb-4">
          <h1 className="dazro-products-title">
            Our Products
          </h1>

          <p className="dazro-products-subtitle">
            Discover our latest products.
          </p>
        </div>

        {/* =========================
            Error
        ========================= */}

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        {/* =========================
            Empty Products
        ========================= */}

        {!error &&
          products.length === 0 && (
            <div className="text-center py-5">
              <h5>
                No products available.
              </h5>
            </div>
          )}

        {/* =========================
            Products Grid
        ========================= */}

        <div className="row g-4">
          {products.map(
            (product, index) => {
              const image =
                product.images?.[0] ||
                "";

              const stock =
                Number(
                  product.stock ||
                    0
                );

              const outOfStock =
                stock <= 0;

              const isAdding =
                addingId ===
                product._id;

              return (
                <div
                  className="col-12 col-sm-6 col-lg-4 col-xl-3"
                  key={
                    product._id
                  }
                >
                  <div className="dazro-product-card">

                    {/* =========================
                        Product Image
                    ========================= */}

                    <Link
                      href={`/products/${product._id}`}
                      className="text-decoration-none"
                    >
                      <div className="dazro-product-image-wrap">

                        {image ? (
                          <>
                            <img
                              src={image}
                              alt={
                                product.name
                              }
                              className="dazro-product-image"
                              loading={
                                index < 4
                                  ? "eager"
                                  : "lazy"
                              }
                              decoding="async"
                            />

                            {/* Shine */}
                            <span className="dazro-product-shine"></span>
                          </>
                        ) : (
                          <div className="dazro-product-no-image">
                            No Image
                          </div>
                        )}

                      </div>
                    </Link>

                    {/* =========================
                        Product Info
                    ========================= */}

                    <div className="p-3">

                      {/* Brand */}

                      {product.brand && (
                        <small className="dazro-product-brand">
                          {
                            product.brand
                          }
                        </small>
                      )}

                      {/* Product Name */}

                      <Link
                        href={`/products/${product._id}`}
                        className="text-decoration-none"
                      >
                        <h3 className="dazro-product-name">
                          {
                            product.name
                          }
                        </h3>
                      </Link>

                      {/* Price */}

                      <div className="dazro-product-price">
                        ৳
                        {Number(
                          product.price ||
                            0
                        ).toLocaleString()}
                      </div>

                      {/* Old Price */}

                      {Number(
                        product.oldPrice ||
                          0
                      ) > 0 && (
                        <div className="dazro-product-old-price">
                          ৳
                          {Number(
                            product.oldPrice
                          ).toLocaleString()}
                        </div>
                      )}

                      {/* Stock */}

                      {outOfStock ? (
                        <div className="dazro-product-stock-out">
                          Out of stock
                        </div>
                      ) : (
                        <div className="dazro-product-stock">
                          {
                            stock
                          }{" "}
                          available
                        </div>
                      )}

                      {/* Add To Cart */}

                      <button
                        type="button"
                        className="btn dazro-add-cart-btn"
                        onClick={() =>
                          handleAddToCart(
                            product
                          )
                        }
                        disabled={
                          outOfStock ||
                          isAdding
                        }
                      >
                        {outOfStock ? (
                          "Out of Stock"
                        ) : isAdding ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm"
                              role="status"
                              aria-hidden="true"
                            />

                            <span>
                              Adding...
                            </span>
                          </>
                        ) : (
                          <>
                            <span>
                              Add to Cart
                            </span>

                            <span className="dazro-cart-arrow">
                              →
                            </span>
                          </>
                        )}
                      </button>

                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>
    </main>
  );
}

export default Products;