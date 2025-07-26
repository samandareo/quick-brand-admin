import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// const firebaseConfig = {
//   apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
//   authDomain: import.meta.env.VITE_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: import.meta.env.VITE_APP_FIREBASE_PROJECT_ID,
//   storageBucket: import.meta.env.VITE_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: import.meta.env.VITE_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: import.meta.env.VITE_APP_FIREBASE_APP_ID,
// };
const firebaseConfig = {
  apiKey: "AIzaSyC5gmaOyLsK-cSiqlQyM3giLo4FwYDGdcg",
  authDomain: "quickboandpluse.firebaseapp.com",
  projectId: "quickboandpluse",
  storageBucket: "quickboandpluse.firebasestorage.app",
  messagingSenderId: "120126048628",
  appId: "1:120126048628:web:5fed2e6e01948827650421",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get token
const requestPermissionAndToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    console.log(permission);

    if (permission === "granted") {
      const currentToken = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_APP_FIREBASE_VAPID_KEY,
      });

      return currentToken;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
  return null;
};

const onForegroundMessage = (callback) => {
  return onMessage(messaging, (payload) => {
    // Add click handler for foreground notifications
    if (payload.notification && payload.data) {
      const handleClick = () => {
        const url = payload.data.url || "/purchase-requests";
        window.location.href = url;
      };

      callback({
        ...payload,
        onClick: handleClick,
      });
    }
  });
};

export { messaging, requestPermissionAndToken, onForegroundMessage };
