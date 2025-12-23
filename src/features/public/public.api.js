import { apiRequest } from "../../core/api/apiClient";

export function getPublicUsers() {
  // ✅ التعديل: استخدام الرابط المخصص للطلاب والموجود في ProfileController
  // هذا الرابط يجلب فقط الطلاب المقبولين (Approved) والـ Public
  return apiRequest("/api/profile/public-students");
}

export function getPublicProfile(userId) {
  return apiRequest(`/api/profile/${userId}`);
}