export interface MenuItem {
  id: number
  name: string
  urdu: string
  description: string
  price: number
  category: string
  image: string
  badge?: string
  available?: boolean
}

export interface CartItem extends MenuItem {
  qty: number
}

// ─── Menu Data ────────────────────────────────────────────────────────────────
export const MENU: MenuItem[] = [
  // Sajji & BBQ
  {
    id: 1,
    name: "Whole Chicken Sajji",
    urdu: "سجی مرغ (پورا)",
    description:
      "Our legendary whole chicken slow-roasted on open charcoal with a signature Balochi spice blend.",
    price: 650,
    category: "Sajji & BBQ",
    image: "/images/dish-1555939594-58d7cb561ad1.jpg",
    badge: "Signature",
  },
  {
    id: 2,
    name: "Half Chicken Sajji",
    urdu: "سجی مرغ (آدھا)",
    description:
      "Half portion of our famous slow-roasted Sajji, tender and smoky.",
    price: 380,
    category: "Sajji & BBQ",
    image: "/images/dish-1605908580297-f3e1c02e64ff.jpg",
  },
  {
    id: 3,
    name: "Chapli Kabab",
    urdu: "چپلی کباب",
    description:
      "Crispy Peshwari-style flat patty kabab with pomegranate seeds and fresh tomato.",
    price: 180,
    category: "Sajji & BBQ",
    image: "/images/dish-1603360946369-dc9bb6258143.jpg",
    badge: "Popular",
  },
  {
    id: 4,
    name: "Seekh Kabab",
    urdu: "سیخ کباب",
    description:
      "Spiced minced beef on skewers, grilled over charcoal for smoky perfection.",
    price: 200,
    category: "Sajji & BBQ",
    image: "/images/dish-1705359573325-f2006d5e459f.jpg",
  },
  {
    id: 5,
    name: "Chicken Tikka",
    urdu: "چکن تکہ",
    description:
      "Marinated chicken pieces grilled on tandoor with yogurt and aromatic spices.",
    price: 350,
    category: "Sajji & BBQ",
    image: "/images/dish-1705359573325-f2006d5e459f.jpg",
  },
  {
    id: 6,
    name: "Mutton Chops",
    urdu: "مٹن چاپس",
    description:
      "Juicy lamb chops marinated overnight and char-grilled to succulent tenderness.",
    price: 480,
    category: "Sajji & BBQ",
    image: "/images/dish-1594266063697-304befca9629.jpg",
  },

  // Karahi & Curries
  {
    id: 7,
    name: "Chicken Karahi",
    urdu: "چکن کڑاہی",
    description:
      "Wok-tossed chicken with fresh tomatoes, green chillies, and ginger in cast-iron karahi.",
    price: 550,
    category: "Karahi & Curries",
    image: "/images/dish-1594266063697-304befca9629.jpg",
    badge: "Best Seller",
  },
  {
    id: 8,
    name: "Mutton Karahi",
    urdu: "مٹن کڑاہی",
    description:
      "Slow-cooked mutton in rich tomato gravy with aromatic highland spices.",
    price: 750,
    category: "Karahi & Curries",
    image: "/images/dish-1555939594-58d7cb561ad1.jpg",
  },
  {
    id: 9,
    name: "Daal Mash",
    urdu: "دال ماش",
    description:
      "Creamy white lentils slow-cooked with tempered whole spices and ghee.",
    price: 180,
    category: "Karahi & Curries",
    image: "/images/dish-1596040033229-a9821ebd058d.jpg",
  },
  {
    id: 10,
    name: "Palak Gosht",
    urdu: "پالک گوشت",
    description:
      "Tender mutton braised in fresh spinach puree with garam masala.",
    price: 380,
    category: "Karahi & Curries",
    image: "/images/dish-1596040033229-a9821ebd058d.jpg",
  },

  // Rice
  {
    id: 11,
    name: "Kabuli Pulao",
    urdu: "کابلی پلاؤ",
    description:
      "A fragrant favourite — basmati rice with raisins, carrots, and slow-cooked mutton.",
    price: 320,
    category: "Rice",
    image: "/images/dish-1599043513900-ed6fe01d3833.jpg",
    badge: "Must Try",
  },
  {
    id: 12,
    name: "Chicken Biryani",
    urdu: "چکن بریانی",
    description:
      "Layered dum biryani with saffron-infused rice and succulent chicken.",
    price: 280,
    category: "Rice",
    image: "/images/dish-1599043513900-ed6fe01d3833.jpg",
  },
  {
    id: 13,
    name: "Mutton Biryani",
    urdu: "مٹن بریانی",
    description:
      "Rich slow-cooked mutton biryani with caramelized onions and whole spices.",
    price: 380,
    category: "Rice",
    image: "/images/dish-1599043513900-ed6fe01d3833.jpg",
  },

  // Breads
  {
    id: 14,
    name: "Roghni Naan",
    urdu: "روغنی نان",
    description: "Fluffy oven-baked naan brushed with butter and sesame seeds.",
    price: 40,
    category: "Breads",
    image: "/images/dish-1655979284091-eea0e93405ee.jpg",
  },
  {
    id: 15,
    name: "Tandoori Roti",
    urdu: "تندوری روٹی",
    description: "Whole-wheat roti fresh from the clay tandoor oven.",
    price: 15,
    category: "Breads",
    image: "/images/dish-1640625314547-aee9a7696589.jpg",
  },
  {
    id: 16,
    name: "Plain Naan",
    urdu: "سادہ نان",
    description: "Classic soft naan bread baked in the tandoor.",
    price: 20,
    category: "Breads",
    image: "/images/dish-1697155406014-04dc649b0953.jpg",
  },

  // Drinks
  {
    id: 17,
    name: "Special Chai",
    urdu: "خاص چائے",
    description:
      "Lalazar's signature milk tea brewed with cardamom, cinnamon, and fresh ginger.",
    price: 50,
    category: "Drinks",
    image: "/images/dish-1608133988679-554453a5a3cc.jpg",
    badge: "Lalazar Special",
  },
  {
    id: 18,
    name: "Kashmiri Chai",
    urdu: "کشمیری چائے",
    description:
      "Iconic pink tea with pistachios and almonds — warmth in every sip.",
    price: 80,
    category: "Drinks",
    image: "/images/dish-1789498882985-2fd093388b8f.jpg",
    badge: "Seasonal",
  },
  {
    id: 19,
    name: "Sweet Lassi",
    urdu: "میٹھی لسی",
    description: "Chilled thick yogurt smoothie with sugar and rose water.",
    price: 120,
    category: "Drinks",
    image: "/images/dish-1683533698971-dcc5e19cb0f1.jpg",
  },
  {
    id: 20,
    name: "Salted Lassi",
    urdu: "نمکین لسی",
    description: "Tangy salted yogurt drink with cumin and fresh mint.",
    price: 100,
    category: "Drinks",
    image: "/images/dish-1683533698971-dcc5e19cb0f1.jpg",
  },

  // Desserts
  {
    id: 21,
    name: "Firni",
    urdu: "پھرنی",
    description:
      "Set rice pudding with saffron, rose water, and crushed pistachios.",
    price: 80,
    category: "Desserts",
    image: "/images/dish-1574810134700-b6ba48d151a0.jpg",
  },
  {
    id: 22,
    name: "Kheer",
    urdu: "کھیر",
    description: "Slow-cooked creamy rice pudding with cardamom and almonds.",
    price: 70,
    category: "Desserts",
    image: "/images/dish-1574810134700-b6ba48d151a0.jpg",
  },
  {
    id: 23,
    name: "Gulab Jamun",
    urdu: "گلاب جامن",
    description:
      "Soft milk-solid dumplings soaked in rose-scented sugar syrup (2 pieces).",
    price: 60,
    category: "Desserts",
    image: "/images/dish-1610661314181-1809ea1b0484.jpg",
  },
  {
    id: 24,
    name: "Beef Pulao",
    urdu: "بیف پلاؤ",
    description:
      "Fragrant basmati rice cooked in a savoury beef yakhni with whole spices.",
    price: 420,
    category: "Rice",
    image: "/images/dish-1599043513900-ed6fe01d3833.jpg",
  },
  {
    id: 25,
    name: "Chicken Pulao",
    urdu: "چکن پلاؤ",
    description:
      "Tender chicken and aromatic basmati rice simmered together in spiced broth.",
    price: 300,
    category: "Rice",
    image: "/images/dish-1599043513900-ed6fe01d3833.jpg",
  },
  {
    id: 26,
    name: "Garlic Naan",
    urdu: "لہسن نان",
    description:
      "Soft tandoor-baked naan finished with garlic, herbs, and a touch of butter.",
    price: 70,
    category: "Breads",
    image: "/images/dish-1655979284091-eea0e93405ee.jpg",
  },
  {
    id: 27,
    name: "Aloo Paratha",
    urdu: "آلو پراٹھا",
    description:
      "Golden griddled whole-wheat flatbread filled with seasoned potatoes.",
    price: 100,
    category: "Breads",
    image: "/images/dish-1640625314547-aee9a7696589.jpg",
  },
  {
    id: 28,
    name: "Mint Lemonade",
    urdu: "پودینے کا لیموں پانی",
    description:
      "A chilled, freshly squeezed lemonade blended with cooling mint.",
    price: 120,
    category: "Drinks",
    image: "/images/dish-1683533698971-dcc5e19cb0f1.jpg",
  },
  {
    id: 29,
    name: "Fresh Lime Soda",
    urdu: "تازہ لائم سوڈا",
    description:
      "Fresh lime juice topped with sparkling soda and served over ice.",
    price: 130,
    category: "Drinks",
    image: "/images/dish-1683533698971-dcc5e19cb0f1.jpg",
  },
  {
    id: 30,
    name: "Shahi Tukray",
    urdu: "شاہی ٹکڑے",
    description:
      "Crisp bread in silky cardamom milk, finished with nuts and saffron.",
    price: 140,
    category: "Desserts",
    image: "/images/dish-1574810134700-b6ba48d151a0.jpg",
  },
  {
    id: 31,
    name: "Gajar Halwa",
    urdu: "گاجر کا حلوہ",
    description:
      "Warm carrot halwa slow-cooked with milk, cardamom, and crushed nuts.",
    price: 150,
    category: "Desserts",
    image: "/images/dish-1574810134700-b6ba48d151a0.jpg",
  },
]

export const CATEGORIES = [
  "All",
  "Sajji & BBQ",
  "Karahi & Curries",
  "Rice",
  "Breads",
  "Drinks",
  "Desserts",
]

export const WHATSAPP_NUMBER = "923331234567"
