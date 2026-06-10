import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  GitBranch,
  ShieldCheck,
  UserCog,
  User,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import api from "../../components/axios";

// ─── Constants ────────────────────────────────────────────────────────────────

const PLANS = ["BASIC", "PRO"];

const INITIAL_FORM = {
  companyName: "",
  subdomain: "",
  plan: "",
  branchName: "",
  adminUsername: "",
  adminPassword: "",
  managerUsername: "",
  managerPassword: "",
  cashierUsername: "",
  cashierPassword: "",
};

const REQUIRED_FIELDS = Object.keys(INITIAL_FORM);

// ─── Animation Variants ────────────────────────────────────────────────────────

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.38, ease: "easeOut" },
  }),
};

const alertVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 280, damping: 24 } },
  exit: { opacity: 0, y: -8, scale: 0.97, transition: { duration: 0.2 } },
};

// ─── Reusable Field Components ────────────────────────────────────────────────

const FieldLabel = ({ children, required }) => (
  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
    {children}
    {required && <span className="text-rose-400 ml-0.5">*</span>}
  </label>
);

const inputBase =
  "w-full px-4 py-2.5 rounded-xl border text-sm text-slate-800 bg-white placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 focus:border-[#7C5CFC] transition-all";

const inputError = "border-rose-300 bg-rose-50/40";
const inputNormal = "border-slate-200";

