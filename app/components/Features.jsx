import React from "react";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PaymentOutlinedIcon from "@mui/icons-material/PaymentOutlined";
import ReplayOutlinedIcon from "@mui/icons-material/ReplayOutlined";

function Features() {
  const features = [
    {
      icon: <LocalShippingOutlinedIcon />,
      title: "Fast Delivery",
      description: "Fast and convenient delivery across Bangladesh.",
    },
    {
      icon: <SecurityOutlinedIcon />,
      title: "Secure Shopping",
      description: "Shop with confidence through a secure checkout.",
    },
    {
      icon: <PaymentOutlinedIcon />,
      title: "Easy Payment",
      description: "Convenient payment options for your orders.",
    },
    {
      icon: <ReplayOutlinedIcon />,
      title: "Easy Returns",
      description: "Simple return support for eligible orders.",
    },
  ];

  return (
    <section
      className="py-3"
      style={{
        backgroundColor: "#FFF2F8",
      }}
    >
      <div className="container">
        <div className="row g-3">
          {features.map((feature, index) => (
            <div className="col-12 col-sm-6 col-lg-3" key={index}>
              <div
                className="bg-white rounded-4 text-center h-100 p-3"
                style={{
                  boxShadow: "0 8px 25px rgba(210, 17, 101, 0.15)",
                  transition: "all 0.3s ease",
                }}
              >
                <div
                  className="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle"
                  style={{
                    width: "50px",
                    height: "50px",
                    backgroundColor: "#FFF2F8",
                    color: "#D21165",
                  }}
                >
                  {React.cloneElement(feature.icon, {
                    sx: { fontSize: 25 },
                  })}
                </div>

                <h2 className="h6 fw-bold mb-1">
                  {feature.title}
                </h2>

                <p
                  className="text-muted mb-0"
                  style={{
                    fontSize: "12px",
                    lineHeight: "1.5",
                  }}
                >
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;