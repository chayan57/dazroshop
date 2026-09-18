import Link from "next/link";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

function CTA() {
  return (
    <section
      className="py-5"
      style={{ backgroundColor: "#FFF2F8" }}
    >
      <div className="container">
        <div
          className="rounded-4 text-center px-4 py-5"
          style={{
            backgroundColor: "#D21165",
            boxShadow: "0 15px 40px rgba(210, 17, 101, 0.18)",
          }}
        >
          <div
            className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
            style={{
              width: "60px",
              height: "60px",
              backgroundColor: "#FFF2F8",
              color: "#D21165",
            }}
          >
            <ShoppingBagOutlinedIcon sx={{ fontSize: 30 }} />
          </div>

          <p
            className="fw-semibold mb-2"
            style={{
              color: "#FFD6E7",
              fontSize: "14px",
            }}
          >
            START SHOPPING
          </p>

          <h2
            className="fw-bold text-white mb-3"
            style={{
              fontSize: "clamp(28px, 4vw, 42px)",
              lineHeight: "1.2",
            }}
          >
            Find Something You’ll Love
          </h2>

          <p
            className="text-white mx-auto mb-4"
            style={{
              maxWidth: "600px",
              fontSize: "16px",
              lineHeight: "1.7",
            }}
          >
            Explore our products and discover quality items for your
            everyday needs.
          </p>

          <Link
            href="/products"
            className="btn fw-semibold px-4 py-3"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#D21165",
              borderRadius: "10px",
              border: "none",
            }}
          >
            Explore Products
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CTA;