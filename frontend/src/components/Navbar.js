import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "15px 30px",
      backgroundColor: "#111827",
      color: "white"
    }}>
      <h2>⚡ Productivity App</h2>

      <div>
        <Link to="/dashboard" style={linkStyle}>Dashboard</Link>
        <Link to="/tasks" style={linkStyle}>Tasks</Link>
        <Link to="/habits" style={linkStyle}>Habits</Link>

        <button onClick={handleLogout} style={logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
};

const linkStyle = {
  color: "white",
  marginRight: "15px",
  textDecoration: "none",
};

const logoutBtn = {
  backgroundColor: "#ef4444",
  color: "white",
  border: "none",
  padding: "6px 10px",
  cursor: "pointer",
  borderRadius: "4px"
};

export default Navbar;