"use client";

import React, {
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (
    e
  ) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit =
    async (e) => {
      e.preventDefault();

      setError("");

      if (
        formData.password !==
        formData.confirmPassword
      ) {
        setError(
          "Passwords do not match."
        );

        return;
      }

      try {
        setLoading(true);

        const response =
          await fetch(
            "/api/auth/register",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                name:
                  formData.name,
                email:
                  formData.email,
                phone:
                  formData.phone,
                password:
                  formData.password,
              }),
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              "Registration failed."
          );
        }

        router.push("/");
        router.refresh();
      } catch (error) {
        console.error(
          "Register error:",
          error
        );

        setError(
          error.message ||
            "Registration failed."
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <main className="dazro-auth-page">
      <div className="container py-5">
        <div className="dazro-auth-card">

          <div className="text-center mb-4">
            <h1 className="dazro-auth-title">
              Create Account
            </h1>

            <p className="dazro-auth-subtitle">
              Create your DazroShop account
              to manage your orders.
            </p>
          </div>

          {error && (
            <div className="alert alert-danger border-0 rounded-3">
              {error}
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
          >
            <div className="mb-3">
              <label className="dazro-input-label">
                Full Name
                <span>*</span>
              </label>

              <input
                type="text"
                name="name"
                value={
                  formData.name
                }
                onChange={
                  handleChange
                }
                className="form-control dazro-input"
                placeholder="Your full name"
                required
              />
            </div>

            <div className="mb-3">
              <label className="dazro-input-label">
                Email Address
                <span>*</span>
              </label>

              <input
                type="email"
                name="email"
                value={
                  formData.email
                }
                onChange={
                  handleChange
                }
                className="form-control dazro-input"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="mb-3">
              <label className="dazro-input-label">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={
                  formData.phone
                }
                onChange={
                  handleChange
                }
                className="form-control dazro-input"
                placeholder="01XXXXXXXXX"
              />
            </div>

            <div className="mb-3">
              <label className="dazro-input-label">
                Password
                <span>*</span>
              </label>

              <input
                type="password"
                name="password"
                value={
                  formData.password
                }
                onChange={
                  handleChange
                }
                className="form-control dazro-input"
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            <div className="mb-4">
              <label className="dazro-input-label">
                Confirm Password
                <span>*</span>
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={
                  formData.confirmPassword
                }
                onChange={
                  handleChange
                }
                className="form-control dazro-input"
                placeholder="Confirm your password"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn dazro-auth-btn w-100 bg-success"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2 " />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="text-center mt-4 mb-0 dazro-auth-switch">
            Already have an account?{" "}
            <Link href="/login">
              Login
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

export default RegisterPage;