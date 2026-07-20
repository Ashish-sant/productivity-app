import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Tasks from "./pages/Tasks";
import Habits from "./pages/Habits";
import FocusLab from "./pages/FocusLab";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      {/* min-h-screen lets the global bg-sage-lighter (from index.css) show through */}
      <div className="min-h-screen">
        <Navbar />

        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />

          <Route
            path="/habits"
            element={
              <ProtectedRoute>
                <Habits />
              </ProtectedRoute>
            }
          />

          <Route
            path="/focus-lab"
            element={
              <ProtectedRoute>
                <FocusLab />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;