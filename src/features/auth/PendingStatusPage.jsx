import React, { useState } from "react";
import { Link } from "react-router-dom";
import { authStorage } from "../../core/auth/auth.storage";
import { uploadProfilePhoto } from "./auth.api";


export default function PendingStatusPage() {
  const session = authStorage.get();
  const role = (session?.role || "").toLowerCase();
  const status = (session?.status || "").toUpperCase();

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoErr, setPhotoErr] = useState("");
  const [photoMsg, setPhotoMsg] = useState("");

  async function handleUploadPhoto() {
    setPhotoErr("");
    setPhotoMsg("");

    if (!profilePhoto) {
      setPhotoErr("Please choose an image first (JPEG/PNG).");
      return;
    }

    const okType = ["image/jpeg", "image/png"].includes(profilePhoto.type);
    if (!okType) {
      setPhotoErr("Only JPEG/PNG files are allowed.");
      return;
    }

    if (profilePhoto.size > 10 * 1024 * 1024) {
      setPhotoErr("Max file size is 10MB.");
      return;
    }

    setPhotoLoading(true);
    const res = await uploadProfilePhoto(profilePhoto);
    setPhotoLoading(false);

    if (!res?.ok) {
      setPhotoErr(res?.error?.message || "Upload failed");
      return;
    }

    setPhotoMsg(res.data?.message || "Profile photo uploaded successfully.");
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ marginTop: 0 }}>Account Status</h1>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          border: "1px solid rgba(0,0,0,0.08)",
          background: "#fff",
          marginBottom: 16,
        }}
      >
        <p style={{ margin: 0 }}>
          <b>Email:</b> {session?.email || "—"}
        </p>
        <p style={{ margin: "6px 0 0" }}>
          <b>Role:</b> {role || "—"}
        </p>
        <p style={{ margin: "6px 0 0" }}>
          <b>Status:</b>{" "}
          <span
            style={{
              padding: "2px 10px",
              borderRadius: 999,
              background: status === "APPROVED" ? "rgba(0,200,120,0.12)" : "rgba(255,170,0,0.12)",
              border: "1px solid rgba(0,0,0,0.08)",
              fontWeight: 800,
            }}
          >
            {status || "—"}
          </span>
        </p>

        {role === "admin" ? (
          <p style={{ margin: "10px 0 0" }}>
            You are admin. Go to <Link to="/admin/pending">Pending Users</Link>
          </p>
        ) : null}

        {status === "APPROVED" ? (
          <p style={{ margin: "10px 0 0" }}>
            ✅ Approved! Go to <Link to="/me">My Page</Link>
          </p>
        ) : (
          <p style={{ margin: "10px 0 0", opacity: 0.85 }}>
            Your account is not approved yet. Please complete required uploads and wait for admin approval.
          </p>
        )}
      </div>

      {/* ✅ Upload Profile Photo */}
      {role !== "admin" ? (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            border: "1px solid rgba(0,0,0,0.08)",
            background: "#fff",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Profile Photo</h3>
          <p style={{ marginTop: 6, opacity: 0.8 }}>
            Upload your profile photo (JPEG/PNG). Admin will review it during approval.
          </p>

          <input
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => setProfilePhoto(e.target.files?.[0] || null)}
          />

          <div style={{ marginTop: 10 }}>
            <button onClick={handleUploadPhoto} disabled={photoLoading}>
              {photoLoading ? "Uploading..." : "Upload photo"}
            </button>
          </div>

          {photoErr ? <div style={{ marginTop: 10, color: "#c62828" }}>{photoErr}</div> : null}
          {photoMsg ? <div style={{ marginTop: 10, color: "#1b5e20" }}>{photoMsg}</div> : null}
        </div>
      ) : null}

      <div style={{ marginTop: 18, opacity: 0.8 }}>
        <button
          onClick={() => {
            authStorage.clear();
            window.location.href = "/login";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
