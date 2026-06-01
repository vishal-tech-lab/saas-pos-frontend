import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import styles from "./Auth.module.css";
import api from "./axios";

function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function InputField({ label, type, value, onChange, showPassword, onTogglePassword, autoFocus = false, disabled = false }) {
  const isPassword = type === "password";
  const resolvedType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
      <input
        className={styles.inputField}
        type={resolvedType}
        required
        value={value}
        onChange={onChange}
        autoFocus={autoFocus}
        disabled={disabled}
      />
      <label className={styles.fieldLabel}>{label}</label>
      {isPassword ? (
        <button type="button" className={styles.eyeToggle} onClick={onTogglePassword} tabIndex={-1} disabled={disabled}>
          {showPassword ? <EyeOffIcon className={styles.fieldIcon} /> : <EyeIcon className={styles.fieldIcon} />}
        </button>
      ) : (
        <UserIcon className={styles.fieldIcon} />
      )}
    </div>
  );
}

function InlineMessage({ msg }) {
  if (!msg.text) return null;
  return (
    <div className={`${styles.inlineMessage} ${styles[msg.type]}`}>
      <span className={styles.msgIcon}>{msg.type === "success" ? "✓" : "✕"}</span>
      {msg.text}
    </div>
  );
}

const EMPTY_MSG = { text: "", type: "" };

function useFlashMessage() {
  const [msg, setMsg] = useState(EMPTY_MSG);
  const timerRef = useRef(null);

  const flash = (text, type, duration = 3000) => {
    clearTimeout(timerRef.current);
    setMsg({ text, type });
    if (type !== "success") {
      timerRef.current = setTimeout(() => setMsg(EMPTY_MSG), duration);
    }
  };

  return [msg, flash];
}

function Auth() {
  const navigate = useNavigate();
  const { tenantId } = useParams();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // authMsg  → signin form only
  // signupMsg → signup form only
  const [authMsg, flashAuth] = useFlashMessage();
  const [signupMsg, flashSignup] = useFlashMessage();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setShowPassword(false);
  }, [isSignup]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem("tenant", tenantId);
      const { data } = await api.post("/auth/login", { username: email, password });
      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("currentUser", data.username || data.email || "");
      localStorage.setItem("role", data.role || "");
      localStorage.setItem("currentBranch", data.branchName || data.branch || data.branchname || "");

      flashAuth("Login successful. Redirecting...", "success");

      setTimeout(() => {
        if (data.role === "ROLE_ADMIN" || data.role === "ROLE_MANAGER") {
          navigate("/dashboard", { replace: true });
        } else if (data.role === "ROLE_CASHIER") {
          navigate("/pos", { replace: true });
        } else if (data.role === "ROLE_KITCHEN") {
          navigate("/kitchen", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }, 700);
    } catch (err) {
      flashAuth(err?.response?.data?.message || "Sign in failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      localStorage.setItem("tenant", tenantId);
      await api.post("/auth/signup", { username: email, password });
      flashSignup("Signup successful. Please sign in.", "success");
      setIsSignup(false);
    } catch (err) {
      flashSignup(err?.response?.data?.message || "Signup failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.authPage}${isLoaded ? " loaded" : ""}${isSignup ? " toggled" : ""}`}>
      <div className={styles.authBg} />
      <div className={styles.authOverlay} />

      <div className={styles.authWrapper}>
        <div className={styles.backgroundShape} />
        <div className={styles.secondaryShape} />

        {/* ── Sign In Form Panel ── */}
        <div className={`${styles.credentialsPanel} ${styles.signin}`}>
          <h2 className={styles.slideElement}>Sign In</h2>
          <form onSubmit={handleLogin}>
            <InputField
              label="Username" type="text" value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus disabled={loading}
            />
            <InputField
              label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
              disabled={loading}
            />

            {/* ✅ authMsg — login errors/success only */}
            <InlineMessage msg={authMsg} />

            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <button className={styles.submitButton} type="submit" disabled={loading}>
                {loading ? "Please wait..." : "Sign In"}
              </button>
            </div>
          </form>
          <div className={`${styles.switchLink} ${styles.slideElement}`}>
            <p>
              Don't have an account?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(true); }}>
                Sign Up
              </a>
            </p>
          </div>
        </div>

        {/* ── Sign In Welcome Panel ── */}
        <div className={`${styles.welcomeSection} ${styles.signin}`}>
          <h2 className={styles.slideElement}>WELCOME BACK!</h2>
          <p className={styles.slideElement}>Login to continue managing your dashboard.</p>
        </div>

        {/* ── Sign Up Welcome Panel ── */}
        <div className={`${styles.welcomeSection} ${styles.signup}`}>
          <h2 className={styles.slideElement}>HELLO!</h2>
          <p className={styles.slideElement}>Create your admin account for your tenant.</p>
        </div>

        {/* ── Sign Up Form Panel ── */}
        <div className={`${styles.credentialsPanel} ${styles.signup}`}>
          <h2 className={styles.slideElement}>Sign Up</h2>
          <form onSubmit={handleSignup}>
            <InputField
              label="Username" type="text" value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
            <InputField
              label="Password" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((p) => !p)}
              disabled={loading}
            />

            {/* ✅ signupMsg — signup errors/success only */}
            <InlineMessage msg={signupMsg} />

            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <button className={styles.submitButton} type="submit" disabled={loading}>
                {loading ? "Please wait..." : "Create Account"}
              </button>
            </div>
          </form>
          <div className={`${styles.switchLink} ${styles.slideElement}`}>
            <p>
              Already have an account?{" "}
              <a href="#" onClick={(e) => { e.preventDefault(); setIsSignup(false); }}>
                Sign In
              </a>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Auth;