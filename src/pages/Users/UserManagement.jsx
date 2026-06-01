import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getUsers, createUser, updateUser, deleteUser, getBranches } from "../../services/userService";

const POPULAR_BRANCH_COUNT = 5;

const ROLES = [
  { value: "ROLE_ADMIN", label: "Admin", icon: "👑", color: "#7C5CFC" },
  { value: "ROLE_MANAGER", label: "Manager", icon: "🏢", color: "#0EA5E9" },
  { value: "ROLE_CASHIER", label: "Cashier", icon: "💳", color: "#10B981" },
  { value: "ROLE_KITCHEN", label: "Kitchen", icon: "👨‍🍳", color: "#F59E0B" },
];

const STATUSES = [
  { value: "APPROVED", label: "Approved", bg: "#D1FAE5", color: "#065F46", dot: "#10B981" },
  { value: "PENDING", label: "Pending", bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
  { value: "REJECTED", label: "Rejected", bg: "#FEE2E2", color: "#991B1B", dot: "#EF4444" },
];

const PAGE_SIZE = 6;

function getRole(val) {
  return ROLES.find((r) => r.value === val) || { label: val, color: "#888" };
}
function getStatus(val) {
  return STATUSES.find((s) => s.value === val) || { label: val, bg: "#eee", color: "#333", dot: "#999" };
}

/* ──────────────── TOAST ──────────────── */
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 32, left: "50%", transform: "translateX(-50%)",
      background: "#18181B", color: "#fff", borderRadius: 12, padding: "12px 24px",
      fontFamily: "'DM Sans', sans-serif", fontWeight: 500, fontSize: 14,
      display: "flex", alignItems: "center", gap: 10, zIndex: 9999,
      boxShadow: "0 8px 32px rgba(0,0,0,0.22)", animation: "slideUp .22s ease",
    }}>
      <span style={{ width: 20, height: 20, background: "#10B981", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</span>
      {message}
    </div>
  );
}

/* ──────────────── STATUS PILL ──────────────── */
function StatusPill({ value }) {
  const s = getStatus(value);
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 5 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
      {s.label}
    </span>
  );
}