const TextField = ({ label, name, placeholder, value, onChange, error }) => (
  <div>
    <FieldLabel required>{label}</FieldLabel>
    <input
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      autoComplete="off"
      className={`${inputBase} ${error ? inputError : inputNormal}`}
    />
    {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
  </div>
);

const PasswordField = ({ label, name, placeholder, value, onChange, error, show, onToggle }) => (
  <div>
    <FieldLabel required>{label}</FieldLabel>
    <div className="relative">
      <input
        name={name}
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="new-password"
        className={`${inputBase} pr-11 ${error ? inputError : inputNormal}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
    {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
  </div>
);

const SelectField = ({ label, name, value, onChange, options, error }) => (
  <div>
    <FieldLabel required>{label}</FieldLabel>
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`${inputBase} appearance-none cursor-pointer ${error ? inputError : inputNormal} ${!value ? "text-slate-300" : "text-slate-800"}`}
      >
        <option value="" disabled>Select plan…</option>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-rose-500 mt-1 font-medium">{error}</p>}
  </div>
);

// ─── Section Card ─────────────────────────────────────────────────────────────

const SectionCard = ({ children, index, className = "" }) => (
  <motion.div
    custom={index}
    variants={sectionVariants}
    initial="hidden"
    animate="visible"
    className={`bg-white/70 backdrop-blur-sm rounded-2xl border border-white/80 shadow-sm p-6 h-full ${className}`}
  >
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, title, subtitle, color }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0 ${color}`}>
      <Icon size={17} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-800 leading-none">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────

export default function TenantCreation() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState({
    adminPassword: false,
    managerPassword: false,
    cashierPassword: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState("");

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const togglePass = (field) =>
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    const labels = {
      companyName: "Company name", subdomain: "Subdomain", plan: "Plan",
      branchName: "Branch name", adminUsername: "Admin username",
      adminPassword: "Admin password", managerUsername: "Manager username",
      managerPassword: "Manager password", cashierUsername: "Cashier username",
      cashierPassword: "Cashier password",
    };
    REQUIRED_FIELDS.forEach((key) => {
      if (!form[key].trim()) errs[key] = `${labels[key]} is required`;
    });
    if (form.subdomain && !/^[a-z0-9-]+$/.test(form.subdomain))
      errs.subdomain = "Only lowercase letters, numbers, and hyphens";
    return errs;
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccess(false);

    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.querySelector(`[name="${firstKey}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/tenant/onboard", form);
      setSuccess(true);
      setForm(INITIAL_FORM);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Something went wrong. Please try again.";
      setApiError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-8 lg:px-12"
      style={{
        fontFamily: "'DM Sans', system-ui, sans-serif",
        background: "linear-gradient(135deg, #f8f7ff 0%, #f0edff 50%, #f5f3ff 100%)",
      }}
    >
      {/* Decorative bg blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #7C5CFC, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #7C5CFC, transparent 70%)" }} />
      </div>

      <motion.div
        className="max-w-6xl mx-auto"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-7">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: "#7C5CFC", boxShadow: "0 8px 24px #7C5CFC44" }}
          >
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 leading-none">Tenant Onboarding</h1>
            <p className="text-sm text-slate-500 mt-0.5">Create a new restaurant account</p>
          </div>
        </div>

        
        {/* ── Alerts ── */}
        <AnimatePresence>
          {success && (
            <motion.div
              key="success"
              variants={alertVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-5 shadow-sm"
            >
              <CheckCircle2 size={20} className="text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-800">Tenant Created Successfully!</p>
                <p className="text-xs text-emerald-600 mt-0.5">The new restaurant account is ready to use.</p>
              </div>
            </motion.div>
          )}
          {apiError && (
            <motion.div
              key="error"
              variants={alertVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="flex items-center gap-3 px-5 py-4 bg-rose-50 border border-rose-200 rounded-2xl mb-5 shadow-sm"
            >
              <AlertCircle size={20} className="text-rose-600 flex-shrink-0" />
              <p className="text-sm font-semibold text-rose-800">{apiError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Form ── */}
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

          {/* ── ROW 1: Company Info (left) + Branch Info (right) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">

            {/* Company Information */}
            <SectionCard index={1}>
              <SectionHeader
                icon={Building2}
                title="Company Information"
                subtitle="Basic details about the restaurant"
                color="bg-[#7C5CFC]"
              />
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <TextField
                    label="Company Name"
                    name="companyName"
                    placeholder="e.g. MasalaRoast"
                    value={form.companyName}
                    onChange={handleChange}
                    error={errors.companyName}
                  />
                  <TextField
                    label="Subdomain"
                    name="subdomain"
                    placeholder="e.g. masalaroast"
                    value={form.subdomain}
                    onChange={handleChange}
                    error={errors.subdomain}
                  />
                </div>
                <SelectField
                  label="Plan"
                  name="plan"
                  value={form.plan}
                  onChange={handleChange}
                  options={PLANS}
                  error={errors.plan}
                />
                {form.subdomain && !errors.subdomain && (
                  <p className="text-xs text-slate-400 font-medium -mt-1">
                    🌐 Preview:{" "}
                    <span className="text-[#7C5CFC] font-semibold">
                      {form.subdomain}.iwansta.com
                    </span>
                  </p>
                )}
              </div>
            </SectionCard>

            {/* Branch Information */}
            <SectionCard index={2}>
              <SectionHeader
                icon={GitBranch}
                title="Branch Information"
                subtitle="Primary branch details"
                color="bg-blue-500"
              />
              <TextField
                label="Branch Name"
                name="branchName"
                placeholder="e.g. Main Branch"
                value={form.branchName}
                onChange={handleChange}
                error={errors.branchName}
              />
            </SectionCard>
          </div>

          {/* ── ROW 2: Admin + Manager + Cashier ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">

            {/* Admin Account */}
            <SectionCard index={3}>
              <SectionHeader
                icon={ShieldCheck}
                title="Admin Account"
                subtitle="Full access account"
                color="bg-violet-600"
              />
              <div className="flex flex-col gap-4">
                <TextField
                  label="Username"
                  name="adminUsername"
                  placeholder="e.g. admin_roast"
                  value={form.adminUsername}
                  onChange={handleChange}
                  error={errors.adminUsername}
                />
                <PasswordField
                  label="Password"
                  name="adminPassword"
                  placeholder="Strong password"
                  value={form.adminPassword}
                  onChange={handleChange}
                  error={errors.adminPassword}
                  show={showPass.adminPassword}
                  onToggle={() => togglePass("adminPassword")}
                />
              </div>
            </SectionCard>

            {/* Manager Account */}
            <SectionCard index={4}>
              <SectionHeader
                icon={UserCog}
                title="Manager Account"
                subtitle="Store operations access"
                color="bg-amber-500"
              />
              <div className="flex flex-col gap-4">
                <TextField
                  label="Username"
                  name="managerUsername"
                  placeholder="e.g. manager_roast"
                  value={form.managerUsername}
                  onChange={handleChange}
                  error={errors.managerUsername}
                />
                <PasswordField
                  label="Password"
                  name="managerPassword"
                  placeholder="Strong password"
                  value={form.managerPassword}
                  onChange={handleChange}
                  error={errors.managerPassword}
                  show={showPass.managerPassword}
                  onToggle={() => togglePass("managerPassword")}
                />
              </div>
            </SectionCard>

            {/* Cashier Account */}
            <SectionCard index={5}>
              <SectionHeader
                icon={User}
                title="Cashier Account"
                subtitle="POS terminal access"
                color="bg-emerald-500"
              />
              <div className="flex flex-col gap-4">
                <TextField
                  label="Username"
                  name="cashierUsername"
                  placeholder="e.g. cashier_roast"
                  value={form.cashierUsername}
                  onChange={handleChange}
                  error={errors.cashierUsername}
                />
                <PasswordField
                  label="Password"
                  name="cashierPassword"
                  placeholder="Strong password"
                  value={form.cashierPassword}
                  onChange={handleChange}
                  error={errors.cashierPassword}
                  show={showPass.cashierPassword}
                  onToggle={() => togglePass("cashierPassword")}
                />
              </div>
            </SectionCard>
          </div>

          {/* ── Submit Button ── */}
          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={{ scale: 0.985 }}
className="mx-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"            style={{
              background: submitting
                ? "#a78bfa"
                : "linear-gradient(135deg, #7C5CFC 0%, #9b7dfd 100%)",
              boxShadow: submitting ? "none" : "0 8px 28px #7C5CFC55",
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Creating Tenant…
              </>
            ) : (
              <>
                <Sparkles size={17} />
                Create Tenant
              </>
            )}
          </motion.button>

          <p className="text-center text-xs text-slate-400 pb-4">
            All fields are required. Credentials will be sent to the tenant admin.
          </p>
        </form>
      </motion.div>
    </div>
  );
}