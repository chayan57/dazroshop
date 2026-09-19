"use client";

import React, {
  useState,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
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

      try {
        setLoading(true);

        const response =
          await fetch(
            "/api/auth/login",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body: JSON.stringify({
                email:
                  formData.email,
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
              "Login failed."
          );
        }

        router.push("/");
        router.refresh();
      } catch (error) {
        console.error(
          "Login error:",
          error
        );

        setError(
          error.message ||
            "Login failed."
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
              Welcome Back
            </h1>

            <p className="dazro-auth-subtitle">
              Login to your DazroShop account.
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

            <div className="mb-4">

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
                placeholder="Your password"
                required
              />

            </div>

            <button
              type="submit"
              className="btn dazro-auth-btn w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </button>

          </form>

          <p className="text-center mt-4 mb-0 dazro-auth-switch">
            Don't have an account?{" "}
            <Link href="/register">
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

export default LoginPage;