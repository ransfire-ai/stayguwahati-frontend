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

    if (loading) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !password) {
      setError("Please enter your email address and password.");
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
          email: cleanEmail,
          password,
        }),
      });

      let data: any = {};

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The server returned an invalid response. Please try again."
        );
      }

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error ||
            data?.msg ||
            "Invalid email or password."
        );
      }

      console.log("StayGuwahati login response:", data);

      const token =
  data?.token ||
  data?.accessToken ||
  data?.jwt ||
  data?.data?.token ||
  data?.data?.accessToken;

const user =
  data?.user ||
  data?.data?.user ||
  {
    name:
      data?.name ||
      data?.data?.name ||
      cleanEmail.split("@")[0],
    email: cleanEmail,
  };

if (!token) {
  throw new Error(
    "Login succeeded but no authentication token was received."
  );
}

if (typeof window !== "undefined") {
  // IMPORTANT: Original dashboard requires sessionStorage
  sessionStorage.setItem("token", token);

  sessionStorage.setItem(
    "userProfile",
    JSON.stringify({
      name:
        user?.name ||
        user?.fullName ||
        user?.username ||
        cleanEmail.split("@")[0],
      email: user?.email || cleanEmail,
    })
  );

  // Default dashboard mode
  sessionStorage.setItem(
    "activeDashboardRole",
    user?.role === "host" ? "host" : "traveler"
  );

  // Keep compatibility with other existing pages
  localStorage.setItem("token", token);
  localStorage.setItem(
    "userProfile",
    JSON.stringify(user)
  );
}

