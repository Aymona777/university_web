import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // تأكد من استيراد Link
import { getAllUsers } from "./admin.api"; 
import { authStorage } from "../../core/auth/auth.storage";
import styles from "./admin.module.css";

export default function AdminPendingUsersPage() {
  const navigate = useNavigate();
  // ... (نفس الكود القديم للـ state) ...
  const [allUsers, setAllUsers] = useState([]);
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
      // بنستخدم الدالة الموحدة getAllUsers
      const result = await getAllUsers();
      const data = Array.isArray(result) ? result : (result.data || []);
      setAllUsers(data);
    } catch (e) {
      setError("Failed to load users: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  // ... (نفس كود filtered useMemo القديم) ...
  const filtered = useMemo(() => {
    let list = allUsers;
    if (activeTab === "PENDING") {
      list = list.filter(u => u.status === "PENDING");
    } else if (activeTab === "UNVERIFIED") {
      list = list.filter(u => !u.emailVerified);
    } 
    const query = q.trim().toLowerCase();
    if (!query) return list;
    return list.filter((u) => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      return (
        name.includes(query) ||
        String(u.email || "").toLowerCase().includes(query)
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
          {/* ✅ زرار جديد يرجعك لصفحة الإحصائيات */}
          <Link to="/admin" style={{ textDecoration: 'none', color: '#3b82f6', fontSize: 14, fontWeight: 'bold', display: 'block', marginBottom: 5 }}>
            ⬅ Back to Dashboard
          </Link>
          <h1 className={styles.title}>Manage Users</h1>
          <p className={styles.sub}>Review and manage student accounts</p>
        </div>
        <button onClick={handleLogout} className={styles.logoutBtn}>Logout ➜</button>
      </div>

      <div className={styles.controlsCard}>
        {/* ... (نفس التابات والبحث القديم) ... */}
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === "PENDING" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("PENDING")}
          >
            ⏳ Pending
          </button>
          <button 
             className={`${styles.tab} ${activeTab === "UNVERIFIED" ? styles.activeTab : ""}`}
             onClick={() => setActiveTab("UNVERIFIED")}
          >
            ✉️ Unverified
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
      {error && <div className={styles.badgeWarning} style={{padding: 10}}>{error}</div>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User Info</th>
                <th>Status</th>
                <th>Email</th>
                <th>Academic</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{padding: 20, textAlign: 'center', color: '#888'}}>
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <img
                          className={styles.avatar}
                          src={u.profilePhotoUrl || u.profilePhoto || "https://via.placeholder.com/40"} 
                          alt="profile"
                        />
                        <div>
                          <div className={styles.userName}>{u.firstName} {u.lastName}</div>
                          <div className={styles.userId}>NID: {u.nationalId}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className={`${styles.statusBadge} ${styles[u.status]}`}>
                        {u.status}
                      </span>
                    </td>

                    <td>
                      {u.emailVerified ? (
                        <span className={styles.badgeSuccess}>Verified</span>
                      ) : (
                        <span className={styles.badgeWarning}>Not Verified</span>
                      )}
                    </td>

                    <td>
                      <div className={styles.academicInfo}>
                        <div>{u.faculty}</div>
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