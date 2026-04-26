import React from "react";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
    const user = JSON.parse(localStorage.getItem("user"));

  // ❌ Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // ❌ Not approved
  if (user.status !== "APPROVED") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">
            Waiting for Approval
          </h2>
          <p className="text-gray-600 mb-4">
            Your account is not approved yet. Please wait for admin approval.
          </p>

          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Logout
          </button>
        </div>
      </div>
    );
  }
// 🔥 ROLE CHECK
if (allowedRoles && !allowedRoles.includes(user.role)) {
  return <Navigate to="/" replace />;
}
  // ✅ Allowed
  return children;
}

export default ProtectedRoute;