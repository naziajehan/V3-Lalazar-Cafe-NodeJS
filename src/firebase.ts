import { initializeApp } from "firebase/app"

import { getAnalytics, isSupported } from "firebase/analytics"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getMessaging } from "firebase/messaging" // 1. Add this import

export const ADMIN_EMAIL = "naziajehan9@gmail.com"

const firebaseConfig = {
  apiKey: "AIzaSyCWx4-i_J5kFkMkoE4yl2aSlHTFcfGQiDA",

  authDomain: "al-maida-pizza-garden-web.firebaseapp.com",

  projectId: "al-maida-pizza-garden-web",

  storageBucket: "al-maida-pizza-garden-web.firebasestorage.app",

  messagingSenderId: "620888624191",

  appId: "1:620888624191:web:2a79f7b1746b08b41b3c8a",

  measurementId: "G-SST55LX0Q0",
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const messaging = getMessaging(app)
export const analytics = isSupported().then((supported) =>
  supported ? getAnalytics(app) : null,
)


