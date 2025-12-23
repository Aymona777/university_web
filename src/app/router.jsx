/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { createBrowserRouter } from "react-router-dom";

// === Auth Pages ===
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import PendingStatusPage from "../features/auth/PendingStatusPage";

// === Profile Pages ===
import StudentProfilePage from "../features/profile/StudentProfilePage";

// === Admin Pages ===
import AdminPendingUsersPage from "../features/admin/AdminPendingUsersPage";
import AdminReviewUserPage from "../features/admin/AdminReviewUserPage";
import AdminDashboardPage from "../features/admin/AdminDashboardPage"; // ✅ Import الداشبورد

// === Guards (HOCs) ===
import { RequireAuth } from "../core/auth/requireAuth";
import { RequireAdmin } from "../core/auth/requireAdmin";
import { RequireApprovedStudent } from "../core/auth/requireApprovedStudent";

function NotFound() {
  return (
    <div style={{ padding: 40, textAlign: "center", color: '#333' }}>
      <h2>404 - Page Not Found</h2>
      <a href="/login">Go to Login</a>
    </div>
  );
}

export const router = createBrowserRouter([
  // 1. Public Routes
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },

  // 2. Auth Status
  {
    path: "/status",
    element: (
      <RequireAuth>
        <PendingStatusPage />
      </RequireAuth>
    ),
  },

  // 3. Student Routes (Profile Only)
  {
    path: "/me",
    element: (
      <RequireApprovedStudent>
        <StudentProfilePage />
      </RequireApprovedStudent>
    ),
  },

  // 4. Admin Routes
  // ✅ Dashboard Route (Default for /admin)
  { 
    path: "/admin", 
    element: (
      <RequireAdmin>
        <AdminDashboardPage />
      </RequireAdmin>
    ) 
  },
  // ✅ User Management Route
  {
    path: "/admin/pending",
    element: (
      <RequireAdmin>
        <AdminPendingUsersPage />
      </RequireAdmin>
    ),
  },
  // ✅ User Review Route
  {
    path: "/admin/review/:userId",
    element: (
      <RequireAdmin>
        <AdminReviewUserPage />
      </RequireAdmin>
    ),
  },

  // 5. Fallback
  { path: "*", element: <NotFound /> },
]);