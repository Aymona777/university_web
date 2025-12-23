import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

import bg from "../../assets/login-bg.jpg";
import logo from "../../assets/psu-logo.png";
import { authStorage } from "../../core/auth/auth.storage";
import { useAuth } from "../../core/auth/auth.context";
import { loginRequest } from "./auth.api";

const dict = {
  "en-US": {
    login: "Login",
    subtitle: "Login with the data you entered during your registration.",
    email: "Email",
    password: "Password",
    btnLogin: "Log in",
    signup: "Sign up",
    signupText: "Create a new account to start your registration.",
    create: "Create account",
    topSignup: "Sign up",
    placeholderEmail: "your.email@eng.psu.edu.eg",
    loading: "Logging in...",
  },
  "ar-EG": {
    login: "تسجيل الدخول",
    subtitle: "سجّل دخولك بالبيانات التي استخدمتها أثناء التسجيل.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    btnLogin: "دخول",
    signup: "إنشاء حساب",
    signupText: "أنشئ حسابًا جديدًا لبدء التسجيل.",
    create: "إنشاء حساب",
    topSignup: "إنشاء حساب",
    placeholderEmail: "example@eng.psu.edu.eg",
    loading: "جاري تسجيل الدخول...",
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { setSession } = useAuth();

  const [lang, setLang] = useState("en-US");
  const t = useMemo(() => dict[lang], [lang]);
  const isRTL = lang === "ar-EG";

  // 1. Credentials are now empty by default
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
  // 2. State for Password Visibility
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
  
    const result = await loginRequest({ identifier, password });

    setLoading(false);

    if (!result.ok) {
      setErrorMsg(result.error?.message || "Login failed");
      return;
    }

    const data = result.data;

    const session = {
      token: data.token,
      userId: data.id,
      email: data.email,
      role: data.role,
      status: data.status,
    };

    setSession(session);
    authStorage.set(session);

    // Redirect logic
    if (data.role === "admin") {
      navigate("/admin/pending", { replace: true });
      return;
    }

    if (data.role === "student" && data.status !== "APPROVED") {
      navigate("/status", { replace: true });
      return;
    }

    navigate("/me", { replace: true });
  }

  return (
    <div className={`${styles.page} ${isRTL ? styles.rtl : ""}`}>
      <div className={styles.bg} style={{ backgroundImage: `url(${bg})` }} />
      <div className={styles.overlay} />

      <header className={styles.topbar}>
        <div className={styles.brand}>
          <img src={logo} alt="PSU Logo" />
          <div className={styles.brandTitle}>{t.login}</div>
        </div>

        <div className={styles.topRight}>
          <div className={styles.langWrap}>
            <select
              className={styles.langSelect}
              value={lang}
              onChange={(e) => setLang(e.target.value)}
            >
              <option value="en-US">English (United States)</option>
              <option value="ar-EG">Arabic (Egypt)</option>
            </select>
          </div>

          <button className={styles.topBtn} onClick={() => navigate("/signup")}>
            {t.topSignup}
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <section className={styles.card} aria-label="Login card">
          <h1 className={styles.title}>{t.login}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>

          {errorMsg && (
            <div style={{
                marginBottom: 10, padding: "10px 12px", borderRadius: 10,
                background: "rgba(255,0,0,0.08)", border: "1px solid rgba(255,0,0,0.18)",
                color: "crimson", fontWeight: 700, fontSize: 13,
            }}>
              {errorMsg}
            </div>
          )}

          <form className={styles.form} onSubmit={onSubmit}>
            <label className={styles.label}>
              {t.email}
              <input
                className={styles.input}
                type="email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t.placeholderEmail}
                autoComplete="email"
                disabled={loading}
              />
            </label>

            <label className={styles.label}>
              {t.password}
              <div style={{ position: "relative" }}>
                <input
                  className={styles.input}
                  type={showPassword ? "text" : "password"} // Toggle type
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  autoComplete="current-password"
                  disabled={loading}
                  style={{ width: "100%", paddingRight: "40px" }} // Make room for icon
                />
                
                {/* 3. Eye Icon Button */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: isRTL ? "auto" : "10px", left: isRTL ? "10px" : "auto",
                    top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "#666", fontSize: "1.2rem"
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"} 
                </button>
              </div>
            </label>

            <button className={styles.primaryBtn} type="submit" disabled={loading}>
              {loading ? t.loading : t.btnLogin}
            </button>

            {/* 4. Forgot Password Removed */}
            {/* <Link className={styles.forgot} to="/signup">{t.forgot}</Link> */}
            <div style={{ marginBottom: 16 }}></div>

          </form>

          <div className={styles.dividerCard}>
            <h2 className={styles.subTitle2}>{t.signup}</h2>
            <p className={styles.subText2}>{t.signupText}</p>

            <button
              className={styles.secondaryBtn}
              onClick={() => navigate("/signup")}
              disabled={loading}
            >
              {t.create}
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}