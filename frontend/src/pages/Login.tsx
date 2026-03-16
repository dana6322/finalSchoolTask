import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [localError, setLocalError] = useState("");
  const { login, googleLogin, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");

    if (!email || !password) {
      setLocalError("Email and password are required");
      return;
    }

    try {
      await login(email, password);
      navigate("/");
    } catch {
      setLocalError(error || "Login failed");
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    setLocalError("");
    if (!credentialResponse.credential) {
      setLocalError("Google login failed - no credential received");
      return;
    }
    try {
      await googleLogin(credentialResponse.credential);
      navigate("/");
    } catch {
      setLocalError(error || "Google login failed");
    }
  };

  const handleGoogleLoginError = () => {
    setLocalError("Google login failed");
  };

  return (
    <div className="auth-page">
      <div className="auth-card card shadow-lg">
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <div
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "var(--primary)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.2rem",
              }}
            >
              S
            </div>
            <h2 className="fw-bold">Welcome Back</h2>
            <p className="text-muted">Sign in to your SocialHub account</p>
          </div>

          {(localError || error) && (
            <div className="alert alert-danger" role="alert">
              {localError || error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className="form-control"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100 mb-3"
              disabled={isLoading}
              style={{ borderRadius: "10px", padding: "10px" }}
            >
              {isLoading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1" />
            <span className="mx-3 text-muted" style={{ fontSize: "0.85rem" }}>
              or
            </span>
            <hr className="flex-grow-1" />
          </div>

          <div className="d-flex justify-content-center mb-3">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleGoogleLoginError}
            />
          </div>

          <p className="text-center text-muted mb-0">
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
