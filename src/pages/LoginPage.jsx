import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;
    const interval = setInterval(() => {
      if (cancelled || !window.google?.accounts?.id) return;
      clearInterval(interval);
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 344,
        locale: "he",
      });
    }, 100);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [onCredential]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="google-signin__inner">
      <div className="google-signin__divider">
        <div className="google-signin__divider-line" />
        <span className="google-signin__divider-text">או</span>
        <div className="google-signin__divider-line" />
      </div>
      <div ref={buttonRef} />
    </div>
  );
}

function Field({ label, type = "text", value, onChange, error, autoComplete }) {
  return (
    <div>
      <label className="login-field-label">{label}</label>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="login-field-input"
      />
      {error && <p className="login-field-error">{error}</p>}
    </div>
  );
}

export default function LoginPage() {
  const { login, signup, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [remember, setRemember] = useState(true);

  async function handleGoogleCredential(credential) {
    setSubmitError(null);
    try {
      await loginWithGoogle(credential);
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  function validate() {
    const next = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "הזן כתובת אימייל תקינה";
    }
    if (!password || password.length < 8) {
      next.password = "הסיסמה חייבת להכיל לפחות 8 תווים";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login({ email, password, remember });
      } else {
        await signup({ email, password, name });
      }
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setErrors({});
    setSubmitError(null);
  }

  return (
    <div className="login-page">
      <div className="login-page__container">
        <div className="login-page__header">
          <div className="login-page__logo">💳</div>
          <p className="login-page__title">SubTrack</p>
          <p className="login-page__subtitle">כל המנויים שלך, במקום אחד</p>
        </div>

        <div className="login-card">
          <div className="login-card__tabs">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`login-card__tab ${mode === "login" ? "login-card__tab--active" : ""}`}
            >
              התחברות
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`login-card__tab ${mode === "signup" ? "login-card__tab--active" : ""}`}
            >
              הרשמה
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {mode === "signup" && (
              <Field label="שם (אופציונלי)" value={name} onChange={setName} autoComplete="name" />
            )}
            <Field
              label="אימייל"
              type="email"
              value={email}
              onChange={setEmail}
              error={errors.email}
              autoComplete="email"
            />
            <Field
              label="סיסמה"
              type="password"
              value={password}
              onChange={setPassword}
              error={errors.password}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />

            {mode === "login" && (
              <label className="login-remember">
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                הישאר מחובר
              </label>
            )}

            {submitError && (
              <div className="login-error">
                <p>{submitError}</p>
              </div>
            )}

            <button type="submit" disabled={submitting} className="login-submit">
              {submitting ? "רגע..." : mode === "login" ? "התחבר" : "הירשם"}
            </button>
          </form>

          <div className="google-signin">
            <GoogleSignInButton onCredential={handleGoogleCredential} />
          </div>
        </div>
      </div>
    </div>
  );
}
