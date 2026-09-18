import Link from "next/link";
import WatchIcon from "@mui/icons-material/Watch";
import HeadphonesIcon from "@mui/icons-material/Headphones";
import CheckroomIcon from "@mui/icons-material/Checkroom";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";

function Categories() {
  const categories = [
    {
      title: "Watches",
      icon: <WatchIcon />,
      href: "/category/watches",
    },
    {
      title: "Gadgets",
      icon: <HeadphonesIcon />,
      href: "/category/gadgets",
    },
    {
      title: "Fashion",
      icon: <CheckroomIcon />,
      href: "/category/fashion",
    },
    {
      title: "Lifestyle",
      icon: <HomeOutlinedIcon />,
      href: "/category/lifestyle",
    },
  ];

  return (
    <section
      className=""
      style={{ backgroundColor: "#FFF2F8" }}
    >
      <div className="container">

        <div className="text-center mb-4">
          <p
            className="mb-1 fw-semibold"
            style={{ color: "#D21165" }}
          >
            Shop by Category
          </p>

          <h2 className="fw-bold mb-2">
            Explore Categories
          </h2>

          <p className="text-muted mb-0">
            Find the products you are looking for.
          </p>
        </div>

        <div className="row g-3">
          {categories.map((category) => (
            <div
              className="col-6 col-md-4 col-lg-3"
              key={category.href}
            >
              <Link
                href={category.href}
                className="text-decoration-none"
              >
                <div
                  className="bg-white rounded-4 text-center p-3 h-100"
                  style={{
                    boxShadow:
                      "0 8px 25px rgba(210, 17, 101, 0.12)",
                    transition: "all 0.3s ease",
                  }}
                >
                  <div
                    className="mx-auto mb-2 d-flex align-items-center justify-content-center rounded-circle"
                    style={{
                      width: "52px",
                      height: "52px",
                      backgroundColor: "#FFF2F8",
                      color: "#D21165",
                    }}
                  >
                    {category.icon}
                  </div>

                  <h3 className="h6 fw-semibold text-dark mb-0">
                    {category.title}
                  </h3>
                </div>
              </Link>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

export default Categories;