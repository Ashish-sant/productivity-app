import { NavLink, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the navbar on the auth pages (login "/" and signup).
  // Logged-out users shouldn't see Dashboard/Tasks/Habits links.
  const hideOnRoutes = ["/", "/signup"];
  if (hideOnRoutes.includes(location.pathname)) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // NavLink gives us `isActive` for free — active page gets a highlight pill.
  const linkClass = ({ isActive }) =>
    [
      "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
      isActive
        ? "bg-white/15 text-white"
        : "text-mint-light hover:text-white hover:bg-white/10",
    ].join(" ");

  return (
    <nav className="bg-brand text-white">
      <div className="flex items-center justify-between px-8 py-3">
        {/* Brand mark */}
        <div className="flex items-center gap-2">
          <span className="text-xl">⚡</span>
          <span className="text-lg font-semibold">Momentum</span>
        </div>

        {/* Nav links + logout */}
        <div className="flex items-center gap-1">
          <NavLink to="/dashboard" className={linkClass}>
            Dashboard
          </NavLink>
          <NavLink to="/tasks" className={linkClass}>
            Tasks
          </NavLink>
          <NavLink to="/habits" className={linkClass}>
            Habits
          </NavLink>

          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium
                       bg-white/10 text-white transition-colors
                       hover:bg-danger"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;