import { apiFetch } from "../../api/http";

// ✅ Login (بدون auth header)
export function loginRequest({ identifier, password }) {
  return apiFetch(
    "/api/login",
    {
      method: "POST",
      body: JSON.stringify({ identifier, password }),
    },
    { auth: false }
  );
}

// ✅ Signup (multipart/form-data) (بدون auth header)
export function signupRequest(formData) {
  return apiFetch(
    "/api/signup",
    {
      method: "POST",
      body: formData, // FormData
    },
    { auth: false }
  );
}

// ✅ Upload Profile Photo (محتاج Bearer token)
export function uploadProfilePhoto(file) {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch("/api/profile/photo", { method: "POST", body: fd }, { auth: true });
}

// (اختياري) لو عندكم endpoint منفصل لرفع صورة البطاقة بعد التسجيل
export function uploadNationalIdScan(file) {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch("/api/profile/national-id-scan", { method: "POST", body: fd }, { auth: true });
}
