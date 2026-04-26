import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Setting() {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h2 className="text-xl font-semibold mb-4">General</h2>

      <div className="bg-white rounded-xl shadow divide-y">

        {/* ROLES */}
        <div
          onClick={() => navigate("/dashboard/settings/collaborators")}
          className="flex justify-between items-center p-5 hover:bg-gray-50 cursor-pointer"
        >
          <div>
            <h3 className="font-semibold text-lg">Roles & permissions</h3>
            <p className="text-sm text-gray-500">
              Invite collaborators and manage roles & permissions.
            </p>
          </div>
          <ChevronRight />
        </div>

        {/* BUSINESS */}
        <div className="flex justify-between items-center p-5 hover:bg-gray-50 cursor-pointer">
          <div>
            <h3 className="font-semibold text-lg">Business info</h3>
            <p className="text-sm text-gray-500">
              Set your business name, logo, and contact info.
            </p>
          </div>
          <ChevronRight />
        </div>

        {/* MOBILE */}
        <div className="flex justify-between items-center p-5 hover:bg-gray-50 cursor-pointer">
          <div>
            <h3 className="font-semibold text-lg">Mobile app</h3>
            <p className="text-sm text-gray-500">
              Manage login access & app preferences.
            </p>
          </div>
          <ChevronRight />
        </div>

        {/* LANGUAGE */}
        <div className="flex justify-between items-center p-5 hover:bg-gray-50 cursor-pointer">
          <div>
            <h3 className="font-semibold text-lg">Language & region</h3>
            <p className="text-sm text-gray-500">
              Set language, region, and currency.
            </p>
          </div>
          <ChevronRight />
        </div>

        {/* STORAGE */}
        <div className="flex justify-between items-center p-5 hover:bg-gray-50 cursor-pointer">
          <div>
            <h3 className="font-semibold text-lg">Manage storage</h3>
            <p className="text-sm text-gray-500">
              Check usage or upgrade storage plan.
            </p>
          </div>
          <ChevronRight />
        </div>

      </div>
    </div>
  );
}

export default Setting;