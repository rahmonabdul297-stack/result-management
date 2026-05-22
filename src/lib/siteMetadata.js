import { getClassConfig } from "./classConfig";

export const SCHOOL_NAME = "School of Science and Technology";
export const SITE_NAME = "SST Result Management System";
export const DEFAULT_DESCRIPTION =
  "Secure school result management for teachers and administrators — enter, view, and manage student result slips across JSS classes.";

function getSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url.replace(/\/$/, "");
  return "http://localhost:3000";
}

/** @param {string} path */
function absoluteUrl(path = "") {
  const base = getSiteUrl();
  if (!path) return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * @param {{ title: string; description?: string; path?: string; noIndex?: boolean; keywords?: string[] }} options
 */
export function pageMetadata({ title, description = DEFAULT_DESCRIPTION, path = "", noIndex = false, keywords = [] }) {
  const canonical = absoluteUrl(path);
  const ogTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords: [
      SCHOOL_NAME,
      "school results",
      "result management",
      "student report card",
      ...keywords,
    ],
    alternates: { canonical },
    openGraph: {
      title: ogTitle,
      description,
      url: canonical,
      siteName: SCHOOL_NAME,
      locale: "en_NG",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

/** @type {Record<string, { title: string; description: string; path: string }>} */
export const ADMIN_PAGE_META = {
  overview: {
    title: "Admin Overview",
    description: "School-wide dashboard with submission stats, class activity, and quick admin actions.",
    path: "/admin",
  },
  results: {
    title: "All School Results",
    description: "View, search, and manage every student result slip submitted by teachers.",
    path: "/admin/results",
  },
  passports: {
    title: "Student Passports",
    description: "Browse and manage student passport photos uploaded with result submissions.",
    path: "/admin/passports",
  },
  teachers: {
    title: "Manage Class Teachers",
    description:
      "Assign teacher names and staff IDs to each JSS class for personalized dashboard welcome messages.",
    path: "/admin/teachers",
  },
  broadcast: {
    title: "Staff Broadcast",
    description: "Send announcements and messages to teachers and school staff.",
    path: "/admin/broadcast",
  },
  settings: {
    title: "School Settings",
    description: "Configure school name, logo, address, and grading rules for result slips.",
    path: "/admin/settings",
  },
};

/** @param {keyof typeof ADMIN_PAGE_META} key */
export function adminPageMetadata(key) {
  const meta = ADMIN_PAGE_META[key];
  return pageMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
    keywords: ["admin", "school administration"],
  });
}

/** @param {string} classSlug @param {"dashboard" | "results" | "entry"} section */
export function classPageMetadata(classSlug, section) {
  const cfg = getClassConfig(classSlug);
  const paths = {
    dashboard: `/dashboard/${classSlug}`,
    results: `/dashboard/${classSlug}/results`,
    entry: `/dashboard/${classSlug}/resultdetails`,
  };
  const titles = {
    dashboard: `${cfg.label} Teacher Dashboard`,
    results: `${cfg.label} Student Results`,
    entry: `${cfg.label} Enter Student Result`,
  };
  const descriptions = {
    dashboard: `Teacher overview and quick links for ${cfg.className} result management.`,
    results: `View and search submitted student result slips for ${cfg.className}.`,
    entry: `Record scores, remarks, and submit printable result slips for ${cfg.className} students.`,
  };

  return pageMetadata({
    title: titles[section],
    description: descriptions[section],
    path: paths[section],
    keywords: [cfg.className, cfg.label, "teacher portal", "result slip"],
  });
}

export const rootMetadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    SCHOOL_NAME,
    "school result system",
    "report card management",
    "Nigeria secondary school",
  ],
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    siteName: SCHOOL_NAME,
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};
