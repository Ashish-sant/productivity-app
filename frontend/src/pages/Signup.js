import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
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
    if (error) setError("");
  };

  const handleSignup = async () => {
    // basic guards
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await API.post("/auth/register", formData);

      // Account created — send them to login to sign in.
      // (passing state so the login page can show a success note)
      navigate("/", { state: { justRegistered: true } });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Could not create account. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-card border border-line p-8">
        {/* Brand mark */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-2xl">⚡</span>
          <span className="text-xl font-semibold text-brand">Momentum</span>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-1">
          Create your account
        </h2>
        <p className="text-ink-muted text-center text-sm mb-6">
          Start tracking your tasks and habits.
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
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Ashish Kumar"
              value={formData.name}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="input"
            />
          </div>

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
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              className="input"
            />
          </div>

          <button
            onClick={handleSignup}
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </div>

        <p className="text-center text-sm text-ink-soft mt-6">
          Already have an account?{" "}
          <Link to="/" className="text-brand font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;