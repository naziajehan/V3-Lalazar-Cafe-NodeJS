export interface MenuItem {
  id: number
  name: string
  urdu: string
  description: string
  price: number
  priceFrom?: boolean
  category: string
  image: string
  badge?: string
  available?: boolean
}

export interface CartItem extends MenuItem {
  qty: number
}

type MenuRow = readonly [
  name: string,
  category: string,
  price: number,
  photo: string,
  priceFrom?: boolean,
]

const FOODPANDA_IMAGE_BASE =
  "https://images.deliveryhero.io/image/global-menu-service/FP_PK/vendor/ri86/product/"

const CATEGORY_FALLBACKS: Record<string, string> = {
  Snacks: "/images/meal.jpg",
  "Side Orders": "/images/dish-1599043513900-ed6fe01d3833.jpg",
  Beverages: "/images/dish-1608133988679-554453a5a3cc.jpg",
}

const CATEGORY_LABELS: Record<string, string> = {
  "CROWN PIZZA": "Pizza",
  "Square Pan Pizza": "Pizza",
  "Al - Maida Special Pizza": "Pizza",
  "DEEP PAN PIZZA": "Pizza",
  "FAST FOOD DEALS": "Deals",
  "PIZZA DEALS": "Pizza",
  "Wrap Roll": "Wraps",
  Roll: "Rolls",
  Tecos: "Tacos",
  PASTA: "Pasta",
  "Zinger Burger & Fish Deals": "Burgers",
  "Side Orders": "Rice & Sides",
  Meals: "Meals & Platters",
}

function getMenuCategory(name: string, sourceCategory: string) {
  const normalizedName = name.toLowerCase()
  if (
    (sourceCategory === "Snacks" ||
      sourceCategory === "Zinger Burger & Fish Deals") &&
    normalizedName.includes("burger")
  ) {
    return "Burgers"
  }
  if (
    (sourceCategory === "Snacks" || sourceCategory === "Meals") &&
    normalizedName.includes("sandwich")
  ) {
    return "Sandwiches"
  }
  if (sourceCategory === "Snacks" && normalizedName.includes("roll")) {
    return "Rolls"
  }
  if (
    sourceCategory === "Side Orders" &&
    normalizedName.includes("fries")
  ) {
    return "Fries"
  }
  if (
    sourceCategory === "Beverages" &&
    normalizedName.includes("ice cream")
  ) {
    return "Desserts"
  }
  if (sourceCategory === "Snacks") return "Chicken & Snacks"
  return CATEGORY_LABELS[sourceCategory] ?? sourceCategory
}

const POPULAR_ITEMS = new Set([
  "Full Loaded Fries",
  "Nawabi Pizza",
  "Mexican Sandwich",
  "Hot Wings",
  "Special Crown Pizza",
  "Brunch Meal",
  "Special Pizzratha",
  "Jalapeno Cheese Rolls",
  "Oven Baked Wings",
])

