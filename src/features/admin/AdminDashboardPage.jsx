import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllUsers } from "./admin.api";
import { authStorage } from "../../core/auth/auth.storage";
import styles from "./admin.module.css";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    byFaculty: {},
  });

  useEffect(() => {
    calculateStats();
  }, []);

  async function calculateStats() {
    setLoading(true);
    setError("");
    try {
      // 1. جلب البيانات
      const response = await getAllUsers();
      
      // [DEBUG] اطبع البيانات في الكونسول عشان نتأكد من شكلها
      console.log("📊 Raw Dashboard Response:", response);

      // 2. توحيد شكل الليست (Handling Arrays, Data wrapper, or Page content)
      let allData = [];
      if (Array.isArray(response)) {
        allData = response;
      } else if (response.data && Array.isArray(response.data)) {
        allData = response.data;
      } else if (response.content && Array.isArray(response.content)) {
        // حالة خاصة لو الباك إند بيرجع Spring Boot Page
        allData = response.content;
      }

      console.log("✅ Parsed User List:", allData);

      if (allData.length >= 0) {
        // 3. فلترة الأدمن (بشكل مرن: يقبل ADMIN أو ROLE_ADMIN)
        const studentsOnly = allData.filter(u => {
          const role = String(u.role || "").toUpperCase();
          return role !== "ADMIN" && role !== "ROLE_ADMIN";
        });

        // 4. حساب الأعداد (مع تجاهل حالة الأحرف Upper/Lower Case)
        const total = studentsOnly.length;
        
        const pending = studentsOnly.filter(u => 
          String(u.status || "").toUpperCase() === "PENDING"
        ).length;
        
        const approved = studentsOnly.filter(u => 
          String(u.status || "").toUpperCase() === "APPROVED"
        ).length;
        
        const rejected = studentsOnly.filter(u => 
          String(u.status || "").toUpperCase() === "REJECTED"
        ).length;

        // 5. تجميع الكليات
        const facultyMap = {};
        studentsOnly.forEach(student => {
          const facultyName = student.faculty || "Unknown Faculty";
          if (!facultyMap[facultyName]) facultyMap[facultyName] = 0;
          facultyMap[facultyName]++;
        });

        setStats({
          totalStudents: total,
          pending,
          approved,
          rejected,
          byFaculty: facultyMap,
        });
      } else {
        setError("Invalid Data Structure received.");
      }
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError("Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    authStorage.clear();
    window.location.href = "/login";
  }

  if (loading) return <div className={styles.pageCenter}><div>Loading Dashboard...</div></div>;
  if (error) return <div className={styles.page}><div className={styles.badgeWarning} style={{fontSize: 16}}>{error}</div></div>;

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Admin Analytics Dashboard</h1>
          <p className={styles.sub}>Real-time system overview & statistics</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link to="/admin/pending" className={styles.btnPrimary} style={{ background: '#374151' }}>
             Manage Users ➜
          </Link>
          <button onClick={handleLogout} className={styles.logoutBtn}>Logout</button>
        </div>
      </div>

      {/* 1. Visualization Cards (Stats) */}
      <div className={styles.statsGrid}>
        
        <div className={`${styles.statCard} ${styles.blueCard}`}>
          <h3 className={styles.statTitle}>Total Students</h3>
          <div className={styles.statValue}>{stats.totalStudents}</div>
          <div className={styles.statDesc}>Registered accounts</div>
        </div>

        <div className={`${styles.statCard} ${styles.yellowCard}`}>
          <h3 className={styles.statTitle}>Pending Requests</h3>
          <div className={styles.statValue}>{stats.pending}</div>
          <div className={styles.statDesc}>
            <span style={{color:'#facc15'}}>●</span> Awaiting approval
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.greenCard}`}>
          <h3 className={styles.statTitle}>Active Students</h3>
          <div className={styles.statValue}>{stats.approved}</div>
          <div className={styles.statDesc}>
            <span style={{color:'#4ade80'}}>●</span> Fully verified
          </div>
        </div>

        <div className={`${styles.statCard} ${styles.redCard}`}>
          <h3 className={styles.statTitle}>Rejected / Banned</h3>
          <div className={styles.statValue}>{stats.rejected}</div>
          <div className={styles.statDesc}>Incomplete or fake profiles</div>
        </div>

      </div>

      {/* 2. Visualization Charts (Faculty Distribution) */}
      <div className={styles.chartSection}>
        <div className={styles.chartHeader}>📊 Students per Faculty</div>
        
        <div className={styles.facultyGrid}>
          {Object.keys(stats.byFaculty).length === 0 ? (
            <div style={{ color: "#6b7280" }}>No data available yet.</div>
          ) : (
            Object.entries(stats.byFaculty).map(([faculty, count]) => {
              // Calculate percentage for progress bar
              const percentage = stats.totalStudents > 0 ? (count / stats.totalStudents) * 100 : 0;
              
              return (
                <div key={faculty} className={styles.facultyItem}>
                  <div className={styles.facultyTop}>
                    <span style={{ color: "#e5e7eb" }}>{faculty}</span>
                    <span style={{ color: "#3b82f6" }}>{count}</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: "11px", color: "#6b7280", marginTop: "4px" }}>
                    {percentage.toFixed(1)}%
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}