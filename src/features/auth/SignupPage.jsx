import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import bg from "../../assets/login-bg.jpg";
import { FACULTIES, getDepartmentsForFaculty, getYearsForFaculty } from "./academic.options";
import { signupRequest } from "./auth.api";

export default function SignupPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [nationalId, setNationalId] = useState("");
  const [facultyId, setFacultyId] = useState(FACULTIES[0]?.id ?? 1);
  const departments = useMemo(() => getDepartmentsForFaculty(facultyId) || [], [facultyId]);
  const years = useMemo(() => getYearsForFaculty(facultyId) || [1, 2, 3, 4], [facultyId]);
  const [departmentId, setDepartmentId] = useState("");
  const [year, setYear] = useState(1);

  const [nationalIdScan, setNationalIdScan] = useState(null);

  useEffect(() => {
    const deps = getDepartmentsForFaculty(facultyId) || [];
    setDepartmentId(deps[0]?.id || "");
    const ys = getYearsForFaculty(facultyId) || [1];
    setYear(ys[0]);
  }, [facultyId]);

  function validateStep(currentStep) {
    if (currentStep === 1) {
      if (!firstName || !lastName) return "Names are required";
      if (!email.toLowerCase().endsWith("@eng.psu.edu.eg")) return "Email must match @eng.psu.edu.eg";
      if (password.length < 6) return "Password too short";
      return "";
    }
    if (currentStep === 2) {
      if (!/^\d{14}$/.test(nationalId)) return "National ID must be 14 digits";
      return "";
    }
    if (currentStep === 3) {
      if (!nationalIdScan) return "ID Scan is required";
      return "";
    }
    return "";
  }

  function onNext() {
    const err = validateStep(step);
    if (err) return setErrorMsg(err);
    setErrorMsg("");
    setStep(s => Math.min(3, s + 1));
  }

  function onBack() {
    setErrorMsg("");
    setStep(s => Math.max(1, s - 1));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    const err = validateStep(3);
    if (err) return setErrorMsg(err);

    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("dateOfBirth", dateOfBirth);
    formData.append("email", email);
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
    } else {
      alert("Account created successfully! Please login.");
      navigate("/login");
    }
  }

  return (
    <div style={{ 
      minHeight: "100vh",
      backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${bg})`,
      backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "100px 20px 40px" // Padding for Navbar
    }}>
      <div style={{
        background: "rgba(255, 255, 255, 0.05)", backdropFilter: "blur(15px)",
        border: "1px solid rgba(255, 255, 255, 0.1)", padding: "40px", borderRadius: "24px",
        width: "100%", maxWidth: "600px", color: "white"
      }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <h2 style={{ fontSize: 28, margin: 0 }}>Create Account</h2>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 15 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ width: 12, height: 12, borderRadius: "50%", background: step >= s ? "#00c6ff" : "rgba(255,255,255,0.2)" }} />
            ))}
          </div>
        </div>

        {errorMsg && <div style={{ background: "rgba(255,0,0,0.1)", color: "#fca5a5", padding: "10px", borderRadius: "8px", textAlign: "center", marginBottom: 20 }}>{errorMsg}</div>}

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {step === 1 && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <Input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} />
                <Input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} />
              </div>
              <Input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
              <Input placeholder="University Email" value={email} onChange={e => setEmail(e.target.value)} />
              <div style={{ position: "relative" }}>
                 <Input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} style={eyeBtnStyle}>{showPassword ? "🙈" : "👁️"}</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <Input placeholder="National ID (14 digits)" value={nationalId} onChange={e => setNationalId(e.target.value)} />
              <Select value={facultyId} onChange={e => setFacultyId(Number(e.target.value))} options={FACULTIES.map(f => ({ id: f.id, name: f.name }))} />
              <Select value={departmentId} onChange={e => setDepartmentId(Number(e.target.value))} options={departments} />
              <Select value={year} onChange={e => setYear(Number(e.target.value))} options={years.map(y => ({ id: y, name: `Year ${y}` }))} />
            </>
          )}

          {step === 3 && (
            <>
              <div style={{ background: "rgba(0,0,0,0.2)", padding: 20, borderRadius: 10, textAlign: "center" }}>
                <label style={{ display: "block", marginBottom: 10, color: "#cbd5e1" }}>Upload National ID Scan</label>
                <input type="file" accept="image/*" onChange={e => setNationalIdScan(e.target.files[0])} style={{ color: "white" }} />
              </div>
            </>
          )}

          <div style={{ display: "flex", gap: 15, marginTop: 10 }}>
            {step > 1 && <button type="button" onClick={onBack} style={secondaryBtnStyle}>Back</button>}
            {step < 3 ? <button type="button" onClick={onNext} style={primaryBtnStyle}>Next</button> : <button type="submit" disabled={loading} style={primaryBtnStyle}>{loading ? "Creating..." : "Create Account"}</button>}
          </div>
        </form>
        
        <div style={{ marginTop: 20, textAlign: "center", fontSize: 14, color: "#94a3b8" }}>
          Already have an account? <Link to="/login" style={{ color: "#38bdf8", fontWeight: "bold" }}>Login</Link>
        </div>
      </div>
    </div>
  );
}

const Input = (props) => <input required {...props} style={sharedInputStyle} />;
const Select = ({ options, ...props }) => (
  <select {...props} style={sharedInputStyle}>
    {options.map(o => <option key={o.id} value={o.id} style={{color: "black"}}>{o.name}</option>)}
  </select>
);
const sharedInputStyle = { width: "100%", padding: "12px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", color: "white", outline: "none" };
const primaryBtnStyle = { flex: 1, padding: "14px", background: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)", color: "white", border: "none", borderRadius: "12px", fontSize: 16, fontWeight: "bold", cursor: "pointer" };
const secondaryBtnStyle = { flex: 1, padding: "14px", background: "rgba(255,255,255,0.1)", color: "white", border: "none", borderRadius: "12px", fontSize: 16, cursor: "pointer" };
const eyeBtnStyle = { position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem", color: "#94a3b8" };