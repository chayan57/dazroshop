"use client";

import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] =
    useState(true);
  const [loggingOut, setLoggingOut] =
    useState(false);

  // ==========================================
  // Check Logged-in User
  // ==========================================

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(
          "/api/auth/me",
          {
            cache: "no-store",
          }
        );

        const data =
          await response.json();

        if (
          response.ok &&
          data.success
        ) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error(
          "Navbar auth error:",
          error
        );

        setUser(null);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuth();
  }, [pathname]);

  // ==========================================
  // Logout
  // ==========================================

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const response =
        await fetch(
          "/api/auth/logout",
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Logout failed."
        );
      }

      setUser(null);

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav
      className="navbar navbar-expand-lg shadow-sm"
      style={{
        backgroundColor: "#D21165",
        minHeight: "70px",
      }}
    >
      <div className="container">

        {/* Logo */}
        <a
          className="navbar-brand"
          href="/"
        >
          <Image
            src="/logo.png"
            alt="DazroShop"
            width={75}
            height={75}
            priority
          />
        </a>

        {/* Mobile Menu Button */}
        <button
          className="navbar-toggler bg-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation */}
        <div
          className="collapse navbar-collapse"
          id="navbarNav"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">

            {/* Home */}
            <li className="nav-item">
              <Button
                href="/"
                variant="contained"
                sx={{
                  backgroundColor:
                    pathname === "/"
                      ? "#FFF2F8"
                      : "transparent",

                  color:
                    pathname === "/"
                      ? "#D21165"
                      : "#FFFFFF",

                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2.5,
                  py: 1,
                  transition:
                    "all 0.25s ease",

                  "&:hover": {
                    backgroundColor:
                      "#0b0307",
                    color: "#D21165",
                    transform:
                      "translateY(-1px)",
                  },
                }}
              >
                Home
              </Button>
            </li>

            {/* Products */}
            <li className="nav-item">
              <Button
                href="/products"
                variant="text"
                sx={{
                  backgroundColor:
                    pathname.startsWith(
                      "/products"
                    )
                      ? "#FFF2F8"
                      : "transparent",

                  color:
                    pathname.startsWith(
                      "/products"
                    )
                      ? "#D21165"
                      : "#FFFFFF",

                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2.5,
                  py: 1,
                  transition:
                    "all 0.25s ease",

                  "&:hover": {
                    backgroundColor:
                      "#050405",
                    color: "#ff006f",
                    transform:
                      "translateY(-1px)",
                  },
                }}
              >
                Products
              </Button>
            </li>

            {/* Cart */}
            <li className="nav-item">
              <Button
                href="/cart"
                variant="text"
                sx={{
                  backgroundColor:
                    pathname.startsWith(
                      "/cart"
                    )
                      ? "#FFF2F8"
                      : "transparent",

                  color:
                    pathname.startsWith(
                      "/cart"
                    )
                      ? "#D21165"
                      : "#FFFFFF",

                  fontWeight: 600,
                  textTransform: "none",
                  borderRadius: "8px",
                  px: 2.5,
                  py: 1,
                  transition:
                    "all 0.25s ease",

                  "&:hover": {
                    backgroundColor:
                      "#000000",
                    color: "#D21165",
                    transform:
                      "translateY(-1px)",
                  },
                }}
              >
                Cart
              </Button>
            </li>

            {/* My Orders - Only When Logged In */}
            {!checkingAuth && user && (
              <li className="nav-item">
                <Button
                  href="/orders"
                  variant="text"
                  sx={{
                    backgroundColor:
                      pathname.startsWith(
                        "/orders"
                      )
                        ? "#FFF2F8"
                        : "transparent",

                    color:
                      pathname.startsWith(
                        "/orders"
                      )
                        ? "#D21165"
                        : "#FFFFFF",

                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 2.5,
                    py: 1,
                    transition:
                      "all 0.25s ease",

                    "&:hover": {
                      backgroundColor:
                        "#000000",
                      color: "#D21165",
                      transform:
                        "translateY(-1px)",
                    },
                  }}
                >
                  My Orders
                </Button>
              </li>
            )}

            {/* ==========================================
                Login / Logout
            ========================================== */}

            {!checkingAuth && !user && (
              <li className="nav-item">
                <Button
                  href="/login"
                  variant="outlined"
                  sx={{
                    backgroundColor:
                      pathname.startsWith(
                        "/login"
                      )
                        ? "#FFF2F8"
                        : "transparent",

                    color:
                      pathname.startsWith(
                        "/login"
                      )
                        ? "#D21165"
                        : "#FFFFFF",

                    borderColor:
                      "#FFFFFF",

                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 2.5,
                    py: 1,
                    transition:
                      "all 0.25s ease",

                    "&:hover": {
                      backgroundColor:
                        "#FFF2F8",
                      color: "#D21165",
                      borderColor:
                        "#FFFFFF",
                      transform:
                        "translateY(-3px)",
                    },
                  }}
                >
                  Login
                </Button>
              </li>
            )}

            {!checkingAuth && user && (
              <li className="nav-item">
                <Button
                  onClick={
                    handleLogout
                  }
                  variant="outlined"
                  disabled={
                    loggingOut
                  }
                  sx={{
                    backgroundColor:
                      "transparent",

                    color:
                      "#FFFFFF",

                    borderColor:
                      "#FFFFFF",

                    fontWeight: 600,
                    textTransform: "none",
                    borderRadius: "8px",
                    px: 2.5,
                    py: 1,
                    transition:
                      "all 0.25s ease",

                    "&:hover": {
                      backgroundColor:
                        "#FFF2F8",
                      color: "#D21165",
                      borderColor:
                        "#FFFFFF",
                      transform:
                        "translateY(-3px)",
                    },

                    "&:disabled": {
                      color:
                        "#FFFFFF",
                      borderColor:
                        "#FFFFFF",
                    },
                  }}
                >
                  {loggingOut
                    ? "Logging out..."
                    : "Logout"}
                </Button>
              </li>
            )}

          </ul>
        </div>
      </div>
    </nav>
  );
}