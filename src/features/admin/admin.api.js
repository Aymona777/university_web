import { apiRequest } from "../../core/api/apiClient";
import { endpoints } from "../../core/api/endpoints";

export function getAllUsers() {
  return apiRequest(endpoints.admin.users);
}

export function getPendingUsers() {
  return apiRequest(endpoints.admin.pending);
}

export function getUserDetails(userId) {
  return apiRequest(`${endpoints.admin.userDetail}/${userId}`);
}

export function getStudentProfile(userId) {
  return apiRequest(`/api/profile/${userId}`);
}

export function approveRejectUser({ userId, approved, rejectionReason }) {
  return apiRequest(endpoints.admin.approveReject, {
    method: "POST",
    body: JSON.stringify({ userId, approved, rejectionReason }),
  });
}

export function sendVerification(userId) {
  return apiRequest(`${endpoints.admin.sendVerification}/${userId}/send-verification`, {
    method: "POST",
  });
}

export function verifyEmailWithToken(userId, token) {
  return apiRequest(`${endpoints.admin.verifyEmail}/${userId}/verify-email/${token}`, {
    method: "POST",
  });
}