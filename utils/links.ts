type NavLink = {
  href: string;
  key: string;
};

export const siteNav = [
  { href: "/products", key: "catalog" },
  { href: "/services", key: "services" },
  { href: "/about", key: "about" },
  { href: "/partnership", key: "partnership" },
  { href: "/faq", key: "faq" },
  { href: "/contact", key: "contacts" },
] as const;

export const accountNav: NavLink[] = [
  { href: "/favorites", key: "favorites" },
  { href: "/reviews", key: "reviews" },
  { href: "/cart", key: "cart" },
  { href: "/orders", key: "orders" },
  { href: "/admin/sales", key: "admin" },
];

export const links: NavLink[] = [
  { href: "/", key: "home" },
  { href: "/about", key: "about" },
  { href: "/products", key: "products" },
  { href: "/favorites", key: "favorites" },
  { href: "/reviews", key: "reviews" },
  { href: "/cart", key: "cart" },
  { href: "/orders", key: "orders" },
  { href: "/admin/sales", key: "admin" },
];

export const adminLinks: NavLink[] = [
  { href: "/admin/sales", key: "sales" },
  { href: "/admin/products", key: "myProducts" },
  { href: "/admin/products/create", key: "createProduct" },
];
