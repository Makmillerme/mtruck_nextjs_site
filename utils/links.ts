type NavLink = {
  href: string;
  key: string;
};

export const siteNav = [
  { href: "/", key: "home" },
  { href: "/products", key: "catalog" },
  { href: "/services", key: "services" },
  { href: "/about", key: "about" },
  { href: "/partnership", key: "partnership" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contacts" },
] as const;

export const accountCabinetNav = [
  { href: "/account", key: "overview", match: "exact" },
  { href: "/account/orders", key: "orders", match: "prefix" },
  { href: "/account/favorites", key: "favorites", match: "prefix" },
  { href: "/account/settings", key: "settings", match: "prefix" },
] as const;

export const accountNav: NavLink[] = [
  { href: "/account/favorites", key: "favorites" },
  { href: "/reviews", key: "reviews" },
  { href: "/cart", key: "cart" },
  { href: "/account/orders", key: "orders" },
  { href: "/admin/sales", key: "admin" },
];

export const adminLinks: NavLink[] = [
  { href: "/admin/catalog", key: "catalog" },
  { href: "/admin/sales", key: "sales" },
  { href: "/admin/products", key: "myProducts" },
];
