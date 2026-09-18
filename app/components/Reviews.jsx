import StarIcon from "@mui/icons-material/Star";

function Reviews() {
  const reviews = [
    {
      id: 1,
      name: "Customer Review",
      text: "Your review will appear here after a successful purchase.",
      rating: 5,
    },
    {
      id: 2,
      name: "Customer Review",
      text: "Real customer feedback will be displayed in this section.",
      rating: 5,
    },
    {
      id: 3,
      name: "Customer Review",
      text: "Customers can share their experience with DazroShop here.",
      rating: 5,
    },
  ];

  return (
    <section
      className="py-5"
      style={{ backgroundColor: "#FFF2F8" }}
    >
      <div className="container">

        {/* Section Header */}
        <div className="text-center mb-4">
          <p
            className="fw-semibold mb-1"
            style={{ color: "#D21165" }}
          >
            Customer Reviews
          </p>

          <h2 className="fw-bold mb-2">
            What Our Customers Say
          </h2>

          <p className="text-muted mb-0">
            Real feedback from people who shop with DazroShop.
          </p>
        </div>

        {/* Reviews */}
        <div className="row g-4">
          {reviews.map((review) => (
            <div
              className="col-12 col-md-4"
              key={review.id}
            >
              <article
                className="bg-white rounded-4 p-4 h-100"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(210, 17, 101, 0.13)",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Stars */}
                <div className="d-flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, index) => (
                    <StarIcon
                      key={index}
                      sx={{
                        fontSize: 20,
                        color: "#D21165",
                      }}
                    />
                  ))}
                </div>

                {/* Review */}
                <p
                  className="text-muted mb-4"
                  style={{
                    fontSize: "14px",
                    lineHeight: "1.7",
                  }}
                >
                  “{review.text}”
                </p>

                {/* Customer */}
                <div className="d-flex align-items-center">
                  <div
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                    style={{
                      width: "42px",
                      height: "42px",
                      backgroundColor: "#FFF2F8",
                      color: "#D21165",
                    }}
                  >
                    C
                  </div>

                  <div className="ms-2">
                    <h3
                      className="mb-0 fw-semibold"
                      style={{ fontSize: "14px" }}
                    >
                      {review.name}
                    </h3>

                    <span
                      className="text-muted"
                      style={{ fontSize: "12px" }}
                    >
                      Verified Purchase
                    </span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Reviews;