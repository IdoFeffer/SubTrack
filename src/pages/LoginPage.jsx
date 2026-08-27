import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";

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
    <div className="flex flex-col items-center gap-4">
      <div className="w-full flex items-center gap-3">
        <div className="h-px flex-1 bg-[#ece7f7]" />
        <span className="text-xs text-[#a99cc4]">או</span>
        <div className="h-px flex-1 bg-[#ece7f7]" />
      </div>
      <div ref={buttonRef} />
    </div>
  );
}

function Field({ label, type = "text", value, onChange, error, autoComplete }) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1.5 text-[#6b5b8a]">{label}</label>
      <input
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl px-3.5 py-3 text-sm border-[1.5px] border-[#ddd3f7] bg-[#faf8ff] text-[#1b1033] outline-none focus:border-[#7c3aed] focus:bg-white"
      />
      {error && <p className="mt-1 mb-0 text-xs text-[#e11d48]">{error}</p>}
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
    <div className="min-h-screen bg-[linear-gradient(180deg,#faf5ff,#fdf2f8)] flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-6">
          <div className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-2xl mb-3 bg-[linear-gradient(140deg,#7c3aed,#c026d3)]">
            💳
          </div>
          <p className="m-0 text-[26px] font-bold text-[#1b1033]">SubTrack</p>
          <p className="mt-1 mb-0 text-sm text-[#8b7cae]">כל המנויים שלך, במקום אחד</p>
        </div>

        <div
          className="bg-white border border-[#ece7f7] rounded-[20px] p-6"
          style={{ boxShadow: "0 16px 36px -28px rgba(27,16,51,.7)" }}
        >
          <div className="flex mb-5 rounded-xl p-1 bg-[#faf8ff] border border-[#ece7f7]">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                mode === "login" ? "bg-white text-[#4c1d95] shadow-sm" : "text-[#8b7cae]"
              }`}
              style={mode === "login" ? { boxShadow: "0 4px 10px -4px rgba(27,16,51,.3)" } : undefined}
            >
              התחברות
            </button>
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className={`flex-1 rounded-lg py-2 text-sm font-semibold ${
                mode === "signup" ? "bg-white text-[#4c1d95] shadow-sm" : "text-[#8b7cae]"
              }`}
              style={mode === "signup" ? { boxShadow: "0 4px 10px -4px rgba(27,16,51,.3)" } : undefined}
            >
              הרשמה
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
              <label className="flex items-center gap-2 text-sm text-[#4c1d95] cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[1.5px] border-[#ddd3f7] accent-[#7c3aed]"
                />
                הישאר מחובר
              </label>
            )}

            {submitError && (
              <div className="rounded-xl px-4 py-3 bg-[#fff1f2] border border-[#fecdd3]">
                <p className="m-0 text-sm font-medium text-[#9f1239]">{submitError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "linear-gradient(140deg,#7c3aed,#c026d3)" }}
            >
              {submitting ? "רגע..." : mode === "login" ? "התחבר" : "הירשם"}
            </button>
          </form>

          <div className="mt-5">
            <GoogleSignInButton onCredential={handleGoogleCredential} />
          </div>
        </div>
      </div>
    </div>
  );
}
