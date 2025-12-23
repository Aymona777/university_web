import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  approveRejectUser,
  getUserDetails,
  sendVerification,
  verifyEmail,
} from "./admin.api";
import styles from "./admin.module.css";

export default function AdminReviewUserPage() {
  const { userId } = useParams(); // مهم: userId
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionOk, setActionOk] = useState("");

  const [rejectReason, setRejectReason] = useState("");
  const [verificationToken, setVerificationToken] = useState("");

  const profilePhotoUrl = useMemo(() => user?.profile?.profilePhotoUrl || "", [user]);
  const nationalIdScanUrl = useMemo(() => user?.nationalIdScanUrl || "", [user]);

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await getUserDetails(userId);
      setUser(data);
    } catch (e) {
      setError(e.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function onSendVerification() {
    try {
      setActionError("");
      setActionOk("");
      const res = await sendVerification(userId);
      // في testing mode غالبًا بيرجع verificationToken
      if (res?.verificationToken) setVerificationToken(res.verificationToken);
      setActionOk(res?.message || "Verification triggered");
    } catch (e) {
      setActionError(e.message || "Failed to send verification");
    }
  }

  async function onVerifyEmail() {
    try {
      setActionError("");
      setActionOk("");
      if (!verificationToken.trim()) {
        setActionError("Token is required");
        return;
      }
      const res = await verifyEmail(userId, verificationToken.trim());
      setActionOk(res?.message || "Email verified");
      await load();
    } catch (e) {
      setActionError(e.message || "Failed to verify email");
    }
  }

  async function onApprove() {
    try {
      setActionError("");
      setActionOk("");
      const res = await approveRejectUser({ userId: Number(userId), approved: true });
      setActionOk(res?.message || "Approved");
      navigate("/admin/pending", { replace: true });
    } catch (e) {
      setActionError(e.message || "Approve failed");
    }
  }

  async function onReject() {
    try {
      setActionError("");
      setActionOk("");
      if (!rejectReason.trim()) {
        setActionError("Rejection reason is required");
        return;
      }
      const res = await approveRejectUser({
        userId: Number(userId),
        approved: false,
        rejectionReason: rejectReason.trim(),
      });
      setActionOk(res?.message || "Rejected");
      navigate("/admin/pending", { replace: true });
    } catch (e) {
      setActionError(e.message || "Reject failed");
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumbs}>
        <Link to="/admin/pending" className={styles.link}>← Back to Pending</Link>
      </div>

      {loading && <div className={styles.card}>Loading…</div>}
      {error && <div className={`${styles.card} ${styles.error}`}>{error}</div>}

      {!loading && !error && user && (
        <>
          <div className={styles.header}>
            <div>
              <h1 className={styles.title}>
                Review User <span className={styles.userId}>#{user.id}</span>
              </h1>
              <p className={styles.sub}>
                {user.firstName} {user.lastName} — {user.email}
              </p>
            </div>

            <div className={styles.pills}>
              <span className={styles.pill}>Status: {user.status}</span>
              <span className={styles.pill}>Role: {user.role}</span>
              <span className={user.emailVerified ? styles.pillOk : styles.pillBad}>
                Email {user.emailVerified ? "Verified" : "Not Verified"}
              </span>
            </div>
          </div>

          {(actionError || actionOk) && (
            <div className={`${styles.card} ${actionError ? styles.error : styles.okCard}`}>
              {actionError || actionOk}
            </div>
          )}

          <div className={styles.grid2}>
            <div className={styles.card}>
              <div className={styles.cardTitle}>User Details</div>
              <div className={styles.kv}>
                <div className={styles.k}>National ID</div>
                <div className={styles.v}>{user.nationalId}</div>

                <div className={styles.k}>DOB</div>
                <div className={styles.v}>{user.dateOfBirth || "-"}</div>

                <div className={styles.k}>Faculty / Dept / Year</div>
                <div className={styles.v}>{user.facultyId}/{user.departmentId}/{user.year}</div>

                <div className={styles.k}>Created</div>
                <div className={styles.v}>{user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}</div>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardTitle}>Email Verification</div>

              {!user.emailVerified && (
                <>
                  <p className={styles.muted}>
                    Email must be verified before approval.
                  </p>

                  <div className={styles.row}>
                    <button className={styles.btnPrimary} onClick={onSendVerification}>
                      Send verification
                    </button>
                  </div>

                  <div className={styles.row}>
                    <input
                      className={styles.input}
                      value={verificationToken}
                      onChange={(e) => setVerificationToken(e.target.value)}
                      placeholder="Paste token here (testing mode)"
                    />
                    <button className={styles.btn} onClick={onVerifyEmail}>
                      Verify now
                    </button>
                  </div>
                </>
              )}

              {user.emailVerified && (
                <p className={styles.okText}>✓ Email verified. You can approve.</p>
              )}
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Photo Comparison</div>
            <div className={styles.images}>
              <div>
                <div className={styles.imgLabel}>Profile Photo</div>
                <img
                  className={styles.bigImg}
                  src={profilePhotoUrl}
                  alt="profile"
                  onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                />
              </div>
              <div>
                <div className={styles.imgLabel}>National ID Scan</div>
                <img
                  className={styles.bigImg}
                  src={nationalIdScanUrl}
                  alt="national id"
                  onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>Decision</div>

            <div className={styles.row}>
              <button
                className={styles.btnPrimary}
                onClick={onApprove}
                disabled={!user.emailVerified}
                title={!user.emailVerified ? "Verify email first" : ""}
              >
                Approve
              </button>

              <div className={styles.rejectBox}>
                <input
                  className={styles.input}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Rejection reason (required)"
                />
                <button className={styles.btnDanger} onClick={onReject}>
                  Reject
                </button>
              </div>
            </div>

            <p className={styles.muted}>
              Approve/Reject uses: POST /api/admin/users/approve-reject (rejectionReason required if rejected).
            </p>
          </div>
        </>
      )}
    </div>
  );
}
