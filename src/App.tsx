import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  MENU,
  CATEGORIES,
  WHATSAPP_NUMBER,
  type MenuItem,
  type CartItem,
} from "./menu"
import {
  ADMIN_EMAIL,
  auth,
  createOrder,
  firebaseConfigured,
  getAuthErrorMessage,
  importLegacyData,
  saveCafeSettings,
  saveCustomers as persistCustomers,
  saveMenuItems,
  saveOrders as persistOrders,
  signInAdmin,
  signOutAdmin,
  subscribeAdminData,
  subscribeMenu,
  subscribeSettings,
  type CafeSettings,
  type CustomerData,
  type LegacyCafeData,
  type OrderData,
} from "./firebase"
import { onAuthStateChanged, type User } from "firebase/auth"

const GRILL_IMAGE = "/images/grill.jpg"
const FOOD_IMAGE = "/images/meal.jpg"
const INTERIOR_IMAGE = "/images/interior.jpg"
const MONEY = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`
function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error)
}
type IconName = "arrow" | "bag" | "close" | "plus" | "minus" | "menu" | "leaf" | "flame" | "heart" | "check" | "grid" | "utensils" | "settings" | "logout" | "lock" | "search" | "edit" | "message"

interface IconProps {
  name: IconName
  className?: string
}

function Icon({ name, className = "" }: IconProps) {
  const paths: Record<IconName, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    bag: (
      <>
        <path d="M5 7h14l1 14H4L5 7Z" />
        <path d="M8 8V6a4 4 0 0 1 8 0v2" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    leaf: (
      <>
        <path d="M20 3C9 2 2 8 5 15c4 8 16 3 15-12Z" />
        <path d="m3 21 12-12" />
      </>
    ),
    flame: (
      <path d="M12 3c1 6-5 7-5 11a5 5 0 0 0 10 0c0-2-1-4-2-5 0 3-2 3-2 3s2-5-1-9Z" />
    ),
    heart: (
      <path d="M20 5a5 5 0 0 0-8 1 5 5 0 0 0-8-1c-5 5 3 11 8 15 5-4 13-10 8-15Z" />
    ),
    check: <path d="m5 12 4 4L19 6" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    utensils: (
      <>
        <path d="M5 3v6c0 3 6 3 6 0V3M8 3v18M19 3c-4 3-4 9 0 9V3Zm0 9v9" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="m9 3-1 3-3 1-2 5 2 5 3 1 1 3h6l1-3 3-1 2-5-2-5-3-1-1-3H9Z" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 6 6" />
      </>
    ),
    edit: (
      <>
        <path d="m15 4 5 5M4 20l5-1L21 7l-4-4L5 15l-1 5Z" />
      </>
    ),
    message: <path d="M21 11a9 9 0 0 1-13 8l-5 2 2-5A9 9 0 1 1 21 11Z" />,
  }
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Flower({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`flower ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.2">
        {Array.from({ length: 8 }, (_, i) => (
          <ellipse
            key={i}
            cx="32"
            cy="20"
            rx="5"
            ry="12"
            transform={`rotate(${i * 45} 32 32)`}
          />
        ))}
        <circle cx="32" cy="32" r="6" />
        <circle cx="32" cy="32" r="29" />
      </g>
    </svg>
  )
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      href="#/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label="Lalazar Cafe home"
    >
      <Flower />
      <span>
        <strong>LALAZAR</strong>
        <small>C A F E &nbsp; & &nbsp; C U L T U R E</small>
      </span>
    </a>
  )
}

