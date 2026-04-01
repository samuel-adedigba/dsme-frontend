// src/data/products.js
// Seeded product catalog for the DSME storefront.
// Items with `sellerEmail` are linked to real seller accounts on the backend.
// Those items show "Buy via Escrow" and trigger the full DSME transaction flow.
// Items without `sellerEmail` are decorative  add to cart/wishlist only.

export const CATEGORIES = [
  "All",
  "Fashion",
  "Electronics",
  "Footwear",
  "Accessories",
  "Home & Living",
  "Beauty",
];

// IMPORTANT: Register these seller accounts on your backend first, then
// update sellerEmail to match. The system will use these to route transactions.
export const LINKED_SELLERS = {
  SELLER_A: "seller@mailinator.com",   // Fashion seller
  SELLER_B: "seller1@mailinator.com", // Electronics seller
  SELLER_C: "fatima@dsme.test",    // Footwear seller
};

export const products = [
  // ── FASHION ────────────────────────────────────────────────────────────────
  {
    id: "p001",
    name: "Custom Ankara 3-Piece Set",
    category: "Fashion",
    price: 45000,           // NGN  displayed as ₦45,000
    priceKobo: 4500000,     // Kobo for DSME transactions
    image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4057?w=400&q=80",
    seller: "Adunola Couture",
    sellerEmail: LINKED_SELLERS.SELLER_A,  // DSME-linked item
    rating: 4.8,
    reviews: 24,
    badge: "Escrow Protected",
    description: "Handcrafted 3-piece Ankara set. Custom sizing available. Milestone-based delivery.",
  },
  {
    id: "p002",
    name: "Lace Blouse & Skirt Set",
    category: "Fashion",
    price: 28000,
    priceKobo: 2800000,
    image: "https://images.unsplash.com/photo-1589810635657-232948472d98?w=400&q=80",
    seller: "Adunola Couture",
    sellerEmail: LINKED_SELLERS.SELLER_A,
    rating: 4.6,
    reviews: 18,
    badge: "Escrow Protected",
    description: "Premium French lace blouse and skirt. Fully lined. Custom colours available.",
  },
  {
    id: "p003",
    name: "Agbada Full Set (Men)",
    category: "Fashion",
    price: 55000,
    priceKobo: 5500000,
    image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=80",
    seller: "Lagos Thread",
    rating: 4.5,
    reviews: 31,
    description: "Premium Agbada set with embroidery. Sizes S-4XL available.",
  },
  {
    id: "p004",
    name: "Dashiki Print Dress",
    category: "Fashion",
    price: 18500,
    priceKobo: 1850000,
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80",
    seller: "Afro Threads",
    rating: 4.3,
    reviews: 42,
    description: "Vibrant Dashiki print midi dress. Machine washable.",
  },

  // ── ELECTRONICS ────────────────────────────────────────────────────────────
  {
    id: "p005",
    name: 'Samsung 43" Smart TV',
    category: "Electronics",
    price: 320000,
    priceKobo: 32000000,
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=400&q=80",
    seller: "TechHub Lagos",
    sellerEmail: LINKED_SELLERS.SELLER_B,
    rating: 4.7,
    reviews: 56,
    badge: "Escrow Protected",
    description: "4K Smart TV with built-in Netflix and YouTube. 2-year warranty.",
  },
  {
    id: "p006",
    name: "Apple AirPods Pro (2nd Gen)",
    category: "Electronics",
    price: 175000,
    priceKobo: 17500000,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=400&q=80",
    seller: "TechHub Lagos",
    sellerEmail: LINKED_SELLERS.SELLER_B,
    rating: 4.9,
    reviews: 89,
    badge: "Escrow Protected",
    description: "Active noise cancellation, adaptive audio. Sealed box with receipt.",
  },
  {
    id: "p007",
    name: "Portable Power Bank 20,000mAh",
    category: "Electronics",
    price: 22000,
    priceKobo: 2200000,
    image: "https://images.unsplash.com/photo-1609592806596-b0c04a7abef5?w=400&q=80",
    seller: "GadgetZone",
    rating: 4.4,
    reviews: 120,
    description: "Fast charging, dual USB ports. Perfect for travel.",
  },
  {
    id: "p008",
    name: "Wireless Mechanical Keyboard",
    category: "Electronics",
    price: 58000,
    priceKobo: 5800000,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80",
    seller: "GadgetZone",
    rating: 4.6,
    reviews: 33,
    description: "RGB backlit, Bluetooth + USB-C, 6-month battery.",
  },

  // ── FOOTWEAR ───────────────────────────────────────────────────────────────
  {
    id: "p009",
    name: "Custom Suede Loafers",
    category: "Footwear",
    price: 35000,
    priceKobo: 3500000,
    image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80",
    seller: "Fatima Footworks",
    sellerEmail: LINKED_SELLERS.SELLER_C,
    rating: 4.8,
    reviews: 15,
    badge: "Escrow Protected",
    description: "Handmade premium suede loafers. Custom sizing, any colour.",
  },
  {
    id: "p010",
    name: "Beaded Ankara Heels",
    category: "Footwear",
    price: 27500,
    priceKobo: 2750000,
    image: "https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=400&q=80",
    seller: "Fatima Footworks",
    sellerEmail: LINKED_SELLERS.SELLER_C,
    rating: 4.7,
    reviews: 22,
    badge: "Escrow Protected",
    description: "Handcrafted beaded heels with Ankara fabric. Custom sizes.",
  },
  {
    id: "p011",
    name: "Nike Air Max 270 (OG Box)",
    category: "Footwear",
    price: 85000,
    priceKobo: 8500000,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80",
    seller: "SneakerVault",
    rating: 4.9,
    reviews: 67,
    description: "100% authentic with receipt. Sizes 40-46 available.",
  },
  {
    id: "p012",
    name: "Men's Chelsea Boots",
    category: "Footwear",
    price: 42000,
    priceKobo: 4200000,
    image: "https://images.unsplash.com/photo-1608256246200-53e635b5b65f?w=400&q=80",
    seller: "LeatherCraft NG",
    rating: 4.5,
    reviews: 28,
    description: "Genuine leather upper, rubber sole. Sizes 40-45.",
  },

  // ── ACCESSORIES ───────────────────────────────────────────────────────────
  {
    id: "p013",
    name: "Handwoven Raffia Bag",
    category: "Accessories",
    price: 14000,
    priceKobo: 1400000,
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
    seller: "Craft & Co.",
    rating: 4.6,
    reviews: 47,
    description: "Eco-friendly handwoven raffia tote. Multiple colours.",
  },
  {
    id: "p014",
    name: "Sterling Silver Waist Beads",
    category: "Accessories",
    price: 8500,
    priceKobo: 850000,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=400&q=80",
    seller: "Adorn Africa",
    rating: 4.7,
    reviews: 93,
    description: "Hand-strung sterling silver beads. Custom sizing.",
  },

  // ── HOME & LIVING ──────────────────────────────────────────────────────────
  {
    id: "p015",
    name: "Adire Throw Pillow Set (2pcs)",
    category: "Home & Living",
    price: 12000,
    priceKobo: 1200000,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80",
    seller: "HomeAfrika",
    rating: 4.4,
    reviews: 38,
    description: "Handcrafted Adire-dyed throw pillows. Includes inner cushion.",
  },
  {
    id: "p016",
    name: "Bamboo Serving Tray",
    category: "Home & Living",
    price: 9500,
    priceKobo: 950000,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
    seller: "HomeAfrika",
    rating: 4.3,
    reviews: 21,
    description: "100% natural bamboo with handles. 40×30cm.",
  },

  // ── BEAUTY ────────────────────────────────────────────────────────────────
  {
    id: "p017",
    name: "Shea Butter & Turmeric Soap (6 bars)",
    category: "Beauty",
    price: 7200,
    priceKobo: 720000,
    image: "https://images.unsplash.com/photo-1532413992378-f169ac26fff0?w=400&q=80",
    seller: "NaturalGlow NG",
    rating: 4.8,
    reviews: 156,
    description: "Cold-pressed shea butter and turmeric. No parabens.",
  },
  {
    id: "p018",
    name: "Natural Hair Growth Oil 100ml",
    category: "Beauty",
    price: 5500,
    priceKobo: 550000,
    image: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400&q=80",
    seller: "NaturalGlow NG",
    rating: 4.6,
    reviews: 204,
    description: "Castor, peppermint, and rosemary blend. 100% natural.",
  },
  {
    id: "p019",
    name: "Kojic Acid Brightening Serum",
    category: "Beauty",
    price: 11000,
    priceKobo: 1100000,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80",
    seller: "GlowLab",
    rating: 4.7,
    reviews: 88,
    description: "2% Kojic acid with Vitamin C. Dermatologist tested.",
  },
  {
    id: "p020",
    name: "Luxury Perfume Gift Set",
    category: "Beauty",
    price: 38000,
    priceKobo: 3800000,
    image: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400&q=80",
    seller: "Scentify",
    rating: 4.9,
    reviews: 41,
    description: "Set of 3 premium eau de parfum (50ml each). Gift boxed.",
  },
];

/** Format kobo to ₦ */
export function formatPrice(kobo) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

/** Get products linked to real DSME sellers */
export function getEscrowProducts() {
  return products.filter((p) => p.sellerEmail);
}
