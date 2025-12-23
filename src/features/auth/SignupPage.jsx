import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import { FACULTIES, getDepartmentsForFaculty, getYearsForFaculty } from "./academic.options";

import bg from "../../assets/login-bg.jpg";
import logo from "../../assets/psu-logo.png";

import { signupRequest } from "./auth.api";

const dict = {
  "en-US": {
    title: "Sign up",
    subtitle: "Create your account to start the registration process.",
    step1: "Basic info",
    step2: "Academic info",
    step3: "Documents",
    firstName: "First name",
    lastName: "Last name",
    dob: "Date of birth",
    email: "Email",
    password: "Password",
    nationalId: "National ID",
    faculty: "Faculty",
    department: "Department",
    year: "Academic year",
    nationalIdScan: "National ID scan (JPEG/PNG)",
    next: "Next",
    back: "Back",
    submit: "Create account",
    topLogin: "Login",
    haveAccount: "Already have an account?",
    goLogin: "Go to login",
  },
  "ar-EG": {
    title: "إنشاء حساب",
    subtitle: "أنشئ حسابك لبدء عملية التسجيل.",
    step1: "بيانات أساسية",
    step2: "بيانات أكاديمية",
    step3: "الملفات",
    firstName: "الاسم الأول",
    lastName: "الاسم الأخير",
    dob: "تاريخ الميلاد",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    nationalId: "الرقم القومي",
    faculty: "الكلية",
    department: "القسم",
    year: "السنة الدراسية",
    nationalIdScan: "صورة البطاقة (JPEG/PNG)",
    next: "التالي",
    back: "رجوع",
    submit: "إنشاء حساب",
    topLogin: "تسجيل الدخول",
    haveAccount: "لديك حساب بالفعل؟",
    goLogin: "اذهب لتسجيل الدخول",
  },
};

function isEmailValid(email) {
  return email.toLowerCase().endsWith("@eng.psu.edu.eg");
}
function isNationalIdValid(n) {
  return /^\d{14}$/.test(n);
}