function Dialog({
  children,
  title,
  close,
  drawer = false,
}: {
  children: ReactNode
  title: string
  close: () => void
  drawer?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    ref.current?.focus()
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
      if (e.key !== "Tab") return
      const elements = ref.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], input, textarea, select, [tabindex="0"]',
      )
      if (!elements?.length) return
      const first = elements[0],
        last = elements[elements.length - 1]
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault()
        last.focus()
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          document.activeElement === ref.current)
      ) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener("keydown", handler)
      previous?.focus()
    }
  }, [close])
  return (
    <div
      className={`modal-backdrop ${drawer ? "drawer-backdrop" : ""}`}
      onClick={close}
    >
      <div
        ref={ref}
        className={`dialog ${drawer ? "drawer" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-heading">
          <div>
            <span className="eyebrow">LALAZAR CAFE</span>
            <h2>{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={close}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Preparing"
  | "Out for delivery"
  | "Delivered"
  | "Cancelled"

type CustomerRecord = CustomerData
type CustomerOrderRecord = OrderData
type ContactInfo = CafeSettings
type RevenuePeriod = "day" | "week" | "month"

interface RevenueBucket {
  key: string
  label: string
  amount: number
}

interface OrderTimelineEntry {
  status: OrderStatus
  time: string
  note: string
}

const ORDER_STATUS_FLOW: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Preparing",
  "Out for delivery",
  "Delivered",
]

const DEFAULT_CONTACT_INFO: ContactInfo = {
  phone: WHATSAPP_NUMBER,
  email: "hello@lalazar.cafe",
  address: "Main Bazaar, Quetta, Pakistan",
  hours: "11:00 AM - 11:00 PM",
}

function readLegacyValue(key: string): unknown {
  const raw = localStorage.getItem(key)
  if (raw === null) return undefined
  try {
    return JSON.parse(raw)
  } catch {
    throw new Error(`Saved browser data "${key}" is not valid JSON.`)
  }
}

function isLegacyMenuItem(value: unknown): value is MenuItem {
  if (typeof value !== "object" || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === "number" &&
    typeof item.name === "string" &&
    typeof item.urdu === "string" &&
    typeof item.description === "string" &&
    typeof item.price === "number" &&
    Number.isFinite(item.price) &&
    item.price > 0 &&
    typeof item.category === "string" &&
    typeof item.image === "string"
  )
}

function isLegacyCustomer(value: unknown): value is CustomerRecord {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.phone === "string" &&
    typeof record.email === "string" &&
    typeof record.address === "string" &&
    typeof record.notes === "string" &&
    typeof record.createdAt === "string" &&
    (record.orderId === undefined || typeof record.orderId === "string")
  )
}

function isLegacyOrderStatus(value: unknown): value is OrderStatus {
  return (
    value === "Pending" ||
    value === "Confirmed" ||
    value === "Preparing" ||
    value === "Out for delivery" ||
    value === "Delivered" ||
    value === "Cancelled"
  )
}

function isLegacyOrder(value: unknown): value is CustomerOrderRecord {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  const validItems =
    Array.isArray(record.items) &&
    record.items.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof item.id === "number" &&
        typeof item.name === "string" &&
        typeof item.qty === "number" &&
        Number.isInteger(item.qty) &&
        item.qty > 0 &&
        typeof item.price === "number" &&
        Number.isFinite(item.price),
    )
  const validTimeline =
    Array.isArray(record.timeline) &&
    record.timeline.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        isLegacyOrderStatus(entry.status) &&
        typeof entry.time === "string" &&
        typeof entry.note === "string",
    )
  return (
    typeof record.id === "string" &&
    typeof record.customerId === "string" &&
    typeof record.customerName === "string" &&
    typeof record.customerPhone === "string" &&
    typeof record.customerAddress === "string" &&
    validItems &&
    typeof record.subtotal === "number" &&
    isLegacyOrderStatus(record.status) &&
    typeof record.createdAt === "string" &&
    typeof record.updatedAt === "string" &&
    typeof record.deadlineMinutes === "number" &&
    typeof record.notes === "string" &&
    validTimeline
  )
}

function readLegacyData(): LegacyCafeData {
  const data: LegacyCafeData = {}
  const menu = readLegacyValue("lalazar.menu.v1")
  if (menu !== undefined) {
    if (!Array.isArray(menu)) {
      throw new Error("Saved browser menu data is not a list.")
    }
    if (menu.length === 0) {
      data.menu = MENU
    } else {
      if (!menu.every(isLegacyMenuItem)) {
        throw new Error("Some saved browser menu items are invalid.")
      }
      data.menu = menu
    }
  }

  const customers = readLegacyValue("lalazar.customers.v1")
  if (customers !== undefined) {
    if (!Array.isArray(customers) || !customers.every(isLegacyCustomer)) {
      throw new Error("Some saved browser customer records are invalid.")
    }
    if (customers.length > 0) data.customers = customers
  }

  const orders = readLegacyValue("lalazar.orders.v1")
  if (orders !== undefined) {
    if (!Array.isArray(orders) || !orders.every(isLegacyOrder)) {
      throw new Error("Some saved browser orders are invalid.")
    }
    if (orders.length > 0) data.orders = orders
  }

  const savedContact = readLegacyValue("lalazar.contact.v1")
  const savedWhatsapp = readLegacyValue("lalazar.whatsapp.v1")
  if (savedContact !== undefined || savedWhatsapp !== undefined) {
    const contactRecord =
      typeof savedContact === "object" && savedContact !== null
        ? (savedContact as Record<string, unknown>)
        : {}
    const validContact =
      typeof contactRecord.email === "string" &&
      typeof contactRecord.address === "string"
        ? {
            email: contactRecord.email,
            address: contactRecord.address,
            phone: typeof contactRecord.phone === "string"
              ? contactRecord.phone
              : DEFAULT_CONTACT_INFO.phone,
            hours: typeof contactRecord.hours === "string"
              ? contactRecord.hours
              : DEFAULT_CONTACT_INFO.hours,
          }
        : {}
    const phone =
      typeof savedWhatsapp === "string" &&
      /^\d{10,15}$/.test(savedWhatsapp.replace(/\D/g, ""))
        ? savedWhatsapp.replace(/\D/g, "")
        : typeof validContact.phone === "string"
          ? validContact.phone
          : DEFAULT_CONTACT_INFO.phone
    data.settings = {
      ...DEFAULT_CONTACT_INFO,
      ...validContact,
      phone,
    }
  }
  return data
}

function clearImportedLegacyData(imported: {
  menu: number
  customers: number
  orders: number
  settings: boolean
}) {
  if (imported.menu) localStorage.removeItem("lalazar.menu.v1")
  if (imported.customers) localStorage.removeItem("lalazar.customers.v1")
  if (imported.orders) localStorage.removeItem("lalazar.orders.v1")
  if (imported.settings) {
    localStorage.removeItem("lalazar.contact.v1")
    localStorage.removeItem("lalazar.whatsapp.v1")
  }
}

function createTimeline(
  createdAt: string,
  status: OrderStatus = "Pending",
): OrderTimelineEntry[] {
  const base = new Date(createdAt).getTime()
  const start = base
  const offsets = [0, 8, 18, 30, 48]
  return ORDER_STATUS_FLOW.map((step, index) => {
    const stepTime = new Date(start + offsets[index] * 60 * 1000)
    return {
      status: step,
      time: stepTime.toISOString(),
      note:
        step === status
          ? `Marked as ${status}`
          : step === "Pending"
            ? "Order placed"
            : step === "Confirmed"
              ? "Restaurant confirmed request"
              : step === "Preparing"
                ? "Kitchen is busy cooking"
                : step === "Out for delivery"
                  ? "Order is on the way"
                  : "Delivered to the guest",
    }
  })
}

function getOrderDeadlineText(order: CustomerOrderRecord) {
  const deadline = new Date(order.createdAt).getTime() + order.deadlineMinutes * 60 * 1000
  const remaining = Math.max(0, deadline - Date.now())
  const minutesLeft = Math.ceil(remaining / (60 * 1000))

  if (minutesLeft <= 0) return "Delayed"
  if (minutesLeft <= 15) return `${minutesLeft} min left`
  return `Due in ${minutesLeft} min`
}

const REVENUE_STATUSES = new Set<OrderStatus>([
  "Confirmed",
  "Preparing",
  "Out for delivery",
  "Delivered",
])

function getLocalDateKey(date: Date, includeHour = false) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  const hour = String(date.getHours()).padStart(2, "0")
  return `${year}-${month}-${day}${includeHour ? `-${hour}` : ""}`
}

function getRevenueBuckets(
  orders: CustomerOrderRecord[],
  period: RevenuePeriod,
  now = new Date(),
): RevenueBucket[] {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)
  if (period === "week") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  } else if (period === "month") {
    start.setDate(1)
  }

  const count =
    period === "day"
      ? 24
      : period === "week"
        ? 7
        : new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate()
  const buckets = Array.from({ length: count }, (_, index) => {
    const date = new Date(start)
    if (period === "day") {
      date.setHours(index)
    } else {
      date.setDate(start.getDate() + index)
    }
    return {
      key: getLocalDateKey(date, period === "day"),
      label:
        period === "day"
          ? date.toLocaleTimeString("en", { hour: "numeric" })
          : period === "week"
            ? date.toLocaleDateString("en", { weekday: "short" })
            : String(date.getDate()),
      amount: 0,
    }
  })
  const bucketByKey = new Map(buckets.map((bucket) => [bucket.key, bucket]))

  for (const order of orders) {
    if (!REVENUE_STATUSES.has(order.status)) continue
    const createdAt = new Date(order.createdAt)
    if (!Number.isFinite(createdAt.getTime())) continue
    const key = getLocalDateKey(createdAt, period === "day")
    const bucket = bucketByKey.get(key)
    if (bucket && Number.isFinite(order.subtotal) && order.subtotal > 0) {
      bucket.amount += order.subtotal
    }
  }

  return buckets
}

function countUniqueCustomers(orders: CustomerOrderRecord[]) {
  return new Set(
    orders
      .filter((order) => order.status !== "Cancelled")
      .map((order) => order.customerPhone.replace(/\D/g, ""))
      .filter(Boolean),
  ).size
}

function countRepeatCustomers(orders: CustomerOrderRecord[]) {
  const ordersByPhone = new Map<string, number>()
  for (const order of orders) {
    if (order.status === "Cancelled") continue
    const phone = order.customerPhone.replace(/\D/g, "")
    if (phone) ordersByPhone.set(phone, (ordersByPhone.get(phone) ?? 0) + 1)
  }
  return [...ordersByPhone.values()].filter((count) => count > 1).length
}

export default function App() {
  const [menu, setMenu] = useState<MenuItem[]>(MENU)
  const [whatsapp, setWhatsapp] = useState(WHATSAPP_NUMBER)
  const [customers, setCustomers] = useState<CustomerRecord[]>([])
  const [orders, setOrders] = useState<CustomerOrderRecord[]>([])
  const [contactInfo, setContactInfo] =
    useState<ContactInfo>(DEFAULT_CONTACT_INFO)
  const [route, setRoute] = useState(window.location.hash)
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(!auth)
  const authenticated =
    user?.email?.toLowerCase() === ADMIN_EMAIL && user.emailVerified
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState("All")
  const [expanded, setExpanded] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [overlay, setOverlay] =
    useState<"cart" | "checkout" | "reservation" | null>(null)
  const [notice, setNotice] = useState("")
  useEffect(() => {
    if (!auth) return
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setAuthReady(true)
    })
  }, [])
  useEffect(() => {
    if (!firebaseConfigured) {
      setNotice("Firebase is not configured. Add the Web app values to .env.local.")
      return
    }
    const reportError = (error: Error) => {
      setNotice(`Firebase error: ${error.message}`)
    }
    const unsubscribeMenu = subscribeMenu(setMenu, reportError)
    const unsubscribeSettings = subscribeSettings((settings) => {
      const next = { ...DEFAULT_CONTACT_INFO, ...settings }
      setContactInfo(next)
      if (/^\d{10,15}$/.test(next.phone.replace(/\D/g, ""))) {
        setWhatsapp(next.phone.replace(/\D/g, ""))
      }
    }, reportError)
    return () => {
      unsubscribeMenu()
      unsubscribeSettings()
    }
  }, [])
  useEffect(() => {
    if (!authenticated) {
      setCustomers([])
      setOrders([])
      return
    }
    return subscribeAdminData(setOrders, setCustomers, (error) => {
      setNotice(`Could not load cafe records from Firebase: ${error.message}`)
    })
  }, [authenticated])
  useEffect(() => {
    if (!authenticated) return
    let cancelled = false
    const migrate = async () => {
      const legacyData = readLegacyData()
      if (Object.keys(legacyData).length === 0) return
      const imported = await importLegacyData(legacyData)
      if (cancelled) return
      try {
        clearImportedLegacyData(imported)
      } catch (error) {
        setNotice(
          `Browser data was imported, but the old local copy could not be cleared: ${getErrorMessage(error)}`,
        )
        return
      }
      const count = imported.menu + imported.customers + imported.orders
      if (count === 0 && !imported.settings) {
        setNotice(
          "Firebase already has data in these collections. Existing browser data was left untouched.",
        )
        return
      }
      setNotice(
        `Imported ${imported.menu} menu items, ${imported.customers} customer records, ${imported.orders} orders${imported.settings ? " and cafe settings" : ""} from this browser to Firebase.`,
      )
    }
    void migrate().catch((error: unknown) => {
      setNotice(`Could not migrate browser data to Firebase: ${getErrorMessage(error)}`)
    })
    return () => {
      cancelled = true
    }
  }, [authenticated])
  useEffect(() => {
    const update = () => {
      setRoute(window.location.hash)
      setMobileNav(false)
      setOverlay(null)
    }
    window.addEventListener("hashchange", update)
    return () => window.removeEventListener("hashchange", update)
  }, [])
  useEffect(() => {
    if (!authReady) return
    if (route === "#/admin" && !authenticated) {
      window.location.hash = "/login"
      return
    }
    if (route === "#/login" && authenticated) {
      window.location.hash = "/admin"
      return
    }
  }, [route, authenticated, authReady])
  useEffect(() => {
    const adminPage = route === "#/admin" || route === "#/login"
    document.title = adminPage
      ? "Admin · Lalazar Cafe"
      : "Lalazar Cafe · Balochi flavours, heartfelt hospitality"
    document.documentElement.lang = "en"
    if (route.startsWith("#/")) window.scrollTo({ top: 0, behavior: "instant" })
  }, [route])
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(""), 4500)
    return () => clearTimeout(id)
  }, [notice])
  const persistMenu = async (next: MenuItem[]) => {
    try {
      await saveMenuItems(menu, next)
      setMenu(next)
      setCart((current) =>
        current.flatMap((item) => {
          const updated = next.find((value) => value.id === item.id)
          return updated && updated.available !== false
            ? [{ ...updated, qty: item.qty }]
            : []
        }),
      )
      return true
    } catch (error) {
      setNotice(`Could not save the menu to Firebase: ${getErrorMessage(error)}`)
      return false
    }
  }
  const saveCustomersToFirebase = async (next: CustomerRecord[]) => {
    try {
      await persistCustomers(customers, next)
      setCustomers(next)
      return true
    } catch (error) {
      setNotice(`Could not save customer records to Firebase: ${getErrorMessage(error)}`)
      return false
    }
  }
  const saveOrdersToFirebase = async (next: CustomerOrderRecord[]) => {
    try {
      await persistOrders(orders, next)
      setOrders(next)
      return true
    } catch (error) {
      setNotice(`Could not save orders to Firebase: ${getErrorMessage(error)}`)
      return false
    }
  }
  const saveContactInfoToFirebase = async (next: ContactInfo) => {
    try {
      await saveCafeSettings(next)
      setContactInfo(next)
      setWhatsapp(next.phone.replace(/\D/g, ""))
      return true
    } catch (error) {
      setNotice(`Could not save cafe settings to Firebase: ${getErrorMessage(error)}`)
      return false
    }
  }
  const changeQty = (item: MenuItem, delta: number) =>
    setCart((current) => {
      const found = current.find((value) => value.id === item.id)
      if (!found) return delta > 0 ? [...current, { ...item, qty: 1 }] : current
      return current
        .map((value) =>
          value.id === item.id
            ? { ...value, qty: Math.max(0, value.qty + delta) }
            : value,
        )
        .filter((value) => value.qty > 0)
    })
  const count = cart.reduce((sum, item) => sum + item.qty, 0)
  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const isAdmin = route === "#/admin" || route === "#/login"
  const close = useRef(() => setOverlay(null)).current
  const openWhatsApp = (message: string) => {
    window.open(
      `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer",
    )
  }

  if (isAdmin)
    return (
      <>
        <Admin
          menu={menu}
          saveMenu={persistMenu}
          customers={customers}
          orders={orders}
          contactInfo={contactInfo}
          saveCustomers={saveCustomersToFirebase}
          saveOrders={saveOrdersToFirebase}
          saveContactInfo={saveContactInfoToFirebase}
          authenticated={authenticated}
          authReady={authReady}
          login={async (email, password) => {
            const admin = await signInAdmin(email, password)
            setUser(admin)
            window.location.hash = "/admin"
          }}
          logout={async () => {
            try {
              await signOutAdmin()
              setUser(null)
              window.location.hash = "/login"
            } catch (error) {
              setNotice(`Could not sign out of Firebase: ${getErrorMessage(error)}`)
            }
          }}
        />
        {notice && (
          <div className="toast" role="status">
            {notice}
          </div>
        )}
      </>
    )

  const filtered = menu.filter(
    (item) => category === "All" || item.category === category,
  )
  const featured = [menu[0], menu[6], menu[10]].filter(
    (item): item is MenuItem => item !== undefined,
  )
  const visible =
    category === "All" && !expanded
      ? featured.length === 3
        ? featured
        : filtered.slice(0, 3)
      : filtered
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav
            className={`main-nav ${mobileNav ? "nav-open" : ""}`}
            aria-label="Main navigation"
          >
            <a className="nav-active" href="#/">
              Home
            </a>
            <a
              href="#menu"
              onClick={() => {
                setExpanded(true)
                setMobileNav(false)
              }}
            >
              Our menu
            </a>
            <a href="#story">Our story</a>
            <a href="#experience">The experience</a>
            <a href="#visit">Visit us</a>
          </nav>
          <div className="header-actions">
            <button
              className="icon-button cart-trigger"
              onClick={() => setOverlay("cart")}
              aria-label={`Open cart, ${count} items`}
            >
              <Icon name="bag" />
              {count > 0 && <span className="cart-count">{count}</span>}
            </button>
            <a
              className="button button-primary header-order"
              href="#menu"
              onClick={() => setExpanded(true)}
            >
              Order online <Icon name="arrow" />
            </a>
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobileNav(!mobileNav)}
              aria-label="Toggle navigation"
              aria-expanded={mobileNav}
            >
              <Icon name={mobileNav ? "close" : "menu"} />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero container" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="eyebrow hero-eyebrow">
              <span className="tiny-diamond" /> BALOCHI SOUL. EXTRAORDINARY
              FLAVOUR.
            </div>
            <h1 id="hero-title">
              Rooted in tradition.
              <br />
              Made to be
              <br />
              <em>remembered.</em>
            </h1>
            <p className="hero-description">
              The warmth of our culture. The richness of our flavours.
              <br className="desktop-break" /> A little piece of home, served at
              your table.
            </p>
            <div className="hero-buttons">
              <a
                className="button button-primary"
                href="#menu"
                onClick={() => setExpanded(true)}
              >
                Explore our menu <Icon name="arrow" />
              </a>
              <button
                className="button button-outline"
                onClick={() => setOverlay("reservation")}
              >
                Reserve a table <Icon name="utensils" />
              </button>
            </div>
            <div className="hero-note">
              <span className="small-line" />
              <span>Slow-cooked. Heartfelt. Unmistakably Lalazar.</span>
            </div>
          </div>
          <div className="hero-art">
            <div className="hero-image-wrap">
              <img
                className="hero-main-image"
                src={GRILL_IMAGE}
                alt="Spiced chicken skewers roasting over glowing charcoal"
                fetchPriority="high"
              />
              <div className="image-shade" />
              <div className="image-caption">
                <span>THE ART OF SLOW COOKING</span>
                <span>Flame. Flavour. Tradition.</span>
              </div>
            </div>
            <div className="hero-inset">
              <img
                src={FOOD_IMAGE}
                alt="A colourful, freshly prepared meal served with care"
              />
              <span>A taste of togetherness</span>
            </div>
            <div className="heritage-seal">
              <Flower />
              <span>CRAFTED WITH CARE</span>
              <strong>ذائقہ اور روایت</strong>
              <small>BALOCHI AT HEART</small>
            </div>
            <div className="hero-side-label">GOOD FOOD. GREAT COMPANY.</div>
            <div className="hero-art-footer">
              <span>01 / A WARM WELCOME</span>
              <span className="art-dots">
                <i />
                <i />
                <i />
              </span>
            </div>
          </div>
        </section>
        <div className="heritage-strip">
          <div className="container strip-inner">
            <span>
              <Icon name="flame" /> Charcoal-fired perfection
            </span>
            <span className="strip-diamond">✧</span>
            <span>
              <Icon name="leaf" /> Fresh ingredients, always
            </span>
            <span className="strip-diamond">✧</span>
            <span>
              <Icon name="heart" /> A tradition of hospitality
            </span>
            <span className="strip-diamond">✧</span>
            <span>Made with love. Shared with joy.</span>
          </div>
        </div>

        <section
          id="menu"
          className="menu-section container"
          aria-labelledby="menu-heading"
        >
          <div className="section-heading">
            <div>
              <span className="eyebrow">FROM OUR KITCHEN, WITH LOVE</span>
              <h2 id="menu-heading">
                A menu full of <em>memories.</em>
              </h2>
            </div>
            <p>
              Familiar favourites. Time-honoured recipes.
              <br />
              Every dish has a story. Find yours.
            </p>
          </div>
          <div className="menu-toolbar">
            <div
              className="categories"
              role="group"
              aria-label="Menu categories"
            >
              {CATEGORIES.map((value) => (
                <button
                  key={value}
                  className={`category ${category === value ? "selected" : ""}`}
                  aria-pressed={category === value}
                  onClick={() => {
                    setCategory(value)
                    setExpanded(value !== "All")
                  }}
                >
                  {value === "All" ? "All dishes" : value}
                </button>
              ))}
            </div>
            <span className="menu-count">
              {menu.length} dishes. Endless delight.
            </span>
          </div>
          <div className="menu-grid">
            {visible.map((item) => {
              const qty = cart.find((value) => value.id === item.id)?.qty || 0
              return (
                <article className="menu-card" key={item.id}>
                  <div className="menu-image">
                    <FoodImage item={item} />
                    {item.badge && (
                      <span className="dish-badge">
                        <span className="tiny-diamond" /> {item.badge}
                      </span>
                    )}
                    {item.available === false && (
                      <span className="unavailable-badge">
                        Currently unavailable
                      </span>
                    )}
                  </div>
                  <div className="menu-card-content">
                    <div className="dish-category">{item.category}</div>
                    <div className="dish-title">
                      <h3>{item.name}</h3>
                      <span lang="ur" dir="rtl">
                        {item.urdu}
                      </span>
                    </div>
                    <p>{item.description}</p>
                    <div className="dish-bottom">
                      <strong>
                        {MONEY(item.price)}
                        <small> / serving</small>
                      </strong>
                      {qty ? (
                        <div className="quantity-control">
                          <button
                            aria-label={`Remove one ${item.name}`}
                            onClick={() => changeQty(item, -1)}
                          >
                            <Icon name="minus" />
                          </button>
                          <span aria-live="polite">{qty}</span>
                          <button
                            aria-label={`Add one ${item.name}`}
                            onClick={() => changeQty(item, 1)}
                          >
                            <Icon name="plus" />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="add-button"
                          disabled={item.available === false}
                          onClick={() => changeQty(item, 1)}
                          aria-label={`Add ${item.name} to order`}
                        >
                          <span>Add to order</span>
                          <Icon name="plus" />
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          {category === "All" && (
            <div className="menu-more">
              <button
                className="text-link"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show our favourites" : "Discover the full menu"}{" "}
                <Icon name="arrow" />
              </button>
              <span>
                {expanded
                  ? `All ${menu.length} dishes, freshly made for you.`
                  : "Something for every craving."}
              </span>
            </div>
          )}
        </section>

        <section id="story" className="story-section">
          <div className="container story-grid">
            <div className="story-image">
              <img
                src={INTERIOR_IMAGE}
                alt="Warm wood, intimate lighting and welcoming restaurant tables"
                loading="lazy"
              />
              <div className="story-image-note">
                <Flower />
                <span>
                  Come as a guest.
                  <br />
                  <em>Leave as family.</em>
                </span>
              </div>
            </div>
            <div className="story-copy">
              <span className="eyebrow">OUR ROOTS. OUR HEART.</span>
              <h2>
                More than a cafe.
                <br />
                <em>A feeling of home.</em>
              </h2>
              <p>
                In Balochi culture, a shared meal is more than food. It is a
                welcome, a conversation, a connection. At Lalazar, we bring that
                spirit to every table.
              </p>
              <p>
                From the first glow of our charcoal to the last comforting sip
                of chai, we believe in taking our time. With our food. With our
                guests. With the moments that matter.
              </p>
              <a className="text-link" href="#experience">
                Experience Lalazar <Icon name="arrow" />
              </a>
              <div className="story-signature">
                With warmth, <span>The Lalazar family</span>
              </div>
            </div>
          </div>
        </section>

        <section id="experience" className="experience-section container">
          <div className="center-heading">
            <span className="eyebrow">SAVOUR THE MOMENT</span>
            <h2>
              Some things are better <em>together.</em>
            </h2>
            <p>
              A table for two, a feast for the family, or simply a cup of chai.
            </p>
          </div>
          <div className="experience-grid">
            {[
              {
                icon: "flame" as const,
                number: "01",
                title: "Food with a soul",
                copy: "Bold Balochi flavours, patient preparation, and recipes that honour our roots.",
              },
              {
                icon: "heart" as const,
                number: "02",
                title: "A place to belong",
                copy: "Warm welcomes and unhurried moments. There is always a seat for you.",
              },
              {
                icon: "message" as const,
                number: "03",
                title: "Your favourites, at home",
                copy: "Choose your dishes, share your details, and send your order directly on WhatsApp.",
              },
            ].map((item) => (
              <article key={item.number}>
                <div className="experience-top">
                  <Icon name={item.icon} />
                  <span>{item.number}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="visit" className="visit-section">
          <Flower className="visit-flower" />
          <div className="container visit-inner">
            <div>
              <span className="eyebrow">YOUR TABLE IS WAITING</span>
              <h2>
                Good food.
                <br />
                <em>Even better company.</em>
              </h2>
              <p>Make a little time for something delicious.</p>
            </div>
            <div className="visit-actions">
              <button
                className="button button-gold"
                onClick={() => setOverlay("reservation")}
              >
                Reserve a table <Icon name="arrow" />
              </button>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="visit-whatsapp"
              >
                <Icon name="message" /> Let's talk on WhatsApp
              </a>
              <small>Reservations are confirmed by our team.</small>
            </div>
          </div>
        </section>
      </main>
      <footer className="site-footer container">
        <div className="footer-top">
          <Brand />
          <p>
            Balochi flavours.
            <br />
            Heartfelt hospitality.
          </p>
          <div className="footer-links">
            <a href="#menu">Our menu</a>
            <a href="#story">Our story</a>
            <a href="#/login">
              Admin login <Icon name="lock" />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Lalazar Cafe. All rights reserved.
          </span>
          <span>Made with care. Served with love.</span>
          <span lang="ur" dir="rtl">
            لالہ زار کیفے — ذائقہ اور محبت
          </span>
        </div>
      </footer>
      {count > 0 && !overlay && (
        <button
          className="floating-cart button button-primary"
          onClick={() => setOverlay("cart")}
        >
          <Icon name="bag" />
          <span>
            {count} {count === 1 ? "item" : "items"} · {MONEY(total)}
          </span>
          <Icon name="arrow" />
        </button>
      )}
      {overlay === "cart" && (
        <Dialog drawer title="Your order" close={close}>
          <div className="cart-content">
            {cart.length ? (
              cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <FoodImage item={item} />
                  <div>
                    <h3>{item.name}</h3>
                    <small>{MONEY(item.price)}</small>
                    <div className="quantity-control">
                      <button
                        aria-label={`Remove one ${item.name}`}
                        onClick={() => changeQty(item, -1)}
                      >
                        <Icon name="minus" />
                      </button>
                      <span>{item.qty}</span>
                      <button
                        aria-label={`Add one ${item.name}`}
                        onClick={() => changeQty(item, 1)}
                      >
                        <Icon name="plus" />
                      </button>
                    </div>
                  </div>
                  <strong>{MONEY(item.price * item.qty)}</strong>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <Icon name="bag" />
                <h3>A little deliciousness awaits.</h3>
                <p>Explore the menu and add your favourites.</p>
                <button
                  className="button button-primary"
                  onClick={() => {
                    close()
                    document
                      .getElementById("menu")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }}
                >
                  Explore the menu <Icon name="arrow" />
                </button>
              </div>
            )}
          </div>
          {cart.length > 0 && (
            <div className="cart-summary">
              <div>
                <span>Subtotal</span>
                <strong>{MONEY(total)}</strong>
              </div>
              <p>Delivery charges, if any, are confirmed by our team.</p>
              <button
                className="button button-primary"
                onClick={() => setOverlay("checkout")}
              >
                Continue to checkout <Icon name="arrow" />
              </button>
              <small>No payment is collected on this website.</small>
            </div>
          )}
        </Dialog>
      )}
      {overlay === "checkout" && (
        <Dialog title="One step closer to delicious." close={close}>
          <Checkout
            cart={cart}
            total={total}
            openWhatsApp={openWhatsApp}
            onHandoff={async (customer) => {
              const uniqueId = crypto.randomUUID().replace(/-/g, "").slice(0, 10)
              const orderId = `LC-${Date.now()}-${uniqueId}`
              const createdAt = new Date().toISOString()
              const customerId = `CUST-${uniqueId}`
              const nextOrder: CustomerOrderRecord = {
                id: orderId,
                customerId,
                customerName: customer.name,
                customerPhone: customer.phone,
                customerAddress: customer.address,
                items: cart.map((item) => ({
                  id: item.id,
                  name: item.name,
                  qty: item.qty,
                  price: item.price,
                })),
                subtotal: total,
                status: "Pending",
                createdAt,
                updatedAt: createdAt,
                deadlineMinutes: 45,
                notes: customer.notes,
                timeline: createTimeline(createdAt, "Pending"),
              }
              const nextCustomer: CustomerRecord = {
                id: customerId,
                name: customer.name,
                phone: customer.phone,
                email: "",
                address: customer.address,
                notes: customer.notes,
                createdAt,
                orderId,
              }
              await createOrder(nextOrder, nextCustomer)
              setCart([])
              close()
              setNotice(
                "Your request was saved securely. Please send the WhatsApp message to complete the request.",
              )
            }}
          />
        </Dialog>
      )}
      {overlay === "reservation" && (
        <Dialog title="A seat at our table." close={close}>
          <Reservation
            openWhatsApp={openWhatsApp}
            complete={() => {
              close()
              setNotice(
                "WhatsApp opened. Our team will confirm your table after you send the request.",
              )
            }}
          />
        </Dialog>
      )}
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" />
          {notice}
        </div>
      )}
    </div>
  )
}

function FoodImage({ item }: { item: MenuItem }) {
  const src =
    item.id === 1
      ? GRILL_IMAGE
      : item.id === 7
        ? FOOD_IMAGE
        : item.category === "Rice"
          ? "/images/rice.jpg"
          : item.image
  return (
    <img
      src={src}
      alt={item.name}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null
        e.currentTarget.src = FOOD_IMAGE
      }}
    />
  )
}

function Checkout({
  cart,
  total,
  openWhatsApp,
  onHandoff,
}: {
  cart: CartItem[]
  total: number
  openWhatsApp: (message: string) => void
  onHandoff: (customer: {
    name: string
    address: string
    phone: string
    notes: string
  }) => Promise<void>
}) {
  const [error, setError] = useState("")
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const name = String(data.get("name")).trim(),
      address = String(data.get("address")).trim(),
      phone = String(data.get("phone")).trim(),
      notes = String(data.get("notes")).trim()
    if (
      !name ||
      !address ||
      !/^[+\d\s()-]{10,20}$/.test(phone) ||
      phone.replace(/\D/g, "").length < 10
    ) {
      setError(
        "Please enter your name, delivery address and a valid contact number.",
      )
      return
    }
    openWhatsApp(
      `Hello Lalazar Cafe! I would like to place an order.\n\n${cart.map((item) => `${item.name} × ${item.qty} — ${MONEY(item.price * item.qty)}`).join("\n")}\n\nSubtotal: ${MONEY(total)}\nFull name: ${name}\nDelivery address: ${address}\nContact number: ${phone}\nNotes: ${notes || "None"}\n\nPlease confirm availability, delivery charges and total.`,
    )
    try {
      await onHandoff({ name, address, phone, notes })
    } catch (handoffError) {
      setError(`We could not save your order. ${getErrorMessage(handoffError)}`)
    }
  }
  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="checkout-summary">
        {cart.map((item) => (
          <div key={item.id}>
            <span>
              {item.name} × {item.qty}
            </span>
            <span>{MONEY(item.price * item.qty)}</span>
          </div>
        ))}
        <div className="checkout-total">
          <strong>Subtotal</strong>
          <strong>{MONEY(total)}</strong>
        </div>
      </div>
      <label>
        Full name
        <input
          name="name"
          autoComplete="name"
          required
          placeholder="Your full name"
          maxLength={100}
        />
      </label>
      <label>
        Delivery address
        <textarea
          name="address"
          autoComplete="street-address"
          required
          placeholder="House, street and area"
          rows={2}
          maxLength={400}
        />
      </label>
      <label>
        Contact number
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="03XX XXXXXXX"
          maxLength={20}
        />
      </label>
      <label>
        Anything we should know? <span className="optional">(optional)</span>
        <input
          name="notes"
          placeholder="Special requests or delivery instructions"
          maxLength={300}
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-primary" type="submit">
        <Icon name="message" />
        Send order on WhatsApp <Icon name="arrow" />
      </button>
      <p className="form-help">
        Your order details are saved securely for cafe staff and included in
        WhatsApp. Send the message so our team can confirm it.
      </p>
    </form>
  )
}

function Reservation({
  openWhatsApp,
  complete,
}: {
  openWhatsApp: (message: string) => void
  complete: () => void
}) {
  const [error, setError] = useState("")
  const today = new Date()
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
  return (
    <form
      className="form-stack"
      onSubmit={(e) => {
        e.preventDefault()
        const data = new FormData(e.currentTarget)
        const name = String(data.get("name")).trim()
        const phone = String(data.get("phone")).trim()
        const date = String(data.get("date"))
        if (
          !name ||
          !/^[+\d\s()-]{10,20}$/.test(phone) ||
          phone.replace(/\D/g, "").length < 10 ||
          date < minDate ||
          new Date(`${date}T${data.get("time")}`) <= new Date()
        ) {
          setError(
            "Please enter a valid name, contact number and future reservation time.",
          )
          return
        }
        openWhatsApp(
          `Hello Lalazar Cafe! I would like to request a table.\n\nName: ${name}\nContact: ${phone}\nDate: ${date}\nTime: ${data.get("time")}\nGuests: ${data.get("guests")}\n\nPlease confirm availability. Thank you!`,
        )
        complete()
      }}
    >
      <p className="form-intro">
        Gather your favourite people. We will take care of the rest.
      </p>
      <label>
        Full name
        <input
          name="name"
          autoComplete="name"
          required
          placeholder="Your full name"
          maxLength={100}
        />
      </label>
      <label>
        Contact number
        <input
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          placeholder="03XX XXXXXXX"
          maxLength={20}
        />
      </label>
      <div className="form-row">
        <label>
          Date
          <input name="date" type="date" min={minDate} required />
        </label>
        <label>
          Time
          <input name="time" type="time" required />
        </label>
      </div>
      <label>
        Number of guests
        <select name="guests">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
            <option key={value} value={value}>
              {value} {value === 1 ? "guest" : "guests"}
            </option>
          ))}
          <option value="More than 10">More than 10 guests</option>
        </select>
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button button-primary" type="submit">
        Request a table on WhatsApp <Icon name="arrow" />
      </button>
      <p className="form-help">
        This is a reservation request, not a confirmed booking. Our team will
        confirm your table on WhatsApp.
      </p>
    </form>
  )
}

