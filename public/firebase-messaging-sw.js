// Import Firebase scripts for the Service Worker
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js");

// Initialize Firebase inside the Service Worker using your Al Maida credentials
firebase.initializeApp({
  apiKey: "AIzaSyCWx4-i_J5kFkMkoE4yl2aSlHTFcfGQiDA",
  authDomain: "al-maida-pizza-garden-web.firebaseapp.com",
  projectId: "al-maida-pizza-garden-web",
  storageBucket: "al-maida-pizza-garden-web.firebasestorage.app",
  messagingSenderId: "620888624191",
  appId: "1:620888624191:web:2a79f7b1746b08b41b3c8a",
  measurementId: "G-SST55LX0Q0"
});

const messaging = firebase.messaging();

// Handle background notifications (when browser tab is closed/minimized)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/favicon.ico'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});