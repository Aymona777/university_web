import React, { useEffect, useState } from "react";
import { authStorage } from "../../core/auth/auth.storage";
import { apiFetch } from "../../core/api/http";

// 1. قائمة الكلمات المحظورة (Updated & Expanded)
const BANNED_WORDS = [
  "spam", "offensive", "inappropriate", "hate", "violence",
  "fuck", "shit", "bitch", "asshole", "dick", "pussy", "whore", "slut", "bastard", "damn",
  "kill", "murder", "terrorist", "bomb", "suicide",
  "stupid", "idiot", "nigger", "faggot"
];

export default function StudentProfilePage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [profile, setProfile] = useState(null);

  // States for Editing
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLinkedin, setEditLinkedin] = useState("");
  const [editGithub, setEditGithub] = useState("");
  const [editInterests, setEditInterests] = useState(""); // Skills & Interests
  const [editVisibility, setEditVisibility] = useState("PUBLIC");
  
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setErr("");
    const res = await apiFetch("/api/profile", { method: "GET" }, { auth: true });
    setLoading(false);

    if (!res.ok) {
      setErr(res.error?.message || "Failed to load profile");
      return;
    }

    const data = res.data;
    setProfile(data);
    
    // Initialize edit form values
    setEditBio(data.bio || "");
    setEditPhone(data.phone || "");
    setEditLinkedin(data.linkedin || ""); 
    setEditGithub(data.github || "");
    setEditInterests(data.interests || "");
    setEditVisibility(data.visibility || "PUBLIC");
  }

  // --- Content Moderation Logic ---
  function containsBannedWords(text) {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    // Check if the text contains any of the banned words
    return BANNED_WORDS.some(word => lowerText.includes(word.toLowerCase()));
  }

  // --- Photo Upload ---
  async function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG/PNG)");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    const res = await apiFetch("/api/profile/photo", {
      method: "POST",
      body: formData, 
    }, { auth: true });
    setUploading(false);

    if (!res.ok) {
      alert(res.error?.message || "Failed to upload photo");
      return;
    }

    loadProfile(); // Refresh to show new image
    alert("Photo updated successfully!");
  }

  // --- Save Profile Changes ---
  async function handleUpdate(e) {
    e.preventDefault();
    
    // 1. Content Moderation Check
    if (containsBannedWords(editBio) || containsBannedWords(editInterests)) {
      alert("⚠️ Update Rejected: Your content contains inappropriate language. Please remove it.");
      return; // Stop execution
    }

    const body = {
      bio: editBio,
      phone: editPhone,
      linkedin: editLinkedin, 
      github: editGithub,
      interests: editInterests,
      visibility: editVisibility
    };

    const res = await apiFetch("/api/profile", {
      method: "PUT",
      body: JSON.stringify(body),
    }, { auth: true });

    if (!res.ok) {
      alert(res.error?.message || "Update failed");
      return;
    }

    setIsEditing(false);
    loadProfile();
    alert("✅ Profile updated successfully!");
  }

  function logout() {
    authStorage.clear();
    window.location.href = "/login";
  }

  if (loading && !profile) return <div style={{ padding: 24, color: "white", background: "#0b0f16", minHeight: "100vh" }}>Loading...</div>;
  if (err) return <div style={{ padding: 24, color: "crimson", background: "#0b0f16", minHeight: "100vh" }}>{err}</div>;

  return (
    <div style={{ padding: 24, minHeight: "100vh", background: "#0b0f16", color: "#e9eef6", fontFamily: 'sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>My Digital Card</h1>
        <button 
          onClick={logout}
          style={{ padding: "8px 16px", borderRadius: 8, background: "#cf1322", color: "white", border: "none", cursor: "pointer" }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          marginTop: 16,
          maxWidth: 900,
          margin: "20px auto",
          background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: 16,
          padding: 24,
          display: "flex",
          gap: 30,
          flexWrap: "wrap" 
        }}
      >
        {/* ----- Left Column: Photo & Static Info ----- */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 15, minWidth: 200 }}>
          <div style={{ position: "relative" }}>
            <img
              src={profile.profilePhoto || "https://via.placeholder.com/150"} 
              alt="Profile"
              style={{
                width: 150,
                height: 150,
                borderRadius: 16,
                objectFit: "cover",
                border: "2px solid rgba(255,255,255,0.2)",
                background: "rgba(255,255,255,0.06)",
                opacity: uploading ? 0.5 : 1
              }}
              onError={(e) => (e.currentTarget.style.opacity = "0.3")}
            />
            
            {/* Camera Icon */}
            <label style={{
              position: "absolute", bottom: -10, right: -10,
              background: "#1890ff", width: 40, height: 40, borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
              border: "2px solid #0b0f16"
            }} title="Change Photo">
              <span style={{ fontSize: "1.2rem" }}>📷</span>
              <input 
                type="file" 
                accept="image/png, image/jpeg" 
                onChange={handlePhotoUpload} 
                style={{ display: "none" }} 
              />
            </label>
          </div>
          {uploading && <small style={{color: "#1890ff"}}>Uploading...</small>}

          <div style={{ textAlign: "center" }}>
             <div style={{ fontSize: 20, fontWeight: "bold" }}>{profile.firstName} {profile.lastName}</div>
             <div style={{ opacity: 0.7, fontSize: 14, marginTop: 5 }}>{profile.email}</div>
             <div style={{ 
               marginTop: 10, 
               display: "inline-block", 
               padding: "4px 10px", 
               borderRadius: 20, 
               background: profile.visibility === "PUBLIC" ? "rgba(82, 196, 26, 0.2)" : "rgba(255, 77, 79, 0.2)",
               color: profile.visibility === "PUBLIC" ? "#95de64" : "#ff7875",
               fontSize: 12, fontWeight: "bold"
             }}>
               {profile.visibility} PROFILE
             </div>
          </div>
        </div>

        {/* ----- Right Column: Editable Content ----- */}
        <div style={{ flex: 1, minWidth: "300px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: 22 }}>Profile Details</h2>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                background: isEditing ? "#444" : "#1890ff",
                color: "white", border: "none", padding: "8px 20px", borderRadius: 6, cursor: "pointer", fontWeight: "bold"
              }}
            >
              {isEditing ? "Cancel Edit" : "Edit Profile"}
            </button>
          </div>

          {isEditing ? (
            // --- EDIT FORM ---
            <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
                <label>
                  <div style={{ marginBottom: 5, fontSize: 13, opacity: 0.8 }}>Phone Number</div>
                  <input 
                    type="text" 
                    value={editPhone} 
                    onChange={e => setEditPhone(e.target.value)}
                    placeholder="+201xxxxxxxxx"
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "none", background: "#222", color: "white" }}
                  />
                </label>
                <label>
                  <div style={{ marginBottom: 5, fontSize: 13, opacity: 0.8 }}>Visibility</div>
                  <select 
                    value={editVisibility}
                    onChange={e => setEditVisibility(e.target.value)}
                    style={{ width: "100%", padding: 10, borderRadius: 8, border: "none", background: "#222", color: "white" }}
                  >
                    <option value="PUBLIC">Public (Visible to all students)</option>
                    <option value="PRIVATE">Private (Admin only)</option>
                  </select>
                </label>
              </div>

              <label>
                <div style={{ marginBottom: 5, fontSize: 13, opacity: 0.8 }}>Bio (About you)</div>
                <textarea 
                  value={editBio} 
                  onChange={e => setEditBio(e.target.value)}
                  rows={3}
                  placeholder="I am a software engineering student..."
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "none", background: "#222", color: "white", resize: "vertical" }}
                />
              </label>

              <label>
                <div style={{ marginBottom: 5, fontSize: 13, opacity: 0.8 }}>Skills & Interests</div>
                <textarea 
                  value={editInterests} 
                  onChange={e => setEditInterests(e.target.value)}
                  rows={3}
                  placeholder="Java, React, Football, Reading..."
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "none", background: "#222", color: "white", resize: "vertical" }}
                />
              </label>

              <label>
                <div style={{ marginBottom: 5, fontSize: 13, opacity: 0.8 }}>LinkedIn URL</div>
                <input 
                  type="url" 
                  value={editLinkedin} 
                  onChange={e => setEditLinkedin(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "none", background: "#222", color: "white" }}
                />
              </label>

              <label>
                <div style={{ marginBottom: 5, fontSize: 13, opacity: 0.8 }}>GitHub URL</div>
                <input 
                  type="url" 
                  value={editGithub} 
                  onChange={e => setEditGithub(e.target.value)}
                  style={{ width: "100%", padding: 10, borderRadius: 8, border: "none", background: "#222", color: "white" }}
                />
              </label>

              <button type="submit" style={{ padding: "12px", background: "#52c41a", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: "bold", marginTop: 10, fontSize: 16 }}>
                Save Changes
              </button>
            </form>
          ) : (
            // --- VIEW MODE ---
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              
              <div style={{ background: "rgba(255,255,255,0.03)", padding: 15, borderRadius: 10 }}>
                <b style={{ color: "#888", fontSize: 12, letterSpacing: 1 }}>ACADEMIC INFO</b>
                <div style={{ marginTop: 8 }}>
                  🎓 {profile.faculty} <br/>
                  🏛️ {profile.department} <br/>
                  📅 Year {profile.year}
                </div>
              </div>

              <div>
                <b style={{ color: "#888", fontSize: 12, letterSpacing: 1 }}>BIO</b>
                <p style={{ marginTop: 5, lineHeight: 1.6 }}>{profile.bio || "No bio added."}</p>
              </div>

              <div>
                <b style={{ color: "#888", fontSize: 12, letterSpacing: 1 }}>SKILLS & INTERESTS</b>
                <p style={{ marginTop: 5, lineHeight: 1.6 }}>{profile.interests || "No interests listed."}</p>
              </div>

              <div>
                <b style={{ color: "#888", fontSize: 12, letterSpacing: 1 }}>CONTACT</b>
                <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                  {profile.phone && <div>📞 {profile.phone}</div>}
                  <div style={{ display: "flex", gap: 15, marginTop: 5 }}>
                    {profile.linkedin && (
                      <a href={profile.linkedin} target="_blank" rel="noreferrer" style={{ color: "#1890ff", textDecoration: "none", fontWeight: "bold" }}>
                        🔗 LinkedIn
                      </a>
                    )}
                    {profile.github && (
                      <a href={profile.github} target="_blank" rel="noreferrer" style={{ color: "#e9eef6", textDecoration: "none", fontWeight: "bold" }}>
                        🐙 GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}