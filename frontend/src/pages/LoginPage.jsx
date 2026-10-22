import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate("/rooms");
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="Collab Editor">
        <Link to="/login" className="login-brand" aria-label="Collab Editor home">
          <span className="brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>collab<span className="brand-light">editor</span></span>
        </Link>

        <div className="story-content">
          <p className="story-kicker"><span /> A calmer way to create</p>
          <h1>Good ideas<br />make better<br /><em>code together.</em></h1>
          <p className="story-caption">Your shared workspace is ready when you are.</p>
        </div>

        <div className="code-art" aria-hidden="true">
          <div className="code-art-top"><span /><span /><span /><b>workspace.jsx</b></div>
          <div className="code-art-body">
            <div className="code-line"><span className="code-number">01</span><span><span className="code-purple">const</span> <span className="code-blue">team</span> = <span className="code-green">"together"</span>;</span></div>
            <div className="code-line"><span className="code-number">02</span><span><span className="code-purple">function</span> <span className="code-yellow">makeSomething</span>() {'{'}</span></div>
            <div className="code-line"><span className="code-number">03</span><span>  <span className="code-purple">return</span> <span className="code-blue">ideas</span>.<span className="code-yellow">map</span>(build);</span></div>
            <div className="code-line"><span className="code-number">04</span><span>{'}'}</span></div>
            <span className="code-cursor" />
          </div>
          <div className="code-art-foot"><span className="presence-dot" /> 3 collaborators <span className="code-foot-right">all changes saved</span></div>
        </div>
        <p className="story-footer">MAKE GOOD THINGS, TOGETHER</p>
      </section>

      <section className="login-form-side">
        <div className="login-form-wrap">
          <p className="form-eyebrow">WELCOME BACK</p>
          <h2>Sign in to your account</h2>
          <p className="form-intro">Pick up right where you left off.</p>

          <form onSubmit={handleSubmit} className="login-form">
            {error && <p className="login-error" role="alert">{error}</p>}
            <label htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-label-row">
              <label htmlFor="login-password">Password</label>
            </div>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
              {!isSubmitting && <span aria-hidden="true">&#8594;</span>}
            </button>
          </form>

          <p className="register-prompt">New to the workspace? <Link to="/register">Create an account</Link></p>
          <div className="form-bottom"><span>COLLAB EDITOR</span><span>BUILT FOR THE WAY YOU THINK</span></div>
        </div>
      </section>
    </main>
  );
}
