import Link from "next/link";
import Image from "next/image";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";

function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "#D21165",
        color: "#FFFFFF",
      }}
    >
      <div className="container py-5">
        <div className="row g-4">
          
          {/* Brand */}
          <div className="col-12 col-md-6 col-lg-4">
            <Link href="/" className="d-inline-block mb-3">
              <Image
                src="/logo.png"
                alt="DazroShop"
                width={55}
                height={45}
                priority={false}
              />
            </Link>

            <h2 className="h5 fw-bold mb-3">
              DazroShop
            </h2>

            <p
              className="mb-0"
              style={{
                color: "#FFD6E7",
                fontSize: "14px",
                lineHeight: "1.7",
                maxWidth: "360px",
              }}
            >
              Discover quality products and enjoy a simple online
              shopping experience with DazroShop.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-3 col-lg-2">
            <h2 className="h6 fw-bold mb-3">
              Quick Links
            </h2>

            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link
                  href="/"
                  className="text-decoration-none footer-link"
                >
                  Home
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  href="/products"
                  className="text-decoration-none footer-link"
                >
                  Products
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  href="/cart"
                  className="text-decoration-none footer-link"
                >
                  Cart
                </Link>
              </li>

              <li>
                <Link
                  href="/login"
                  className="text-decoration-none footer-link"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="col-6 col-md-3 col-lg-3">
            <h2 className="h6 fw-bold mb-3">
              Customer Support
            </h2>

            <ul className="list-unstyled mb-0">
              <li className="mb-2">
                <Link
                  href="/contact"
                  className="text-decoration-none footer-link"
                >
                  Contact Us
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  href="/shipping-policy"
                  className="text-decoration-none footer-link"
                >
                  Shipping Policy
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  href="/return-policy"
                  className="text-decoration-none footer-link"
                >
                  Return Policy
                </Link>
              </li>

              <li>
                <Link
                  href="/privacy-policy"
                  className="text-decoration-none footer-link"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="col-12 col-lg-3">
            <h2 className="h6 fw-bold mb-3">
              Follow Us
            </h2>

            <div className="d-flex gap-2">
              <a
                href="#"
                aria-label="DazroShop Facebook"
                className="social-link"
              >
                <FacebookIcon />
              </a>

              <a
                href="#"
                aria-label="DazroShop Instagram"
                className="social-link"
              >
                <InstagramIcon />
              </a>

              <a
                href="#"
                aria-label="DazroShop WhatsApp"
                className="social-link"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>
        </div>

        <hr
          className="my-4"
          style={{
            borderColor: "rgba(255,255,255,0.25)",
          }}
        />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <p
            className="mb-0"
            style={{
              color: "#FFD6E7",
              fontSize: "13px",
            }}
          >
            © {new Date().getFullYear()} DazroShop. All rights reserved.
          </p>

          <p
            className="mb-0"
            style={{
              color: "#FFD6E7",
              fontSize: "13px",
            }}
          >
            Online Shopping in Bangladesh
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;