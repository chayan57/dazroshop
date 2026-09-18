import Image from "next/image";
import Link from "next/link";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";

function FeaturedProducts() {
  const products = [
    {
      id: 1,
      name: "Digital Watch for Men",
      image:
        "https://cdn.dummyjson.com/product-images/mens-watches/brown-leather-belt-watch/1.webp",
      price: 1290,
      oldPrice: 1590,
      slug: "digital-watch-for-men",
    },
    {
      id: 2,
      name: "Wireless Bluetooth Earbuds",
      image:
        "https://cdn.dummyjson.com/product-images/mens-watches/longines-master-collection/1.webp",
      price: 1490,
      oldPrice: 1890,
      slug: "wireless-bluetooth-earbuds",
    },
    {
      id: 3,
      name: "Smart Lifestyle Gadget",
      image:
        "https://cdn.dummyjson.com/product-images/mens-watches/rolex-cellini-date-black-dial/1.webp",
      price: 990,
      oldPrice: 1290,
      slug: "smart-lifestyle-gadget",
    },
    {
      id: 4,
      name: "Premium Everyday Product",
      image:
        "https://cdn.dummyjson.com/product-images/mens-watches/rolex-datejust/1.webp",
      price: 1190,
      oldPrice: 1490,
      slug: "premium-everyday-product",
    },
  ];

  return (
    <section
      className="py-5"
      style={{ backgroundColor: "#FFF2F8" }}
    >
      <div className="container">
        {/* Section Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <p
              className="fw-semibold mb-1"
              style={{ color: "#D21165" }}
            >
              Featured Products
            </p>

            <h2 className="fw-bold mb-2">
              Our Popular Products
            </h2>

            <p className="text-muted mb-0">
              Discover products customers love.
            </p>
          </div>

          <Link
            href="/products"
            className="fw-semibold text-decoration-none mt-3 mt-md-0"
            style={{ color: "#D21165" }}
          >
            View All Products →
          </Link>
        </div>

        {/* Products */}
        <div className="row g-4">
          {products.map((product) => (
            <div
              className="col-12 col-sm-6 col-lg-3"
              key={product.id}
            >
              <article className="product-card bg-white rounded-4 overflow-hidden h-100">
                {/* Product Image */}
                <Link
                  href={`/products/${product.slug}`}
                  className="text-decoration-none"
                >
                  <div
                    className="product-image-wrapper position-relative overflow-hidden"
                    style={{
                      height: "250px",
                      backgroundColor: "#FFF2F8",
                    }}
                  >
                    <Image
                      src={product.image}
                      alt={`${product.name} - DazroShop`}
                      fill
                      sizes="(max-width: 575px) 100vw, (max-width: 991px) 50vw, 25vw"
                      style={{
                        objectFit: "cover",
                      }}
                    />

                    {/* Shine Effect */}
                    <span className="shine-effect"></span>
                  </div>

                  {/* Product Info */}
                  <div className="p-3">
                    <h3
                      className="fw-semibold text-dark mb-2"
                      style={{
                        fontSize: "16px",
                        lineHeight: "1.5",
                      }}
                    >
                      {product.name}
                    </h3>

                    <div className="d-flex align-items-center gap-2">
                      <span
                        className="fw-bold"
                        style={{
                          color: "#D21165",
                          fontSize: "18px",
                        }}
                      >
                        ৳{product.price}
                      </span>

                      <span
                        className="text-muted text-decoration-line-through"
                        style={{ fontSize: "13px" }}
                      >
                        ৳{product.oldPrice}
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Add to Cart */}
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    className="btn w-100 fw-semibold d-flex align-items-center justify-content-center gap-2 addtoCartButton"
                    style={{
                      backgroundColor: "#D21165",
                      color: "#FFFFFF",
                      borderRadius: "8px",
                      border: "none",
                    }}
                  >
                    <ShoppingCartOutlinedIcon fontSize="small" />
                    Add to Cart
                  </button>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default FeaturedProducts;