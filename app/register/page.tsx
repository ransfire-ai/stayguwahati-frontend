 "use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PageShell from "../components/layout/PageShell";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://stayguwahati-backend.onrender.com";

type Message = {
  type: "success" | "error";
  text: string;
};

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferralCode(ref.trim());
  }, []);

  useEffect(() => {
    if (message?.type !== "success") return;

    const timer = window.setTimeout(() => {
      router.push("/login");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [message, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (loading) return;

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    setMessage(null);

    if (!cleanName || !cleanEmail || !password) {
      setMessage({
        type: "error",
        text: "Please complete your name, email address and password.",
      });
      return;
    }

    if (password.length < 6) {
      setMessage({
        type: "error",
        text: "Your password must contain at least 6 characters.",
      });
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password,
          ...(referralCode ? { referralCode } : {}),
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
            "Unable to create your account. Please try again."
        );
      }

      setMessage({
        type: "success",
        text: "Your account has been created successfully. Taking you to sign in...",
      });
    } catch (err) {
      console.error("Registration error:", err);

      setMessage({
        type: "error",
        text:
          err instanceof Error
            ? err.message
            : "An unexpected error occurred. Please try again.",
      });
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
          className="register-layout"
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
        >
          {/* LEFT: BRAND EXPERIENCE */}
          <section
            style={{
              position: "relative",
              minHeight: "670px",
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
                JOIN STAYGUWAHATI
              </div>

              <h1
                style={{
                  maxWidth: "500px",
                  margin: "42px 0 20px",
                  fontSize: "clamp(42px, 5vw, 68px)",
                  lineHeight: 1.02,
                  letterSpacing: "-0.055em",
                  fontWeight: 800,
                }}
              >
                Stay local.
                <br />
                <span style={{ color: "#f5c65d" }}>Feel Guwahati.</span>
              </h1>

              <p
                style={{
                  maxWidth: "420px",
                  margin: 0,
                  color: "rgba(255,255,255,0.78)",
                  fontSize: "16px",
                  lineHeight: 1.7,
                }}
              >
                Create your free account to discover local stays, save your
                favourites and keep every Guwahati plan in one place.
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
                ["♡", "Save favourites"],
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
                  <div
                    style={{
                      color: "#f5c65d",
                      fontSize: "18px",
                      marginBottom: "8px",
                    }}
                  >
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

          {/* RIGHT: REGISTRATION FORM */}
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
                ✦
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
                CREATE YOUR ACCOUNT
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
                Start your local stay story.
              </h2>

              <p
                style={{
                  margin: "0 0 30px",
                  color: "#6b7775",
                  fontSize: "15px",
                  lineHeight: 1.6,
                }}
              >
                It only takes a moment to create your StayGuwahati account.
              </p>

              {message && (
                <div
                  role="alert"
                  aria-live="polite"
                  style={{
                    marginBottom: "22px",
                    padding: "13px 15px",
                    borderRadius: "14px",
                    border:
                      message.type === "success"
                        ? "1px solid #b7ded5"
                        : "1px solid #f3c8c2",
                    background:
                      message.type === "success" ? "#effaf7" : "#fff4f2",
                    color:
                      message.type === "success" ? "#176b67" : "#b42318",
                    fontSize: "13px",
                    lineHeight: 1.5,
                    fontWeight: 650,
                  }}
                >
                  {message.type === "success" ? "✓ " : "⚠ "}
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="name"
                    style={{
                      display: "block",
                      marginBottom: "9px",
                      color: "#294946",
                      fontWeight: 800,
                      fontSize: "13px",
                    }}
                  >
                    Full name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    disabled={loading}
                    required
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "18px" }}>
                  <label
                    htmlFor="email"
                    style={labelStyle}
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
                    style={inputStyle}
                  />
                </div>

                <div style={{ marginBottom: "8px" }}>
                  <label htmlFor="password" style={labelStyle}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                    minLength={6}
                    disabled={loading}
                    required
                    style={inputStyle}
                  />
                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#8a9693",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    Use at least 6 characters to secure your account.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading || message?.type === "success"}
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
                    cursor:
                      loading || message?.type === "success"
                        ? "not-allowed"
                        : "pointer",
                    opacity:
                      loading || message?.type === "success" ? 0.72 : 1,
                    boxShadow: "0 10px 22px rgba(23,63,61,0.16)",
                  }}
                >
                  {loading
                    ? "Creating your account..."
                    : message?.type === "success"
                    ? "Account created ✓"
                    : "Create your account →"}
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
                  Already have a StayGuwahati account?
                </p>

                <Link
                  href="/login"
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
                  Sign in instead
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <style>{`
        @media (max-width: 820px) {
          .register-layout {
            grid-template-columns: 1fr !important;
            border-radius: 24px !important;
          }
        }

        @media (max-width: 560px) {
          .register-layout > section:first-child {
            min-height: auto !important;
            padding: 32px 26px !important;
          }

          .register-layout > section:last-child {
            padding: 36px 26px !important;
          }

          .register-layout h1 {
            margin-top: 28px !important;
          }
        }
      `}</style>
    </PageShell>
  );
}

const labelStyle = {
  display: "block" as const,
  marginBottom: "9px",
  color: "#294946",
  fontWeight: 800,
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  padding: "15px 17px",
  borderRadius: "14px",
  border: "1px solid #d7e0dd",
  fontSize: "15px",
  outline: "none",
  background: "#ffffff",
  color: "#173f3d",
  boxSizing: "border-box" as const,
};
