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

// ─── Sub-components ────────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle, color, index }) => (
  <motion.div
    custom={index}
    variants={sectionVariants}
    initial="hidden"
    animate="visible"
    className="flex items-center gap-3 mb-5"
  >
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm ${color}`}>
      <Icon size={17} className="text-white" />
    </div>
    <div>
      <p className="text-sm font-bold text-slate-800 leading-none">{title}</p>
      {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
    </div>
  </motion.div>
);

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

const TextField = ({ label, name, placeholder, value, onChange, error, required = true }) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
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

const PasswordField = ({ label, name, placeholder, value, onChange, error, show, onToggle, required = true }) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
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

const SelectField = ({ label, name, value, onChange, options, error, required = true }) => (
  <div>
    <FieldLabel required={required}>{label}</FieldLabel>
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

const Divider = () => <div className="border-t border-slate-100 my-6" />;

// ─── Section Card ─────────────────────────────────────────────────────────────

const SectionCard = ({ children, index }) => (
  <motion.div
    custom={index}
    variants={sectionVariants}
    initial="hidden"
    animate="visible"
    className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white shadow-sm p-6"
  >
    {children}
  </motion.div>
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
    REQUIRED_FIELDS.forEach((key) => {
      if (!form[key].trim()) {
        const labels = {
          companyName: "Company name",
          subdomain: "Subdomain",
          plan: "Plan",
          branchName: "Branch name",
          adminUsername: "Admin username",
          adminPassword: "Admin password",
          managerUsername: "Manager username",
          managerPassword: "Manager password",
          cashierUsername: "Cashier username",
          cashierPassword: "Cashier password",
        };
        errs[key] = `${labels[key]} is required`;
      }
    });
    // Subdomain: lowercase alphanumeric + hyphens only
    if (form.subdomain && !/^[a-z0-9-]+$/.test(form.subdomain)) {
      errs.subdomain = "Only lowercase letters, numbers, and hyphens";
    }
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
      // Scroll to first error
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
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{
        fontFamily: "'DM Sans', sans-serif",
        background: "linear-gradient(135deg, #f8f7ff 0%, #f0edff 50%, #f5f3ff 100%)",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Decorative bg blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-20" style={{ background: "radial-gradient(circle, #7C5CFC, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #7C5CFC, transparent 70%)" }} />
      </div>

      <motion.div
        className="max-w-2xl mx-auto"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
      >
        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg"
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
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

          {/* 1 · Company Information */}
          <SectionCard index={1}>
            <SectionHeader
              icon={Building2}
              title="Company Information"
              subtitle="Basic details about the restaurant"
              color="bg-[#7C5CFC]"
              index={1}
            />
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
            <div className="mt-4">
              <SelectField
                label="Plan"
                name="plan"
                value={form.plan}
                onChange={handleChange}
                options={PLANS}
                error={errors.plan}
              />
            </div>
            {form.subdomain && !errors.subdomain && (
              <p className="text-xs text-slate-400 mt-2 font-medium">
                🌐 Preview:{" "}
                <span className="text-[#7C5CFC] font-semibold">
                  {form.subdomain}.iwansta.com
                </span>
              </p>
            )}
          </SectionCard>

          {/* 2 · Branch Information */}
          <SectionCard index={2}>
            <SectionHeader
              icon={GitBranch}
              title="Branch Information"
              subtitle="Primary branch details"
              color="bg-blue-500"
              index={2}
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

          {/* 3 · Admin Account */}
          <SectionCard index={3}>
            <SectionHeader
              icon={ShieldCheck}
              title="Admin Account"
              subtitle="Full access account"
              color="bg-violet-600"
              index={3}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Admin Username"
                name="adminUsername"
                placeholder="e.g. admin_roast"
                value={form.adminUsername}
                onChange={handleChange}
                error={errors.adminUsername}
              />
              <PasswordField
                label="Admin Password"
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

          {/* 4 · Manager Account */}
          <SectionCard index={4}>
            <SectionHeader
              icon={UserCog}
              title="Manager Account"
              subtitle="Store operations access"
              color="bg-amber-500"
              index={4}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Manager Username"
                name="managerUsername"
                placeholder="e.g. manager_roast"
                value={form.managerUsername}
                onChange={handleChange}
                error={errors.managerUsername}
              />
              <PasswordField
                label="Manager Password"
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

          {/* 5 · Cashier Account */}
          <SectionCard index={5}>
            <SectionHeader
              icon={User}
              title="Cashier Account"
              subtitle="POS terminal access"
              color="bg-emerald-500"
              index={5}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextField
                label="Cashier Username"
                name="cashierUsername"
                placeholder="e.g. cashier_roast"
                value={form.cashierUsername}
                onChange={handleChange}
                error={errors.cashierUsername}
              />
              <PasswordField
                label="Cashier Password"
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

          {/* ── Submit ── */}
          <motion.button
            type="submit"
            disabled={submitting}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl text-white text-base font-bold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-xl mt-1"
            style={{
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