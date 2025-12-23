import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllUsers } from "./admin.api"; // لاحظ: بنستخدم getAllUsers
import { authStorage } from "../../core/auth/auth.storage";
import styles from "./admin.module.css";

export default function AdminPendingUsersPage() {
  const navigate = useNavigate();
  const [allUsers, setAllUsers] = useState([]);
  
  // Tabs: 'PENDING' | 'UNVERIFIED' | 'ALL'
  const [activeTab, setActiveTab] = useState("PENDING"); 
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      // بنجيب الداتابيز كلها والفلترة عندنا
      const result = await getAllUsers();
      const data = result.data || result;
      if (Array.isArray(data)) {
        setAllUsers(data);
      } else {
        setAllUsers([]);
      }
    } catch (e) {
      setError("Failed to load users: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    let list = allUsers;

    // 1. فلترة حسب التاب
    if (activeTab === "PENDING") {
      // هات الـ Pending بس (سواء مفعل إيميل أو لا)
      list = list.filter(u => u.status === "PENDING");
    } else if (activeTab === "UNVERIFIED") {
      // هات اللي إيميلهم مش مفعل (عشان نبعتلهم تفعيل)
      list = list.filter(u => !u.emailVerified);
    } 
    // tab === 'ALL' بيعرض كله

    // 2. البحث
    const query = q.trim().toLowerCase();
    if (!query) return list;
    
    return list.filter((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      return (
        name.includes(query) ||
        String(u.email || "").toLowerCase().includes(query) ||
        String(u.id || "").includes(query)
      );
    });
  }, [allUsers, activeTab, q]);

  function handleLogout() {
    authStorage.clear();
    navigate("/login");
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.sub}>System Overview & Management</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout ➜</button>
      </div>

      <div className={styles.controlsCard}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === "PENDING" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("PENDING")}
          >
            ⏳ Pending Requests
          </button>
          <button 
             className={`${styles.tab} ${activeTab === "UNVERIFIED" ? styles.activeTab : ""}`}
             onClick={() => setActiveTab("UNVERIFIED")}
          >
            ✉️ Unverified Emails
          </button>
          <button 
             className={`${styles.tab} ${activeTab === "ALL" ? styles.activeTab : ""}`}
             onClick={() => setActiveTab("ALL")}
          >
            👥 All Users
          </button>
        </div>

        <input
          className={styles.search}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="🔍 Search..."
        />
      </div>

      {loading && <div className={styles.loading}>Loading users...</div>}
      {error && <div className={styles.errorBanner}>{error}</div>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User Info</th>
                <th>Status</th>
                <th>Email Verification</th>
                <th>Academic</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={styles.empty}>
                    No users found in this category.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <img
                          className={styles.avatar}
                          src={u.profilePhotoUrl || u.profilePhoto || ""} 
                          alt="profile"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <div>
                          <div className={styles.userName}>{u.firstName} {u.lastName}</div>
                          <div className={styles.userId}>NID: {u.nationalId}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      {/* عرض حالة الحساب (Pending/Approved/Rejected) */}
                      <span className={`${styles.statusBadge} ${styles[u.status]}`}>
                        {u.status}
                      </span>
                    </td>

                    <td>
                      {u.emailVerified ? (
                        <span className={styles.badgeSuccess}>✓ Verified</span>
                      ) : (
                        <span className={styles.badgeWarning}>⚠ Not Verified</span>
                      )}
                    </td>

                    <td>
                      <div className={styles.academicInfo}>
                        <div>{u.faculty || "Unknown Faculty"}</div>
                        <div style={{fontSize: 11, opacity: 0.7}}>{u.department}</div>
                      </div>
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <Link className={styles.btnPrimary} to={`/admin/review/${u.id}`}>
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}