"use client";
 
import React, { useEffect, useState, useCallback, useRef } from "react"; 
import Link from "next/link"; 
import Image from "next/image"; 
import { useDispatch } from "react-redux"; 
import { setCart } from "./store/cartSlice"; 
 
function Products() { 
  const dispatch = useDispatch(); 
 
  const [products, setProducts] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(""); 
  const [addingId, setAddingId] = useState(null); 
  const [reviewSummaries, setReviewSummaries] = useState({});
 
  // Use a ref to track adding state reliably without triggering re-renders or stale closures 
  const isAddingRef = useRef(false); 
 
  // ===================================================== 
  // Fetch Products 
  // ===================================================== 
  useEffect(() => { 
    const controller = new AbortController(); 
 
    const fetchProducts = async () => { 
      try { 
        setLoading(true); 
        setError(""); 
 
        const response = await fetch("/api/products", { 
          method: "GET", 
          signal: controller.signal, 
          cache: "no-store", 
        }); 
 
        const data = await response.json(); 
 
        if (!response.ok || !data.success) { 
          throw new Error( 
            data.message || "Failed to fetch products." 
          ); 
        } 
 
        const productList = Array.isArray(data.products) 
          ? data.products 
          : []; 
 
        setProducts(productList); 
      } catch (err) { 
        if (err.name === "AbortError") { 
          return; 
        } 
 
        console.error("Products error:", err); 
        setError( 
          err.message || "Failed to load products." 
        ); 
      } finally { 
        if (!controller.signal.aborted) { 
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
  // Fetch Product Review Summaries
  // =====================================================
  useEffect(() => {
    if (products.length === 0) {
      setReviewSummaries({});
      return;
    }

    const controller = new AbortController();

    const fetchReviewSummaries = async () => {
      try {
        const results = await Promise.all(
          products.map(async (product) => {
            try {
              const response = await fetch(
                `/api/reviews?productId=${encodeURIComponent(product._id)}`,
                {
                  method: "GET",
                  signal: controller.signal,
                  cache: "no-store",
                }
              );

              const data = await response.json();

              if (!response.ok || !data.success) {
                return {
                  productId: product._id,
                  averageRating: 0,
                  reviewCount: 0,
                };
              }

              return {
                productId: product._id,
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
                `Review summary error for product ${product._id}:`,
                err
              );

              return {
                productId: product._id,
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

        setReviewSummaries(summaryMap);
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }

        console.error("Review summaries error:", err);
      }
    };

    fetchReviewSummaries();

    return () => {
      controller.abort();
    };
  }, [products]);
 
  // ===================================================== 
  // Add To Cart 
  // ===================================================== 
  const handleAddToCart = useCallback( 
    async (product) => { 
      const stock = Number(product.stock || 0); 
 
      if (stock <= 0) return; 
 
      // Prevent concurrent/duplicate add requests 
      if (isAddingRef.current) return; 
 
      try { 
        isAddingRef.current = true; 
        setAddingId(product._id); 
        setError(""); 
 
        const response = await fetch("/api/cart", { 
          method: "POST", 
          headers: { 
            "Content-Type": "application/json", 
          }, 
          body: JSON.stringify({ 
            productId: product._id, 
            quantity: 1, 
          }), 
        }); 
 
        const data = await response.json(); 
 
        if (!response.ok || !data.success) { 
          throw new Error( 
            data.message || "Failed to add product to cart." 
          ); 
        } 
 
        // Sync Redux with MongoDB cart 
        dispatch(setCart(data.cart?.items || [])); 
      } catch (err) { 
        console.error("Add to cart error:", err); 
        setError( 
          err.message || "Failed to add product to cart." 
        ); 
      } finally { 
        isAddingRef.current = false; 
        setAddingId(null); 
      } 
    }, 
    [dispatch] 
  ); 
 
  // ===================================================== 
  // Loading State 
  // ===================================================== 
  if (loading && products.length === 0) { 
    return ( 
      <main className="dazro-products-page"> 
        <div className="container py-5 text-center"> 
          <div className="spinner-border" role="status" /> 
          <p className="mt-3 mb-0 text-muted"> 
            Loading products... 
          </p> 
        </div> 
      </main> 
    ); 
  } 
 
  // ===================================================== 
  // Render Products 
  // ===================================================== 
  return ( 
    <main className="dazro-products-page"> 
      <div className="container py-5"> 
        <div className="mb-4"> 
          <h1 className="dazro-products-title"> 
            Our Products 
          </h1> 
          <p className="dazro-products-subtitle"> 
            Discover our latest products. 
          </p> 
        </div> 
 
        {error && ( 
          <div className="alert alert-danger">{error}</div> 
        )} 
 
        {!error && products.length === 0 && ( 
          <div className="text-center py-5"> 
            <h5>No products available.</h5> 
          </div> 
        )} 
 
        <div className="row g-4"> 
          {products.map((product, index) => ( 
            <ProductCard 
              key={product._id} 
              product={product} 
              index={index} 
              isAdding={addingId === product._id} 
              onAddToCart={handleAddToCart}
              reviewSummary={
                reviewSummaries[product._id] || {
                  averageRating: 0,
                  reviewCount: 0,
                }
              }
            /> 
          ))} 
        </div> 
      </div> 
    </main> 
  ); 
} 
 
// ===================================================== 
// Isolated & Memoized Product Card Component 
// ===================================================== 
const ProductCard = React.memo( 
  ({ product, index, isAdding, onAddToCart, reviewSummary }) => { 
    const image = product.images?.[0] || ""; 
    const stock = Number(product.stock || 0); 
    const outOfStock = stock <= 0;
    const averageRating = Number(reviewSummary?.averageRating || 0);
    const reviewCount = Number(reviewSummary?.reviewCount || 0);
 
    return ( 
      <div className="col-12 col-sm-6 col-lg-4 col-xl-3"> 
        <div className="dazro-product-card"> 
          {/* Product Image */} 
          <Link 
            href={`/products/${product._id}`} 
            className="text-decoration-none" 
          > 
            <div className="dazro-product-image-wrap"> 
              {image ? ( 
                <> 
                  <Image 
                    src={image} 
                    alt={product.name} 
                    className="dazro-product-image" 
                    width={400} 
                    height={400} 
                    priority={index < 4} 
                  /> 
                  <span className="dazro-product-shine"></span> 
                </> 
              ) : ( 
                <div className="dazro-product-no-image"> 
                  No Image 
                </div> 
              )} 
            </div> 
          </Link> 
 
          {/* Product Info */} 
          <div className="p-3"> 
            {product.brand && ( 
              <small className="dazro-product-brand"> 
                {product.brand} 
              </small> 
            )}

            {/* Reviews */}
            {reviewCount > 0 && (
              <div className="dazro-product-review-summary">
                <span
                  className="dazro-product-review-stars"
                  aria-label={`${averageRating.toFixed(1)} out of 5 stars from ${reviewCount} reviews`}
                >
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= Math.round(averageRating)
                          ? "active"
                          : ""
                      }
                      aria-hidden="true"
                    >
                      ★
                    </span>
                  ))}
                </span>

                <span className="dazro-product-review-rating">
                  {averageRating.toFixed(1)}
                </span>

                <span className="dazro-product-review-count">
                  ({reviewCount})
                </span>
              </div>
            )}
 
            <Link 
              href={`/products/${product._id}`} 
              className="text-decoration-none" 
            > 
              <h3 className="dazro-product-name"> 
                {product.name} 
              </h3> 
            </Link> 
 
            <div className="dazro-product-price"> 
              ৳ {Number(product.price || 0).toLocaleString()} 
            </div> 
 
            {Number(product.oldPrice || 0) > 0 && ( 
              <div className="dazro-product-old-price"> 
                ৳ {Number(product.oldPrice).toLocaleString()} 
              </div> 
            )} 
 
            {/* Stock */} 
            {outOfStock ? ( 
              <div className="dazro-product-stock-out"> 
                Out of stock 
              </div> 
            ) : ( 
              <div className="dazro-product-stock"> 
                {stock} available 
              </div> 
            )} 
 
            {/* Add To Cart Button */} 
            <button 
              type="button" 
              className="btn dazro-add-cart-btn" 
              onClick={() => onAddToCart(product)} 
              disabled={outOfStock || isAdding} 
            > 
              {outOfStock ? ( 
                "Out of Stock" 
              ) : isAdding ? ( 
                <> 
                  <span 
                    className="spinner-border spinner-border-sm me-1" 
                    role="status" 
                    aria-hidden="true" 
                  /> 
                  <span>Adding...</span> 
                </> 
              ) : ( 
                <> 
                  <span>Add to Cart</span> 
                  <span className="dazro-cart-arrow">→</span> 
                </> 
              )} 
            </button> 
          </div> 
        </div> 
      </div> 
    ); 
  } 
); 
 
ProductCard.displayName = "ProductCard"; 
 
export default Products;