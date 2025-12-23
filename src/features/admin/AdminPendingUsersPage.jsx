import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPendingUsers } from "./admin.api";
import styles from "./admin.module.css";

export default function AdminPendingUsersPage() {
  const [users, setUsers] = useState([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getPendingUsers();
        if (mounted) setUsers(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load pending users");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return users
      .filter((u) => (verifiedOnly ? !!u.emailVerified : true))
      .filter((u) => {
        if (!query) return true;
        const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
        return (
          name.includes(query) ||
          String(u.email || "").toLowerCase().includes(query) ||
          String(u.id || "").includes(query)
        );
      });
  }, [users, verifiedOnly, q]);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Pending Users</h1>
          <p className={styles.sub}>
            Review pending accounts, verify email, then approve/reject.
          </p>
        </div>

        <div className={styles.headerActions}>
          <input
            className={styles.search}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / email / id…"
          />
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
            <span>Verified only</span>
          </label>
        </div>
      </div>

      {loading && <div className={styles.card}>Loading…</div>}
      {error && <div className={`${styles.card} ${styles.error}`}>{error}</div>}

      {!loading && !error && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Verified</th>
                <th>Faculty/Dept/Year</th>
                <th>Created</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className={styles.empty}>
                    No pending users found.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className={styles.userCell}>
                        <img
                          className={styles.avatar}
                          src={u.profilePhotoUrl || ""}
                          alt="profile"
                          onError={(e) => (e.currentTarget.style.display = "none")}
                        />
                        <div>
                          <div className={styles.userName}>
                            {u.firstName} {u.lastName} <span className={styles.userId}>#{u.id}</span>
                          </div>
                          <div className={styles.muted}>National ID: {u.nationalId}</div>
                        </div>
                      </div>
                    </td>

                    <td>{u.email}</td>

                    <td>
                      <span className={u.emailVerified ? styles.ok : styles.bad}>
                        {u.emailVerified ? "✓ Verified" : "✗ Not verified"}
                      </span>
                    </td>

                    <td className={styles.muted}>
                      {u.facultyId}/{u.departmentId}/{u.year}
                    </td>

                    <td className={styles.muted}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleString() : "-"}
                    </td>

                    <td style={{ textAlign: "right" }}>
                      <Link className={styles.btn} to={`/admin/review/${u.id}`}>
                        Review
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
