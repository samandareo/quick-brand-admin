import axios from "axios";
import config from "../config/config";

const http = axios.create({
  baseURL: config.apiUrl,
});

http.interceptors.request.use((config) => {
  config.headers["Authorization"] = localStorage.getItem("authToken");
  return config;
});

// AUTH APIs
export const loginAdmin = (data, params, headers) =>
  http.post("/api/v1/admins/login", data, { params, headers });
export const validateLogin = (params, headers) =>
  http.get("/api/v1/admins/me", { params, headers });

// ADMIN Profile APIs
export const updateAdmin = (data, params, headers) =>
  http.patch("/api/v1/admins/update", data, { params, headers });
export const updatePassword = (data, params, headers) =>
  http.patch("/api/v1/admins/update-password", data, { params, headers });
export const getDashboardStats = (params, headers) =>
  http.get("/api/v1/admins/dashboard", { params, headers });
export const saveFcmToken = (adminId, token, params, headers) =>
  http.post("/api/v1/admins/tokens", { adminId, token }, { params, headers });
export const removeFcmToken = (adminId, token, params, headers) =>
  http.delete("/api/v1/admins/tokens", {
    data: { adminId, token },
    params,
    headers,
  });
export const getNotifications = (params, headers) =>
  http.get("/api/v1/admins/notifications", { params, headers });
export const markNotificationAsRead = (notificationId, params, headers) =>
  http.post(
    `/api/v1/admins/notifications`,
    { notificationId },
    {
      params,
      headers,
    }
  );

// USER APIs
export const getUsers = (params, headers) =>
  http.get("/api/v1/users", { params, headers });
export const getUserById = (userId, params, headers) =>
  http.get(`/api/v1/users/${userId}`, { params, headers });
export const updateUser = (userId, data, params, headers) =>
  http.patch(`/api/v1/users/${userId}`, data, { params, headers });
export const DeleteUserById = (userId, params, headers) =>
  http.delete(`/api/v1/users/${userId}`, { params, headers });

// TRANSACTION APIs
export const getTransactions = (params, headers) =>
  http.get(`/api/v1/wallet/transactions/admin`, { params, headers });
export const getUserTransactions = (userId, params, headers) =>
  http.get(`/api/v1/wallet/${userId}/transactions`, { params, headers });

// OFFERS APIs
export const createOffer = (data, params, headers) =>
  http.post("/api/v1/offers", data, { params, headers });
export const getOffers = (params, headers) =>
  http.get("/api/v1/offers", { params, headers });
export const getOfferById = (offerId, params, headers) =>
  http.get(`/api/v1/offers/${offerId}`, { params, headers });
export const updateOffer = (offerId, data, params, headers) =>
  http.patch(`/api/v1/offers/${offerId}`, data, { params, headers });
export const deleteOffer = (offerId, params, headers) =>
  http.delete(`/api/v1/offers/${offerId}`, { params, headers });
export const toggleOfferStatus = (offerId, params, headers) =>
  http.patch(
    `/api/v1/offers/${offerId}/toggle-status`,
    {},
    { params, headers }
  );

// PURCHASE REQUESTS APIs
export const getPurchaseRequests = (params, headers) =>
  http.get("/api/v1/admins/purchase-requests", { params, headers });
export const updateRequestStatus = (requestId, data, params, headers) =>
  http.patch(`/api/v1/admins/purchase-requests/${requestId}`, data, {
    params,
    headers,
  });

// OPERATORS APIs
export const createOperator = (data, params, headers) =>
  http.post("/api/v1/operators", data, { params, headers });
export const getOperators = (params, headers) =>
  http.get("/api/v1/operators", { params, headers });
export const getOperatorById = (operatorId, params, headers) =>
  http.get(`/api/v1/operators/${operatorId}`, { params, headers });
export const updateOperator = (operatorId, data, params, headers) =>
  http.patch(`/api/v1/operators/${operatorId}`, data, { params, headers });
export const toggleOperatorStatus = (operatorId, params, headers) =>
  http.patch(
    `/api/v1/operators/${operatorId}/toggle-status`,
    {},
    { params, headers }
  );
export const deleteOperator = (operatorId, params, headers) =>
  http.delete(`/api/v1/operators/${operatorId}`, { params, headers });

// Social Media APIs
export const createSocialMedia = (data, params, headers) =>
  http.post("/api/v1/admins/social-media", data, { params, headers });
export const getSocialMedia = (params, headers) =>
  http.get("/api/v1/admins/social-media", { params, headers });
export const updateSocialMedia = (socialMediaId, data, params, headers) =>
  http.put(`/api/v1/admins/social-media/${socialMediaId}`, data, {
    params,
    headers,
  });
