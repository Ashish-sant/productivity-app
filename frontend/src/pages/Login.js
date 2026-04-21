import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleLogin = async () => {
  try {
    const res = await API.post("/auth/login", formData);

    // Save token
    localStorage.setItem("token", res.data.token);

    
    navigate("/dashboard");

  } catch (error) {
    console.error(error.response?.data || error.message);
    
  }
};
  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <h2>Login</h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          style={styles.input}
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
        />

        <button style={styles.button} onClick={handleLogin}>
                  Login
        </button>

        <p>
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
  },
  box: {
    width: "300px",
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
  },
  button: {
    width: "100%",
    padding: "10px",
    background: "blue",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};

export default Login;