function Admin({
  menu,
  saveMenu,
  customers,
  orders,
  contactInfo,
  saveCustomers,
  saveOrders,
  saveContactInfo,
  authenticated,
  authReady,
  login,
  logout,
}: {
  menu: MenuItem[]
  saveMenu: (menu: MenuItem[]) => Promise<boolean>
  customers: CustomerRecord[]
  orders: CustomerOrderRecord[]
  contactInfo: ContactInfo
  saveCustomers: (customers: CustomerRecord[]) => Promise<boolean>
  saveOrders: (orders: CustomerOrderRecord[]) => Promise<boolean>
  saveContactInfo: (contactInfo: ContactInfo) => Promise<boolean>
  authenticated: boolean
  authReady: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}) {
  const [tab, setTab] = useState<
    "overview" | "menu" | "orders" | "customers" | "settings"
  >("overview")
  const [error, setError] = useState("")
  const [authLoading, setAuthLoading] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [query, setQuery] = useState("")
  const [edit, setEdit] = useState<MenuItem | null>(null)
  const [isNewDish, setIsNewDish] = useState(false)
  const [customerForm, setCustomerForm] = useState<CustomerRecord>({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
    createdAt: new Date().toISOString(),
  })
  const [customerQuery, setCustomerQuery] = useState("")
  const restorePreviousMenuItems = async () => {
    const existingNames = new Set(
      menu.map((item) => item.name.trim().toLowerCase()),
    )
    const missingItems = MENU.filter(
      (item) => !existingNames.has(item.name.trim().toLowerCase()),
    )
    if (missingItems.length === 0) {
      setFeedback("All earlier menu items are already listed.")
      return
    }

    const firstAvailableId =
      menu.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1
    const restoredItems = missingItems.map((item, index) => ({
      ...item,
      id: firstAvailableId + index,
    }))
    if (await saveMenu([...menu, ...restoredItems])) {
      setFeedback(
        `Restored ${restoredItems.length} earlier menu item${restoredItems.length === 1 ? "" : "s"} alongside the current menu.`,
      )
    }
  }
  const closeEdit = useRef(() => {
    setEdit(null)
    setIsNewDish(false)
    setError("")
  }).current
  const tabs = [
    { key: "overview" as const, label: "Overview", icon: "grid" as const },
    {
      key: "menu" as const,
      label: "Menu management",
      icon: "utensils" as const,
    },
    { key: "orders" as const, label: "Orders", icon: "bag" as const },
    {
      key: "customers" as const,
      label: "Customers",
      icon: "check" as const,
    },
    {
      key: "settings" as const,
      label: "Cafe settings",
      icon: "settings" as const,
    },
  ]

  const revenueToday = getRevenueBuckets(orders, "day").reduce(
    (total, bucket) => total + bucket.amount,
    0,
  )
  const revenueThisWeek = getRevenueBuckets(orders, "week").reduce(
    (total, bucket) => total + bucket.amount,
    0,
  )
  const revenueThisMonth = getRevenueBuckets(orders, "month").reduce(
    (total, bucket) => total + bucket.amount,
    0,
  )
  const uniqueCustomers = countUniqueCustomers(orders)
  const repeatCustomers = countRepeatCustomers(orders)
  const topItem = Object.entries(
    orders
      .filter((order) => order.status !== "Cancelled")
      .reduce<Record<string, number>>((all, order) => {
      order.items.forEach((item) => {
        all[item.name] = (all[item.name] ?? 0) + item.qty
      })
      return all
      }, {}),
  ).sort((a, b) => b[1] - a[1])[0]

  if (!authenticated)
    return (
      <div className="login-page">
        <div className="login-art">
          <Brand light />
          <div>
            <span className="eyebrow">THE HEART BEHIND THE HOSPITALITY</span>
            <h1>
              A little care.
              <br />
              <em>A lot of Lalazar.</em>
            </h1>
            <p>
              Your space to look after the menu
              <br />
              and the moments that make us special.
            </p>
          </div>
          <Flower className="login-flower" />
          <span className="login-art-footer">
            BALOCHI FLAVOURS. HEARTFELT HOSPITALITY.
          </span>
        </div>
        <div className="login-content">
          <a href="#/" className="text-link">
            <Icon name="arrow" className="back-arrow" />
            Back to the cafe
          </a>
          <div className="login-form-wrap">
            <span className="eyebrow">LALAZAR ADMIN</span>
            <h2>Welcome back.</h2>
            <p>Sign in to your cafe dashboard.</p>
            <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault()
                if (authLoading) return
                setAuthLoading(true)
                const data = new FormData(e.currentTarget)
                try {
                  await login(
                    String(data.get("email")),
                    String(data.get("password")),
                  )
                  setError("")
                } catch (loginError) {
                  setError(getAuthErrorMessage(loginError))
                } finally {
                  setAuthLoading(false)
                }
              }}
            >
              <label>
                Email address
                <input
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  placeholder={ADMIN_EMAIL}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                />
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              <button
                className="button button-primary"
                type="submit"
                disabled={authLoading || !authReady || !firebaseConfigured}
              >
                {authLoading ? "Signing in..." : "Sign in"}
                {!authLoading && <Icon name="arrow" />}
              </button>
            </form>
            <div className="demo-note">
              <Icon name="lock" />
              <div>
                <strong>Firebase administrator sign-in</strong>
                <p>
                  Authorized email: <code>{ADMIN_EMAIL}</code>
                </p>
                <small>
                  Use the password for this verified Firebase Authentication
                  account. Do not create public sign-ups for admin access.
                </small>
              </div>
            </div>
          </div>
          <small className="login-copyright">
            Lalazar Cafe · Made with care.
          </small>
        </div>
      </div>
    )

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Brand light />
        <span className="eyebrow">CAFE WORKSPACE</span>
        <nav aria-label="Admin navigation">
          {tabs.map((item) => (
            <button
              key={item.key}
              className={tab === item.key ? "active" : ""}
              onClick={() => {
                setTab(item.key)
                setFeedback("")
                setError("")
              }}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="#/">
            <Icon name="arrow" />
            View website
          </a>
          <button onClick={logout}>
            <Icon name="logout" />
            Sign out
          </button>
          <small>FIREBASE WORKSPACE</small>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="eyebrow">LALAZAR CAFE</span>
            <h1>{tabs.find((item) => item.key === tab)?.label}</h1>
          </div>
          <div className="admin-avatar">
            L<span>Cafe administrator</span>
          </div>
        </header>
        <div className="admin-demo-banner">
          <Icon name="lock" />
          <span>
            Connected to Firebase. Menu and cafe settings are public; customer
            and order records are restricted to the verified administrator.
          </span>
        </div>
        {feedback && (
          <div className="success-note" role="status">
            <Icon name="check" />
            {feedback}
          </div>
        )}

        {tab === "overview" && (
          <>
            <div className="admin-welcome">
              <h2>A warm welcome, again.</h2>
              <p>A quick view of your cafe operations and order performance.</p>
            </div>
            <div className="stats-grid">
              <Stat label="Revenue today" value={MONEY(revenueToday)} icon="bag" />
              <Stat
                label="Revenue this week"
                value={MONEY(revenueThisWeek)}
                icon="grid"
              />
              <Stat
                label="Revenue this month"
                value={MONEY(revenueThisMonth)}
                icon="check"
              />
              <Stat
                label="Most ordered item"
                value={topItem ? `${topItem[0]} (${topItem[1]})` : "No orders"}
                icon="utensils"
              />
              <Stat
                label="Unique customers"
                value={uniqueCustomers.toString()}
                icon="heart"
              />
              <Stat
                label="Repeat customers"
                value={repeatCustomers.toString()}
                icon="check"
              />
            </div>
            <RevenueChart orders={orders} />
            <p className="analytics-note">
              Revenue includes confirmed, preparing, out-for-delivery, and
              delivered orders; pending and cancelled orders are excluded.
              Customer counts are matched by phone number. Website visits aren’t
              tracked in this dashboard.
            </p>
            <div className="admin-overview-grid">
              <section className="admin-panel">
                <span className="eyebrow">MAKE IT YOURS</span>
                <h2>Keep the menu fresh.</h2>
                <p>Update dishes, pricing and availability whenever the kitchen changes.</p>
                <button className="button button-primary" onClick={() => setTab("menu")}>
                  Manage your menu <Icon name="arrow" />
                </button>
              </section>
              <section className="admin-panel">
                <span className="eyebrow">STAY CONNECTED</span>
                <h2>Customer contact details</h2>
                <p className="whatsapp-value">{contactInfo.phone}</p>
                <p>{contactInfo.address}</p>
                <button className="text-link" onClick={() => setTab("settings")}>
                  Update cafe settings <Icon name="arrow" />
                </button>
              </section>
            </div>
            <section className="admin-panel">
              <div className="panel-title">
                <h2>Recent customer orders</h2>
                <button className="text-link" onClick={() => setTab("orders")}>
                  View all <Icon name="arrow" />
                </button>
              </div>
              <OrderTable
                orders={orders.slice(0, 5)}
                onStatusChange={async (id, status) => {
                  const next = orders.map((order) => {
                    if (order.id !== id) return order
                    const timeline = ORDER_STATUS_FLOW.map((step) => {
                      const ahead = ORDER_STATUS_FLOW.indexOf(step) <= ORDER_STATUS_FLOW.indexOf(status)
                      const existing = order.timeline.find((entry) => entry.status === step)
                      return {
                        status: step,
                        time: existing?.time ?? new Date().toISOString(),
                        note: ahead ? (step === status ? `Marked as ${status}` : existing?.note ?? "Confirmed") : existing?.note ?? "Waiting",
                      }
                    })
                    return {
                      ...order,
                      status,
                      updatedAt: new Date().toISOString(),
                      timeline,
                    }
                  })
                  if (await saveOrders(next)) setFeedback("Order status updated.")
                }}
              />
            </section>
          </>
        )}

        {tab === "menu" && (
          <section className="admin-panel">
            <div className="panel-title">
              <div>
                <h2>Your menu, your way.</h2>
                <p>Add, edit or remove dishes and adjust item availability.</p>
              </div>
              <div className="panel-actions">
                <button
                  className="button button-outline"
                  onClick={() => void restorePreviousMenuItems()}
                >
                  Restore earlier menu items
                </button>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setIsNewDish(true)
                    setEdit({
                      id: Date.now(),
                      name: "",
                      urdu: "",
                      description: "",
                      price: 0,
                      category: "Sajji & BBQ",
                      image: "/images/meal.jpg",
                      available: true,
                    })
                  }}
                >
                  Add dish <Icon name="plus" />
                </button>
                <div className="search-field">
                  <Icon name="search" />
                  <input
                    aria-label="Search menu"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search dishes..."
                  />
                </div>
              </div>
            </div>
            <div className="table-scroll">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Dish</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Availability</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {menu
                    .filter((item) =>
                      `${item.name} ${item.urdu} ${item.category}`
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className="table-dish">
                            <FoodImage item={item} />
                            <div>
                              <strong>{item.name}</strong>
                              <small lang="ur" dir="rtl">
                                {item.urdu}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>{item.category}</td>
                        <td>{MONEY(item.price)}</td>
                        <td>
                          <button
                            className={`availability ${item.available !== false ? "available" : ""}`}
                            aria-label={`Toggle availability for ${item.name}`}
                            aria-pressed={item.available !== false}
                            onClick={async () => {
                              if (await saveMenu(
                                menu.map((value) =>
                                  value.id === item.id
                                    ? { ...value, available: value.available === false }
                                    : value,
                                ),
                              ))
                                setFeedback(`${item.name} availability updated.`)
                            }}
                          >
                            <span />
                            {item.available !== false ? "Available" : "Unavailable"}
                          </button>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="icon-button"
                              aria-label={`Edit ${item.name}`}
                              onClick={() => {
                                setIsNewDish(false)
                                setEdit({ ...item })
                              }}
                            >
                              <Icon name="edit" />
                            </button>
                            <button
                              className="icon-button danger"
                              aria-label={`Delete ${item.name}`}
                              onClick={async () => {
                                const nextMenu = menu.filter((value) => value.id !== item.id)
                                if (await saveMenu(nextMenu)) setFeedback(`${item.name} removed from the menu.`)
                              }}
                            >
                              <Icon name="close" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!menu.some((item) =>
                `${item.name} ${item.urdu} ${item.category}`
                  .toLowerCase()
                  .includes(query.toLowerCase()),
              ) && (
                <div className="empty-state">
                  <p>No dishes found. Try another search.</p>
                </div>
              )}
            </div>
          </section>
        )}

        {tab === "orders" && (
          <section className="admin-panel">
            <div className="panel-title">
              <div>
                <h2>Customer order dashboard</h2>
                <p>Each order shows its status, deadline and live fulfilment timeline.</p>
              </div>
            </div>
            <OrderTable
              orders={orders}
              onStatusChange={async (id, status) => {
                const next = orders.map((order) => {
                  if (order.id !== id) return order
                  const timeline = ORDER_STATUS_FLOW.map((step) => {
                    const ahead = ORDER_STATUS_FLOW.indexOf(step) <= ORDER_STATUS_FLOW.indexOf(status)
                    const existing = order.timeline.find((entry) => entry.status === step)
                    return {
                      status: step,
                      time: existing?.time ?? new Date().toISOString(),
                      note: ahead ? (step === status ? `Marked as ${status}` : existing?.note ?? "Confirmed") : existing?.note ?? "Waiting",
                    }
                  })
                  return {
                    ...order,
                    status,
                    updatedAt: new Date().toISOString(),
                    timeline,
                  }
                })
                if (await saveOrders(next)) setFeedback("Order status updated.")
              }}
            />
          </section>
        )}

        {tab === "customers" && (
          <section className="admin-panel">
            <div className="panel-title">
              <div>
                <h2>Customer directory</h2>
                <p>Manage customer profile records and keep contacts organised.</p>
              </div>
              <div className="search-field">
                <Icon name="search" />
                <input
                  aria-label="Search customers"
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  placeholder="Search customers..."
                />
              </div>
            </div>
            <form
              className="customer-form form-stack"
              onSubmit={async (e) => {
                e.preventDefault()
                const nextCustomer = {
                  ...customerForm,
                  name: customerForm.name.trim(),
                  phone: customerForm.phone.trim(),
                  email: customerForm.email.trim(),
                  address: customerForm.address.trim(),
                  notes: customerForm.notes.trim(),
                }
                if (!nextCustomer.name || !nextCustomer.phone || !nextCustomer.address) {
                  setError("Name, phone and address are required.")
                  return
                }
                const exists = customers.some((customer) => customer.id === nextCustomer.id)
                const nextCustomers = exists
                  ? customers.map((customer) => (customer.id === nextCustomer.id ? nextCustomer : customer))
                  : [{ ...nextCustomer, id: `CUST-${Date.now().toString().slice(-6)}` }, ...customers]
                if (await saveCustomers(nextCustomers)) {
                  setCustomerForm({ id: "", name: "", phone: "", email: "", address: "", notes: "", createdAt: new Date().toISOString() })
                  setFeedback(exists ? "Customer record saved." : "Customer added.")
                  setError("")
                }
              }}
            >
              <div className="form-row">
                <label>
                  Name
                  <input
                    value={customerForm.name}
                    onChange={(e) => setCustomerForm((current) => ({ ...current, name: e.target.value }))}
                    required
                  />
                </label>
                <label>
                  Phone
                  <input
                    value={customerForm.phone}
                    onChange={(e) => setCustomerForm((current) => ({ ...current, phone: e.target.value }))}
                    required
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Email
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={(e) => setCustomerForm((current) => ({ ...current, email: e.target.value }))}
                  />
                </label>
                <label>
                  Address
                  <input
                    value={customerForm.address}
                    onChange={(e) => setCustomerForm((current) => ({ ...current, address: e.target.value }))}
                    required
                  />
                </label>
              </div>
              <label>
                Notes
                <textarea
                  rows={3}
                  value={customerForm.notes}
                  onChange={(e) => setCustomerForm((current) => ({ ...current, notes: e.target.value }))}
                />
              </label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary" type="submit">
                {customerForm.id ? "Save customer" : "Add customer"} <Icon name="check" />
              </button>
            </form>
            <CustomerTable
              customers={customers.filter((customer) => `${customer.name} ${customer.phone} ${customer.address}`.toLowerCase().includes(customerQuery.toLowerCase()))}
              onEdit={(customer) => setCustomerForm({ ...customer })}
              onDelete={async (id) => {
                const nextCustomers = customers.filter((customer) => customer.id !== id)
                if (await saveCustomers(nextCustomers)) setFeedback("Customer record removed.")
              }}
            />
          </section>
        )}

        {tab === "settings" && (
          <section className="admin-panel settings-panel">
            <span className="eyebrow">THE DETAILS THAT MATTER</span>
            <h2>Keep the conversation going.</h2>
            <p>This contact information is used for online order requests and customer communication.</p>
            <form
              className="form-stack"
              onSubmit={async (e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                const next = {
                  phone: String(data.get("whatsapp") ?? "").trim(),
                  email: String(data.get("email") ?? "").trim(),
                  address: String(data.get("address") ?? "").trim(),
                  hours: String(data.get("hours") ?? "").trim(),
                }
                if (!/^\d{10,15}$/.test(next.phone.replace(/\D/g, ""))) {
                  setError("Please enter a valid WhatsApp number in international digits.")
                  return
                }
                if (await saveContactInfo(next)) {
                  setError("")
                  setFeedback("Contact details saved successfully.")
                }
              }}
            >
              <label>
                WhatsApp number
                <input name="whatsapp" type="tel" defaultValue={contactInfo.phone} required maxLength={24} />
              </label>
              <label>
                Email address
                <input name="email" type="email" defaultValue={contactInfo.email} required />
              </label>
              <label>
                Cafe address
                <input name="address" defaultValue={contactInfo.address} required maxLength={200} />
              </label>
              <label>
                Opening hours
                <input name="hours" defaultValue={contactInfo.hours} required maxLength={100} />
              </label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button button-primary" type="submit">
                Save cafe settings <Icon name="check" />
              </button>
            </form>
          </section>
        )}
        <footer className="admin-footer">
          Lalazar Cafe · A little care makes all the difference.
        </footer>
      </main>
      {edit && (
        <Dialog title={isNewDish ? "Add a new dish" : `Edit ${edit.name}`} close={closeEdit}>
          <form
            className="form-stack"
            onSubmit={async (e) => {
              e.preventDefault()
              const data = new FormData(e.currentTarget)
              const price = Number(data.get("price"))
              const name = String(data.get("name")).trim()
              const urdu = String(data.get("urdu")).trim()
              const description = String(data.get("description")).trim()
              const category = String(data.get("category") || "Sajji & BBQ").trim()
              if (!name || !description || !Number.isFinite(price) || price <= 0) {
                setError("Enter a dish name, description and a valid positive price.")
                return
              }
              const nextItem: MenuItem = {
                id: Number(data.get("id") || edit.id) || Date.now(),
                name,
                urdu: urdu || name,
                description,
                price,
                category,
                image: String(data.get("image") || "/images/meal.jpg"),
                available: data.get("available") !== "false",
              }
              const nextMenu = isNewDish ? [...menu, nextItem] : menu.map((item) => (item.id === edit.id ? nextItem : item))
              if (await saveMenu(nextMenu)) {
                setEdit(null)
                setIsNewDish(false)
                setFeedback(isNewDish ? "Dish added to the menu." : "Dish updated. Your website menu is up to date.")
                setError("")
              }
            }}
          >
            <input type="hidden" name="id" value={edit.id} />
            <label>
              Dish name
              <input name="name" defaultValue={edit.name} required maxLength={100} />
            </label>
            <label>
              Urdu name
              <input name="urdu" defaultValue={edit.urdu} maxLength={100} />
            </label>
            <label>
              Category
              <select name="category" defaultValue={edit.category || "Sajji & BBQ"}>
                {CATEGORIES.filter((entry) => entry !== "All").map((entry) => (
                  <option key={entry} value={entry}>
                    {entry}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price (PKR)
              <input name="price" type="number" min="1" step="1" defaultValue={edit.price} required max="1000000" />
            </label>
            <label>
              Image URL
              <input name="image" defaultValue={edit.image || "/images/meal.jpg"} />
            </label>
            <label>
              Description
              <textarea name="description" defaultValue={edit.description} required rows={3} maxLength={500} />
            </label>
            <label>
              Available
              <select name="available" defaultValue={String(edit.available !== false)}>
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </label>
            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="button button-primary" type="submit">
              {isNewDish ? "Add dish" : "Save dish"} <Icon name="check" />
            </button>
          </form>
        </Dialog>
      )}
    </div>
  )
}

function RevenueChart({ orders }: { orders: CustomerOrderRecord[] }) {
  const [period, setPeriod] = useState<RevenuePeriod>("week")
  const buckets = getRevenueBuckets(orders, period)
  const total = buckets.reduce((sum, bucket) => sum + bucket.amount, 0)
  const maxAmount = Math.max(...buckets.map((bucket) => bucket.amount), 0)
  const periodLabels: Record<RevenuePeriod, string> = {
    day: "Today",
    week: "This week",
    month: "This month",
  }

  return (
    <section className="admin-panel revenue-panel">
      <div className="panel-title">
        <div>
          <span className="eyebrow">ORDER PERFORMANCE</span>
          <h2>Revenue</h2>
          <p>
            {periodLabels[period]} · {MONEY(total)} from eligible orders
          </p>
        </div>
        <div className="revenue-periods" role="group" aria-label="Revenue period">
          {(["day", "week", "month"] as const).map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={period === value}
              className={period === value ? "selected" : ""}
              onClick={() => setPeriod(value)}
            >
              {periodLabels[value]}
            </button>
          ))}
        </div>
      </div>
      <div
        className={`revenue-chart revenue-chart-${period}`}
        role="img"
        aria-label={`${periodLabels[period]} revenue chart totaling ${MONEY(total)}`}
      >
        {buckets.map((bucket, index) => (
          <div className="revenue-column" key={bucket.key}>
            <span className="revenue-value">{bucket.amount ? MONEY(bucket.amount) : ""}</span>
            <div className="revenue-bar-track">
              <div
                className="revenue-bar"
                style={{
                  height: maxAmount
                    ? `${Math.max(3, (bucket.amount / maxAmount) * 100)}%`
                    : "0%",
                }}
                title={`${bucket.label}: ${MONEY(bucket.amount)}`}
              />
            </div>
            {(period === "week" ||
              (period === "day" && index % 3 === 0) ||
              (period === "month" &&
                (index % 5 === 0 || index === buckets.length - 1))) && (
              <span className="revenue-label">{bucket.label}</span>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  icon,
}: {
  label: string
  value: string
  icon: IconName
}) {
  return (
    <div className="stat">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      <Icon name={icon} />
    </div>
  )
}

function OrderTable({
  orders,
  onStatusChange,
}: {
  orders: CustomerOrderRecord[]
  onStatusChange: (id: string, status: OrderStatus) => void
}) {
  if (!orders.length)
    return (
      <div className="empty-state request-empty">
        <Icon name="bag" />
        <h3>No orders yet.</h3>
        <p>Customer orders will appear here as soon as they are placed.</p>
      </div>
    )

  return (
    <div className="table-scroll">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Deadline</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id}>
              <td>
                <div className="order-meta">
                  <strong>{order.id}</strong>
                  <small>{new Date(order.createdAt).toLocaleString()}</small>
                </div>
              </td>
              <td>
                <div className="order-meta">
                  <strong>{order.customerName}</strong>
                  <small>{order.customerPhone}</small>
                  <small>{order.customerAddress}</small>
                </div>
              </td>
              <td>
                <div className="order-item-stack">
                  {order.items.map((item) => (
                    <span key={`${order.id}-${item.id}`}>
                      {item.name} × {item.qty}
                    </span>
                  ))}
                  <strong>Total {MONEY(order.subtotal)}</strong>
                </div>
              </td>
              <td>
                <div className="deadline-box">
                  <strong>{getOrderDeadlineText(order)}</strong>
                  <small>
                    {new Date(
                      new Date(order.createdAt).getTime() + order.deadlineMinutes * 60 * 1000,
                    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </small>
                </div>
              </td>
              <td>
                <div className="status-stack">
                  <select value={order.status} onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}>
                    {ORDER_STATUS_FLOW.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                  <div className="timeline">
                    {order.timeline.map((entry) => {
                      const done = ORDER_STATUS_FLOW.indexOf(entry.status) <= ORDER_STATUS_FLOW.indexOf(order.status)
                      return (
                        <div key={`${order.id}-${entry.status}`} className={`timeline-step ${done ? "done" : ""}`}>
                          <span />
                          <div>
                            <strong>{entry.status}</strong>
                            <small>{new Date(entry.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CustomerTable({
  customers,
  onEdit,
  onDelete,
}: {
  customers: CustomerRecord[]
  onEdit: (customer: CustomerRecord) => void
  onDelete: (id: string) => void
}) {
  if (!customers.length)
    return (
      <div className="empty-state request-empty">
        <Icon name="check" />
        <h3>No customer records.</h3>
        <p>Add a customer profile to keep contact and order details organized.</p>
      </div>
    )

  return (
    <div className="table-scroll customer-table">
      <table className="admin-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Phone</th>
            <th>Address</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>
                <div className="order-meta">
                  <strong>{customer.name}</strong>
                  <small>{customer.email || "No email"}</small>
                </div>
              </td>
              <td>{customer.phone}</td>
              <td>{customer.address}</td>
              <td>{customer.notes || "—"}</td>
              <td>
                <div className="table-actions">
                  <button className="icon-button" aria-label={`Edit ${customer.name}`} onClick={() => onEdit(customer)}>
                    <Icon name="edit" />
                  </button>
                  <button className="icon-button danger" aria-label={`Delete ${customer.name}`} onClick={() => onDelete(customer.id)}>
                    <Icon name="close" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
