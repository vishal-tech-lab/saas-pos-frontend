import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import api from "./axios";

function TenantLogin() {
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 120);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data } = await api.post("/auth/login", { username, password });

      if (data.role !== "TENANT_OWNER") {
        setError("Only Tenant Owners can login here.");
        return;
      }

      localStorage.setItem("tenant", data.tenantId);
      localStorage.setItem("user", JSON.stringify(data));
      navigate(`/login/${data.tenantId}`);
    } catch (err) {
      setError(err?.response?.data?.message || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  // FIX: use a plain string for "loaded" so CSS selectors like .loaded .authBg work
  const pageClass = `${styles.authPage}${isLoaded ? " loaded" : ""}`;

  return (
    <div className={pageClass}>
      <div className={styles.authBg} />
      <div className={styles.authOverlay} />

      <div className={styles.authWrapper}>
        <div className={styles.backgroundShape} />
        <div className={styles.secondaryShape} />

        {/* ── Login Form Panel ── */}
        <div className={`${styles.credentialsPanel} ${styles.signin}`}>
          <h2 className={styles.slideElement}>Tenant Login</h2>

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.inputField}
              />
              <label className={styles.fieldLabel}>Username</label>
            </div>

            {/* Password */}
            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.inputField}
              />
              <label className={styles.fieldLabel}>Password</label>
            </div>

            {/* Error message */}
            {error && (
              <div className={`${styles.inlineMessage} ${styles.error}`}>
                <span className={styles.msgIcon}>✖</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <button
                type="submit"
                disabled={loading}
                className={styles.submitButton}
              >
                {loading ? "Please wait..." : "Login"}
              </button>
            </div>
          </form>
        </div>

        {/* ── Branding Panel ── */}
        <div className={`${styles.welcomeSection} ${styles.signin}`}>
          <h2 className={styles.slideElement}>Welcome To</h2>
          <p className={styles.slideElement}>Tenant Owner Portal</p>
        </div>
      </div>
    </div>
  );
}

export default TenantLogin;