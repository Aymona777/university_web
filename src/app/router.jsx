/* eslint-disable react-refresh/only-export-components */
import React from "react";
import { createBrowserRouter } from "react-router-dom";
import { RequireApprovedStudent } from "../core/auth/requireApprovedStudent";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import PendingStatusPage from "../features/auth/PendingStatusPage";

import { RequireAuth } from "../core/auth/requireAuth";
import { RequireAdmin } from "../core/auth/requireAdmin";

import AdminPendingUsersPage from "../features/admin/AdminPendingUsersPage";
import AdminReviewUserPage from "../features/admin/AdminReviewUserPage";

function MePage() {
  return (
    <RequireAuth>
      <div
        style={{
          padding: 24,
          color: "#111",
          minHeight: "100vh",
          background: "#f6f7fb",
        }}
      >
        <h2>My Page (placeholder)</h2>
        <p>✅ Redirect after login worked.</p>
      </div>
    </RequireAuth>
  );
}

function AdminHome() {
  return (
    <RequireAdmin>
      <div style={{ padding: 24 }}>
        <h2>Admin Home (placeholder)</h2>
        <p>
          Go to: <a href="/admin/pending">Pending Users</a>
        </p>
      </div>
    </RequireAdmin>
  );
}

function NotFound() {
  return (
    <div style={{ padding: 24 }}>
      <h2>404 - Page Not Found</h2>
      <a href="/login">Go to Login</a>
    </div>
  );
}

export const router = createBrowserRouter([
  { path: "/", element: <LoginPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },

  { path: "/me", element: <RequireApprovedStudent><MePage /></RequireApprovedStudent> },

  {
    path: "/status",
    element: (
      <RequireAuth>
        <PendingStatusPage />
      </RequireAuth>
    ),
  },

  { path: "/admin", element: <AdminHome /> },

  {
    path: "/admin/pending",
    element: (
      <RequireAdmin>
        <AdminPendingUsersPage />
      </RequireAdmin>
    ),
  },

  {
    path: "/admin/review/:userId",
    element: (
      <RequireAdmin>
        <AdminReviewUserPage />
      </RequireAdmin>
    ),
  },

  { path: "*", element: <NotFound /> },
]);
