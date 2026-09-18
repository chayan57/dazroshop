"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

function SpecialOffer() {
  const offers = [
    {
      id: 1,
      title: "Discover Great Deals",
      subtitle: "SPECIAL OFFER",
      description:
        "Explore exciting products and special offers at DazroShop. Find quality watches, gadgets, lifestyle products, and more.",
      image: "/hero-baner.png",
    },
    {
      id: 2,
      title: "Shop Your Favorite Products",
      subtitle: "TRENDING NOW",
      description:
        "Discover popular products at DazroShop and find something perfect for your everyday needs.",
      image: "/hero-baner.png",
    },
    {
      id: 3,
      title: "Quality Products, Great Value",
      subtitle: "SHOP TODAY",
      description:
        "Explore our growing collection of quality products with convenient online shopping across Bangladesh.",
      image: "/hero-baner.png",
    },
  ];

  return (
    <section
      className="py-5"
      style={{ backgroundColor: "#FFF2F8" }}
    >
      <div className="container">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          className="special-offer-slider"
        >
          {offers.map((offer) => (
            <SwiperSlide key={offer.id}>
              <div
                className="row align-items-center overflow-hidden rounded-4"
                style={{
                  backgroundColor: "#D21165",
                  boxShadow:
                    "0 15px 40px rgba(210, 17, 101, 0.2)",
                }}
              >
                {/* Content */}
                <div className="col-12 col-lg-6 p-4 p-md-5">
                  <p
                    className="fw-semibold mb-2"
                    style={{
                      color: "#FFD6E7",
                      fontSize: "14px",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {offer.subtitle}
                  </p>

                  <h2
                    className="fw-bold text-white mb-3"
                    style={{
                      fontSize: "clamp(30px, 4vw, 46px)",
                      lineHeight: "1.15",
                    }}
                  >
                    {offer.title}
                  </h2>

                  <p
                    className="text-white mb-4"
                    style={{
                      fontSize: "16px",
                      lineHeight: "1.7",
                      maxWidth: "500px",
                    }}
                  >
                    {offer.description}
                  </p>

                  <Link
                    href="/products"
                    className="btn fw-semibold px-4 py-3"
                    style={{
                      backgroundColor: "#FFFFFF",
                      color: "#D21165",
                      borderRadius: "10px",
                    }}
                  >
                    Shop Now
                  </Link>
                </div>

                {/* Image */}
                <div className="col-12 col-lg-6">
                  <div
                    className="position-relative overflow-hidden special-offer-image"
                    style={{
                      width: "100%",
                      height: "380px",
                    }}
                  >
                    <Image
                      src={offer.image}
                      alt={`${offer.title} - DazroShop`}
                      fill
                      sizes="(max-width: 991px) 100vw, 50vw"
                      style={{
                        objectFit: "cover",
                      }}
                    />

                    <span className="special-offer-shine"></span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default SpecialOffer;