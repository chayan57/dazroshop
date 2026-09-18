import Image from "next/image";
import Link from "next/link";
import Features from "../components/Features";
import Categories from "../components/Categories";
import FeaturedProducts from "../components/FeaturedProducts";
import SpecialOffer from "../components/SpecialOffer";
import WhyChoose from "../components/WhyChoose";
import Reviews from "../components/Reviews";
import CTA from "../components/CTA";
export default function Home() {
  return (
    <main style={{ backgroundColor: "#FFF2F8" }}>
      {/* Hero Section */}
      <section
      className="pt-3"
  style={{
    background:
      "linear-gradient(to bottom, #D21165 0%, #D21165 65%, #FFF2F8 100%)",
    minHeight: "520px",
    display: "flex",
    alignItems: "center",
  }}
>
        <div className="container">
          <div className="row align-items-center gy-5">

            {/* Left Side */}
            <div className="col-12 col-lg-6 text-center text-lg-start">
              <h5
                className="mb-3 fw-semibold"
                style={{ color: "#FFD6E7" }}
              >
                Welcome to DazroShop
              </h5>

              <h1
                className="display-4 fw-bold text-white mb-3"
                style={{ lineHeight: "1.15" }}
              >
                Shop Everything
                <br />
                You Love
              </h1>

              <p
                className="text-white mb-4"
                style={{
                  fontSize: "17px",
                  lineHeight: "1.7",
                  maxWidth: "520px",
                }}
              >
                Discover quality products, great deals, and everyday
                essentials—all in one place.
              </p>

              <Link
                href="/products"
                className="btn btn-light fw-semibold px-4 py-3"
                style={{
                  color: "#D21165",
                  borderRadius: "8px",
                }}
              >
                Shop Now
              </Link>
            </div>

            {/* Right Side */}
       <div className="col-12 col-lg-6">
  <div
    className="position-relative w-100 mx-auto overflow-hidden pt-5"
    style={{
      maxWidth: "650px",
      aspectRatio: "1 / 1",
      borderRadius: "30px",
    }}
  >
    <Image
  src="/hero-baner.png"
  alt="DazroShop online shopping products in Bangladesh"
  priority
  width={600}
  height={500}
  style={{
    width: "100%",
    maxWidth: "660px",
    height: "430px",
    objectFit: "cover",
    borderRadius: "30px",
  }}
/>
  </div>
</div>

          </div>
        </div>
      </section>
      <Categories/>
      <FeaturedProducts/>
      <SpecialOffer/>
      <Features/>
      <Reviews/>
     <WhyChoose/>
     <CTA/>
    </main>
  );
}