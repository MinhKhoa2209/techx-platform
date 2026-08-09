import type { Availability, ProductCategory } from "./types";

export const ROUTES = {
  home: "/",
  products: "/products",
  cart: "/cart",
  checkout: "/checkout",
  orders: "/orders",
  product: (id: string) => `/product/${encodeURIComponent(id)}`,
  order: (id: string) => `/order/${encodeURIComponent(id)}`,
  category: (id: ProductCategory) => `/products?category=${id}`,
  search: (query: string) => `/products?q=${encodeURIComponent(query.trim())}`,
} as const;

export const SITE = {
  name: "TechX Observatory Supply",
  shortName: "TechX",
  mark: "TX",
  brandDescriptor: "Observatory Supply",
  tagline: "Better nights start with the right view.",
  description:
    "A focused demo storefront for telescopes, binoculars and observing accessories.",
  demoNotice:
    "Demo storefront — no payment is collected and no physical order is shipped.",
} as const;

export const UI_STORAGE_KEYS = {
  demoNoticeDismissed: "techx-demo-notice-dismissed",
  lastOrder: "techx-last-order-v2",
} as const;

export const NAVIGATION = [
  { label: "Shop", href: ROUTES.products },
  { label: "Telescopes", href: ROUTES.category("telescopes") },
  { label: "Binoculars", href: ROUTES.category("binoculars") },
  { label: "Accessories", href: ROUTES.category("accessories") },
  { label: "Order lookup", href: ROUTES.orders },
] as const;

export const CATEGORY_PRESENTATION: Record<
  ProductCategory,
  { eyebrow: string; icon: string }
> = {
  telescopes: { eyebrow: "Moon to deep sky", icon: "scope" },
  binoculars: { eyebrow: "Grab and explore", icon: "binoculars" },
  accessories: { eyebrow: "Complete your kit", icon: "accessories" },
};

export const AVAILABILITY_CONTENT: Record<
  Availability,
  { label: string; tone: "success" | "warning" | "neutral" }
> = {
  in_stock: { label: "In stock", tone: "success" },
  low_stock: { label: "Low stock", tone: "warning" },
  out_of_stock: { label: "Out of stock", tone: "neutral" },
};

export const AVAILABILITY_FILTERS: readonly Availability[] = [
  "in_stock",
  "low_stock",
];

export const CART_BADGE_DISPLAY_LIMIT = 99;

export const CHECKOUT_FIELD_GROUPS = {
  contact: ["email", "name"],
  address: ["line1", "line2", "city", "region", "postalCode"],
} as const;

export const UI_LIMITS = {
  regionCharacters: 2,
  optionalAddressCharacters: 120,
  customerNameMinimum: 2,
  customerNameMaximum: 80,
  streetAddressMinimum: 3,
  cityMinimum: 2,
  cartPreviewItems: 4,
  desktopNavigationItems: 4,
} as const;

export const UI_TIMINGS = {
  transientFeedbackMs: 1_800,
  addToCartFeedbackMs: 2_000,
} as const;

export const PRICE_FILTERS = [
  { id: "under-100", label: "Under $100", minimum: 0, maximum: 10_000 },
  { id: "100-300", label: "$100–$300", minimum: 10_000, maximum: 30_000 },
  {
    id: "300-plus",
    label: "$300 and above",
    minimum: 30_000,
    maximum: Number.POSITIVE_INFINITY,
  },
] as const;

export const SORT_OPTIONS = [
  { id: "featured", label: "Featured" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "name-asc", label: "Name: A–Z" },
] as const;