const MENU_ROWS: MenuRow[] = [
  ["Half Loaded Fries", "Fries", 320, "61b2273b-b716-4565-86ec-bdfea3a42f18.jpg"],
  ["Full Mayo Fries", "Fries", 400, "3f82abf4-b5b6-48c3-88b7-2b8976c185ec.jpg"],
  ["Half Chicken Crispy Fries", "Fries", 380, "405084a0-08d7-440d-a03c-b3a66fbc73cb.jpg"],
  ["Full Loaded Fries", "Fries", 500, "356ca32c-61a9-460b-b25b-a94b829bd876.jpg"],
  ["Full Chicken Crispy Fries", "Fries", 620, "1b915b49-c9ec-4219-95c0-32e40c9b6a63.jpg"],

  ["Special Pizzratha", "Pizzratha", 500, "102255634/83eb2d15-9588-4c64-8313-70533e67fb82.jpg"],
  ["Grill Pizzratha", "Pizzratha", 500, "102255635/72651b6b-176e-4dbe-9cc1-6bf2ab1af21c.jpg"],
  ["Peri Peri Pizzratha", "Pizzratha", 500, "102255636/2c284eeb-eb58-419e-aba3-5ceb9e9da495.jpg"],
  ["Malai Pizzratha", "Pizzratha", 500, "0e84c879-5c5d-4ea3-a46c-1ecc5a55ffab.jpg"],

  ["Nawabi Roll", "Snacks", 400, "", true],
  ["Nawabi Burger", "Snacks", 400, "", true],
  ["Zed Burger", "Snacks", 450, "102250475/1b01a4ff-0938-4b03-b4b4-4e7043313afb.jpg", true],
  ["Grilled Burger", "Snacks", 500, "", true],
  ["Chicken Burger", "Snacks", 400, "", true],
  ["Heavy Zed Burger", "Snacks", 550, "102250478/efb48594-3dce-4c79-af76-cec06e48fd51.jpg", true],
  ["Arabian Chicken Gyora", "Snacks", 400, "", true],
  ["Chicken Zed Sandwich", "Snacks", 400, "", true],
  ["Hot Wings", "Snacks", 300, "", true],
  ["Nuggets", "Snacks", 270, "", true],
  ["Zed Tower Burger", "Snacks", 550, "", true],

  ["Junior Zed Burger", "Zinger Burger & Fish Deals", 300, "47fc00d9-a8ca-4155-b32b-b1c283194ff6.jpg"],

  ["Arabian Traditional Rice", "Side Orders", 260, ""],
  ["French Fries", "Side Orders", 200, "", true],
  ["French Fries Family Pack", "Side Orders", 330, "", true],
  ["Dip Sauce", "Side Orders", 80, ""],
  ["Extra Cheese Slice", "Side Orders", 100, "0a91dc3c-c5d4-4f60-af74-e4d61856e272.jpg"],

  ["Coca Cola - 500 ml", "Beverages", 150, ""],
  ["Sprite - 500 ml", "Beverages", 150, ""],
  ["Fanta - 500 ml", "Beverages", 150, ""],
  ["Coca Cola - 1 Litre", "Beverages", 200, ""],
  ["Coca Cola - 1.5 Litre", "Beverages", 280, ""],
  ["Pepsi Tin Pack - 250 ml", "Beverages", 220, ""],
  ["Mineral Water Aquafina - 1.5 Liter", "Beverages", 150, ""],
  ["Pepsi - 345 ml", "Beverages", 100, ""],
  ["Mineral Water Aquafina - 500 ml", "Beverages", 80, ""],
  ["Vanilla Ice Cream", "Beverages", 200, "99111203-parent/4d24da45-b190-4344-a52c-887baab76e37.jpg", true],

  ["Fettuccine Pasta", "PASTA", 380, "5201a86d-7abb-467a-bbfb-edace37fd9c2.jpg", true],
  ["Flaming Pasta", "PASTA", 380, "a14a5f86-c333-4f16-9b60-ccdfcd26631f.jpg", true],
  ["Creamy Spicy Penne Pasta", "PASTA", 380, "5648e50c-f674-4eae-ac0c-b3e4ece0b3ca.jpg", true],
  ["Chicken Macaroni Pasta", "PASTA", 380, "fdd594f9-8859-4628-bc83-b1b4eafcb1e4.jpg", true],

  ["Special Crown Pizza", "CROWN PIZZA", 1450, "3f2a0855-fed1-482e-8c1c-4d3d48d5d1aa.jpg", true],
  ["Fajita Crown Pizza", "CROWN PIZZA", 1450, "4b26b6e2-f8e7-4e86-8698-796e6b23e255.jpg", true],

  ["Square Chicken Fajita Pizza", "Square Pan Pizza", 500, "08632afc-7b22-4d80-85a5-f5c68f309536.jpg", true],
  ["Square Chicken Tandoori Pizza", "Square Pan Pizza", 500, "979e62e2-0c19-4617-9a4a-07466a7d018e.jpg", true],
  ["Square Chicken Tikka Pizza", "Square Pan Pizza", 500, "59d5db9f-e661-4509-82ae-e34898698b1d.jpg", true],
  ["Square Chicken Supreme Pizza", "Square Pan Pizza", 500, "e8098e3c-565a-4e8a-a7eb-b25ee953a5cf.jpg", true],
  ["Square Split Pizza", "Square Pan Pizza", 500, "933e3450-fba9-446c-8947-74078953f61d.jpg", true],

  ["Stuffed Chicken Pizza", "Al - Maida Special Pizza", 1400, "1c1e65e7-2fc8-4a91-9215-52a03dac28ca.jpg", true],
  ["Stuffed Kababi Pizza", "Al - Maida Special Pizza", 1400, "98789f7c-1f51-4d54-96e2-89b743852fab.jpg", true],
  ["Lasania Pizza", "Al - Maida Special Pizza", 1400, "17e7cc42-aac9-40d8-936d-59ee60e745ed.jpg", true],
  ["Behari Seekh Kabab Pizza", "Al - Maida Special Pizza", 1400, "c8069b7f-cbf9-4833-9a33-dfd5f0ef06e9.jpg", true],
  ["Extreme Pizza", "Al - Maida Special Pizza", 1450, "f86b9488-5a78-4721-bed9-03d6e04ac1e4.jpg", true],
  ["Doner Pizza", "Al - Maida Special Pizza", 1400, "c840267f-ff15-4a07-93b1-a631cb7d357f.jpg", true],
  ["Crispy Pizza", "Al - Maida Special Pizza", 1400, "2a34903b-9c9d-48c6-9cf4-31888dbca304.jpg", true],

  ["Nawabi Pizza", "DEEP PAN PIZZA", 550, "1a9944cd-b014-4c60-b3f0-9291b73e81bf.jpg", true],
  ["Blackchee Pizza", "DEEP PAN PIZZA", 550, "b3cc8189-c2a7-4e08-b058-49de77c0a5f0.jpg", true],
  ["Bone Fire Pizza", "DEEP PAN PIZZA", 550, "f3bc69fa-21d5-4804-a269-099654248c0a.jpg", true],
  ["Peri Peri Pizza", "DEEP PAN PIZZA", 550, "795ae227-6f07-4267-92b4-bb7ea93598c7.jpg", true],
  ["Smoked Chicken Pizza", "DEEP PAN PIZZA", 550, "f2bb091b-a83d-4c03-9323-4bfd934dc4ce.jpg", true],
  ["Grill Pizza", "DEEP PAN PIZZA", 550, "856b1adb-94f6-4ccd-bd50-bd3a0e0636ba.jpg", true],
  ["Malai Pizza", "DEEP PAN PIZZA", 550, "f5e836ed-e34e-4a0e-8cf0-1e7214e46266.jpg", true],

  ["Combo 1", "FAST FOOD DEALS", 530, "8f183f7b-ff95-4777-970f-99e711f97fa0.jpg"],
  ["Combo No.3", "FAST FOOD DEALS", 500, "de81a6d4-780d-4687-a787-f940d3988597.jpg"],
  ["Combo No.4", "FAST FOOD DEALS", 450, "59967f4c-0fbb-4795-9b10-c119467e74d3.jpg"],
  ["Combo No.2", "FAST FOOD DEALS", 750, "85e51853-8a69-45df-9790-811f76e38cf3.jpg"],
  ["Chiken Petti Burger Deal(spicy chicken burger with drink)", "FAST FOOD DEALS", 500, "82218c68-f03e-4c4d-9ab2-eb2a22badcc9.jpg"],
  ["Combo No.6", "FAST FOOD DEALS", 2050, "43ebc28e-2b7e-4d88-81ab-b7fa594715d5.jpg"],
  ["Whole in One Deal", "FAST FOOD DEALS", 700, "a1ac7a3b-6a05-407e-a3b6-1a4761a038ea.jpg"],
  ["Combo No.5", "FAST FOOD DEALS", 2050, "76566009-6ad3-4778-a9d1-226d63840fd9.jpg"],
  ["Real Deal", "FAST FOOD DEALS", 600, "79ff4629-ab1d-4783-9957-ad1296f32e5d.jpg"],
  ["Zinger Burger Deal ( zed burger with cold drink)", "FAST FOOD DEALS", 500, "7d56b2bf-a110-4592-942a-ec7a72e5f8e8.jpg"],
  ["Tower Deal", "FAST FOOD DEALS", 600, "a4100d5c-ff33-4a9f-adc9-43b36e299a4b.jpg"],
  ["Max 50", "FAST FOOD DEALS", 350, "8dcd14ef-1fac-459d-90c2-352f73515cfa.jpg"],
  ["Family Zinger Deal", "FAST FOOD DEALS", 1750, "59cd85e3-90fe-4456-9a0b-748acc7e4789.jpg"],
  ["Grill Burger Deal ( grill burger with drink)", "FAST FOOD DEALS", 600, "9b30ff1a-474a-4b25-b27a-975eedad520f.jpg"],
  ["Heavy Zed Deal (heavy zed burger with drink)", "FAST FOOD DEALS", 600, "05bf0cd8-9f6c-4f23-94ca-0fc3c7be1d20.jpg"],
  ["Mini Classic Deal", "FAST FOOD DEALS", 500, "cebcbeb0-c623-4214-8b95-dfbaa671175f.jpg"],
  ["Diamond Deal", "FAST FOOD DEALS", 500, "de3e7bf1-071a-479d-b611-3b1f9419ba49.jpg"],
  ["Brunch Meal", "FAST FOOD DEALS", 550, "3ec919a5-e982-4ea5-967f-2daa6cf0c326.jpg"],
  ["Pop Shorts", "FAST FOOD DEALS", 400, "26224713-083e-4052-a76d-bd87ff7c5e10.jpg"],
  ["Classic Deal", "FAST FOOD DEALS", 600, "654f5072-7fc2-4567-9b06-30ef22f8d654.jpg"],
  ["Zed Sandwich Meal", "FAST FOOD DEALS", 450, "6c075379-721e-42ca-a590-4ca1e6ba3b61.jpg"],
  ["Arabian Chicken Gyora Deal", "FAST FOOD DEALS", 450, "68f1aa4d-23eb-48e4-8713-683e4ef042c8.jpg"],
  ["Chilli Crispy Rice deal", "FAST FOOD DEALS", 380, "084259b9-64cb-4fe6-96da-f57ce2b48d88.jpg"],
  ["Barbi Burger Deal(barbi burger with drink)", "FAST FOOD DEALS", 450, "ee962009-d3ca-42c0-b13f-06a446fb4928.jpg"],
  ["Nawabi Roll Deal (Nawabi Roll with Drink)", "FAST FOOD DEALS", 450, "53f3b782-4a94-4eae-bea7-97903d5e2772.jpg"],
  ["Mast Burger Deal (twin or batista)", "FAST FOOD DEALS", 530, "182e87da-1a81-4b33-bbfd-07081f2c0b17.jpg"],
  ["Rice Deal", "FAST FOOD DEALS", 380, "03d653bc-b4ed-468a-bd5b-fc2e6522ff67.jpg"],
  ["Nawabi Burger Deal", "FAST FOOD DEALS", 450, "35bb01fa-c465-4c50-8010-df437e17181d.jpg"],
  ["Zed Shawarma Deal", "FAST FOOD DEALS", 300, "4311e9f5-16f1-45f5-bcd9-bd0898cd8ef6.jpg"],
  ["Kinder Meals (5pcs nuggets, fries & drink)", "FAST FOOD DEALS", 450, "7904616b-9eb0-40b3-b880-f974dba09f4a.jpg"],

  ["Chicken Crunchy Wrap", "Wrap Roll", 600, "4b15a6bd-2e03-4b09-833b-b51f4d1954d1.jpg"],
  ["Chicken Grillzee Wrap", "Wrap Roll", 600, "63bbf370-6fd6-4888-9a65-f63d4284ac9f.jpg"],
  ["Chicken Chunky Wrap", "Wrap Roll", 600, "789154b0-60bd-4856-b528-9625e7d72676.jpg"],
  ["Chicken Malai Wrap", "Wrap Roll", 600, "35b1f69a-de84-4d6a-b124-1c1406edd49c.jpg"],

  ["Behari Chicken Rolls", "Roll", 650, "43c82b46-8678-4977-98c4-15968b9cfb27.jpg"],
  ["BBQ Chicken Spin Roll", "Roll", 650, "af062bb4-de8e-4582-985b-e15f7b148c4a.jpg"],
  ["Mexican Chicken Rolls", "Roll", 650, "82ed6e62-0928-41f5-8907-a690b70f2ef0.jpg"],
  ["Jalapeno Cheese Rolls", "Roll", 650, "d3717f4c-35d9-4f08-a425-29adacd86c3e.jpg"],
  ["Grilled Rolls", "Roll", 650, "8cf1d6e4-205d-4075-b357-23caea6fe41c.jpg"],
  ["Peri Peri Rolls", "Roll", 650, "8ccfd724-bbb1-484c-8885-634d071c21b8.jpg"],

  ["Grilled Tecos", "Tecos", 450, "5c7c9e21-1d6b-4a3b-84b9-035504bf6a58.jpg"],
  ["Nawabi Tacos", "Tecos", 450, "16e73404-71d7-45f2-ad2d-140bf0c29838.jpg"],
  ["Malai Tacos", "Tecos", 450, "fa769bad-8cc8-4d60-b412-64a1f8b14d17.jpg"],
  ["Peri Peri Tacos", "Tecos", 450, "b8f2a765-c99e-44ff-b994-6492e6a46f87.jpg"],

  ["Oven Baked Wings", "Meals", 390, "9249a895-3cba-4e34-8ccf-be1fb4492c98.jpg"],
  ["Mexican Sandwich", "Meals", 750, "8b22d580-62a3-47c2-95e0-8ee20add013e.jpg"],
  ["Grilled Chicken", "Meals", 500, "d72c7c04-418f-44ab-b1a6-cd096d9c7dac.jpg"],
  ["Golden Platter", "Meals", 1000, "e9318a62-f2cd-4a05-b2d0-957cb8aa23aa.jpg"],
  ["Cheese Sticks", "Meals", 650, "df71d29f-3860-4d18-a81b-d7ffca50ab72.jpg"],
  ["Chicken Stick", "Meals", 850, "871a736e-c208-4167-8ec8-680b7f03d49f.jpg"],

  ["SMALL PIZZA DEAL", "PIZZA DEALS", 2200, "af9407f2-7269-4524-a187-ad0d2f17ab36.jpg"],
  ["REG. PIZZA DEAL", "PIZZA DEALS", 2250, "6202fec6-78a4-40cf-9e97-1fffcb869e0b.jpg"],
  ["DELIGHT DEAL", "PIZZA DEALS", 1930, "c29cc1a8-69c3-4c4e-a9c2-f338d87469b9.jpg"],
  ["LARGE PIZZA DEAL", "PIZZA DEALS", 3250, "24bedde8-87e5-44f9-aab8-8ce3dc564431.jpg"],
  ["FRIENDS DEAL", "PIZZA DEALS", 2700, "e040d607-bbec-43b3-bb75-e4e2abad5be1.jpg"],
  ["MIX TREAT DEAL", "PIZZA DEALS", 2350, "a620f265-618d-4985-8a1c-7033e5e12fb3.jpg"],
  ["FAMILY DEAL", "PIZZA DEALS", 4600, "080493bc-6a08-4422-a700-a5fbc587a14f.jpg"],
]

export const MENU: MenuItem[] = MENU_ROWS.map(
  ([name, sourceCategory, price, photo, priceFrom], index) => ({
    id: index + 1,
    name,
    urdu: "",
    description: "",
    price,
    ...(priceFrom ? { priceFrom: true } : {}),
    category: getMenuCategory(name, sourceCategory),
    image: photo
      ? `${FOODPANDA_IMAGE_BASE}${photo}?width=600&height=600`
      : CATEGORY_FALLBACKS[sourceCategory] ?? "/images/meal.jpg",
    ...(POPULAR_ITEMS.has(name) ? { badge: "Popular" } : {}),
  }),
)

export const CATEGORIES = [
  "All",
  "Pizza",
  "Fries",
  "Pizzratha",
  "Burgers",
  "Sandwiches",
  "Wraps",
  "Rolls",
  "Tacos",
  "Pasta",
  "Chicken & Snacks",
  "Meals & Platters",
  "Rice & Sides",
  "Beverages",
  "Desserts",
  "Deals",
]

export const WHATSAPP_NUMBER = "923317131160"
