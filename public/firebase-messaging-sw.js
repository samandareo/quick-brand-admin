/* eslint-disable no-undef */
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

const firebaseConfig = {
  apiKey: "AIzaSyC5gmaOyLsK-cSiqlQyM3giLo4FwYDGdcg",
  authDomain: "quickboandpluse.firebaseapp.com",
  projectId: "quickboandpluse",
  storageBucket: "quickboandpluse.firebasestorage.app",
  messagingSenderId: "120126048628",
  appId: "1:120126048628:web:5fed2e6e01948827650421",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const notificationTitle = payload.data?.title;
  const notificationOptions = {
    body: payload.data?.body,
    icon: "/logo.jpeg",
    data: { url: payload.data?.url }, // Include all data for click handling
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click handler
self.addEventListener("notificationclick", (event) => {
  // Close the notification
  event.notification.close();

  // Get the URL from notification data or use your admin panel URL
  const urlToOpen = new URL(
    event.notification.data?.url || "/purchase-requests",
    self.location.origin
  ).href;

  // Focus/open the admin panel
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Check if admin panel is already open
      for (const client of clientList) {
        if (client.url.includes("/") && "focus" in client) {
          return client.focus();
        }
      }

      // If no matching window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