// Redirect to the ORIGINAL dashboard
window.location.href = "/dashboard";

    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageShell>
      <main
        style={{
          minHeight: "calc(100vh - 80px)",
          padding: "clamp(28px, 5vw, 72px) 20px",
          background:
            "radial-gradient(circle at 8% 10%, rgba(234, 179, 8, 0.10), transparent 28%), radial-gradient(circle at 92% 82%, rgba(23, 107, 103, 0.13), transparent 30%), #f7f5ef",
        }}
      >
        <div
          style={{
            maxWidth: "1080px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.05fr) minmax(380px, 0.95fr)",
            overflow: "hidden",
            borderRadius: "30px",
            border: "1px solid #d8e1de",
            background: "#ffffff",
            boxShadow: "0 24px 70px rgba(19, 58, 55, 0.14)",
          }}
          className="signin-layout"
        >
          {/* LEFT: BRAND EXPERIENCE */}
          <section
            style={{
              position: "relative",
              minHeight: "640px",
              padding: "clamp(34px, 5vw, 64px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              overflow: "hidden",
              background:
                "linear-gradient(145deg, #123d3a 0%, #1c5651 58%, #34736b 100%)",
              color: "#ffffff",
            }}
          >
            <div
              style={{
                position: "absolute",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.10)",
                right: "-120px",
                top: "-110px",
              }}
            />
            <div
              style={{
                position: "absolute",
                width: "180px",
                height: "180px",
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.10)",
                right: "30px",
                top: "10px",
              }}
            />

            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.22)",
                  background: "rgba(255,255,255,0.08)",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                }}
              >
                <span style={{ color: "#f6c65b", fontSize: "14px" }}>✦</span>
                WELCOME BACK
              </div>

              <h1
                style={{
                  maxWidth: "480px",
                  margin: "42px 0 20px",
                  fontSize: "clamp(42px, 5vw, 68px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.055em",
                  fontWeight: 800,
                }}
              >
                Your next stay
                <br />
                <span style={{ color: "#f5c65d" }}>starts here.</span>
              </h1>

              <p
                style={{
                  maxWidth: "410px",
                  margin: 0,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "16px",
                  lineHeight: 1.7,
                }}
              >
                Sign in to manage reservations, save your favourite local stays
                and keep your Guwahati travel plans in one place.
              </p>
            </div>

            <div
              style={{
                position: "relative",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginTop: "50px",
              }}
            >
              {[
                ["⌂", "Local stays"],
                ["♡", "Saved places"],
                ["✓", "Easy booking"],
              ].map(([icon, label]) => (
                <div
                  key={label}
                  style={{
                    padding: "16px 12px",
                    borderRadius: "18px",
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.11)",
                  }}
                >
                  <div style={{ color: "#f5c65d", fontSize: "18px", marginBottom: "8px" }}>
                    {icon}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "rgba(255,255,255,0.78)",
                      fontWeight: 700,
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* RIGHT: SIGN IN FORM */}
          <section
            style={{
              padding: "clamp(32px, 5vw, 68px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              background: "#fffdf9",
            }}
          >
            <div style={{ maxWidth: "420px", width: "100%", margin: "0 auto" }}>
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "16px",
                  display: "grid",
                  placeItems: "center",
                  background: "#e9f1ef",
                  color: "#176b67",
                  fontSize: "24px",
                  marginBottom: "28px",
                }}
              >
                ↗
              </div>

              <p
                style={{
                  margin: "0 0 10px",
                  color: "#176b67",
                  fontSize: "11px",
                  fontWeight: 800,
                  letterSpacing: "0.14em",
                }}
              >
                STAYGUWAHATI ACCOUNT
              </p>

              <h2
                style={{
                  margin: "0 0 12px",
                  color: "#173f3d",
                  fontSize: "clamp(30px, 4vw, 42px)",
                  lineHeight: 1.1,
                  letterSpacing: "-0.035em",
                }}
              >
                Sign in and pick up where you left off.
              </h2>

              <p
                style={{
                  margin: "0 0 34px",
                  color: "#6b7775",
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                Enter your account details to continue.
              </p>

              <form onSubmit={handleSignIn}>
                <div style={{ marginBottom: "20px" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      marginBottom: "9px",
                      color: "#294946",
                      fontWeight: 800,
                      fontSize: "13px",
                    }}
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={loading}
                    required
                    style={{
                      width: "100%",
                      padding: "15px 17px",
                      borderRadius: "14px",
                      border: "1px solid #d7e0dd",
                      fontSize: "15px",
                      outline: "none",
                      background: "#ffffff",
                      color: "#173f3d",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "10px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "9px",
                    }}
                  >
                    <label
                      htmlFor="password"
                      style={{
                        color: "#294946",
                        fontWeight: 800,
                        fontSize: "13px",
                      }}
                    >
                      Password
                    </label>

                    <Link
                      href="/forgot-password"
                      style={{
                        color: "#176b67",
                        fontWeight: 800,
                        textDecoration: "none",
                        fontSize: "12px",
                      }}
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={loading}
                    required
                    style={{
                      width: "100%",
                      padding: "15px 17px",
                      borderRadius: "14px",
                      border: "1px solid #d7e0dd",
                      fontSize: "15px",
                      outline: "none",
                      background: "#ffffff",
                      color: "#173f3d",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    style={{
                      margin: "20px 0",
                      padding: "13px 15px",
                      borderRadius: "14px",
                      border: "1px solid #f3c8c2",
                      background: "#fff4f2",
                      color: "#b42318",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      fontWeight: 600,
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    marginTop: "22px",
                    padding: "16px 20px",
                    border: "none",
                    borderRadius: "14px",
                    background: "#173f3d",
                    color: "#ffffff",
                    fontSize: "15px",
                    fontWeight: 800,
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.7 : 1,
                    boxShadow: "0 10px 22px rgba(23,63,61,0.16)",
                  }}
                >
                  {loading ? "Signing you in..." : "Sign in →"}
                </button>
              </form>

              <div
                style={{
                  marginTop: "30px",
                  paddingTop: "26px",
                  borderTop: "1px solid #e6ece9",
                  textAlign: "center",
                }}
              >
                <p
                  style={{
                    margin: "0 0 14px",
                    color: "#71807d",
                    fontSize: "14px",
                  }}
                >
                  New to StayGuwahati?
                </p>

                <Link
                  href="/register"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "46px",
                    padding: "0 22px",
                    borderRadius: "13px",
                    border: "1px solid #176b67",
                    color: "#176b67",
                    fontSize: "14px",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  Create your account
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        @media (max-width: 820px) {
          .signin-layout {
            grid-template-columns: 1fr !important;
            border-radius: 24px !important;
          }
        }

        @media (max-width: 560px) {
          .signin-layout > section:first-child {
            min-height: auto !important;
            padding: 32px 26px !important;
          }

          .signin-layout > section:last-child {
            padding: 36px 26px !important;
          }

          .signin-layout h1 {
            margin-top: 28px !important;
          }
        }
      `}</style>
    </PageShell>
  );
}
