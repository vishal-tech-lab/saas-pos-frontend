import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {

  const navigate = useNavigate();

  const user =
    JSON.parse(
      localStorage.getItem("user")
    );

 useEffect(() => {

  if (!user) {

    navigate("/");

  }

}, [user, navigate]);

  if (!user) return null;

 const handleLogout = () => {

  localStorage.clear();

  navigate("/");

};
  return (

    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">

      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <div className="flex flex-col items-center mb-6">

          <div className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center text-3xl font-bold shadow">

            {user.username?.charAt(0).toUpperCase()}

          </div>

          <h2 className="mt-3 text-2xl font-bold text-black">

            {user.username}

          </h2>

        </div>

        <div className="flex justify-center gap-3 mb-6">

          <span className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-600 font-semibold">

            {user.role}

          </span>

          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              user.status === "APPROVED"
                ? "bg-green-100 text-green-600"
                : "bg-yellow-100 text-yellow-600"
            }`}
          >
            {user.status}
          </span>

        </div>

        <div className="text-center mb-6 text-gray-600 text-sm">

          {user.role === "ROLE_ADMIN" ? (

            <p className="text-green-600 font-medium">

              You have full system access 🔥

            </p>

          ) : (

            <p>

              Limited access account.
              Contact admin for permissions.

            </p>

          )}

        </div>

        <div className="flex flex-col gap-3">

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition"
          >
            Go to Dashboard
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>

        </div>

      </div>

    </div>
  );
}

export default Profile;