import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/Notfound";
import Ingestion from "./pages/Ingestion";
import Cleaning from "./pages/Cleaning";
import Transformation from "./pages/Transformation";
import Visualization from "./pages/Visualization";

import PublicLayout from "./layout/Publiclayout";
import ProtectedLayout from "./layout/ProtectedLayout";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes (no Navbar) */}
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Route>

          {/* Protected routes (with Navbar) */}
          <Route
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/ingestion" element={<Ingestion />} />
            <Route path="/cleaning" element={<Cleaning />} />
            <Route path="/transformation" element={<Transformation />} />
            <Route path="/visualization" element={<Visualization />} />
          </Route>

          {/* Other routes */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