export const CONTENT = {
  common: {
    home: "Home",
    breadcrumb: "Breadcrumb",
    retry: "Try again",
    shopNow: "Shop all gear",
    viewProduct: "View product",
    addToCart: "Add to cart",
    added: "Added to cart",
    continueShopping: "Continue shopping",
    loading: "Loading…",
    free: "Free",
    product: "product",
    products: "products",
    item: "item",
    items: "items",
    clear: "Clear",
    search: "Search",
    quantity: "Quantity",
    decreaseQuantity: "Decrease quantity",
    increaseQuantity: "Increase quantity",
    noProducts: "No products found",
    noProductsBody: "Try adjusting your filters or check back later.",
  },
  shell: {
    skipToContent: "Skip to content",
    dismissDemoNotice: "Dismiss demo notice",
    openNavigation: "Open navigation",
    closeNavigation: "Close navigation",
    navigation: "Navigation",
    primaryNavigation: "Primary navigation",
    mobileNavigation: "Mobile navigation",
    footerNavigation: "Footer navigation",
    searchProducts: "Search products",
    searchPlaceholder: "Search gear",
    orderLookup: "Order lookup",
    cartLabel: (count: number) => `Cart with ${count} items`,
    footerShop: "Shop",
    demoInformation: "Demo information",
    temporaryOrders: "Portfolio storefront · Orders are temporary",
  },
  home: {
    eyebrow: "Astronomy gear for curious nights",
    title: "Find your way into the night sky.",
    intro:
      "Clear product guidance, dependable optics and a compact collection for first looks and next discoveries.",
    secondaryAction: "How to choose",
    categoriesEyebrow: "Shop by category",
    categoriesTitle: "Start with how you want to explore",
    featuredEyebrow: "Field-tested favorites",
    featuredTitle: "Featured for your next clear night",
    guideEyebrow: "New to astronomy?",
    guideTitle: "Choose confidence over complexity.",
    guideBody:
      "Start with binoculars for flexibility, a refractor for quick lunar views, or a reflector when deep-sky detail matters most.",
    paymentFact: "Payment",
    paymentFactValue: "Never collected",
    catalogFact: "Catalog",
    catalogFactValue: (count: number) => `${count} curated products`,
    deliveryFact: "Delivery",
    loadingRule: "Loading rule",
    featuredPick: "Featured field pick",
    featuredLoading: "Loading featured gear…",
    catalogUnavailable: "The catalog is temporarily unavailable.",
    categoryCount: (count: number) =>
      `${count} ${count === 1 ? "product" : "products"}`,
    viewCollection: "View the full collection",
    featuredEmpty: "Featured gear is being refreshed",
    featuredEmptyBody: "Browse the complete collection in the meantime.",
    compareCollection: "Compare the collection",
    guideOptions: [
      {
        icon: "binoculars",
        title: "Most flexible",
        body: "Binoculars are quick to carry and useful in daylight too.",
      },
      {
        icon: "scope",
        title: "Fast first views",
        body: "Refractors make lunar and planetary setup straightforward.",
      },
      {
        icon: "accessories",
        title: "Build your field kit",
        body: "Small accessories improve comfort and protect your optics.",
      },
    ],
    principlesLabel: "Demo storefront principles",
    principles: {
      paymentTitle: "No payment collection",
      paymentBody: "Safe portfolio checkout",
      deliveryTitle: "Transparent delivery rule",
      deliveryLoading: "Loading delivery details",
      pricingTitle: "Server-priced orders",
      pricingBody: "Totals are verified by the order service",
    },
  },
  catalog: {
    eyebrow: "Curated observing gear",
    title: "Shop the collection",
    intro: "Search and compare optics selected for real observing use cases.",
    searchLabel: "Search products",
    searchPlaceholder: "Search by name, SKU or use case",
    filters: "Filters",
    allProducts: "All products",
    categories: "Categories",
    price: "Price",
    availability: "Availability",
    availableNow: "Available now",
    applyFilters: "View results",
    clear: "Clear all",
    noResults: "No gear matches those filters",
    noResultsBody: "Clear a filter or try a broader search.",
    sortBy: "Sort by",
    resultCount: (count: number) =>
      `${count} ${count === 1 ? "product" : "products"}`,
    errorTitle: "The catalog could not be loaded",
    errorBody: "Try again without losing your filters.",
    closeFilters: "Close filters",
    closeProductFilters: "Close product filters",
    productFilters: "Product filters",
    loadingProducts: "Loading products",
  },
  product: {
    specifications: "Product details",
    related: "You may also like",
    quantity: "Quantity",
    sku: "SKU",
    unavailable: "This product is currently unavailable.",
    notFound: "Product not found",
    notFoundBody:
      "The product may have moved or no longer belongs to this catalog.",
    save: (percent: number) => `Save ${percent}%`,
    lowStock: (count: number) =>
      `Only ${count} available in this demo catalog.`,
    quantityFor: (name: string) => `Quantity for ${name}`,
    viewImage: (index: number) => `View image ${index}`,
    deliveryLoading: "Delivery details loading",
    demoCheckoutTitle: "Demo-safe checkout",
    demoCheckoutBody: "No card details are requested.",
    specificationsEyebrow: "Built for the field",
  },
  cart: {
    title: "Your cart",
    empty: "Your cart is ready for a first discovery",
    emptyBody: "Add a telescope, binocular or field accessory to get started.",
    summary: "Order summary",
    subtotal: "Subtotal",
    shipping: "Standard delivery",
    total: "Total",
    checkout: "Continue to checkout",
    reconciled: "Your cart was refreshed with the latest catalog details.",
    eyebrow: "Ready when you are",
    count: (count: number) =>
      `${count} ${count === 1 ? "item" : "items"} in your cart`,
    dismissNotice: "Dismiss cart notice",
    preview: "Cart preview",
    closePreview: "Close cart preview",
    viewCart: "View cart",
    deliveryUnavailable: "Delivery pricing is temporarily unavailable.",
    freeDeliveryProgress: "Free delivery progress",
    freeDelivery: "Standard delivery is free.",
    freeDeliveryRemaining: (amount: string) =>
      `Add ${amount} for free standard delivery.`,
    unavailableItems: "Resolve unavailable items before checkout.",
    demoNote: "No payment is collected in this demo.",
    unitPrice: (price: string) => `${price} each`,
    remove: "Remove",
  },
  checkout: {
    title: "Demo checkout",
    contact: "Contact",
    shipping: "Shipping address",
    review: "Review order",
    demoPaymentTitle: "No payment required",
    demoPaymentBody:
      "This portfolio demo never asks for card details and will not charge or ship anything.",
    placeOrder: "Place demo order",
    submitting: "Placing demo order…",
    back: "Back to cart",
    emptyTitle: "Nothing to check out",
    eyebrow: "Safe portfolio flow",
    country: "Country",
    countryValue: "United States",
    submitErrorTitle: "Order could not be placed",
    submitErrorSuffix: "Your cart and form are still here.",
    fallbackError: "The demo order could not be placed.",
    validation: {
      name: "Enter a name from 2 to 80 characters.",
      email: "Enter a valid email address.",
      line1: "Enter a street address.",
      line2: "Keep the optional address line under 120 characters.",
      city: "Enter a city.",
      region: "Use a two-letter US state code.",
      postalCode: "Use ZIP format 12345 or 12345-6789.",
    },
  },
  order: {
    confirmed: "Demo order confirmed",
    confirmedBody:
      "The order flow completed successfully. No payment was taken and no parcel will be shipped.",
    lookupTitle: "Look up a demo order",
    lookupBody:
      "Paste an order ID to view its item snapshot and confirmation details while it remains in memory.",
    lookupAction: "Find order",
    notFound: "We could not find that order.",
    invalidId: "Enter a complete order ID beginning with ord_.",
    eyebrow: "Temporary demo data",
    id: "Order ID",
    placeholder: "ord_00000000-0000-0000-0000-000000000000",
    detailsLabel: "Demo order details",
    created: (date: string) => `Created ${date}`,
    copied: "Copied",
    copyId: "Copy ID",
    quantity: (count: number) => `Quantity ${count}`,
    deliveryWindow: "Demo delivery window",
    destination: "Destination",
    contact: "Contact",
    expiry: (date: string) => `Temporary order data expires ${date}.`,
    unavailable: "Order unavailable",
    lookupAnother: "Look up another order",
    checkoutComplete: "Checkout complete",
    lookupAnOrder: "Look up an order",
    lookingUp: "Looking up…",
    ttlHelp: "Orders are available only until their server-side TTL expires.",
  },
} as const;

