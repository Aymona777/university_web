import { apiRequest } from "../../core/api/apiClient";

export function getPendingUsers() {
  return apiRequest("/api/admin/users/pending");
}

export function getUserDetails(userId) {
  return apiRequest(`/api/admin/users/${userId}`);
}

export function approveRejectUser({ userId, approved, rejectionReason }) {
  return apiRequest("/api/admin/users/approve-reject", {
    method: "POST",
    body: JSON.stringify({ userId, approved, rejectionReason }),
  });
}

export function sendVerification(userId) {
  return apiRequest(`/api/admin/users/${userId}/send-verification`, {
    method: "POST",
  });
}

export function verifyEmail(userId, token) {
  return apiRequest(`/api/admin/users/${userId}/verify-email/${token}`, {
    method: "POST",
  });
}
