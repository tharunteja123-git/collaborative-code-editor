import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, register } from "../lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await register(email, password);
      await login(email, password);
      navigate("/rooms");
    } catch (err) {
      setError(err?.response?.data?.detail || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="signup-page">
      <div className="signup-orbit signup-orbit-one" aria-hidden="true" />
      <div className="signup-orbit signup-orbit-two" aria-hidden="true" />
      <section className="signup-card" aria-labelledby="signup-title">
        <Link to="/login" className="signup-brand" aria-label="Collab Editor home">
          <span className="signup-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>collab<span>editor</span></span>
        </Link>

        <div className="signup-heading">
          <p className="signup-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <h1 id="signup-title">Create your account</h1>
          <p>One shared space for your team's best ideas.</p>
        </div>

        <form onSubmit={handleSubmit} className="signup-form">
          {error && <p className="signup-error" role="alert">{error}</p>}
          <div className="signup-field">
            <label htmlFor="register-email">Email address</label>
            <input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>
          <div className="signup-field">
            <label htmlFor="register-password">Create a password</label>
            <input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />
            <p className="signup-hint">Use at least 8 characters.</p>
          </div>
          <button className="signup-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating your account..." : "Create account"}
            {!isSubmitting && <span aria-hidden="true">&#8594;</span>}
          </button>
        </form>

        <p className="signup-login">Already have an account? <Link to="/login">Sign in</Link></p>
        <div className="signup-secure"><span aria-hidden="true">&#10003;</span> Your workspace is just a few steps away</div>
      </section>
    </main>
  );
}
