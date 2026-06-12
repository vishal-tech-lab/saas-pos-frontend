import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Auth.module.css";
import api from "./axios"
import { loadTenant }
from "../services/tenantService";
// ─── Icons ───────────────────────────────────────────────────────────────────

function EyeIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function EyeOffIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.12 14.12a3 3 0 1 1-4.24-4.24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line
        x1="1"
        y1="1"
        x2="23"
        y2="23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M4 20a8 8 0 0 1 16 0" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

// ─── Reusable InputField ──────────────────────────────────────────────────────

/**
 * @param {object}   props
 * @param {string}   props.label
 * @param {string}   props.type          - "text" | "password" | "email"
 * @param {string}   props.value
 * @param {function} props.onChange
 * @param {boolean}  [props.showPassword]          - only for password fields
 * @param {function} [props.onTogglePassword]      - only for password fields
 * @param {boolean}  [props.autoFocus]
 * @param {boolean}  [props.disabled]
 */
function InputField({
  label,
  type,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  autoFocus = false,
  disabled = false,
}) {
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
        <button
          type="button"
          className={styles.eyeToggle}
          onClick={onTogglePassword}
          tabIndex={-1}
          disabled={disabled}
        >
          {showPassword ? (
            <EyeOffIcon className={styles.fieldIcon} />
          ) : (
            <EyeIcon className={styles.fieldIcon} />
          )}
        </button>
      ) : (
        <UserIcon className={styles.fieldIcon} />
      )}
    </div>
  );
}

// ─── Reusable InlineMessage ───────────────────────────────────────────────────

function InlineMessage({ msg }) {
  if (!msg.text) return null;
  return (
    <div className={`${styles.inlineMessage} ${styles[msg.type]}`}>
      <span className={styles.msgIcon}>{msg.type === "success" ? "✓" : "✕"}</span>
      {msg.text}
    </div>
  );
}



// ─── Helpers ──────────────────────────────────────────────────────────────────

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

  const clear = () => setMsg(EMPTY_MSG);

  return [msg, flash, clear];
}

// ─── Main Component ───────────────────────────────────────────────────────────

function Auth() {
  const navigate = useNavigate();

  const [isLoaded, setIsLoaded] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [authMsg, flashAuth] = useFlashMessage();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 120);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hostname = window.location.hostname;
    const parts = hostname.split(".");

    if (parts.length > 2) {
      const subdomain = parts[0];
      localStorage.setItem("tenant", subdomain);
      console.log("Tenant:", subdomain);
    }
  }, []);

  useEffect(() => {
    loadTenant().then((data) => {
      if (data) {
        localStorage.setItem("tenantInfo", JSON.stringify(data));
        localStorage.setItem("plan", data.plan);
        localStorage.setItem("subscriptionStatus", data.subscriptionStatus);
      }
    });
  }, []);

  useEffect(() => {
    setShowPassword(false);
  }, [isSignup]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", {
        username: email,
        password,
      });

      localStorage.setItem("user", JSON.stringify(data));
      localStorage.setItem("role", data.role);
localStorage.setItem("branchId",data.branchid);

localStorage.setItem("currentBranch",data.branchname);
      if (data.role === "ROLE_ADMIN" || data.role === "ROLE_MANAGER") {
        navigate("/dashboard");
      } else if (data.role === "ROLE_CASHIER") {
        navigate("/pos");
      } else if (data.role === "ROLE_KITCHEN") {
        navigate("/kitchen");
      }
    } catch (err) {
      flashAuth(
        err.response?.data?.message || "Login Failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/auth/signup", {
        username: email,
        password,
      });

      flashAuth("Signup successful. Please sign in.", "success");
      setIsSignup(false);
    } catch (err) {
      flashAuth(err?.response?.data?.message || "Signup failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const title = isSignup ? "Sign Up" : "Sign In";
  const submitLabel = isSignup ? "Create Account" : "Sign In";
  const switchLabel = isSignup
    ? "Already have an account?"
    : "Don’t have an account?";
  const switchAction = isSignup ? "Sign In" : "Sign Up";
  const displayTitle = isSignup ? "Sign Up" : "Sign In";
  const displaySubmitLabel = isSignup ? "Create Account" : "Sign In";
  const displaySwitchLabel = isSignup
    ? "Already have an account?"
    : "Don't have an account?";
  const displaySwitchAction = isSignup ? "Sign In" : "Sign Up";
  const displayWelcomeText = isSignup
    ? "Create your admin account for your tenant."
    : "Login to continue managing your dashboard.";
  const pageClass = `${styles.authPage}${isLoaded ? " loaded" : ""}`;
  return (
<div className={pageClass}>
        <div className={styles.authBg}></div>
      <div className={styles.authOverlay}></div>

      <div className={styles.authWrapper}>
        <div className={styles.backgroundShape}></div>
        <div className={styles.secondaryShape}></div>

        <div className={`${styles.credentialsPanel} ${styles.signin}`}>
          <h2 className={styles.slideElement}>{displayTitle}</h2>

          <form onSubmit={isSignup ? handleSignup : handleLogin}>
            <InputField
              label="Username"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              disabled={loading}
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
              disabled={loading}
            />

            <InlineMessage msg={authMsg} />

            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <button
                className={styles.submitButton}
                type="submit"
                disabled={loading}
              >
                {loading ? "Please wait..." : displaySubmitLabel}
              </button>
            </div>
          </form>

          <div className={`${styles.switchLink} ${styles.slideElement}`}>
            <p>
              {displaySwitchLabel}{" "}
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setIsSignup((prev) => !prev);
                }}
              >
                {displaySwitchAction}
              </a>
            </p>
          </div>
        </div>

        <div className={`${styles.welcomeSection} ${styles.signin}`}>
          <h2 className={styles.slideElement}>WELCOME BACK!</h2>
          <p className={styles.slideElement}>
            {displayWelcomeText}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;