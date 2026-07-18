import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError(""); // clear the error as soon as the user edits
  };

  const handleLogin = async () => {
    // basic guard so we don't fire an empty request
    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      // show the server's message if there is one, otherwise a friendly fallback
      const message =
        err.response?.data?.message || "Invalid credentials. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // allow pressing Enter to submit
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-card border border-line p-8">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold text-brand">Momentum</span>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-1">Welcome back</h2>
        <p className="text-ink-muted text-center text-sm mb-6">
          Log in to continue to your dashboard.
        </p>

        {/* Error banner */}
        {error && (
          <div className="mb-4 rounded-lg bg-danger-soft text-danger text-sm px-3 py-2 text-center">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-soft mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="input"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </div>

        <p className="text-center text-sm text-ink-soft mt-6">
          Don't have an account?{" "}
          <Link to="/signup" className="text-brand font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;