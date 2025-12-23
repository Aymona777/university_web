import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getUserDetails, 
  getStudentProfile, 
  approveRejectUser, 
  sendVerification, 
  verifyEmailWithToken 
} from "./admin.api";
import styles from "./admin.module.css";

export default function AdminReviewUserPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Manual Verify State
  const [showManualVerify, setShowManualVerify] = useState(false);
  const [manualToken, setManualToken] = useState("");

  useEffect(() => {
    if(userId && userId !== "undefined") {
      loadAllData();
    } else {
      setError("Invalid User ID");
      setLoading(false);
    }
  }, [userId]);

  async function loadAllData() {
    setLoading(true);
    try {
      const userRes = await getUserDetails(userId);
      setUser(userRes.data || userRes);

      try {
        const profileRes = await getStudentProfile(userId);
        setProfile(profileRes.data || profileRes);
      } catch (err) {
        console.log("No extra profile info");
      }
    } catch (err) {
      setError(err.message || "Failed to load user");
    } finally {
      setLoading(false);
    }
  }

  // --- 1. إرسال الإيميل (وأخذ التوكين في التست) ---
  async function handleSendEmail() {
    setProcessing(true);
    try {
      const res = await sendVerification(userId);
      const data = res.data || res;
      
      let msg = "Verification email sent!";
      // لو الباك إند في وضع testingMode=true، هيرجع التوكين
      if (data.token) {
        msg += `\n\n[TEST TOKEN]: ${data.token}\n\n(Copy this token for manual verification)`;
        // نفتح خانة الإدخال تلقائياً
        setShowManualVerify(true);
      }
      alert(msg);
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessing(false);
    }
  }

  // --- 2. التحقق اليدوي بالتوكين ---
  async function handleManualVerify() {
    if (!manualToken.trim()) return alert("Please enter the token!");
    
    setProcessing(true);
    try {
      await verifyEmailWithToken(userId, manualToken);
      alert("✅ Email Verified Successfully!");
      setShowManualVerify(false);
      loadAllData(); // تحديث الصفحة عشان الحالة تتغير لـ Verified
    } catch (err) {
      alert(err.message || "Verification Failed");
    } finally {
      setProcessing(false);
    }
  }

  async function handleApprove() {
    if (!window.confirm("Approve this user?")) return;
    setProcessing(true);
    try {
      await approveRejectUser({ userId: parseInt(userId), approved: true });
      navigate("/admin/pending");
    } catch (err) {
      alert(err.message);
      setProcessing(false);
    }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return alert("Reason required");
    setProcessing(true);
    try {
      await approveRejectUser({ userId: parseInt(userId), approved: false, rejectionReason: rejectReason });
      navigate("/admin/pending");
    } catch (err) {
      alert(err.message);
      setProcessing(false);
    }
  }

  if (loading) return <div className={styles.pageCenter}>Loading details...</div>;
  if (error) return <div className={styles.pageCenter}><div className={styles.errorBanner}>{error}</div></div>;
  if (!user) return <div className={styles.pageCenter}>User not found</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topNav}>
        <button onClick={() => navigate("/admin/pending")} className={styles.backBtn}>
           ← Back to List
        </button>
        <h2 className={styles.reviewTitle}>Review Application</h2>
      </div>

      <div className={styles.reviewGrid}>
        {/* Left Col */}
        <div className={styles.leftCol}>
           <div className={styles.card}>
             <h3 className={styles.cardTitle}>Identity Match</h3>
             <div className={styles.compareRow}>
               <div className={styles.photoBox}>
                 <span>Profile Photo</span>
                 <img src={user.profilePhotoUrl || user.profilePhoto} alt="Profile" className={styles.profileImg} />
               </div>
               <div className={styles.photoBox}>
                 <span>ID Scan</span>
                 <img src={user.nationalIdScanUrl || user.nationalIdScan} alt="ID" className={styles.idImg} onClick={() => window.open(user.nationalIdScanUrl, '_blank')} />
               </div>
             </div>
           </div>

           <div className={styles.card}>
             <h3 className={styles.cardTitle}>Info & Verification</h3>
             <div className={styles.infoRow}>
               <span className={styles.label}>Name:</span> <span className={styles.val}>{user.firstName} {user.lastName}</span>
             </div>
             <div className={styles.infoRow}>
               <span className={styles.label}>Email:</span> 
               <span className={styles.val}>
                 {user.email} 
                 {user.emailVerified ? <span className={styles.tagOk}>Verified</span> : <span className={styles.tagBad}>Unverified</span>}
               </span>
             </div>
             
             {/* Verification Section */}
             {!user.emailVerified && (
               <div style={{marginTop: 15, paddingTop: 15, borderTop: '1px solid #333'}}>
                 <button onClick={handleSendEmail} disabled={processing} className={styles.resendBtn}>
                   ✉️ Send Verification (Get Test Token)
                 </button>
                 
                 <div style={{marginTop: 10}}>
                   {!showManualVerify ? (
                     <button onClick={() => setShowManualVerify(true)} className={styles.btnSec} style={{fontSize: 12, width: '100%'}}>
                       Enter Token Manually
                     </button>
                   ) : (
                     <div style={{display: 'flex', gap: 5}}>
                       <input 
                         className={styles.search} 
                         style={{width: '100%', padding: '8px'}}
                         placeholder="Paste Token here..."
                         value={manualToken}
                         onChange={e => setManualToken(e.target.value)}
                       />
                       <button onClick={handleManualVerify} className={styles.btnPrimary} disabled={processing}>OK</button>
                     </div>
                   )}
                 </div>
               </div>
             )}
           </div>
        </div>

        {/* Right Col */}
        <div className={styles.rightCol}>
          <div className={styles.card}>
             <h3 className={styles.cardTitle}>Student Profile</h3>
             {profile ? (
               <div className={styles.profilePreview}>
                 <div className={styles.fieldBlock}>
                   <label>Bio:</label>
                   <p>{profile.bio || "No bio."}</p>
                 </div>
                 <div className={styles.linksList}>
                   {profile.linkedin ? <a href={profile.linkedin} target="_blank" rel="noreferrer" className={styles.linkItem}>LinkedIn ↗</a> : <span className={styles.missing}>No LinkedIn</span>}
                   {profile.github ? <a href={profile.github} target="_blank" rel="noreferrer" className={styles.linkItem}>GitHub ↗</a> : <span className={styles.missing}>No GitHub</span>}
                 </div>
               </div>
             ) : (
               <div className={styles.empty}>Profile not filled yet.</div>
             )}
          </div>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Decision</h3>
            {showRejectInput ? (
              <div className={styles.rejectForm}>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Reason..." />
                <div className={styles.actions}>
                  <button onClick={() => setShowRejectInput(false)} className={styles.btnSec}>Cancel</button>
                  <button onClick={handleReject} disabled={processing} className={styles.btnDanger}>Confirm Reject</button>
                </div>
              </div>
            ) : (
              <div className={styles.actions}>
                <button onClick={() => setShowRejectInput(true)} disabled={processing} className={styles.btnDangerOut}>Reject</button>
                <button onClick={handleApprove} disabled={processing || !user.emailVerified} className={styles.btnPrimaryLarge} title={!user.emailVerified ? "Verify email first" : ""}>Approve</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}