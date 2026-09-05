import Link from "next/link";
import PageShell from "../components/layout/PageShell";

export default function Page(){
  return (
    <PageShell>
      <div className="sg-container sg-page">
        <section className="sg-hero">
          <span className="sg-kicker">StayGuwahati account</span>
          <h1 className="sg-title">Everything about your stay, in one place.</h1>
          <p className="sg-sub">Manage your personal details, bookings and saved stays with your StayGuwahati account.</p>
        </section>

        <section className="sg-section sg-card sg-empty sg-auth-card">
          <span className="sg-kicker">Your account</span>
          <h2 className="sg-title-sm">Sign in to continue</h2>
          <p className="sg-muted">Access your bookings, saved places and account details.</p>

          <div className="sg-auth-actions">
            <Link href="/login" className="sg-btn sg-dark">Sign in →</Link>
            <Link href="/register" className="sg-btn sg-outline">Create account</Link>
          </div>

          <p className="sg-auth-note">Already have an account? Use the same email and password you registered with.</p>
        </section>
      </div>
    </PageShell>
  );
}