import React, { useEffect, useState } from "react";
import axios from "axios";
import { Search, ShieldCheck, Clock3, ArrowLeft } from "lucide-react";

function RolesPermissions({ goBack }) {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [showPending, setShowPending] = useState(false);
  const [search, setSearch] = useState("");

  const fetchUsers = async () => {
    const res = await axios.get("http://localhost:8080/admin/users");
    setUsers(res.data);
  };

  const fetchPending = async () => {
    const res = await axios.get("http://localhost:8080/admin/pending-users");
    setPending(res.data);
  };

  useEffect(() => {
    fetchUsers();
    fetchPending();
  }, []);

  const approve = async (id) => {
    await axios.put(`http://localhost:8080/admin/approve/${id}`);
    fetchUsers();
    fetchPending();
  };

  const reject = async (id) => {
    await axios.put(`http://localhost:8080/admin/reject/${id}`);
    fetchPending();
  };

  const makeAdmin = async (id) => {
    await axios.put(`http://localhost:8080/admin/make-admin/${id}`);
    fetchUsers();
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <button
              onClick={goBack}
              className="flex items-center gap-2 text-blue-600 font-medium mb-2 hover:text-blue-800 transition"
            >
              <ArrowLeft size={16} />
              Settings
            </button>

            <h2 className="text-3xl font-bold text-slate-800">
              Roles & Permissions
            </h2>
            <p className="text-slate-500 mt-1">
              Invite collaborators and manage account roles
            </p>
          </div>

          <button
            onClick={() => setShowPending(!showPending)}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-lg hover:bg-blue-700 transition"
          >
            <Clock3 size={18} />
            Pending Approval ({pending.length})
          </button>
        </div>

        {/* Search */}
        {!showPending && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Search size={18} className="text-slate-500" />
            </div>
            <input
              type="text"
              placeholder="Search username..."
              className="bg-transparent outline-none w-full text-slate-700 placeholder:text-slate-400"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}

        {/* Users */}
        {!showPending && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl overflow-hidden">
            <div className="grid grid-cols-4 px-6 py-4 text-sm font-semibold text-slate-500 border-b border-white/30 bg-white/30">
              <span>Name</span>
              <span>Role</span>
              <span>Joined</span>
              <span>Actions</span>
            </div>

            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-4 px-6 py-4 items-center border-b border-white/20 hover:bg-white/30 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                    {u.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{u.username}</p>
                  </div>
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    u.role === "ADMIN"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-slate-200 text-slate-700"
                  }`}>
                    {u.role}
                  </span>
                </div>

                <div className="text-sm text-slate-500">
                  {u.createdAt ? new Date(u.createdAt).toDateString() : "-"}
                </div>

                <div>
                  {u.role !== "ADMIN" && (
                    <button
                      onClick={() => makeAdmin(u.id)}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 shadow-md transition"
                    >
                      Make Admin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending */}
        {showPending && (
          <div className="bg-white/60 backdrop-blur-xl border border-white/40 shadow-xl rounded-3xl overflow-hidden">
            <div className="px-6 py-4 font-semibold text-slate-700 border-b border-white/30 bg-white/30">
              Pending Requests ({pending.length})
            </div>

            {pending.length === 0 ? (
              <p className="p-6 text-slate-500">No pending users</p>
            ) : (
              pending.map((u) => (
                <div
                  key={u.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-6 py-4 border-b border-white/20 hover:bg-white/30 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-bold shadow-md">
                      {u.username.charAt(0).toUpperCase()}
                    </div>
                    <p className="font-semibold text-slate-800">{u.username}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(u.id)}
                      className="px-4 py-2 rounded-xl bg-green-500 text-white text-sm font-medium hover:bg-green-600 shadow-md transition"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => reject(u.id)}
                      className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 shadow-md transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RolesPermissions;