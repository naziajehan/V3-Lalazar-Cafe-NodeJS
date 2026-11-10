import { FirebaseError, initializeApp } from "firebase/app"
import { getAnalytics, isSupported } from "firebase/analytics"
import {
  getAuth,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"
import {
  collection,
  doc,
  getFirestore,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from "firebase/firestore"
import { MENU, type MenuItem } from "./menu"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const ADMIN_EMAIL = "naziajehan9@gmail.com"
export const firebaseConfigured = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.storageBucket,
  firebaseConfig.messagingSenderId,
  firebaseConfig.appId,
].every(Boolean)

const app = firebaseConfigured ? initializeApp(firebaseConfig) : null
export const auth = app ? getAuth(app) : null
const db = app ? getFirestore(app) : null
if (app && typeof window !== "undefined" && firebaseConfig.measurementId) {
  void isSupported()
    .then((supported) => {
      if (supported) getAnalytics(app)
    })
    .catch((error: unknown) => {
      console.warn("Firebase Analytics could not be initialized.", error)
    })
}

export interface CafeSettings {
  phone: string
  email: string
  address: string
  hours: string
}

export interface CustomerData extends DocumentData {
  id: string
  name: string
  phone: string
  email: string
  address: string
  notes: string
  createdAt: string
  orderId?: string
}

export interface OrderData extends DocumentData {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: { id: number; name: string; qty: number; price: number }[]
  subtotal: number
  status:
    | "Pending"
    | "Confirmed"
    | "Preparing"
    | "Out for delivery"
    | "Delivered"
    | "Cancelled"
  createdAt: string
  updatedAt: string
  deadlineMinutes: number
  notes: string
  timeline: {
    status:
      | "Pending"
      | "Confirmed"
      | "Preparing"
      | "Out for delivery"
      | "Delivered"
      | "Cancelled"
    time: string
    note: string
  }[]
}

export interface LegacyCafeData {
  menu?: MenuItem[]
  customers?: CustomerData[]
  orders?: OrderData[]
  settings?: CafeSettings
}

function requireFirestore() {
  if (!db) {
    throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* values.")
  }
  return db
}

function snapshotItems<T>(snapshot: { docs: { data(): DocumentData }[] }) {
  return snapshot.docs.map((entry) => entry.data() as T)
}

export function subscribeMenu(
  onValue: (items: MenuItem[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const firestore = requireFirestore()
  return onSnapshot(
    collection(firestore, "menu"),
    (snapshot) => {
      const items = snapshotItems<MenuItem>(snapshot).sort((a, b) => a.id - b.id)
      onValue(items.length ? items : MENU)
    },
    onError,
  )
}

export function subscribeSettings(
  onValue: (settings: Partial<CafeSettings>) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const firestore = requireFirestore()
  return onSnapshot(
    doc(firestore, "settings", "site"),
    (snapshot) => onValue(snapshot.exists() ? snapshot.data() : {}),
    onError,
  )
}

export function subscribeAdminData(
  onOrders: (orders: OrderData[]) => void,
  onCustomers: (customers: CustomerData[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const firestore = requireFirestore()
  const unsubscribeOrders = onSnapshot(
    query(collection(firestore, "orders")),
    (snapshot) =>
      onOrders(
        snapshotItems<OrderData>(snapshot).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        ),
      ),
    onError,
  )
  const unsubscribeCustomers = onSnapshot(
    query(collection(firestore, "customers")),
    (snapshot) =>
      onCustomers(
        snapshotItems<CustomerData>(snapshot).sort((a, b) =>
          b.createdAt.localeCompare(a.createdAt),
        ),
      ),
    onError,
  )

  return () => {
    unsubscribeOrders()
    unsubscribeCustomers()
  }
}

export async function signInAdmin(
  email: string,
  password: string,
): Promise<User> {
  if (!auth) {
    throw new Error("Firebase is not configured. Add the VITE_FIREBASE_* values.")
  }
  const credential = await signInWithEmailAndPassword(auth, email, password)
  if (credential.user.email?.toLowerCase() !== ADMIN_EMAIL) {
    await signOut(auth)
    throw new Error(
      `This account is not authorized. Sign in with ${ADMIN_EMAIL}.`,
    )
  }
  if (!credential.user.emailVerified) {
    try {
      await sendEmailVerification(credential.user)
    } finally {
      await signOut(auth)
    }
    throw new Error(
      `This account's email is not verified yet. We sent a verification link to ${ADMIN_EMAIL}. Open that email, click the link, then sign in again.`,
    )
  }
  return credential.user
}

export function getAuthErrorMessage(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error.message : "Sign-in failed. Please try again."
  }

  switch (error.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect."
    case "auth/invalid-email":
      return "Enter a valid email address."
    case "auth/user-disabled":
      return "This administrator account has been disabled. Contact the Firebase project owner."
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Wait a while, then try again."
    case "auth/network-request-failed":
      return "Could not reach Firebase. Check your internet connection and try again."
    case "auth/operation-not-allowed":
      return "Email/password sign-in is disabled. Enable it in Firebase Authentication settings."
    default:
      return error.message
  }
}

export async function signOutAdmin() {
  if (!auth) throw new Error("Firebase Authentication is not configured.")
  await signOut(auth)
}

async function replaceCollection<T extends { id: string | number }>(
  name: string,
  current: T[],
  next: T[],
) {
  const firestore = requireFirestore()
  const nextIds = new Set(next.map((entry) => String(entry.id)))
  const changes: { id: string; data?: T }[] = []
  const currentById = new Map(
    current.map((entry) => [String(entry.id), entry] as const),
  )
  for (const entry of next) {
    const oldEntry = currentById.get(String(entry.id))
    if (!oldEntry || JSON.stringify(oldEntry) !== JSON.stringify(entry)) {
      changes.push({ id: String(entry.id), data: entry })
    }
  }
  for (const entry of current) {
    if (!nextIds.has(String(entry.id))) {
      changes.push({ id: String(entry.id) })
    }
  }
  for (let index = 0; index < changes.length; index += 450) {
    const batch = writeBatch(firestore)
    for (const change of changes.slice(index, index + 450)) {
      const reference = doc(firestore, name, change.id)
      if (change.data) batch.set(reference, change.data)
      else batch.delete(reference)
    }
    await batch.commit()
  }
}

export async function saveMenuItems(current: MenuItem[], next: MenuItem[]) {
  await replaceCollection("menu", current, next)
}

export async function saveCustomers(
  current: CustomerData[],
  next: CustomerData[],
) {
  await replaceCollection("customers", current, next)
}

export async function saveOrders(current: OrderData[], next: OrderData[]) {
  await replaceCollection("orders", current, next)
}

export async function saveCafeSettings(settings: CafeSettings) {
  const firestore = requireFirestore()
  await setDoc(doc(firestore, "settings", "site"), settings)
}

export async function importLegacyData(data: LegacyCafeData) {
  const firestore = requireFirestore()
  const settingsRef = doc(firestore, "settings", "site")
  const [menuSnapshot, customerSnapshot, orderSnapshot, settingsSnapshot] =
    await Promise.all([
      getDocs(collection(firestore, "menu")),
      getDocs(collection(firestore, "customers")),
      getDocs(collection(firestore, "orders")),
      getDoc(settingsRef),
    ])
  const imported = {
    menu: menuSnapshot.empty ? (data.menu ?? []) : [],
    customers: customerSnapshot.empty ? (data.customers ?? []) : [],
    orders: orderSnapshot.empty ? (data.orders ?? []) : [],
    settings: !settingsSnapshot.exists() && data.settings ? data.settings : null,
  }
  const writeCount =
    imported.menu.length +
    imported.customers.length +
    imported.orders.length +
    (imported.settings ? 1 : 0)
  if (writeCount > 450) {
    throw new Error(
      "More than 450 browser records were found. No data was imported; contact support for a bulk migration.",
    )
  }

  const batch = writeBatch(firestore)
  for (const item of imported.menu) {
    batch.set(doc(firestore, "menu", String(item.id)), item)
  }
  for (const customer of imported.customers) {
    batch.set(doc(firestore, "customers", customer.id), customer)
  }
  for (const order of imported.orders) {
    batch.set(doc(firestore, "orders", order.id), order)
  }
  if (imported.settings) batch.set(settingsRef, imported.settings)
  if (writeCount > 0) await batch.commit()

  return {
    menu: imported.menu.length,
    customers: imported.customers.length,
    orders: imported.orders.length,
    settings: imported.settings !== null,
  }
}

export async function createOrder(
  order: OrderData,
  customer: CustomerData,
) {
  const firestore = requireFirestore()
  const batch = writeBatch(firestore)
  batch.set(doc(firestore, "orders", order.id), order)
  batch.set(doc(firestore, "customers", customer.id), {
    ...customer,
    orderId: order.id,
  })
  await batch.commit()
}
