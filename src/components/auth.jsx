import React, { useEffect, useState } from "react";
import styles from "./Auth.module.css";

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
      <path
        d="M4 20a8 8 0 0 1 16 0"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  );
}

function Auth() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [loginMsg, setLoginMsg] = useState({ text: "", type: "" });

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 120);
    return () => clearTimeout(timer);
  }, []);

 const handleLogin = async (e) => {

  e.preventDefault();

  try {

    const res = await fetch(
      "https://saas-pos-backend-m8et.onrender.com/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(loginData),
      }
    );

    const data = await res.json();

    if (!res.ok) {

      setLoginMsg({
        text:
          data?.message || "Login failed",
        type: "error",
      });

      return;
    }

    setLoginMsg({
      text:
        "Login successful! Redirecting...",
      type: "success",
    });

    localStorage.setItem(
      "user",
      JSON.stringify(data)
    );

    localStorage.setItem(
      "tenant",
      data.schema
    );

    setTimeout(() => {

      if (data.role === "ADMIN") {

        window.location.href =
          "/dashboard";

      } else {

        window.location.href = "/";
      }

    }, 1500);

  } catch (err) {

    console.error(err);

    setLoginMsg({
      text:
        "Server error. Please try again.",
      type: "error",
    });
  }
};

  return (
    <div className={`${styles.authPage} ${isLoaded ? styles.loaded : ""}`}>
      <div className={styles.authBg}></div>
      <div className={styles.authOverlay}></div>

      <div className={styles.authWrapper}>
        <div className={styles.backgroundShape}></div>
        <div className={styles.secondaryShape}></div>

        <div className={`${styles.credentialsPanel} ${styles.signin}`}>
          <h2 className={styles.slideElement}>Login</h2>

          <form onSubmit={handleLogin}>
            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <input
                className={styles.inputField}
                type="text"
                required
                value={loginData.username}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    username: e.target.value,
                  })
                }
              />
              <label className={styles.fieldLabel}>Email</label>
              <UserIcon className={styles.fieldIcon} />
            </div>

            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <input
                className={styles.inputField}
                type={showLoginPassword ? "text" : "password"}
                required
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({
                    ...loginData,
                    password: e.target.value,
                  })
                }
              />
              <label className={styles.fieldLabel}>Password</label>
              <button
                type="button"
                className={styles.eyeToggle}
                onClick={() => setShowLoginPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showLoginPassword ? (
                  <EyeOffIcon className={styles.fieldIcon} />
                ) : (
                  <EyeIcon className={styles.fieldIcon} />
                )}
              </button>
            </div>

            {loginMsg.text && (
              <div className={`${styles.inlineMessage} ${styles[loginMsg.type]}`}>
                <span className={styles.msgIcon}>
                  {loginMsg.type === "success" ? "✓" : "✕"}
                </span>
                {loginMsg.text}
              </div>
            )}

            <div className={`${styles.fieldWrapper} ${styles.slideElement}`}>
              <button className={styles.submitButton} type="submit">
                Login
              </button>
            </div>
          </form>
        </div>

        <div className={`${styles.welcomeSection} ${styles.signin}`}>
          <h2 className={styles.slideElement}>WELCOME BACK!</h2>
          <p className={styles.slideElement}>
            Login to continue managing your dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;