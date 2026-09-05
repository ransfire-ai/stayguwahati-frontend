"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PageShell from "../components/layout/PageShell";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://stayguwahati-backend.onrender.com";

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            "Unable to sign in. Please check your details."
        );
      }

      const token =
        data?.token ||
        data?.accessToken ||
        data?.data?.token;

      const user =
        data?.user ||
        data?.data?.user ||
        null;

      if (typeof window !== "undefined") {
        if (token) {
          localStorage.setItem("token", token);
          localStorage.setItem("stayguwahati_token", token);
        }

        if (user) {
          localStorage.setItem(
            "user",
            JSON.stringify(user)
          );
        }
      }

      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <div className="sg-container sg-page">
        <section className="sg-hero">
          <span className="sg-kicker">WELCOME BACK</span>

          <h1 className="sg-title">
            Sign in to
            <br />
            continue.
          </h1>

          <p className="sg-sub">
            Access your bookings, saved places and account details.
          </p>
        </section>

        <section
          className="sg-section sg-card"
          style={{
            maxWidth: "620px",
            margin: "0 auto",
          }}
        >
          <div style={{ marginBottom: "28px" }}>
            <h2
              className="sg-title-sm"
              style={{
                fontSize: "28px",
                marginBottom: "8px",
              }}
            >
              Your StayGuwahati account
            </h2>

            <p className="sg-muted">
              Enter your details to continue.
            </p>
          </div>

          <form onSubmit={handleSignIn}>
            <div style={{ marginBottom: "18px" }}>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 700,
                }}
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                autoComplete="email"
                required
                style={{
                  width: "100%",
                  padding: "15px 16px",
                  borderRadius: "14px",
                  border: "1px solid #d6dfdc",
                  fontSize: "16px",
                  outline: "none",
                  background: "#ffffff",
                  color: "#173f3d",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "10px" }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: 700,
                }}
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                style={{
                  width: "100%",
                  padding: "15px 16px",
                  borderRadius: "14px",
                  border: "1px solid #d6dfdc",
                  fontSize: "16px",
                  outline: "none",
                  background: "#ffffff",
                  color: "#173f3d",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                textAlign: "right",
                marginBottom: "20px",
              }}
            >
              <Link
                href="/forgot-password"
                style={{
                  color: "#176b67",
                  fontWeight: 700,
                  textDecoration: "none",
                  fontSize: "14px",
                }}
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div
                role="alert"
                style={{
                  marginBottom: "18px",
                  padding: "13px 15px",
                  borderRadius: "12px",
                  background: "#fff1ef",
                  color: "#b42318",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="sg-btn sg-dark"
              style={{
                width: "100%",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                padding: "16px",
                fontSize: "16px",
              }}
            >
              {loading ? "Signing in..." : "Sign in →"}
            </button>
          </form>

          <div
            style={{
              marginTop: "26px",
              paddingTop: "22px",
              borderTop: "1px solid #e3e9e7",
              textAlign: "center",
            }}
          >
            <p
              className="sg-muted"
              style={{
                marginBottom: "14px",
              }}
            >
              New to StayGuwahati?
            </p>

            <Link
              href="/register"
              className="sg-btn"
              style={{
                display: "inline-flex",
                justifyContent: "center",
                textDecoration: "none",
                border: "1px solid #176b67",
              }}
            >
              Create account
            </Link>
          </div>
        </section>
      </div>
    </PageShell>
  );
}