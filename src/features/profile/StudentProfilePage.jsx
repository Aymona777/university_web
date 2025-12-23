import React, { useEffect, useState } from "react";
import { authStorage } from "../../core/auth/auth.storage";
import { apiFetch } from "../../core/api/http";

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr("");

      const res = await apiFetch("/api/profile", { method: "GET" }, { auth: true });

      if (!mounted) return;

      setLoading(false);

      if (!res.ok) {
        setErr(res.error?.message || "Failed to load profile");
        return;
      }

      setProfile(res.data);
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  function logout() {
    authStorage.clear();
    window.location.href = "/login";
  }

  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (err) return <div style={{ padding: 24, color: "crimson" }}>{err}</div>;
  if (!profile) return <div style={{ padding: 24 }}>No profile data.</div>;

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#0b0f16", color: "#e9eef6" }}>
      <h1 style={{ marginTop: 0 }}>My Digital Card</h1>

      <div
        style={{
          marginTop: 16,
          maxWidth: 900,
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 16,
          display: "grid",
          gridTemplateColumns: "140px 1fr",
          gap: 16,
          alignItems: "center",
        }}
      >
        <img
          src={profile.profilePhoto}
          alt="Profile"
          style={{
            width: 140,
            height: 140,
            borderRadius: 16,
            objectFit: "cover",
            border: "1px solid rgba(255,255,255,0.12)",
            background: "rgba(255,255,255,0.06)",
          }}
          onError={(e) => (e.currentTarget.style.opacity = "0.3")}
        />

        <div>
          <div style={{ fontSize: 22, fontWeight: 900 }}>
            {profile.firstName} {profile.lastName}
          </div>

          <div style={{ marginTop: 6, opacity: 0.85 }}>{profile.email}</div>

          <div style={{ marginTop: 10, opacity: 0.85 }}>
            <b>Faculty:</b> {profile.faculty} — <b>Dept:</b> {profile.department} — <b>Year:</b>{" "}
            {profile.year}
          </div>

          <div style={{ marginTop: 10, opacity: 0.85 }}>
            <b>Bio:</b> {profile.bio || "—"}
          </div>

          <button
            onClick={logout}
            style={{
              marginTop: 12,
              padding: "10px 12px",
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.14)",
              background: "rgba(255,255,255,0.06)",
              color: "#e9eef6",
              cursor: "pointer",
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
