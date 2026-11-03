export const SITE = {
  name: "The Quiet Ledger",
  shortName: "Ledger",
  tagline: "Dispatches on technology, craft, and the slow web.",
  description:
    "An independent publication covering technology, design, engineering craft, and the culture of building software for the long term.",
  author: {
    name: "Amara Okonkwo",
    role: "Editor and writer",
    bio: "Amara writes about software craft, the economics of independent publishing, and the quiet parts of building products that last.",
  },
  locale: "en_US",
  language: "en",
} as const;

export const NAV_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Categories", href: "/categories" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const FOOTER_LINKS = {
  read: [
    { label: "All articles", href: "/blog" },
    { label: "Categories", href: "/categories" },
    { label: "Search", href: "/search" },
    { label: "Newsletter", href: "/newsletter" },
  ],
  publication: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
    { label: "RSS feed", href: "/feed.xml" },
    { label: "Sitemap", href: "/sitemap.xml" },
  ],
  legal: [
    { label: "Privacy policy", href: "/privacy-policy" },
    { label: "Terms and conditions", href: "/terms-and-conditions" },
    { label: "Cookie policy", href: "/cookie-policy" },
  ],
} as const;

export const ADMIN_NAV = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "LayoutDashboard" },
  { label: "Posts", href: "/admin/posts", icon: "FileText" },
  { label: "New post", href: "/admin/posts/new", icon: "PenLine" },
  { label: "Categories", href: "/admin/categories", icon: "FolderTree" },
  { label: "Tags", href: "/admin/tags", icon: "Tags" },
  { label: "Media library", href: "/admin/media", icon: "Images" },
  { label: "Comments", href: "/admin/comments", icon: "MessageSquare" },
  { label: "Subscribers", href: "/admin/subscribers", icon: "Users" },
  { label: "Messages", href: "/admin/messages", icon: "Mail" },
  { label: "Analytics", href: "/admin/analytics", icon: "ChartLine" },
  { label: "Settings", href: "/admin/settings", icon: "Settings" },
] as const;

export const ADMIN_NAV_PHASE: Record<(typeof ADMIN_NAV)[number]["href"], string> = {
  "/admin/dashboard": "6",
  "/admin/posts": "8",
  "/admin/posts/new": "8",
  "/admin/categories": "9",
  "/admin/tags": "9",
  "/admin/media": "7",
  "/admin/comments": "9",
  "/admin/subscribers": "9",
  "/admin/messages": "9",
  "/admin/analytics": "9",
  "/admin/settings": "9",
};

export const POSTS_PER_PAGE = 9;
export const MEDIA_PER_PAGE = 24;