export const ORDER_ERROR_CONTENT: Record<string, string> = {
  INVALID_ORDER: "Review the checkout information and try again.",
  INVALID_CUSTOMER: "Enter a valid name and email address.",
  INVALID_SHIPPING_ADDRESS: "Enter a valid US demo shipping address.",
  PRODUCT_OUT_OF_STOCK: "A product in your cart is now out of stock.",
  INSUFFICIENT_INVENTORY:
    "A product quantity is higher than current availability.",
  CATALOG_UNAVAILABLE: "Product availability could not be checked. Try again.",
  RATE_LIMITED: "Too many attempts. Wait briefly and try again.",
  ORDER_NOT_FOUND: "The order was not found or has expired.",
  DEPENDENCY_UNAVAILABLE: "The demo service is temporarily unavailable.",
};

export const ORDER_STATUS_CONTENT = {
  confirmed: {
    label: "Confirmed",
    description: "The demo order was accepted and priced by the order service.",
  },
} as const;

export const CHECKOUT_FIELDS = {
  email: {
    label: "Email address",
    autoComplete: "email",
    inputMode: "email",
    placeholder: "you@example.com",
  },
  name: {
    label: "Full name",
    autoComplete: "name",
    inputMode: "text",
    placeholder: "Alex Morgan",
  },
  line1: {
    label: "Street address",
    autoComplete: "address-line1",
    inputMode: "text",
    placeholder: "100 Clear Sky Lane",
  },
  line2: {
    label: "Apartment, suite or unit (optional)",
    autoComplete: "address-line2",
    inputMode: "text",
    placeholder: "Apartment 2B",
  },
  city: {
    label: "City",
    autoComplete: "address-level2",
    inputMode: "text",
    placeholder: "Seattle",
  },
  region: {
    label: "State",
    autoComplete: "address-level1",
    inputMode: "text",
    placeholder: "WA",
  },
  postalCode: {
    label: "ZIP code",
    autoComplete: "postal-code",
    inputMode: "numeric",
    placeholder: "98101",
  },
} as const;
