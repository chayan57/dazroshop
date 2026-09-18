import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";

function WhyChoose() {
  const reasons = [
    {
      icon: <VerifiedOutlinedIcon />,
      title: "Quality Products",
      description: "We focus on quality products for everyday needs.",
    },
    {
      icon: <LocalShippingOutlinedIcon />,
      title: "Convenient Delivery",
      description: "Get your orders delivered conveniently across Bangladesh.",
    },
    {
      icon: <SupportAgentOutlinedIcon />,
      title: "Customer Support",
      description: "We're here to help before and after your purchase.",
    },
    {
      icon: <ShoppingBagOutlinedIcon />,
      title: "Easy Shopping",
      description: "Enjoy a simple and convenient online shopping experience.",
    },
  ];

  return (
    <section
      className="py-5"
      style={{ backgroundColor: "#FFF2F8" }}
    >
      <div className="container">
        <div className="text-center mb-4">
          <p
            className="fw-semibold mb-1"
            style={{ color: "#D21165" }}
          >
            Why Choose DazroShop?
          </p>

          <h2 className="fw-bold mb-2">
            Shopping Made Simple
          </h2>

          <p className="text-muted mb-0">
            A better way to discover and shop for the products you need.
          </p>
        </div>

        <div className="row g-3">
          {reasons.map((reason) => (
            <div
              className="col-12 col-sm-6 col-lg-3"
              key={reason.title}
            >
              <div
                className="bg-white rounded-4 p-4 h-100 text-center"
                style={{
                  boxShadow:
                    "0 10px 30px rgba(210, 17, 101, 0.14)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "56px",
                    height: "56px",
                    backgroundColor: "#FFF2F8",
                    color: "#D21165",
                  }}
                >
                  {reason.icon}
                </div>

                <h3 className="h6 fw-bold mb-2">
                  {reason.title}
                </h3>

                <p
                  className="text-muted mb-0"
                  style={{
                    fontSize: "13px",
                    lineHeight: "1.6",
                  }}
                >
                  {reason.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyChoose;