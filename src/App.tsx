import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"
import { FirebaseError } from "firebase/app"
import {
  addDoc,
  deleteDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query as firestoreQuery,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore"
import { ADMIN_EMAIL, auth, db, messaging } from "./firebase"
import { MENU, WHATSAPP_NUMBER, type MenuItem, type CartItem } from "./menu"
import { getToken, onMessage } from "firebase/messaging"


const GRILL_IMAGE =
  MENU.find((item) => item.name === "Nawabi Pizza")?.image ?? "/images/meal.jpg"
const FOOD_IMAGE =
  MENU.find((item) => item.name === "Special Pizzratha")?.image ??
  "/images/meal.jpg"
const INTERIOR_IMAGE =
  MENU.find((item) => item.name === "Oven Baked Wings")?.image ??
  "/images/meal.jpg"
const FALLBACK_IMAGE = "/images/meal.jpg"
const MONEY = (value: number) => `Rs. ${value.toLocaleString("en-PK")}`
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

function Brand({
  light = false,
  name = "Al Maida Pizza Garden",
}: {
  light?: boolean
  name?: string
}) {
  const words = name.trim().toUpperCase().split(/\s+/)
  return (
    <a
      href="#/"
      className={`brand ${light ? "brand-light" : ""}`}
      aria-label={`${name} home`}
    >
      <Flower />
      <span>
        <strong>{words.slice(0, 2).join(" ")}</strong>
        {words.length > 2 && <small>{words.slice(2).join(" ")}</small>}
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
            <span className="eyebrow">AL MAIDA PIZZA GARDEN</span>
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

interface ContactInfo {
  name: string
  phone: string
  address: string
  hours: string
  heroTitle: string
  heroDescription: string
}

const DEFAULT_CONTACT_INFO: ContactInfo = {
  name: "Al Maida Pizza Garden",
  phone: "0331 7131160 ",
  address: "Railway Road, Block A, Dera Ghazi Khan, 02233",
  hours: "Google currently lists closing at 2:00 AM",
  heroTitle: "Pizzas, pizzratha, rolls and bites made to share.",
  heroDescription:
    "Explore Al Maida Pizza Garden's delivery menu: deep pan and square pan pizzas, pasta, rolls, fries, burgers, meals and deals.",
}

function parseMenuItem(id: string, value: unknown): MenuItem | null {
  if (
    !isRecord(value) ||
    !Number.isInteger(value.id) ||
    typeof value.name !== "string" ||
    typeof value.urdu !== "string" ||
    typeof value.description !== "string" ||
    !Number.isFinite(value.price) ||
    typeof value.category !== "string" ||
    typeof value.image !== "string"
  ) {
    return null
  }
  return {
    id: Number(value.id),
    name: value.name,
    urdu: value.urdu,
    description: value.description,
    price: Number(value.price),
    priceFrom: Boolean(value.priceFrom),
    category: value.category,
    image: value.image,
    ...(typeof value.badge === "string" ? { badge: value.badge } : {}),
    available: value.available !== false,
  }
}

function parseContactInfo(value: unknown): ContactInfo {
  if (!isRecord(value)) return DEFAULT_CONTACT_INFO
  return {
    name:
      typeof value.name === "string" && value.name.trim()
        ? value.name
        : DEFAULT_CONTACT_INFO.name,
    phone:
      typeof value.phone === "string"
        ? value.phone
        : DEFAULT_CONTACT_INFO.phone,
    address:
      typeof value.address === "string"
        ? value.address
        : DEFAULT_CONTACT_INFO.address,
    hours:
      typeof value.hours === "string"
        ? value.hours
        : DEFAULT_CONTACT_INFO.hours,
    heroTitle:
      typeof value.heroTitle === "string"
        ? value.heroTitle
        : DEFAULT_CONTACT_INFO.heroTitle,
    heroDescription:
      typeof value.heroDescription === "string"
        ? value.heroDescription
        : DEFAULT_CONTACT_INFO.heroDescription,
  }
}

export default function App() {
  const whatsapp = WHATSAPP_NUMBER
  const [menu, setMenu] = useState<MenuItem[]>(MENU)
  const [menuInitialized, setMenuInitialized] = useState(false)
  const [menuCollectionEmpty, setMenuCollectionEmpty] = useState<boolean | null>(
    null,
  )
  const [fcmToken, setFcmToken] = useState<string>("")
  const [contactInfo, setContactInfo] =
    useState<ContactInfo>(DEFAULT_CONTACT_INFO)
  // Task 1: Simple Push Notification Controller (1 text field + 1 button) for Al Maida. Action: write the text in the text field and click the button to push the notification to all other open tabs of the same browser. Use BroadcastChannel API for this task.
  const [pushedMessage, setPushedMessage] = useState<string>("")
  const [page, setPage] = useState<"home" | "menu" | "admin" | "login">(() =>
    window.location.hash === "#/menu"
      ? "menu"
      : window.location.hash === "#/admin"
        ? "admin"
        : window.location.hash === "#/login"
          ? "login"
          : "home",
  )
  const [user, setUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [cart, setCart] = useState<CartItem[]>([])
  const [category, setCategory] = useState("All")
  const [mobileNav, setMobileNav] = useState(false)
  const [overlay, setOverlay] =
    useState<"cart" | "checkout" | "reservation" | null>(null)
  const [notice, setNotice] = useState("")
  
  // Task 1: Simple Push Notification Controller (1 text field + 1 button) for Al Maida. Action: write the text in the text field and click the button to push the notification to all other open tabs of the same browser. Use BroadcastChannel API for this task.
  useEffect(() => {
  // Connect to the same broadcast channel name
  const channel = new BroadcastChannel("al_maida_notifications")

  channel.onmessage = (event) => {
    if (event.data && event.data.text) {
      setPushedMessage(event.data.text)
    }
  }

  return () => channel.close()
  }, [])
  useEffect(
    () =>
      onAuthStateChanged(auth, (nextUser) => {
        setUser(nextUser)
        setAuthReady(true)
      }),
    [],
  )
  useEffect(() => {
    const unsubscribeMenu = onSnapshot(
      firestoreQuery(collection(db, "menuItems"), orderBy("id")),
      (snapshot) => {
        if (snapshot.empty) {
          setMenuCollectionEmpty(true)
          return
        }
        setMenuCollectionEmpty(false)
        const parsed = snapshot.docs
          .map((menuDoc) => parseMenuItem(menuDoc.id, menuDoc.data()))
          .filter((item): item is MenuItem => item !== null)
        setMenu(parsed)
      },
      () => setNotice("Menu updates could not be loaded. Please refresh."),
    )
    const unsubscribeMenuMetadata = onSnapshot(
      doc(db, "settings", "metadata"),
      (snapshot) => {
        setMenuInitialized(snapshot.data()?.menuInitialized === true)
      },
      () => setNotice("Menu initialization status could not be loaded."),
    )
    const unsubscribeSettings = onSnapshot(
      doc(db, "settings", "restaurant"),
      (snapshot) => {
        if (snapshot.exists()) setContactInfo(parseContactInfo(snapshot.data()))
      },
      () =>
        setNotice("Restaurant details could not be loaded. Please refresh."),
    )
    return () => {
      unsubscribeMenu()
      unsubscribeMenuMetadata()
      unsubscribeSettings()
    }
  }, [])
  useEffect(() => {
    if (menuCollectionEmpty !== true) return
    setMenu(menuInitialized ? [] : MENU)
  }, [menuCollectionEmpty, menuInitialized])
  useEffect(() => {
    const updatePage = () => {
      const nextPage =
        window.location.hash === "#/menu"
          ? "menu"
          : window.location.hash === "#/admin"
            ? "admin"
            : window.location.hash === "#/login"
              ? "login"
              : "home"
      setPage(nextPage)
      setMobileNav(false)
      if (nextPage === "menu") setCategory("All")
      setOverlay(null)
      window.scrollTo({ top: 0, behavior: "auto" })
    }
    window.addEventListener("hashchange", updatePage)
    document.documentElement.lang = "en"
    return () => window.removeEventListener("hashchange", updatePage)
  }, [])
  useEffect(() => {
    if (
      category !== "All" &&
      !menu.some((item) => item.category === category)
    ) {
      setCategory("All")
    }
  }, [category, menu])
  useEffect(() => {
    if (!authReady) return
    if (page === "admin" && !user) {
      window.location.hash = "#/login"
    } else if (page === "login" && user) {
      window.location.hash = "#/admin"
    }
  }, [authReady, page, user])
  useEffect(() => {
    document.title =
      page === "menu"
        ? `Full Menu | ${contactInfo.name}, Dera Ghazi Khan`
        : page === "admin"
          ? `Admin Workspace | ${contactInfo.name}`
          : page === "login"
            ? `Admin Sign In | ${contactInfo.name}`
            : `${contactInfo.name} | Menu in Dera Ghazi Khan`
  }, [page, contactInfo.name])
  useEffect(() => {
    if (!notice) return
    const id = setTimeout(() => setNotice(""), 4500)
    return () => clearTimeout(id)
  }, [notice])
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => console.log("SW registered:", registration.scope))
        .catch((err) => console.error("SW registration failed:", err))
    }

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message received:", payload)
      alert(`🍕 Al Maida Notification:\n${payload.notification?.title}\n${payload.notification?.body}`)
    })

    return () => unsubscribe()
  }, [])
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
  const close = useRef(() => setOverlay(null)).current
  const openWhatsApp = (message: string) => {
    window.open(
      "https://wa.me/" + whatsapp + "?text=" + encodeURIComponent(message),
      "_blank",
      "noopener,noreferrer",
    )
  }

  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === "granted") {
        const currentToken = await getToken(messaging, {
          vapidKey: "BJfXkJGgaTc7xI_YXJlicyVt_uB96MVccdBrDZX8YlEdq7SzAWA6_MwJtgFFYdcOzHEARY4cfkkJycg_ZiQyHwg" // Replace with your VAPID key from Firebase Console
        })

        if (currentToken) {
          setFcmToken(currentToken)
          console.log("FCM Token:", currentToken)

          await setDoc(doc(db, "devices", currentToken), {
            token: currentToken,
            updatedAt: serverTimestamp(),
          })

          alert("Push notifications enabled successfully!")
        } else {
          console.log("No registration token available.")
        }
      } else {
        alert("Notification permission was denied.")
      }
    } catch (error) {
      console.error("Error retrieving FCM token:", error)
    }
  }

  const featuredNames = [
    "Nawabi Pizza",
    "Special Pizzratha",
    "Full Loaded Fries",
    "Jalapeno Cheese Rolls",
    "Oven Baked Wings",
    "Brunch Meal",
  ]
  const featured = featuredNames
    .map((name) => menu.find((item) => item.name === name))
    .filter((item): item is MenuItem => item !== undefined)
  const showHomeSection = (id: string) => {
    setPage("home")
    setMobileNav(false)
    if (window.location.hash !== "#/") window.location.hash = "/"
    window.setTimeout(
      () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
      0,
    )
  }
  return page === "admin" ? (
    !authReady ? (
      <AuthLoading />
    ) : user ? (
      <AdminPage
        menu={menu}
        setMenu={setMenu}
        contactInfo={contactInfo}
        setContactInfo={setContactInfo}
        user={user}
        onSignOut={() => signOut(auth)}
      />
    ) : (
      <AuthLoading />
    )
  ) : page === "login" ? (
    <LoginPage
      restaurantName={contactInfo.name}
      onSignIn={(email, password) =>
        signInWithEmailAndPassword(auth, email, password)
      }
    />
  ) : (
    <div className="site-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Brand name={contactInfo.name} />
          <nav
            className={`main-nav ${mobileNav ? "nav-open" : ""}`}
            aria-label="Main navigation"
          >
            <a className={page === "home" ? "nav-active" : ""} href="#/">
              Home
            </a>
            <a
              className={page === "menu" ? "nav-active" : ""}
              href="#/menu"
              onClick={() => setMobileNav(false)}
            >
              Our menu
            </a>
            <a
              href="#story"
              onClick={(event) => {
                event.preventDefault()
                showHomeSection("story")
              }}
            >
              Our story
            </a>
            <a
              href="#experience"
              onClick={(event) => {
                event.preventDefault()
                showHomeSection("experience")
              }}
            >
              The experience
            </a>
            <a
              href="#visit"
              onClick={(event) => {
                event.preventDefault()
                showHomeSection("visit")
              }}
            >
              Visit us
            </a>
          </nav>
          <div className="header-actions">
            <button 
              className="button button-outline"
              onClick={requestNotificationPermission}
              style={{ fontSize: "12px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "5px" }}
              title="Enable Order Notifications"
            >
              {fcmToken ? "Alerts Active" : "Enable Alerts"} <Icon name="flame" />
            </button>
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
              href="#/menu"
              onClick={() => setMobileNav(false)}
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
        {page === "menu" ? (
          <FullMenuPage
            menu={menu}
            category={category}
            setCategory={setCategory}
            cart={cart}
            changeQty={changeQty}
          />
        ) : (
          <>
            <section className="hero container" aria-labelledby="hero-title">
              <div className="hero-copy">
                <div className="eyebrow hero-eyebrow">
                  <span className="tiny-diamond" /> DERA GHAZI KHAN · PIZZA
                  RESTAURANT
                </div>
                <h1 id="hero-title">{contactInfo.heroTitle}</h1>
                <p className="hero-description">
                  {contactInfo.heroDescription}
                </p>
                <div className="hero-buttons">
                  <a className="button button-primary" href="#/menu">
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
                  <span>4.0 out of 5 on Google · 775 reviews</span>
                </div>
              </div>
              <div className="hero-art">
                <div className="hero-image-wrap">
                  <img
                    className="hero-main-image"
                    src={GRILL_IMAGE}
                    alt="Nawabi Pizza from Al Maida Pizza Garden"
                    fetchPriority="high"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE
                    }}
                  />
                  <div className="image-shade" />
                  <div className="image-caption">
                    <span>AL MAIDA MENU HIGHLIGHT</span>
                    <span>Pizza favourites, made to share.</span>
                  </div>
                </div>
                <div className="hero-inset">
                  <img
                    src={FOOD_IMAGE}
                    alt="Special Pizzratha from Al Maida Pizza Garden"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE
                    }}
                  />
                  <span>Special Pizzratha</span>
                </div>
                <div className="heritage-seal">
                  <Flower />
                  <span>AL MAIDA PIZZA GARDEN</span>
                  <strong lang="ur" dir="rtl">
                    تازہ ذائقہ
                  </strong>
                  <small lang="ur" dir="rtl">
                    ہر نوالہ لاجواب
                  </small>
                </div>
                <div className="hero-side-label">GOOD FOOD. GREAT COMPANY.</div>
                <div className="hero-art-footer">
                  <span>01 / MENU HIGHLIGHTS</span>
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
                  <Icon name="flame" /> Pizza favourites
                </span>
                <span className="strip-diamond">✧</span>
                <span>
                  <Icon name="leaf" /> Fries, rolls and sides
                </span>
                <span className="strip-diamond">✧</span>
                <span>
                  <Icon name="heart" /> Meals and deals
                </span>
                <span className="strip-diamond">✧</span>
                <span>Explore the full menu.</span>
              </div>
            </div>

            <section
              id="menu"
              className="menu-section container"
              aria-labelledby="menu-heading"
            >
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    AL MAIDA PIZZA GARDEN · DERA GHAZI KHAN
                  </span>
                  <h2 id="menu-heading">
                    A few favourites, <em>to start.</em>
                  </h2>
                </div>
                <div className="menu-highlight">
                  <strong>Your next favourite is waiting.</strong>
                  <p>
                    From cheesy, oven-fresh pizza to loaded fries and crispy
                    bites, there is something delicious for every craving.
                  </p>
                </div>
              </div>
              <MenuCards items={featured} cart={cart} changeQty={changeQty} />
              <div className="menu-more">
                <a className="text-link" href="#/menu">
                  Explore all {menu.length} menu items <Icon name="arrow" />
                </a>
                <span>Browse every category, dish and listed price.</span>
              </div>
            </section>

            <section id="story" className="story-section">
              <div className="container story-grid">
                <div className="story-image">
                  <img
                    src={INTERIOR_IMAGE}
                    alt="Oven Baked Wings from Al Maida Pizza Garden"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = FALLBACK_IMAGE
                    }}
                  />
                  <div className="story-image-note">
                    <Flower />
                    <span>
                      Good food.
                      <br />
                      <em>Great company.</em>
                    </span>
                  </div>
                </div>
                <div className="story-copy">
                  <span className="eyebrow">OUR PROMISE</span>
                  <h2>
                    A quick bite,
                    <br />
                    <em>a memorable meal.</em>
                  </h2>
                  <p>
                    Al Maida Pizza Garden is listed on Railway Road, Block A, in
                    Dera Ghazi Khan. Its menu features deep pan, square pan,
                    crown and stuffed pizzas alongside pasta, rolls, fries and
                    meals.
                  </p>
                  <p>
                    Browse the listed dishes and current prices, then contact
                    the restaurant directly to confirm availability, serving
                    options and delivery details.
                  </p>
                  <a className="text-link" href="#experience">
                    Discover the experience <Icon name="arrow" />
                  </a>
                  <div className="story-signature">
                    Listed in <span>Dera Ghazi Khan</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="experience" className="experience-section container">
              <div className="center-heading">
                <span className="eyebrow">SAVOUR THE MOMENT</span>
                <h2>
                  Flavour-packed favourites, <em>made to share.</em>
                </h2>
                <p>
                  Pizzas, burgers, wraps, and sides for every craving and every
                  occasion.
                </p>
              </div>
              <div className="experience-grid">
                {[
                  {
                    icon: "flame" as const,
                    number: "01",
                    title: "Freshly made classics",
                    copy: "From cheesy pizzas to loaded fries, every dish is cooked to order and served hot.",
                  },
                  {
                    icon: "heart" as const,
                    number: "02",
                    title: "A place for every crew",
                    copy: "The listed menu includes fast-food combos and pizza deals for sharing.",
                  },
                  {
                    icon: "message" as const,
                    number: "03",
                    title: "Order in a tap",
                    copy: "Pick your favourites, share your order, and let us handle the rest on WhatsApp.",
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
                  <span className="eyebrow">
                    VISIT {contactInfo.name.toUpperCase()}
                  </span>
                  <h2>Visit us soon.</h2>
                  <p>{contactInfo.address}</p>
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
                  <a
                    className="visit-whatsapp"
                    href={`tel:${contactInfo.phone.replace(/\D/g, "")}`}
                  >
                    Call {contactInfo.phone}
                  </a>
                  <small>{contactInfo.hours}</small>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="site-footer container">
        <div className="footer-top">
          <Brand name={contactInfo.name} />
          <p>
            Hot pizzas.
            <br />
            Crispy bites. Great company.
          </p>
          <div className="footer-links">
            <a href="#/menu">Our menu</a>
            <a
              href="#story"
              onClick={(event) => {
                event.preventDefault()
                showHomeSection("story")
              }}
            >
              Our story
            </a>
            <a href="#/login">Admin</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {contactInfo.name}. All rights
            reserved.
          </span>
          <span>Freshly made for every craving.</span>
          <span lang="ur" dir="rtl">
            المیڈا پیزا گارڈن — تازہ ذائقہ
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
      {/* Real-time Broadcast Notification Banner */}
      {pushedMessage && (
        <div style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          backgroundColor: "#d9381e",
          color: "#ffffff",
          padding: "16px 24px",
          borderRadius: "8px",
          boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          maxWidth: "350px",
          fontSize: "15px",
          fontWeight: "bold"
        }}>
          <span>📢 {pushedMessage}</span>
          <button 
            onClick={() => setPushedMessage("")}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              fontSize: "18px",
              cursor: "pointer",
              marginLeft: "auto"
            }}
          >
            ✕
          </button>
        </div>
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
                    <small>
                      {item.priceFrom ? "From " : ""}
                      {MONEY(item.price)}
                    </small>
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
                  <strong>
                    {item.priceFrom ? "From " : ""}
                    {MONEY(item.price * item.qty)}
                  </strong>
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
                    window.location.hash = "#/menu"
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
            onComplete={() => {
              setCart([])
              close()
              setNotice(
                "WhatsApp opened. Send the message so our team can confirm your order.",
              )
            }}
          />
        </Dialog>
      )}
      {overlay === "reservation" && (
        <Dialog title="Request a table." close={close}>
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
  const src = item.image || FALLBACK_IMAGE
  return (
    <img
      src={src}
      alt={item.name}
      loading="lazy"
      onError={(e) => {
        e.currentTarget.onerror = null
        e.currentTarget.src = FALLBACK_IMAGE
      }}
    />
  )
}

function MenuCards({
  items,
  cart,
  changeQty,
}: {
  items: MenuItem[]
  cart: CartItem[]
  changeQty: (item: MenuItem, delta: number) => void
}) {
  return (
    <div className="menu-grid">
      {items.map((item) => {
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
                <span className="unavailable-badge">Currently unavailable</span>
              )}
            </div>
            <div className="menu-card-content">
              <div className="dish-category">{item.category}</div>
              <div className="dish-title">
                <h3>{item.name}</h3>
                {item.urdu && (
                  <span lang="ur" dir="rtl">
                    {item.urdu}
                  </span>
                )}
              </div>
              {item.description && <p>{item.description}</p>}
              <div className="dish-bottom">
                <strong>
                  {item.priceFrom ? "From " : ""}
                  {MONEY(item.price)}
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
  )
}

function FullMenuPage({
  menu,
  category,
  setCategory,
  cart,
  changeQty,
}: {
  menu: MenuItem[]
  category: string
  setCategory: (category: string) => void
  cart: CartItem[]
  changeQty: (item: MenuItem, delta: number) => void
}) {
  const categories = [
    "All",
    ...new Set(menu.map((item) => item.category)),
  ].sort((left, right) =>
    left === "All" ? -1 : right === "All" ? 1 : left.localeCompare(right),
  )
  const filtered = menu.filter(
    (item) => category === "All" || item.category === category,
  )
  return (
    <section id="menu" className="menu-page" aria-labelledby="menu-heading">
      <div className="menu-page-banner">
        <div className="container menu-page-banner-inner">
          <div>
            <span className="eyebrow">
              AL MAIDA PIZZA GARDEN · DERA GHAZI KHAN
            </span>
            <h1 id="menu-heading">
              The full menu, <em>your way.</em>
            </h1>
            <p>
              Big flavours, fresh favourites and feel-good bites—find the
              perfect thing to share.
            </p>
          </div>
          <a className="button button-outline menu-home-link" href="#/">
            <Icon name="arrow" className="back-arrow" /> Back to home
          </a>
        </div>
      </div>
      <div className="container menu-section menu-page-content">
        <div className="menu-toolbar">
          <div className="menu-filter">
            <label htmlFor="menu-category">Browse by category</label>
            <select
              id="menu-category"
              value={category}
              onChange={(event) => setCategory(event.currentTarget.value)}
            >
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value === "All" ? "All dishes" : value}
                </option>
              ))}
            </select>
          </div>
          <span className="menu-count">
            {category === "All"
              ? `${menu.length} dishes to discover`
              : `${filtered.length} ${category.toLowerCase()} dishes`}
          </span>
        </div>
        <div className="menu-highlight menu-page-highlight">
          <strong>Good food makes every get-together better.</strong>
          <p>
            Make it a pizza night, load up on fries or choose a little of
            everything. Prices marked “From” are starting prices; availability
            and final totals can be confirmed with our team.
          </p>
        </div>
        <MenuCards items={filtered} cart={cart} changeQty={changeQty} />
      </div>
    </section>
  )
}

type AdminTab = "overview" | "menu" | "orders" | "customers" | "settings"
type OrderStatus = "pending" | "confirmed" | "preparing" | "completed" | "cancelled"
type AnalyticsPeriod = "day" | "week" | "month"

interface RestaurantOrder {
  id: string
  customer: {
    name: string
    address: string
    phone: string
    notes: string
  }
  items: {
    id: number
    name: string
    qty: number
    price: number
    priceFrom: boolean
  }[]
  subtotal: number
  status: OrderStatus
  createdAt: Timestamp | null
}

const ORDER_STATUSES: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "completed",
  "cancelled",
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === "string" &&
    ORDER_STATUSES.some((status) => status === value)
  )
}

function isRestaurantOrderItem(
  item: unknown,
): item is RestaurantOrder["items"][number] {
  return (
    isRecord(item) &&
    Number.isInteger(item.id) &&
    typeof item.name === "string" &&
    Number.isInteger(item.qty) &&
    Number(item.qty) > 0 &&
    Number.isFinite(item.price) &&
    Number(item.price) >= 0 &&
    typeof item.priceFrom === "boolean"
  )
}

function parseRestaurantOrder(
  id: string,
  data: unknown,
): RestaurantOrder | null {
  if (
    !isRecord(data) ||
    !isRecord(data.customer) ||
    !Array.isArray(data.items) ||
    typeof data.customer.name !== "string" ||
    typeof data.customer.address !== "string" ||
    typeof data.customer.phone !== "string" ||
    typeof data.customer.notes !== "string" ||
    !Number.isFinite(data.subtotal) ||
    !isOrderStatus(data.status) ||
    !(data.createdAt === null || data.createdAt instanceof Timestamp)
  ) {
    return null
  }
  const items = data.items
  const validItems = items.filter(isRestaurantOrderItem)
  if (validItems.length === 0 || validItems.length !== items.length) {
    return null
  }
  return {
    id,
    customer: {
      name: data.customer.name,
      address: data.customer.address,
      phone: data.customer.phone,
      notes: data.customer.notes,
    },
    items: validItems.map((item) => ({
      id: item.id,
      name: item.name,
      qty: item.qty,
      price: item.price,
      priceFrom: item.priceFrom,
    })),
    subtotal: Number(data.subtotal),
    status: data.status,
    createdAt: data.createdAt,
  }
}

function orderDate(order: RestaurantOrder) {
  return order.createdAt ? order.createdAt.toDate().toLocaleString("en-PK", {
        dateStyle: "medium",
        timeStyle: "short",
      }) : "Just now"
}

function getPeriodStart(period: AnalyticsPeriod, now = new Date()) {
  const start = new Date(now)
  if (period === "day") {
    start.setHours(0, 0, 0, 0)
  } else if (period === "week") {
    start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
    start.setHours(0, 0, 0, 0)
  } else {
    start.setDate(1)
    start.setHours(0, 0, 0, 0)
  }
  return start
}

function AdminPage({
  menu,
  setMenu,
  contactInfo,
  setContactInfo,
  user,
  onSignOut,
}: {
  menu: MenuItem[]
  setMenu: (items: MenuItem[]) => void
  contactInfo: ContactInfo
  setContactInfo: (info: ContactInfo) => void
  user: User
  onSignOut: () => Promise<void>
}) {
  const [tab, setTab] = useState<AdminTab>("overview")
  const [query, setQuery] = useState("")
  const [signOutError, setSignOutError] = useState("")
  const [adminError, setAdminError] = useState("")
  const [adminNotice, setAdminNotice] = useState("")
  const [orders, setOrders] = useState<RestaurantOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [ordersError, setOrdersError] = useState("")
  const [updatingOrderId, setUpdatingOrderId] = useState("")
  const [period, setPeriod] = useState<AnalyticsPeriod>("week")
  const [menuModal, setMenuModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState<MenuItem | null>(null)
  const [menuSaving, setMenuSaving] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<{
    customerKey: string
    phone: string
    name: string
    address: string
    notes: string
  } | null>(null)
  const [customerSaving, setCustomerSaving] = useState(false)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const tabs: { key: AdminTab; label: string; icon: IconName }[] = [
    { key: "overview", label: "Overview", icon: "grid" },
    { key: "menu", label: "Menu management", icon: "utensils" },
    { key: "orders", label: "Orders", icon: "bag" },
    { key: "customers", label: "Customers", icon: "check" },
    { key: "settings", label: "Restaurant settings", icon: "settings" },
  ]
  const title = tabs.find((item) => item.key === tab)?.label ?? "Overview"
  const filteredMenu = menu.filter((item) =>
    `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase()),
  )
  const categories = [...new Set(menu.map((item) => item.category))].sort()
  useEffect(() => {
    if (user.email?.toLowerCase() !== ADMIN_EMAIL) return
    let cancelled = false
    const initializeAdminData = async () => {
      try {
        const menuSnapshot = await getDocs(collection(db, "menuItems"))
        if (!cancelled && menuSnapshot.empty) {
          const batch = writeBatch(db)
          MENU.forEach((item) =>
            batch.set(doc(db, "menuItems", String(item.id)), item),
          )
          await batch.commit()
        }
        const settingsRef = doc(db, "settings", "restaurant")
        const settingsSnapshot = await getDoc(settingsRef)
        if (!cancelled && !settingsSnapshot.exists()) {
          await setDoc(settingsRef, DEFAULT_CONTACT_INFO)
        }
      } catch (cause) {
        if (!cancelled) {
          setAdminError(
            cause instanceof FirebaseError && cause.code === "permission-denied"
              ? "Admin data setup was denied by Firestore rules. Deploy the latest rules and reload."
              : "Admin data could not be initialized. Check your connection and Firestore setup.",
          )
        }
      }
    }
    void initializeAdminData()
    return () => {
      cancelled = true
    }
  }, [user.email])
  useEffect(() => {
    if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
      setOrdersLoading(false)
      return
    }
    const ordersQuery = firestoreQuery(
      collection(db, "orders"),
      orderBy("createdAt", "desc"),
      limit(1000),
    )
    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        const parsedOrders = snapshot.docs.map((orderDoc) =>
          parseRestaurantOrder(orderDoc.id, orderDoc.data()),
        )
        const validOrders = parsedOrders.filter(
          (order): order is RestaurantOrder => order !== null,
        )
        setOrders(validOrders)
        setOrdersError(
          validOrders.length === parsedOrders.length
            ? ""
            : "Some saved orders have invalid data and were hidden. Review those records in the Firebase console.",
        )
        setOrdersLoading(false)
      },
      (cause) => {
        setOrdersError(
          cause instanceof FirebaseError && cause.code === "permission-denied"
            ? "Order access was denied. Confirm that you are signed in to the correct Firebase project and that the latest Firestore rules are deployed."
            : "Live orders could not be loaded. Please refresh and try again.",
        )
        setOrdersLoading(false)
      },
    )
  }, [user])
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setUpdatingOrderId(orderId)
    setOrdersError("")
    try {
      await updateDoc(doc(db, "orders", orderId), { status })
    } catch (cause) {
      setOrdersError(
        cause instanceof FirebaseError && cause.code === "permission-denied"
          ? "You are not authorized to update this order."
          : "Order status could not be updated. Please try again.",
      )
    } finally {
      setUpdatingOrderId("")
    }
  }
  const saveMenuItem = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const name = String(data.get("name")).trim()
    const category = String(data.get("category")).trim()
    const price = Number(data.get("price"))
    const image = String(data.get("image")).trim() || FALLBACK_IMAGE
    if (!name || !category || !Number.isFinite(price) || price <= 0) {
      setAdminError("Enter a name, category, and valid price for this item.")
      return
    }
    const id =
      editingMenu?.id ?? Math.max(0, ...menu.map((item) => item.id)) + 1
    const item: MenuItem = {
      id,
      name,
      urdu: String(data.get("urdu")).trim(),
      description: String(data.get("description")).trim(),
      price,
      priceFrom: data.get("priceFrom") === "on",
      category,
      image,
      badge: String(data.get("badge")).trim() || undefined,
      available: data.get("available") === "on",
    }
    const cleanItem = Object.fromEntries(
      Object.entries(item).filter(([, value]) => value !== undefined),
    )
    setMenuSaving(true)
    setAdminError("")
    try {
      await setDoc(doc(db, "menuItems", String(id)), cleanItem)
      setMenu(
        [...menu.filter((current) => current.id !== id), item].sort(
          (left, right) => left.id - right.id,
        ),
      )
      setMenuModal(false)
      setAdminNotice(`${name} saved and published to the website.`)
    } catch (cause) {
      setAdminError(
        cause instanceof FirebaseError && cause.code === "permission-denied"
          ? "You are not allowed to edit the menu. Verify the admin account and Firestore rules."
          : "The menu item could not be saved. Please try again.",
      )
    } finally {
      setMenuSaving(false)
    }
  }
  const removeMenuItem = async (item: MenuItem) => {
    if (!window.confirm(`Remove ${item.name} from the public menu?`)) return
    setAdminError("")
    try {
      await deleteDoc(doc(db, "menuItems", String(item.id)))
      setMenu(menu.filter((current) => current.id !== item.id))
      setAdminNotice(`${item.name} was removed from the website menu.`)
    } catch (cause) {
      setAdminError(
        cause instanceof FirebaseError && cause.code === "permission-denied"
          ? "You are not allowed to remove menu items."
          : "The menu item could not be removed. Please try again.",
      )
    }
  }
  const saveCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!editingCustomer) return
    const data = new FormData(event.currentTarget)
    const customer = {
      name: String(data.get("name")).trim(),
      address: String(data.get("address")).trim(),
      phone: String(data.get("phone")).trim(),
      notes: String(data.get("notes")).trim(),
    }
    if (
      !customer.name ||
      !customer.address ||
      !/^[+\d\s()-]{10,20}$/.test(customer.phone) ||
      customer.phone.replace(/\D/g, "").length < 10
    ) {
      setAdminError("Enter the customer's name, address, and valid phone.")
      return
    }
    const matchingOrders = orders.filter(
      (order) =>
        order.customer.phone.replace(/\D/g, "") === editingCustomer.customerKey,
    )
    setCustomerSaving(true)
    setAdminError("")
    try {
      for (let index = 0; index < matchingOrders.length; index += 450) {
        const batch = writeBatch(db)
        matchingOrders.slice(index, index + 450).forEach((order) => {
          batch.update(doc(db, "orders", order.id), { customer })
        })
        await batch.commit()
      }
      setEditingCustomer(null)
      setAdminNotice(
        `Customer details updated across ${matchingOrders.length} recent order(s).`,
      )
    } catch (cause) {
      setAdminError(
        cause instanceof FirebaseError && cause.code === "permission-denied"
          ? "You are not allowed to edit customer records. Check the Firestore rules."
          : "Customer details could not be updated. Please try again.",
      )
    } finally {
      setCustomerSaving(false)
    }
  }
  const saveRestaurantSettings = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const nextSettings: ContactInfo = {
      name: String(data.get("name")).trim(),
      phone: String(data.get("phone")).trim(),
      address: String(data.get("address")).trim(),
      hours: String(data.get("hours")).trim(),
      heroTitle: String(data.get("heroTitle")).trim(),
      heroDescription: String(data.get("heroDescription")).trim(),
    }
    if (Object.values(nextSettings).some((value) => !value)) {
      setAdminError("Complete all website details before saving.")
      return
    }
    setSettingsSaving(true)
    setAdminError("")
    try {
      await setDoc(doc(db, "settings", "restaurant"), nextSettings)
      setContactInfo(nextSettings)
      setAdminNotice("Website details saved and published.")
    } catch (cause) {
      setAdminError(
        cause instanceof FirebaseError && cause.code === "permission-denied"
          ? "You are not allowed to change website details."
          : "Website details could not be saved. Please try again.",
      )
    } finally {
      setSettingsSaving(false)
    }
  }
  const today = new Date().toDateString()
  const todaysOrders = orders.filter(
    (order) => order.createdAt?.toDate().toDateString() === today,
  ).length
  const recentCustomers = new Set(orders.map((order) => order.customer.phone))
  const periodStart = getPeriodStart(period)
  const periodOrders = orders.filter(
    (order) =>
      order.createdAt &&
      order.createdAt.toDate().getTime() >= periodStart.getTime(),
  )
  const revenueOrders = periodOrders.filter((order) =>
    ["confirmed", "preparing", "completed"].includes(order.status),
  )
  const paidRevenue = revenueOrders.reduce(
    (sum, order) => sum + order.subtotal,
    0,
  )
  const bucketCount =
    period === "day" ? 24 : period === "week" ? 7 : new Date().getDate()
  const revenueBuckets = Array.from({ length: bucketCount }, (_, index) => {
    const label =
      period === "day"
        ? `${index % 12 || 12}${index < 12 ? "a" : "p"}`
        : period === "week"
          ? new Date(
              periodStart.getFullYear(),
              periodStart.getMonth(),
              periodStart.getDate() + index,
            ).toLocaleDateString("en-PK", { weekday: "short" })
          : String(index + 1)
    return { label, value: 0 }
  })
  revenueOrders.forEach((order) => {
    if (!order.createdAt) return
    const date = order.createdAt.toDate()
    const index =
      period === "day"
        ? date.getHours()
        : period === "week"
          ? Math.floor(
              (new Date(
                date.getFullYear(),
                date.getMonth(),
                date.getDate(),
              ).getTime() -
                periodStart.getTime()) /
                86400000,
            )
          : date.getDate() - 1
    if (index >= 0 && index < revenueBuckets.length) {
      revenueBuckets[index].value += order.subtotal
    }
  })
  const maximumRevenue = Math.max(
    1,
    ...revenueBuckets.map((bucket) => bucket.value),
  )
  const bestSellers = new Map<string, number>()
  revenueOrders.forEach((order) =>
    order.items.forEach((item) =>
      bestSellers.set(item.name, (bestSellers.get(item.name) ?? 0) + item.qty),
    ),
  )
  const bestSellingItems = [...bestSellers.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
  const orderStatusCounts = ORDER_STATUSES.map((status) => ({
    status,
    count: periodOrders.filter((order) => order.status === status).length,
  }))
  const customerMap = new Map<string, {
    phone: string
    name: string
    address: string
    notes: string
    orders: RestaurantOrder[]
  }>()
  orders.forEach((order) => {
    const key = order.customer.phone.replace(/\D/g, "")
    const customer = customerMap.get(key)
    if (customer) customer.orders.push(order)
    else
      customerMap.set(key, {
        phone: order.customer.phone,
        name: order.customer.name,
        address: order.customer.address,
        notes: order.customer.notes,
        orders: [order],
      })
  })
  const customers = [...customerMap.values()]

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return (
      <main className="auth-loading">
        <span className="eyebrow">ADMIN ACCESS RESTRICTED</span>
        <h1>Administrator account required</h1>
        <p>
          This workspace is restricted to {ADMIN_EMAIL}. The current signed-in
          account is {user.email ?? "missing an email address"}.
        </p>
        <button className="button button-primary" onClick={onSignOut}>
          Sign out
        </button>
      </main>
    )
  }
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <Brand light name={contactInfo.name} />
        <span className="eyebrow">RESTAURANT WORKSPACE</span>
        <nav aria-label="Admin navigation">
          {tabs.map((item) => (
            <button
              key={item.key}
              className={tab === item.key ? "active" : ""}
              onClick={() => setTab(item.key)}
            >
              <Icon name={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a href="#/">
            <Icon name="arrow" className="back-arrow" />
            View website
          </a>
          <button
            onClick={async () => {
              try {
                await onSignOut()
                window.location.hash = "#/login"
              } catch {
                setSignOutError("Could not sign out. Please try again.")
              }
            }}
          >
            <Icon name="logout" />
            Sign out
          </button>
          <small>ADMIN PREVIEW</small>
        </div>
      </aside>
      <main className="admin-main">
        <header className="admin-header">
          <div>
            <span className="eyebrow">AL MAIDA PIZZA GARDEN</span>
            <h1>{title}</h1>
          </div>
          <div className="admin-avatar">
            {(user.displayName?.[0] ?? user.email?.[0] ?? "A").toUpperCase()}
            <span>{user.email}</span>
          </div>
        </header>
        <div className="admin-demo-banner" role="status">
          <Icon name="check" />
          <span>
            Orders, menu items, customer details and public website details are
            managed here and saved to Firebase.
          </span>
        </div>
        {(adminError || signOutError) && (
          <p className="form-error" role="alert">
            {adminError || signOutError}
          </p>
        )}
        {adminNotice && (
          <div className="success-note" role="status">
            <Icon name="check" />
            {adminNotice}
          </div>
        )}
        {tab === "overview" && (
          <>
            <div className="admin-welcome">
              <span className="eyebrow">YOUR RESTAURANT AT A GLANCE</span>
              <h2>Welcome to your workspace.</h2>
              <p>
                Manage the menu and keep your restaurant details up to date.
              </p>
            </div>
            <div className="stats-grid">
              <AdminStat label="Menu items" value={menu.length.toString()} />
              <AdminStat
                label="Categories"
                value={categories.length.toString()}
              />
              <AdminStat
                label="Orders today"
                value={todaysOrders.toString()}
                note="From latest 1,000"
              />
              <AdminStat
                label="Recent customers"
                value={recentCustomers.size.toString()}
                note="From latest 1,000 orders"
              />
            </div>
            <section className="admin-panel revenue-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">REVENUE PERFORMANCE</span>
                  <h2>{MONEY(paidRevenue)}</h2>
                  <p>
                    Confirmed, preparing and completed orders ·{" "}
                    {period === "day"
                      ? "Today"
                      : period === "week"
                        ? "This week"
                        : "This month"}
                  </p>
                </div>
                <div className="revenue-periods" aria-label="Analytics period">
                  {(["day", "week", "month"] as const).map((value) => (
                    <button
                      key={value}
                      className={period === value ? "selected" : ""}
                      aria-pressed={period === value}
                      onClick={() => setPeriod(value)}
                    >
                      {value[0].toUpperCase() + value.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {ordersLoading ? (
                <p className="admin-empty-result" role="status">
                  Loading revenue data…
                </p>
              ) : (
                <div
                  className={`revenue-chart ${
                    period === "day"
                      ? "revenue-chart-day"
                      : period === "month"
                        ? "revenue-chart-month"
                        : ""
                  }`}
                  style={{
                    gridTemplateColumns: `repeat(${bucketCount}, minmax(0, 1fr))`,
                  }}
                  aria-label={`Revenue ${period} chart`}
                >
                  {revenueBuckets.map((bucket, index) => (
                    <div
                      className="revenue-column"
                      key={`${bucket.label}-${index}`}
                      title={`${bucket.label}: ${MONEY(bucket.value)}`}
                    >
                      <strong className="revenue-value">
                        {MONEY(bucket.value)}
                      </strong>
                      <div className="revenue-bar-track">
                        <div
                          className="revenue-bar"
                          style={{
                            height: `${Math.max(
                              bucket.value ? 3 : 0,
                              (bucket.value / maximumRevenue) * 100,
                            )}%`,
                          }}
                        />
                      </div>
                      <span className="revenue-label">
                        {period === "month" && index % 3 !== 0
                          ? ""
                          : bucket.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="analytics-note">
                Revenue uses saved order starting-price subtotals. Data is
                limited to the latest 1,000 orders currently loaded.
              </p>
              <div className="demand-list">
                <div className="demand-heading">
                  <div>
                    <span className="eyebrow">CUSTOMER DEMAND</span>
                    <h3>Best-selling items</h3>
                  </div>
                  <small>Units · same period</small>
                </div>
                {bestSellingItems.length ? (
                  bestSellingItems.map(([name, count], index) => (
                    <div className="demand-row" key={name}>
                      <span className="demand-rank">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{name}</span>
                      <strong>{count} sold</strong>
                    </div>
                  ))
                ) : (
                  <p className="admin-empty-result">
                    No confirmed, preparing or completed orders in this period.
                  </p>
                )}
              </div>
            </section>
            <div className="admin-overview-grid">
              <section className="admin-panel">
                <span className="eyebrow">MENU SNAPSHOT</span>
                <h2>Popular with guests</h2>
                <p>Featured dishes from your current menu.</p>
                <div className="admin-featured-list">
                  {menu
                    .filter((item) => item.badge === "Popular")
                    .slice(0, 4)
                    .map((item) => (
                      <div className="admin-featured-item" key={item.id}>
                        <FoodImage item={item} />
                        <span>{item.name}</span>
                        <strong>{MONEY(item.price)}</strong>
                      </div>
                    ))}
                </div>
                <button className="text-link" onClick={() => setTab("menu")}>
                  Manage menu <Icon name="arrow" />
                </button>
              </section>
              <section className="admin-panel admin-connection-panel">
                <span className="eyebrow">ORDER STATUS · THIS PERIOD</span>
                <h2>Customer order status</h2>
                <div className="status-chart">
                  {orderStatusCounts.map(({ status, count }) => (
                    <div className="status-chart-row" key={status}>
                      <span>{status}</span>
                      <div className="status-track">
                        <i
                          className={`status-fill status-${status}`}
                          style={{
                            width: `${
                              periodOrders.length
                                ? (count / periodOrders.length) * 100
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                      <strong>{count}</strong>
                    </div>
                  ))}
                </div>
                <button
                  className="button button-outline"
                  onClick={() => setTab("orders")}
                >
                  Open orders <Icon name="arrow" />
                </button>
              </section>
            </div>
          </>
        )}
        {tab === "menu" && (
          <section className="admin-panel admin-menu-panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow">PRODUCT CATALOG</span>
                <h2>Menu management</h2>
                <p>
                  {filteredMenu.length} of {menu.length} menu items
                </p>
              </div>
              <div className="panel-actions">
                <label className="search-field">
                  <Icon name="search" />
                  <input
                    type="search"
                    placeholder="Search dishes or categories"
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    aria-label="Search menu items"
                  />
                </label>
                <button
                  className="button button-primary"
                  onClick={() => {
                    setEditingMenu(null)
                    setMenuModal(true)
                  }}
                >
                  <Icon name="plus" /> Add item
                </button>
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
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenu.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="table-dish">
                          <FoodImage item={item} />
                          <strong>{item.name}</strong>
                        </div>
                      </td>
                      <td>{item.category}</td>
                      <td>
                        {item.priceFrom ? "From " : ""}
                        {MONEY(item.price)}
                      </td>
                      <td>
                        <span
                          className={`availability ${
                            item.available === false ? "" : "available"
                          }`}
                        >
                          <span />
                          {item.available === false
                            ? "Unavailable"
                            : "Available"}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => {
                              setEditingMenu(item)
                              setMenuModal(true)
                            }}
                          >
                            <Icon name="edit" />
                          </button>
                          <button
                            className="icon-button danger-action"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => void removeMenuItem(item)}
                          >
                            <Icon name="close" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredMenu.length === 0 && (
                <p className="admin-empty-result">
                  No menu items match “{query}”.
                </p>
              )}
            </div>
          </section>
        )}
        {tab === "orders" && (
          <section className="admin-panel admin-orders-panel">
            <div className="panel-title">
              <div>
                <span className="eyebrow">ORDER MANAGEMENT</span>
                <h2>Live customer orders</h2>
                <p>Showing the latest {orders.length} orders (up to 1,000).</p>
              </div>
            </div>
            {ordersError && (
              <p className="form-error" role="alert">
                {ordersError}
              </p>
            )}
            {ordersLoading ? (
              <p className="admin-empty-result" role="status">
                Loading live orders…
              </p>
            ) : orders.length === 0 ? (
              <div className="admin-empty-result">
                {ordersError ||
                  "No orders yet. Customer checkout orders will appear here."}
              </div>
            ) : (
              <div className="admin-order-list">
                {orders.map((order) => (
                  <article className="admin-order-card" key={order.id}>
                    <div className="admin-order-header">
                      <div>
                        <span className="eyebrow">
                          ORDER #{order.id.slice(-6).toUpperCase()}
                        </span>
                        <p>{orderDate(order)}</p>
                      </div>
                      <label className="order-status-control">
                        <span className="sr-only">Order status</span>
                        <select
                          value={order.status}
                          disabled={updatingOrderId === order.id}
                          onChange={(event) =>
                            void updateOrderStatus(
                              order.id,
                              event.currentTarget.value as OrderStatus,
                            )
                          }
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status[0].toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <div className="admin-order-content">
                      <div>
                        <h3>{order.customer.name}</h3>
                        <a href={`tel:${order.customer.phone}`}>
                          {order.customer.phone}
                        </a>
                        <p>{order.customer.address}</p>
                        {order.customer.notes && (
                          <p className="admin-order-notes">
                            Notes: {order.customer.notes}
                          </p>
                        )}
                      </div>
                      <ul>
                        {order.items.map((item, index) => (
                          <li key={`${item.id}-${index}`}>
                            <span>
                              {item.name} × {item.qty}
                            </span>
                            <strong>
                              {item.priceFrom ? "From " : ""}
                              {MONEY(item.price * item.qty)}
                            </strong>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="admin-order-total">
                      <span>Starting-price subtotal</span>
                      <strong>{MONEY(order.subtotal)}</strong>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}
        {tab === "customers" && (
          <>
            <section className="admin-panel">
              <div className="panel-title">
                <div>
                  <span className="eyebrow">CUSTOMER DIRECTORY</span>
                  <h2>Customers & order history</h2>
                  <p>
                    {customers.length} customers across the latest{" "}
                    {orders.length} orders loaded.
                  </p>
                </div>
              </div>
              <div className="status-chart customer-status-chart">
                <div className="customer-status-heading">
                  <h3>Order status overview · selected period</h3>
                  <div
                    className="revenue-periods"
                    aria-label="Customer status period"
                  >
                    {(["day", "week", "month"] as const).map((value) => (
                      <button
                        key={value}
                        className={period === value ? "selected" : ""}
                        aria-pressed={period === value}
                        onClick={() => setPeriod(value)}
                      >
                        {value[0].toUpperCase() + value.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                {orderStatusCounts.map(({ status, count }) => (
                  <div className="status-chart-row" key={status}>
                    <span>{status}</span>
                    <div className="status-track">
                      <i
                        className={`status-fill status-${status}`}
                        style={{
                          width: `${
                            periodOrders.length
                              ? (count / periodOrders.length) * 100
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                    <strong>{count}</strong>
                  </div>
                ))}
              </div>
              {ordersLoading ? (
                <p className="admin-empty-result" role="status">
                  Loading customer records…
                </p>
              ) : customers.length ? (
                <div className="customer-list">
                  {customers.map((customer) => (
                    <article
                      className="customer-card"
                      key={customer.phone.replace(/\D/g, "")}
                    >
                      <div className="customer-card-header">
                        <div>
                          <h3>{customer.name}</h3>
                          <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                          <p>{customer.address}</p>
                        </div>
                        <button
                          className="button button-outline"
                          onClick={() =>
                            setEditingCustomer({
                              customerKey: customer.phone.replace(/\D/g, ""),
                              phone: customer.phone,
                              name: customer.name,
                              address: customer.address,
                              notes: customer.notes,
                            })
                          }
                        >
                          <Icon name="edit" /> Edit customer
                        </button>
                      </div>
                      <p className="customer-order-count">
                        {customer.orders.length} order
                        {customer.orders.length === 1 ? "" : "s"} · Last order{" "}
                        {orderDate(customer.orders[0])}
                      </p>
                      <div className="customer-order-history">
                        {customer.orders.slice(0, 5).map((order) => (
                          <div className="customer-order-row" key={order.id}>
                            <div>
                              <strong>
                                #{order.id.slice(-6).toUpperCase()}
                              </strong>
                              <span>{orderDate(order)}</span>
                            </div>
                            <span
                              className={`order-status-pill status-${order.status}`}
                            >
                              {order.status}
                            </span>
                            <span>
                              {order.items
                                .map((item) => `${item.name} × ${item.qty}`)
                                .join(", ")}
                            </span>
                            <strong>{MONEY(order.subtotal)}</strong>
                          </div>
                        ))}
                        {customer.orders.length > 5 && (
                          <p className="analytics-note">
                            Showing 5 of {customer.orders.length} loaded orders
                            for this customer.
                          </p>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="admin-empty-result">
                  No customer records yet. Customers appear after their first
                  order.
                </p>
              )}
              <p className="analytics-note">
                Customer history is grouped by phone number and limited to the
                latest 1,000 orders loaded.
              </p>
            </section>
          </>
        )}
        {tab === "settings" && (
          <section className="admin-panel settings-panel">
            <span className="eyebrow">BUSINESS PROFILE</span>
            <h2>Website details</h2>
            <p>
              Changes are saved to Firebase and reflected on the public site.
            </p>
            <form
              key={JSON.stringify(contactInfo)}
              className="form-stack admin-settings-form"
              onSubmit={(event) => void saveRestaurantSettings(event)}
            >
              <label>
                Restaurant name
                <input
                  name="name"
                  defaultValue={contactInfo.name}
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Phone number
                <input
                  name="phone"
                  defaultValue={contactInfo.phone}
                  required
                  maxLength={30}
                />
              </label>
              <label>
                Address
                <input
                  name="address"
                  defaultValue={contactInfo.address}
                  required
                  maxLength={300}
                />
              </label>
              <label>
                Opening hours
                <input
                  name="hours"
                  defaultValue={contactInfo.hours}
                  required
                  maxLength={150}
                />
              </label>
              <label>
                Homepage headline
                <input
                  name="heroTitle"
                  defaultValue={contactInfo.heroTitle}
                  required
                  maxLength={150}
                />
              </label>
              <label>
                Homepage introduction
                <textarea
                  name="heroDescription"
                  defaultValue={contactInfo.heroDescription}
                  required
                  maxLength={500}
                  rows={3}
                />
              </label>
              <button
                className="button button-primary"
                type="submit"
                disabled={settingsSaving}
              >
                {settingsSaving ? "Saving…" : "Save website details"}
              </button>
            </form>
            <p className="form-help">
              Restaurant name, phone, address, hours, and homepage copy appear
              on the public website.
            </p>
          </section>
        )}
        {menuModal && (
          <Dialog
            title={editingMenu ? "Edit menu item" : "Add menu item"}
            close={() => setMenuModal(false)}
          >
            <form
              className="form-stack"
              onSubmit={(event) => void saveMenuItem(event)}
            >
              <label>
                Item name
                <input
                  name="name"
                  defaultValue={editingMenu?.name ?? ""}
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Urdu name
                <input
                  name="urdu"
                  defaultValue={editingMenu?.urdu ?? ""}
                  maxLength={100}
                />
              </label>
              <label>
                Description
                <textarea
                  name="description"
                  defaultValue={editingMenu?.description ?? ""}
                  maxLength={400}
                  rows={3}
                />
              </label>
              <div className="form-row">
                <label>
                  Price (Rs.)
                  <input
                    name="price"
                    type="number"
                    min="1"
                    step="1"
                    defaultValue={editingMenu?.price ?? ""}
                    required
                  />
                </label>
                <label>
                  Category
                  <input
                    name="category"
                    list="menu-categories"
                    defaultValue={editingMenu?.category ?? ""}
                    required
                    maxLength={60}
                  />
                  <datalist id="menu-categories">
                    {categories.map((value) => (
                      <option key={value} value={value} />
                    ))}
                  </datalist>
                </label>
              </div>
              <label>
                Image URL
                <input
                  name="image"
                  type="url"
                  defaultValue={editingMenu?.image ?? ""}
                  placeholder="https://example.com/dish.jpg"
                  maxLength={1000}
                />
              </label>
              <label>
                Badge <span className="optional">(optional)</span>
                <input
                  name="badge"
                  defaultValue={editingMenu?.badge ?? ""}
                  placeholder="Popular, New, Chef's pick..."
                  maxLength={40}
                />
              </label>
              <div className="check-row">
                <label>
                  <input
                    type="checkbox"
                    name="priceFrom"
                    defaultChecked={editingMenu?.priceFrom ?? false}
                  />
                  Price starts from this amount
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="available"
                    defaultChecked={editingMenu?.available !== false}
                  />
                  Available to order
                </label>
              </div>
              <button
                className="button button-primary"
                type="submit"
                disabled={menuSaving}
              >
                {menuSaving ? "Saving item…" : "Save and publish item"}
              </button>
            </form>
          </Dialog>
        )}
        {editingCustomer && (
          <Dialog
            title="Edit customer details"
            close={() => setEditingCustomer(null)}
          >
            <form
              className="form-stack"
              onSubmit={(event) => void saveCustomer(event)}
            >
              <label>
                Customer name
                <input
                  name="name"
                  defaultValue={editingCustomer.name}
                  required
                  maxLength={100}
                />
              </label>
              <label>
                Phone number
                <input
                  name="phone"
                  type="tel"
                  defaultValue={editingCustomer.phone}
                  required
                  maxLength={20}
                />
              </label>
              <label>
                Delivery address
                <textarea
                  name="address"
                  defaultValue={editingCustomer.address}
                  required
                  maxLength={400}
                  rows={3}
                />
              </label>
              <label>
                Customer notes
                <textarea
                  name="notes"
                  defaultValue={editingCustomer.notes}
                  maxLength={300}
                  rows={2}
                />
              </label>
              <p className="form-help">
                Updated details will apply to all of this customer's loaded
                orders.
              </p>
              <button
                className="button button-primary"
                type="submit"
                disabled={customerSaving}
              >
                {customerSaving ? "Saving details…" : "Save customer details"}
              </button>
            </form>
          </Dialog>
        )}
        <footer className="admin-footer">
          {contactInfo.name} · Admin workspace
        </footer>
      </main>
    </div>
  )
}

function AdminStat({
  label,
  value,
  note,
}: {
  label: string
  value: string
  note?: string
}) {
  return (
    <div className="stat">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
      <Icon name={label === "Menu items" ? "utensils" : "grid"} />
    </div>
  )
}

function LoginPage({
  onSignIn,
  restaurantName,
}: {
  onSignIn: (email: string, password: string) => Promise<unknown>
  restaurantName: string
}) {
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  return (
    <div className="login-page">
      <div className="login-art">
        <Brand light name={restaurantName} />
        <div>
          <span className="eyebrow">THE HEART BEHIND THE HOSPITALITY</span>
          <h1>
            Great food.
            <br />
            <em>Thoughtfully managed.</em>
          </h1>
          <p>
            Your workspace for the menu
            <br />
            and the details that make us special.
          </p>
        </div>
        <Flower className="login-flower" />
        <span className="login-art-footer">
          {restaurantName.toUpperCase()} · DERA GHAZI KHAN
        </span>
      </div>
      <div className="login-content">
        <a href="#/" className="text-link">
          <Icon name="arrow" className="back-arrow" />
          Back to the website
        </a>
        <div className="login-form-wrap">
          <span className="eyebrow">ADMIN WORKSPACE</span>
          <h2>Welcome back.</h2>
          <p>Sign in with your Firebase email and password.</p>
          <form
            className="form-stack"
            onSubmit={async (event) => {
              event.preventDefault()
              if (loading) return
              setLoading(true)
              setError("")
              const data = new FormData(event.currentTarget)
              try {
                await onSignIn(
                  String(data.get("email")).trim(),
                  String(data.get("password")),
                )
                window.location.hash = "#/admin"
              } catch (loginError) {
                const code =
                  loginError instanceof FirebaseError ? loginError.code : ""
                if (
                  code === "auth/invalid-credential" ||
                  code === "auth/user-not-found" ||
                  code === "auth/wrong-password"
                ) {
                  setError("Email or password is incorrect.")
                } else if (code === "auth/invalid-email") {
                  setError("Enter a valid email address.")
                } else if (code === "auth/too-many-requests") {
                  setError("Too many attempts. Wait a moment and try again.")
                } else if (code === "auth/operation-not-allowed") {
                  setError(
                    "Email/password sign-in is disabled. Enable it in Firebase Authentication.",
                  )
                } else if (code === "auth/network-request-failed") {
                  setError("Network error. Check your connection and retry.")
                } else {
                  setError("Sign-in failed. Please try again.")
                }
              } finally {
                setLoading(false)
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
                placeholder="admin@example.com"
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
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <Icon name="arrow" />}
            </button>
          </form>
          <div className="demo-note">
            <Icon name="lock" />
            <div>
              <strong>Secure administrator sign-in</strong>
              <p>
                Use the administrator account created in Firebase
                Authentication. Public sign-up is not available.
              </p>
              <small>
                Ensure Firebase Authentication Email/Password is enabled and
                sign in with {ADMIN_EMAIL}.
              </small>
            </div>
          </div>
        </div>
        <small className="login-copyright">
          Al Maida Pizza Garden · Made with care.
        </small>
      </div>
    </div>
  )
}

function AuthLoading() {
  return (
    <main className="auth-loading" role="status">
      <span className="eyebrow">AL MAIDA PIZZA GARDEN</span>
      <p>Checking your sign-in…</p>
    </main>
  )
}

function Checkout({
  cart,
  total,
  onComplete,
}: {
  cart: CartItem[]
  total: number
  onComplete: () => void
}) {
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [orderReference, setOrderReference] = useState("")
  const [whatsAppLink, setWhatsAppLink] = useState("")
  const [customerName, setCustomerName] = useState("")
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
      phone.replace(/\D/g, "").length < 10 ||
      cart.length === 0
    ) {
      setError(
        cart.length === 0
          ? "Your cart is empty. Add an item before placing an order."
          : "Please enter your name, delivery address and a valid contact number.",
      )
      return
    }
    setError("")
    setSubmitting(true)
    setCustomerName(name)
    try {
      const order = await addDoc(collection(db, "orders"), {
        customer: { name, address, phone, notes },
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          priceFrom: Boolean(item.priceFrom),
        })),
        subtotal: total,
        status: "pending",
        createdAt: serverTimestamp(),
      })
      const message = `Hello Al Maida Pizza Garden! I would like to place an order.\n\nOrder reference: ${order.id}\n\n${cart.map((item) => `${item.name} × ${item.qty} — ${item.priceFrom ? "from " : ""}${MONEY(item.price * item.qty)}`).join("\n")}\n\nStarting-price subtotal: ${MONEY(total)}\nFull name: ${name}\nDelivery address: ${address}\nContact number: ${phone}\nNotes: ${notes || "None"}\n\nPlease confirm availability, serving options, delivery charges and final total.`
      setWhatsAppLink(
        `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`,
      )
      setOrderReference(order.id)
    } catch (cause) {
      setError(
        cause instanceof FirebaseError
          ? `We couldn't save your order (${cause.code}). Please try again or contact us on WhatsApp.`
          : "We couldn't save your order. Please try again or contact us on WhatsApp.",
      )
    } finally {
      setSubmitting(false)
    }
  }
  return orderReference ? (
    <div className="checkout-success" role="status">
      <span className="eyebrow">ORDER SAVED</span>
      <h3>Thanks, {customerName}.</h3>
      <p>
        Your order <strong>#{orderReference.slice(-6).toUpperCase()}</strong> is
        saved as pending. Continue to WhatsApp to send it to our team for
        confirmation.
      </p>
      <a
        className="button button-primary"
        href={whatsAppLink}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onComplete}
      >
        <Icon name="message" />
        Continue to WhatsApp <Icon name="arrow" />
      </a>
    </div>
  ) : (
    <form className="form-stack" onSubmit={submit}>
      <div className="checkout-summary">
        {cart.map((item) => (
          <div key={item.id}>
            <span>
              {item.name} × {item.qty}
            </span>
            <span>
              {item.priceFrom ? "From " : ""}
              {MONEY(item.price * item.qty)}
            </span>
          </div>
        ))}
        <div className="checkout-total">
          <strong>Starting-price subtotal</strong>
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
      <button
        className="button button-primary"
        type="submit"
        disabled={submitting}
      >
        <Icon name="message" />
        {submitting ? "Saving your order…" : "Place order & continue"}
        {!submitting && <Icon name="arrow" />}
      </button>
      <p className="form-help">
        Your order is saved securely before WhatsApp opens. Our team will
        confirm availability, delivery charges and the final total.
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
          `Hello Al Maida Pizza Garden! I would like to request a table.\n\nName: ${name}\nContact: ${phone}\nDate: ${date}\nTime: ${data.get("time")}\nGuests: ${data.get("guests")}\n\nPlease confirm availability. Thank you!`,
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