export default function SignupPage() {
  const navigate = useNavigate();

  const [lang, setLang] = useState("en-US");
  const t = useMemo(() => dict[lang], [lang]);
  const isRTL = lang === "ar-EG";

  const [step, setStep] = useState(1);

  // step1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // step2
  const [nationalId, setNationalId] = useState("");

  // ✅ Selects بدل الأرقام
  const [facultyId, setFacultyId] = useState(FACULTIES[0]?.id ?? 1);

  const departments = useMemo(() => getDepartmentsForFaculty(facultyId) || [], [facultyId]);
  const years = useMemo(() => getYearsForFaculty(facultyId) || [1, 2, 3, 4], [facultyId]);

  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [year, setYear] = useState(years[0] ?? 1);

  // لما faculty تتغير: اختر أول department وأول year تلقائيًا
useEffect(() => {
  const deps = getDepartmentsForFaculty(facultyId) || [];
  const nextDeptId = deps[0]?.id ?? "";

  const ys = getYearsForFaculty(facultyId) || [1, 2, 3, 4];
  const nextYear = ys[0] ?? 1;
    setDepartmentId((prev) => (prev === nextDeptId ? prev : nextDeptId));
  setYear((prev) => (prev === nextYear ? prev : nextYear));
}, [facultyId]);


  // step3
  const [nationalIdScan, setNationalIdScan] = useState(null);
   const [profilePhoto, setProfilePhoto] = useState(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function stepTitle() {
    if (step === 1) return t.step1;
    if (step === 2) return t.step2;
    return t.step3;
  }

  function validateStep(currentStep) {
    if (currentStep === 1) {
      if (!firstName.trim()) return "First name is required";
      if (!lastName.trim()) return "Last name is required";
      if (!dateOfBirth) return "Date of birth is required";
      if (!isEmailValid(email)) return "Email must end with @eng.psu.edu.eg";
      if (!password || password.length < 6) return "Password must be at least 6 characters";
      return "";
    }

    if (currentStep === 2) {
      if (!isNationalIdValid(nationalId)) return "National ID must be exactly 14 digits";
      if (!facultyId) return "Faculty is required";
      if (!departmentId) return "Department is required";
      if (!year) return "Academic year is required";
      return "";
    }

    if (currentStep === 3) {
      if (!nationalIdScan) return "National ID scan is required";
      const okType = ["image/jpeg", "image/png"].includes(nationalIdScan.type);
      if (!okType) return "Only JPEG/PNG allowed";
      if (nationalIdScan.size > 10 * 1024 * 1024) return "File must be <= 10MB";
      if (!profilePhoto) return "Profile photo is required";
const okType2 = ["image/jpeg", "image/png"].includes(profilePhoto.type);
if (!okType2) return "Profile photo: Only JPEG/PNG allowed";
if (profilePhoto.size > 10 * 1024 * 1024) return "Profile photo: Max 10MB";

      return "";
    }

    return "";
  }

  function onNext() {
    setErrorMsg("");
    const v = validateStep(step);
    if (v) return setErrorMsg(v);
    setStep((s) => Math.min(3, s + 1));
  }

  function onBack() {
    setErrorMsg("");
    setStep((s) => Math.max(1, s - 1));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    // validate all steps before submit
    for (let s = 1; s <= 3; s++) {
      const v = validateStep(s);
      if (v) {
        setStep(s);
        setErrorMsg(v);
        return;
      }
    }

    const formData = new FormData();
    formData.append("firstName", firstName.trim());
    formData.append("lastName", lastName.trim());
    formData.append("dateOfBirth", dateOfBirth); // YYYY-MM-DD
    formData.append("email", email.trim().toLowerCase());
    formData.append("password", password);
    formData.append("nationalId", nationalId);
    formData.append("facultyId", String(facultyId));
    formData.append("departmentId", String(departmentId));
    formData.append("year", String(year));
    formData.append("nationalIdScan", nationalIdScan);

    setLoading(true);
    const result = await signupRequest(formData);
    setLoading(false);

    if (!result.ok) {
      setErrorMsg(result.error?.message || "Signup failed");
      return;
    }

    setSuccessMsg(result.data?.message || "Registered successfully");
    setTimeout(() => navigate("/login", { replace: true }), 700);
  }

  return (
    <div className={styles.page} style={{ direction: isRTL ? "rtl" : "ltr" }}>
      <img className={styles.bg} src={bg} alt="bg" />

      <header className={styles.topbar}>
        <div className={styles.brand}>
          <img src={logo} alt="PSU" className={styles.logo} />
          <span className={styles.brandText}>{t.title}</span>
        </div>

        <div className={styles.topActions}>
          <select className={styles.langSelect} value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en-US">English (United States)</option>
            <option value="ar-EG">العربية (مصر)</option>
          </select>

          <Link className={styles.topBtn} to="/login">
            {t.topLogin}
          </Link>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.card}>
          <h1 className={styles.title}>{t.title}</h1>
          <p className={styles.subtitle}>{t.subtitle}</p>

          <div className={styles.stepper} aria-label="signup steps">
            <div className={`${styles.step} ${step >= 1 ? styles.stepActive : ""}`} />
            <div className={`${styles.step} ${step >= 2 ? styles.stepActive : ""}`} />
            <div className={`${styles.step} ${step >= 3 ? styles.stepActive : ""}`} />
          </div>

          <p className={styles.subtitle} style={{ marginTop: 0 }}>
            {stepTitle()}
          </p>

          <form className={styles.form} onSubmit={onSubmit}>
            {step === 1 && (
              <>
                <div className={styles.grid2}>
                  <label className={styles.label}>
                    {t.firstName}
                    <input className={styles.input} value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </label>

                  <label className={styles.label}>
                    {t.lastName}
                    <input className={styles.input} value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </label>
                </div>

                <label className={styles.label}>
                  {t.dob}
                  <input
                    className={styles.input}
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </label>

                <label className={styles.label}>
                  {t.email}
                  <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>

                <label className={styles.label}>
                  {t.password}
                  <input
                    className={styles.input}
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
              </>
            )}

            {step === 2 && (
              <>
                <label className={styles.label}>
                  {t.nationalId}
                  <input
                    className={styles.input}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value.replace(/\D/g, "").slice(0, 14))}
                    placeholder="14 digits"
                  />
                </label>

                <div className={styles.grid3}>
                  <label className={styles.label}>
                    {t.faculty}
                    <select
                      className={styles.input}
                      value={facultyId}
                      onChange={(e) => setFacultyId(Number(e.target.value))}
                    >
                      {FACULTIES.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className={styles.label}>
                    {t.department}
                    <select
                      className={styles.input}
                      value={departmentId}
                      onChange={(e) => setDepartmentId(Number(e.target.value))}
                      disabled={!departments.length}
                    >
                      {departments.length ? (
                        departments.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))
                      ) : (
                        <option value="">No departments</option>
                      )}
                    </select>
                  </label>

                  <label className={styles.label}>
                    {t.year}
                    <select className={styles.input} value={year} onChange={(e) => setYear(Number(e.target.value))}>
                      {years.map((y) => (
                        <option key={y} value={y}>
                          Year {y}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </>
            )}

            {step === 3 && (
              <>
                <label className={styles.label}>
                  {t.nationalIdScan}
                  <input
                    className={styles.input}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={(e) => setNationalIdScan(e.target.files?.[0] || null)}
                  />
                </label>

                <p className={styles.subtitle} style={{ marginTop: 0 }}>
                  Tip: upload a clear photo to speed up approval.
                </p>
                <label className={styles.label}>
  Profile Photo (JPEG/PNG)
  <input
    className={styles.input}
    type="file"
    accept="image/png,image/jpeg"
    onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
  />
</label>

              </>
            )}

            {errorMsg ? <div className={styles.error}>{errorMsg}</div> : null}
            {successMsg ? <div className={styles.success}>{successMsg}</div> : null}

            {step < 3 ? (
              <div className={styles.actionsRow}>
                <button type="button" className={styles.secondaryBtn} onClick={onBack} disabled={step === 1 || loading}>
                  {t.back}
                </button>
                <button type="button" className={styles.primaryBtn} onClick={onNext} disabled={loading}>
                  {t.next}
                </button>
              </div>
            ) : (
              <div className={styles.actionsRow}>
                <button type="button" className={styles.secondaryBtn} onClick={onBack} disabled={loading}>
                  {t.back}
                </button>
                <button className={styles.primaryBtn} disabled={loading}>
                  {loading ? "Creating..." : t.submit}
                </button>
              </div>
            )}

            <div className={styles.bottomLink}>
              {t.haveAccount} <Link to="/login">{t.goLogin}</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
