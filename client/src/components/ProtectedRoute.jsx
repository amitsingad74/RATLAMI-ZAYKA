import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {

  const token = localStorage.getItem("token");

  // If user is not logged in
  if (!token) {

    return <Navigate to="/login" replace />;

  }

  // User is logged in
  return children;

}

export default ProtectedRoute;