export const deleteSocialMedia = (socialMediaId, params, headers) =>
  http.delete(`/api/v1/admins/social-media/${socialMediaId}`, { params, headers });
export const getSocialMediaById = (socialMediaId, params, headers) =>
  http.get(`/api/v1/admins/social-media/${socialMediaId}`, { params, headers });

// Image Slider APIs
export const createImageSlider = (data, params, headers) =>
  http.post("/api/v1/admins/sliders", data, { params, headers });
export const getImageSliders = (params, headers) =>
  http.get("/api/v1/admins/sliders", { params, headers });
export const getimageSliderById = (imageSliderId, params, headers) =>
  http.get(`/api/v1/admins/sliders/${imageSliderId}`, { params, headers });
export const updateImageSlider = (imageSliderId, data, params, headers) =>
  http.put(`/api/v1/admins/sliders/${imageSliderId}`, data, { params, headers });
export const deleteImageSlider = (imageSliderId, params, headers) =>
  http.delete(`/api/v1/admins/sliders/${imageSliderId}`, {params, headers});

// Push Notification APIs
export const getPushNotifications = (params, headers) =>
  http.get("/api/v1/push-notifications", { params, headers });
export const getPushNotificationById = (pushNotificationId, params, headers) =>
  http.get(`/api/v1/push-notifications/${pushNotificationId}`, { params, headers });
export const getPushNotificationStats = (params, headers) =>
  http.get("/api/v1/push-notifications/stats/overview", { params, headers });
export const createPushNotification = (data, params, headers) =>
  http.post("/api/v1/push-notifications", data, { params, headers });
export const updatePushNotification = (pushNotificationId, data, params, headers) =>
  http.put(`/api/v1/push-notifications/${pushNotificationId}`, data, { params, headers });
export const deletePushNotification = (pushNotificationId, params, headers) =>
  http.delete(`/api/v1/push-notifications/${pushNotificationId}`, { params, headers });
export const sendPushNotification = (notificationId, params, headers) =>
  http.post(`/api/v1/push-notifications/${notificationId}/send`, {}, { params, headers });

// CHAT APIs
export const getChatConversations = (params, headers) =>
  http.get("/api/v1/chat/conversations", { params, headers });

export const getChatConversationMessages = (conversationId, params, headers) =>
  http.get(`/api/v1/chat/conversations/${conversationId}/messages`, { params, headers });

export const markChatConversationAsSeen = (conversationId, params, headers) =>
  http.post(`/api/v1/chat/conversations/${conversationId}/seen`, {}, { params, headers });

export const getChatUserInfo = (userId, params, headers) =>
  http.get(`/api/v1/chat/users/${userId}`, { params, headers });

export const getChatUnreadCount = (params, headers) =>
  http.get("/api/v1/chat/unread-count", { params, headers });

export const getChatConversationBetweenUsers = (userId1, userId2, params, headers) =>
  http.get(`/api/v1/chat/conversation/${userId1}/${userId2}`, { params, headers });

export const getChatStats = (params, headers) =>
  http.get("/api/v1/chat/stats", { params, headers });

export const getAllChatUsers = (params, headers) =>
  http.get("/api/v1/chat/users", { params, headers });

export const deleteChatMessage = (messageId, params, headers) =>
  http.delete(`/api/v1/chat/messages/${messageId}`, { params, headers });

// Manual Withdrawal APIs
export const getManualWithdrawals = (params, headers) =>
  http.get("/api/v1/admins/manual-withdrawals", { params, headers });
export const getManualWithdrawalById = (withdrawalId, params, headers) =>
  http.get(`/api/v1/admins/manual-withdrawals/${withdrawalId}`, { params, headers });
export const updateManualWithdrawal = (withdrawalId, data, params, headers) =>
  http.patch(`/api/v1/admins/manual-withdrawals/${withdrawalId}`, data, { params, headers });

// Mobile Banking APIs
export const createMobileBanking = (data, params, headers) =>
  http.post("/api/v1/admins/mobile-banking", data, { params, headers });
export const getMobileBankings = (params, headers) =>
  http.get("/api/v1/admins/mobile-banking", { params, headers });
export const getMobileBankingById = (id, params, headers) =>
  http.get(`/api/v1/admins/mobile-banking/${id}`, { params, headers });
export const updateMobileBanking = (id, data, params, headers) =>
  http.put(`/api/v1/admins/mobile-banking/${id}`, data, { params, headers });
export const deleteMobileBanking = (id, params, headers) =>
  http.delete(`/api/v1/admins/mobile-banking/${id}`, { params, headers });

// Reward Info APIs
export const getRewardInfo = (params, headers) =>
  http.get("/api/v1/admins/reward-info", { params, headers });
export const updateRewardInfo = (data, params, headers) =>
  http.put("/api/v1/admins/reward-info", data, { params, headers });