/* ──────────────── ROLE BADGE ──────────────── */
function RoleBadge({ value }) {
  const r = getRole(value);
  return (
    <span style={{ background: r.color + "18", color: r.color, borderRadius: 8, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
      {r.label}
    </span>
  );
}

/* ──────────────── BRANCH PICKER ──────────────── */
function BranchPicker({ branches = [], selected, onChange }) {
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalQuery, setModalQuery] = useState("");
  const inputRef = useRef();

  const popular = branches.slice(0, POPULAR_BRANCH_COUNT);
  const popularFiltered = popular.filter((b) => b.name.toLowerCase().includes(query.toLowerCase()));
  const allFiltered = branches.filter((b) => b.name.toLowerCase().includes(modalQuery.toLowerCase()));

  const selectedBranch = selected ? branches.find((b) => b.id === selected) : null;

  function pick(branch) {
    onChange(branch.id);
    setModalOpen(false);
    setModalQuery("");
  }

  return (
    <>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748B", marginBottom: 8, letterSpacing: 0.3 }}>BRANCH</div>
        {selectedBranch && (
          <div style={{
            background: "linear-gradient(135deg, #7C5CFC18 0%, #7C5CFC08 100%)",
            border: "1.5px solid #7C5CFC55", borderRadius: 10, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
          }}>
            <span style={{ color: "#7C5CFC", fontSize: 16 }}>✓</span>
            <span style={{ fontWeight: 600, color: "#7C5CFC", fontSize: 14 }}>{selectedBranch.name}</span>
            <button onClick={() => onChange(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
          </div>
        )}

        <div style={{ position: "relative", marginBottom: 10 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8", fontSize: 15 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search branch…"
            style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
            onFocus={e => e.target.style.borderColor = "#7C5CFC"}
            onBlur={e => e.target.style.borderColor = "#E2E8F0"}
          />
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {popularFiltered.map(b => (
            <button key={b.id} onClick={() => pick(b)} style={{
              padding: "8px 14px", borderRadius: 10, border: selected === b.id ? "1.5px solid #7C5CFC" : "1.5px solid #E2E8F0",
              background: selected === b.id ? "#7C5CFC" : "#F8FAFC", color: selected === b.id ? "#fff" : "#374151",
              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              transition: "all .15s",
            }}>
              {b.name}
            </button>
          ))}
        </div>

        <button onClick={() => setModalOpen(true)} style={{
          background: "none", border: "none", color: "#7C5CFC", fontWeight: 600, fontSize: 13,
          cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "4px 0",
        }}>
          + More Branches
        </button>
      </div>

      {/* Branch Modal */}
      {modalOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(15,15,30,0.55)", zIndex: 8000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }} onClick={() => setModalOpen(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 18, width: "100%", maxWidth: 420,
            boxShadow: "0 24px 64px rgba(124,92,252,0.18)", overflow: "hidden",
            fontFamily: "'DM Sans', sans-serif", animation: "scaleIn .18s ease",
          }}>
            <div style={{ padding: "20px 20px 0", borderBottom: "1px solid #F1F5F9" }}>
              <div style={{ fontWeight: 700, fontSize: 17, color: "#0F172A", marginBottom: 14 }}>Select Branch</div>
              <div style={{ position: "relative", marginBottom: 14 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
                <input
                  autoFocus
                  value={modalQuery}
                  onChange={e => setModalQuery(e.target.value)}
                  placeholder="Search branch…"
                  style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>
            </div>
            <div style={{ maxHeight: 300, overflowY: "auto", padding: "8px 0" }}>
              {allFiltered.map(b => (
                <button key={b.id} onClick={() => pick(b)} style={{
                  width: "100%", padding: "13px 20px", background: selected === b.id ? "#7C5CFC0D" : "transparent",
                  border: "none", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                  fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: selected === b.id ? "#7C5CFC" : "#1E293B",
                  fontWeight: selected === b.id ? 600 : 400,
                }}>
                  {selected === b.id && <span style={{ color: "#7C5CFC", fontWeight: 700 }}>✓</span>}
                  {b.name}
                </button>
              ))}
              {allFiltered.length === 0 && (
                <div style={{ padding: "20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>No branches found</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ──────────────── DELETE CONFIRM ──────────────── */
function DeleteConfirm({ user, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,15,30,0.55)", zIndex: 8000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: "#fff", borderRadius: 18, width: "100%", maxWidth: 380,
        padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.14)", fontFamily: "'DM Sans', sans-serif",
        animation: "scaleIn .18s ease",
      }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>🗑️</div>
        <div style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", marginBottom: 8 }}>Delete User</div>
        <div style={{ color: "#64748B", fontSize: 14, marginBottom: 24, lineHeight: 1.6 }}>
          Are you sure you want to delete <strong>{user.username}</strong>? This action cannot be undone.
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "12px", borderRadius: 10, border: "1.5px solid #E2E8F0", background: "#fff",
            color: "#374151", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>Cancel</button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "12px", borderRadius: 10, border: "none", background: "#EF4444",
            color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
          }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── USER MODAL ──────────────── */
function UserModal({ editUser, onClose, onSave, branches }) {
  const [form, setForm] = useState(
    editUser
      ? { username: editUser.username, password: "", role: editUser.role, branchId: editUser.branchId, status: editUser.status }
      : { username: "", password: "", role: "", branchId: null, status: "APPROVED" }
  );
  const [errors, setErrors] = useState({});

  function set(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  }

  function validate() {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    if (!editUser && !form.password.trim()) e.password = "Password is required";
    if (!form.role) e.role = "Please select a role";
    if (!form.branchId) e.branchId = "Please select a branch";
    if (!form.status) e.status = "Please select a status";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function submit() {
    if (!validate()) return;
    onSave({ ...form, id: editUser?.id });
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,15,30,0.55)", zIndex: 7000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto",
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520,
        boxShadow: "0 24px 80px rgba(124,92,252,0.22)", fontFamily: "'DM Sans', sans-serif",
        animation: "scaleIn .2s ease", margin: "auto",
      }}>
        {/* Modal Header */}
        <div style={{ padding: "22px 24px 18px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#0F172A" }}>{editUser ? "Edit User" : "Add New User"}</div>
            <div style={{ fontSize: 13, color: "#94A3B8", marginTop: 2 }}>{editUser ? "Update staff account details" : "Create a new staff account"}</div>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: "50%", border: "none", background: "#F1F5F9", cursor: "pointer", fontSize: 18, color: "#64748B", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>

        <div style={{ padding: "22px 24px" }}>
          {/* Username */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Username</label>
            <input
              value={form.username}
              onChange={e => set("username", e.target.value)}
              placeholder="e.g. cashier_raj"
              style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${errors.username ? "#EF4444" : "#E2E8F0"}`, borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
              onFocus={e => e.target.style.borderColor = "#7C5CFC"}
              onBlur={e => e.target.style.borderColor = errors.username ? "#EF4444" : "#E2E8F0"}
            />
            {errors.username && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.username}</div>}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
              Password {editUser && <span style={{ color: "#94A3B8", fontWeight: 400 }}>(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={e => set("password", e.target.value)}
              placeholder={editUser ? "Enter new password" : "Enter password"}
              style={{ width: "100%", padding: "11px 14px", border: `1.5px solid ${errors.password ? "#EF4444" : "#E2E8F0"}`, borderRadius: 10, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "'DM Sans', sans-serif" }}
              onFocus={e => e.target.style.borderColor = "#7C5CFC"}
              onBlur={e => e.target.style.borderColor = errors.password ? "#EF4444" : "#E2E8F0"}
            />
            {errors.password && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.password}</div>}
          </div>

          {/* Role */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Role</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {ROLES.map(r => (
                <button key={r.value} onClick={() => set("role", r.value)} style={{
                  padding: "8px 14px", borderRadius: 20, border: `1.5px solid ${form.role === r.value ? r.color : "#E2E8F0"}`,
                  background: form.role === r.value ? r.color : "#F8FAFC",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  display: "flex", alignItems: "center", gap: 6,
                  transition: "all .15s",
                }}>
                  <span style={{ fontSize: 14 }}>{r.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: form.role === r.value ? "#fff" : "#374151" }}>{r.label}</span>
                </button>
              ))}
            </div>
            {errors.role && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>{errors.role}</div>}
          </div>

          {/* Branch Picker */}
          <div style={{ marginBottom: 18 }}>
            <BranchPicker branches={branches} selected={form.branchId} onChange={v => set("branchId", v)} />
            {errors.branchId && <div style={{ color: "#EF4444", fontSize: 12, marginTop: 4 }}>{errors.branchId}</div>}
          </div>

          {/* Status */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>Status</div>
            <div style={{ display: "flex", gap: 6 }}>
              {STATUSES.map(s => (
                <button key={s.value} onClick={() => set("status", s.value)} style={{
                  padding: "7px 14px", borderRadius: 20, border: `1.5px solid ${form.status === s.value ? s.dot : "#E2E8F0"}`,
                  background: form.status === s.value ? s.bg : "#F8FAFC",
                  cursor: "pointer", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 12,
                  color: form.status === s.value ? s.color : "#64748B",
                  display: "flex", alignItems: "center", gap: 5,
                  transition: "all .15s",
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button onClick={submit} style={{
            width: "100%", padding: "15px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
            color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer",
            fontFamily: "'DM Sans', sans-serif", letterSpacing: 0.3,
            boxShadow: "0 4px 16px rgba(124,92,252,0.35)", transition: "transform .1s, box-shadow .1s",
          }}
            onMouseDown={e => { e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={e => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            {editUser ? "Save Changes" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ──────────────── MAIN PAGE ──────────────── */
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | "add" | {editUser}
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const branchName = useCallback(
    (branchId) => branches.find((b) => b.id === branchId)?.name || "—",
    [branches]
  );

  const loadUsers = useCallback(async () => {
    try {
      setErrorMessage("");
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to load users.");
      setToast("Unable to load users");
    }
  }, []);

  const loadBranches = useCallback(async () => {
    try {
      setErrorMessage("");
      const data = await getBranches();
      const normalized = Array.isArray(data)
        ? data.map((b) => ({ id: b.branchid, name: b.branchname }))
        : [];
      setBranches(normalized);
    } catch (err) {
      console.error(err);
      setErrorMessage("Unable to load branches.");
      setToast("Unable to load branches");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    loadUsers().finally(() => setLoading(false));
  }, [loadUsers]);

  useEffect(() => {
    setLoading(true);
    loadBranches().finally(() => setLoading(false));
  }, [loadBranches]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const branchLabel = (u.branchName || branchName(u.branchId) || "").toLowerCase();
      const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) ||
        branchLabel.includes(search.toLowerCase());
      const matchRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchStatus = statusFilter === "ALL" || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter, branchName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

  async function handleSave(form) {
    setLoading(true);
    try {
      if (form.id) {
        const payload = {
          username: form.username,
          role: form.role,
          branchId: form.branchId,
          status: form.status,
        };
        if (form.password?.trim()) payload.password = form.password;
        await updateUser(form.id, payload);
        setToast("User updated successfully");
      } else {
        await createUser({
          username: form.username,
          password: form.password,
          role: form.role,
          status: form.status,
          branchId: form.branchId,
        });
        setToast("User created successfully");
      }
      setModal(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setToast("Unable to save user");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setLoading(true);
    try {
      await deleteUser(id);
      setToast("User deleted successfully");
      setDeleteTarget(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      setToast("Unable to delete user");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(12px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #F4F3FF; font-family: 'DM Sans', sans-serif; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #C7BCFC; border-radius: 4px; }
        tr:hover td { background: #7C5CFC06 !important; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#F4F3FF", fontFamily: "'DM Sans', sans-serif" }}>
        {/* Top Nav Bar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #EDE9FE", padding: "0 24px", display: "flex", alignItems: "center", height: 56 }}>
          <div style={{ fontWeight: 800, fontSize: 18, color: "#7C5CFC", letterSpacing: -0.5 }}>NextGen<span style={{ color: "#0F172A" }}>POS</span></div>
          <div style={{ marginLeft: 32, display: "flex", gap: 4 }}>
            {["Dashboard", "Orders", "Users", "Settings"].map(nav => (
              <div key={nav} style={{ padding: "8px 16px", borderRadius: 8, background: nav === "Users" ? "#7C5CFC15" : "transparent", color: nav === "Users" ? "#7C5CFC" : "#64748B", fontSize: 13, fontWeight: nav === "Users" ? 700 : 500, cursor: "pointer" }}>{nav}</div>
            ))}
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 20px" }}>
          {/* Page Header */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontWeight: 800, fontSize: 26, color: "#0F172A", letterSpacing: -0.5, marginBottom: 4 }}>User Management</h1>
              <p style={{ color: "#64748B", fontSize: 14 }}>Manage staff accounts and permissions across all branches</p>
            </div>
            <button onClick={() => setModal("add")} style={{
              padding: "12px 22px", borderRadius: 12, border: "none",
              background: "linear-gradient(135deg, #7C5CFC 0%, #6046E0 100%)",
              color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 8,
              boxShadow: "0 4px 16px rgba(124,92,252,0.32)", whiteSpace: "nowrap",
            }}>
              <span style={{ fontSize: 18 }}>+</span> Add User
            </button>
          </div>

          {/* Stats Row */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { label: "Total Users", value: users.length, color: "#7C5CFC", bg: "#F4F3FF" },
              { label: "Active", value: users.filter(u => u.status === "APPROVED").length, color: "#10B981", bg: "#F0FDF4" },
              { label: "Pending", value: users.filter(u => u.status === "PENDING").length, color: "#F59E0B", bg: "#FFFBEB" },
              { label: "Branches", value: branches.length, color: "#0EA5E9", bg: "#F0F9FF" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "6px 14px", border: `1px solid ${s.color}22`, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 12, color: "#64748B", fontWeight: 500 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Filters */}
          {errorMessage && (
            <div style={{ width: "100%", background: "#FEE2E2", borderRadius: 12, padding: "12px 16px", color: "#B91C1C", border: "1px solid #FECACA", marginBottom: 12 }}>
              {errorMessage}
            </div>
          )}
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", marginBottom: 14, border: "1px solid #EDE9FE", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <div style={{ position: "relative", flex: "1 1 220px" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}>🔍</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search users or branches…"
                style={{ width: "100%", padding: "10px 12px 10px 36px", border: "1.5px solid #E2E8F0", borderRadius: 10, fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif" }}
                onFocus={e => e.target.style.borderColor = "#7C5CFC"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"}
              />
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["ALL", ...ROLES.map(r => r.value)].map(r => {
                const role = ROLES.find(x => x.value === r);
                return (
                  <button key={r} onClick={() => setRoleFilter(r)} style={{
                    padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${roleFilter === r ? "#7C5CFC" : "#E2E8F0"}`,
                    background: roleFilter === r ? "#7C5CFC" : "#F8FAFC",
                    color: roleFilter === r ? "#fff" : "#374151",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {r === "ALL" ? "All Roles" : (role?.label || r)}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {["ALL", "APPROVED", "PENDING", "REJECTED"].map(s => {
                const st = getStatus(s);
                return (
                  <button key={s} onClick={() => setStatusFilter(s)} style={{
                    padding: "8px 14px", borderRadius: 9, border: `1.5px solid ${statusFilter === s ? (s === "ALL" ? "#7C5CFC" : st.dot) : "#E2E8F0"}`,
                    background: statusFilter === s ? (s === "ALL" ? "#7C5CFC" : st.bg) : "#F8FAFC",
                    color: statusFilter === s ? (s === "ALL" ? "#fff" : st.color) : "#374151",
                    fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                  }}>
                    {s === "ALL" ? "All Status" : st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #EDE9FE", overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "#FAFAFF" }}>
                    {["Username", "Role", "Branch", "Status", "Actions"].map((col, i) => (
                      <th key={col} style={{
                        padding: "13px 18px", textAlign: i === 4 ? "center" : "left", fontSize: 12,
                        fontWeight: 700, color: "#94A3B8", letterSpacing: 0.5,
                        borderBottom: "1px solid #F1F5F9",
                      }}>{col.toUpperCase()}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} style={{ padding: "48px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                      Loading users...
                    </td></tr>
                  ) : paginated.length === 0 ? (
                    <tr><td colSpan={5} style={{ padding: "48px 20px", textAlign: "center", color: "#94A3B8", fontSize: 14 }}>
                      No users found matching your filters
                    </td></tr>
                  ) : paginated.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid #F8FAFC" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: "50%",
                            background: `${getRole(u.role).color}20`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 12, color: getRole(u.role).color,
                          }}>
                            {u.username.slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{u.username}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px" }}><RoleBadge value={u.role} /></td>
                      <td style={{ padding: "14px 18px", color: "#374151", fontSize: 14 }}>{u.branchName || branchName(u.branchId)}</td>
                      <td style={{ padding: "14px 18px" }}><StatusPill value={u.status} /></td>
                      <td style={{ padding: "14px 18px", textAlign: "center" }}>
                        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                          <button onClick={() => setModal({ editUser: u })} style={{
                            padding: "7px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC",
                            color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5,
                          }}>✏️ Edit</button>
                          <button onClick={() => setDeleteTarget(u)} style={{
                            padding: "7px 14px", borderRadius: 8, border: "1.5px solid #FEE2E2", background: "#FEF2F2",
                            color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5,
                          }}>🗑️ Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ padding: "14px 18px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div style={{ color: "#94A3B8", fontSize: 13 }}>
                  Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                    padding: "7px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC",
                    color: page === 1 ? "#CBD5E1" : "#374151", fontSize: 13, fontWeight: 600, cursor: page === 1 ? "default" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)} style={{
                      width: 34, height: 34, borderRadius: 8, border: `1.5px solid ${p === page ? "#7C5CFC" : "#E2E8F0"}`,
                      background: p === page ? "#7C5CFC" : "#F8FAFC",
                      color: p === page ? "#fff" : "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                    }}>{p}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                    padding: "7px 14px", borderRadius: 8, border: "1.5px solid #E2E8F0", background: "#F8FAFC",
                    color: page === totalPages ? "#CBD5E1" : "#374151", fontSize: 13, fontWeight: 600, cursor: page === totalPages ? "default" : "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {(modal === "add" || modal?.editUser) && (
        <UserModal
          editUser={modal?.editUser || null}
          branches={branches}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          user={deleteTarget}
          onConfirm={() => handleDelete(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}