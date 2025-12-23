import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

import bg from "../../assets/login-bg.jpg";
import logo from "../../assets/psu-logo.png";
import { authStorage } from "../../core/auth/auth.storage";


import { useAuth } from "../../core/auth/auth.context";
import { loginRequest } from "./auth.api";



// نفس dict بتاع اللغة زي ما هو عندك
const dict = {
  "en-US": {
    login: "Login",
    subtitle: "Login with the data you entered during your registration.",
    email: "Email",
    password: "Password",
    btnLogin: "Log in",
    forgot: "Did you forget your password?",
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
    forgot: "هل نسيت كلمة المرور؟",
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

  const [identifier, setIdentifier] = useState("test@eng.psu.edu.eg");
  const [password, setPassword] = useState("password123");

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

    // Backend returns: token, id, email, role, status
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
              aria-label="Language"
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

          {/* ✅ Error message */}
          {errorMsg ? (
            <div
              style={{
                marginBottom: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: "rgba(255,0,0,0.08)",
                border: "1px solid rgba(255,0,0,0.18)",
                color: "rgba(0,0,0,0.8)",
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              {errorMsg}
            </div>
          ) : null}

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
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                autoComplete="current-password"
                disabled={loading}
              />
            </label>

            <button className={styles.primaryBtn} type="submit" disabled={loading}>
              {loading ? t.loading : t.btnLogin}
            </button>

            <Link className={styles.forgot} to="/signup">
              {t.forgot}
            </Link>
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
