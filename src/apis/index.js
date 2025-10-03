import axios from "axios";
import config from "../config/config";

const http = axios.create({
  baseURL: config.apiUrl,
});

const httpEcommerce = axios.create({
  baseURL: config.apiUrlEcommerce,
});

httpEcommerce.interceptors.request.use((config) => {
  config.headers["Authorization"] = localStorage.getItem("authToken");
  return config;
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

// ECOMMERCE APIs

// Categories APIs
export const createCategory = (data, params, headers) =>
  httpEcommerce.post("/api/v1/categories", data, { params, headers });
export const getCategories = (params, headers) =>
  httpEcommerce.get("/api/v1/categories", { params, headers });
export const getCategoryById = (categoryId, params, headers) =>
  httpEcommerce.get(`/api/v1/categories/${categoryId}`, { params, headers });
export const updateCategory = (categoryId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/categories/${categoryId}`, data, { params, headers });
export const deleteCategory = (categoryId, params, headers) =>
  httpEcommerce.delete(`/api/v1/categories/${categoryId}`, { params, headers });
export const toggleCategoryStatus = (categoryId, params, headers) =>
  httpEcommerce.patch(`/api/v1/categories/${categoryId}/toggle-status`, {}, { params, headers });

// Products APIs
export const createProduct = (data, params, headers) =>
  httpEcommerce.post("/api/v1/products", data, { params, headers });
export const getProducts = (params, headers) =>
  httpEcommerce.get("/api/v1/products", { params, headers });
export const getProductById = (productId, params, headers) =>
  httpEcommerce.get(`/api/v1/products/${productId}`, { params, headers });
export const updateProduct = (productId, data, params, headers) =>
  httpEcommerce.put(`/api/v1/products/${productId}`, data, { params, headers });
export const deleteProduct = (productId, params, headers) =>
  httpEcommerce.delete(`/api/v1/products/${productId}`, { params, headers });
export const toggleProductStatus = (productId, params, headers) =>
  httpEcommerce.patch(`/api/v1/products/${productId}/toggle-status`, {}, { params, headers });
export const setFlashSale = (productId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/products/${productId}/flash-sale`, data, { params, headers });
export const deactivateFlashSale = (productId, params, headers) =>
  httpEcommerce.patch(`/api/v1/products/${productId}/flash-sale/deactivate`, {}, { params, headers });
export const updateProductInventory = (productId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/products/${productId}/inventory`, data, { params, headers });
export const getProductStats = (params, headers) =>
  httpEcommerce.get("/api/v1/products/stats", { params, headers });
export const getFlashSaleProducts = (params, headers) =>
  httpEcommerce.get("/api/v1/products/flash-sale", { params, headers });
export const getTopRatedProducts = (params, headers) =>
  httpEcommerce.get("/api/v1/products/top-rated", { params, headers });
export const getProductsInStock = (params, headers) =>
  httpEcommerce.get("/api/v1/products/in-stock", { params, headers });
export const getOutOfStockProducts = (params, headers) =>
  httpEcommerce.get("/api/v1/products/out-of-stock", { params, headers });
export const getLowStockProducts = (params, headers) =>
  httpEcommerce.get("/api/v1/products/low-stock", { params, headers });
export const getAllBrands = (params, headers) =>
  httpEcommerce.get("/api/v1/products/brands", { params, headers });
export const getAllTags = (params, headers) =>
  httpEcommerce.get("/api/v1/products/tags", { params, headers });
export const uploadProductImages = (formData, params, headers) =>
  httpEcommerce.post("/api/v1/products/upload-images", formData, { 
    params, 
    headers: { 
      ...headers, 
      'Content-Type': 'multipart/form-data' 
    } 
  });
export const updateProductData = (productId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/products/${productId}`, data, { params, headers });

// Variants APIs
export const createVariant = (productId, data, params, headers) =>
  httpEcommerce.post(`/api/v1/variants/${productId}`, data, { 
    params, 
    headers: { 
      ...headers, 
      'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
    } 
  });
export const getVariants = (params, headers) =>
  httpEcommerce.get("/api/v1/variants", { params, headers });
export const getVariantById = (variantId, params, headers) =>
  httpEcommerce.get(`/api/v1/variants/single/${variantId}`, { params, headers });
export const updateVariant = (variantId, data, params, headers) =>
  httpEcommerce.put(`/api/v1/variants/${variantId}`, data, { 
    params, 
    headers: { 
      ...headers, 
      'Content-Type': data instanceof FormData ? 'multipart/form-data' : 'application/json'
    } 
  });
export const deleteVariant = (variantId, params, headers) =>
  httpEcommerce.delete(`/api/v1/variants/${variantId}`, { params, headers });
export const toggleVariantStatus = (variantId, params, headers) =>
  httpEcommerce.patch(`/api/v1/variants/${variantId}/toggle-status`, {}, { params, headers });
export const updateVariantInventory = (variantId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/variants/${variantId}/inventory`, data, { params, headers });
export const addToInventory = (variantId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/variants/${variantId}/add-inventory`, data, { params, headers });
export const removeFromInventory = (variantId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/variants/${variantId}/remove-inventory`, data, { params, headers });
export const getVariantsByProduct = (productId, params, headers) =>
  httpEcommerce.get(`/api/v1/variants/${productId}`, { params, headers });
export const getVariantsInStock = (productId, params, headers) =>
  httpEcommerce.get(`/api/v1/variants/${productId}/in-stock`, { params, headers });
export const getOutOfStockVariants = (productId, params, headers) =>
  httpEcommerce.get(`/api/v1/variants/${productId}/out-of-stock`, { params, headers });

// Banners APIs
export const createBanner = (data, params, headers) =>
  httpEcommerce.post("/api/v1/banners", data, { params, headers });
export const getBanners = (params, headers) =>
  httpEcommerce.get("/api/v1/banners", { params, headers });
export const getBannerById = (bannerId, params, headers) =>
  httpEcommerce.get(`/api/v1/banners/${bannerId}`, { params, headers });
export const updateBanner = (bannerId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/banners/${bannerId}`, data, { params, headers });
export const deleteBanner = (bannerId, params, headers) =>
  httpEcommerce.delete(`/api/v1/banners/${bannerId}`, { params, headers });
export const toggleBannerStatus = (bannerId, params, headers) =>
  httpEcommerce.patch(`/api/v1/banners/${bannerId}/toggle-status`, {}, { params, headers });
export const uploadBannerImage = (formData, params, headers) =>
  httpEcommerce.post("/api/v1/banners/upload-image", formData, { 
    params, 
    headers: { 
      ...headers, 
      'Content-Type': 'multipart/form-data' 
    } 
  });

// Orders APIs
export const getAllOrders = (params, headers) =>
  httpEcommerce.get("/api/v1/orders/admin/all", { params, headers });
export const getOrderById = (orderId, params, headers) =>
  httpEcommerce.get(`/api/v1/orders/admin/${orderId}`, { params, headers });
export const updateOrderStatus = (orderId, data, params, headers) =>
  httpEcommerce.patch(`/api/v1/orders/admin/${orderId}/status`, data, { params, headers });
export const refundDeliveryCost = (orderId, data, params, headers) =>
  httpEcommerce.post(`/api/v1/orders/admin/${orderId}/refund`, data, { params, headers });
export const getOrderStats = (params, headers) =>
  httpEcommerce.get("/api/v1/orders/admin/stats/overview", { params, headers });
export const getOrdersByStatus = (status, params, headers) =>
  httpEcommerce.get(`/api/v1/orders/admin/status/${status}`, { params, headers });
export const bulkUpdateOrderStatus = (data, params, headers) =>
  httpEcommerce.patch("/api/v1/orders/admin/bulk-update", data, { params, headers });

// Ecommerce Dashboard APIs
export const getEcommerceStats = (params, headers) =>
  httpEcommerce.get("/api/v1/admins/ecommerce/stats", { params, headers });
export const getBestSellingProducts = (params, headers) =>
  httpEcommerce.get("/api/v1/products/mobile/top-selling", { params, headers });
export const getDailySales = (params, headers) =>
  httpEcommerce.get("/api/v1/orders/admin/daily-sales", { params, headers });

// Recharge APIs
const httpRecharge = axios.create({
  baseURL: "https://recharge.aspshopping.com",
});

httpRecharge.interceptors.request.use((config) => {
  config.headers["Authorization"] = localStorage.getItem("authToken");
  return config;
});

export const getAllRecharges = (params, headers) =>
  httpRecharge.get("/api/recharge/all", { params, headers });

// Cashback APIs
export const getAllCashbackRules = (params, headers) =>
  httpRecharge.get("/api/cashback/", { params, headers });
export const createCashbackRule = (data, params, headers) =>
  httpRecharge.post("/api/cashback/", data, { params, headers });
export const updateCashbackRule = (data, params, headers) =>
  httpRecharge.put("/api/cashback/", data, { params, headers });
export const deleteCashbackRule = (data, params, headers) =>
  httpRecharge.delete("/api/cashback/", { data, params, headers });

// Recharge Operators APIs
export const getAllRechargeOperators = (params, headers) =>
  httpRecharge.get("/api/recharge/operators", { params, headers });
export const createRechargeOperator = (data, params, headers) =>
  httpRecharge.post("/api/recharge/operators", data, { params, headers });
export const updateRechargeOperator = (data, params, headers) =>
  httpRecharge.put("/api/recharge/operators", data, { params, headers });
export const toggleRechargeOperatorStatus = (data, params, headers) =>
  httpRecharge.patch("/api/recharge/operators", data, { params, headers });
export const deleteRechargeOperator = (data, params, headers) =>
  httpRecharge.delete("/api/recharge/operators", { data, params, headers });