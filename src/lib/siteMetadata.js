import { getClassConfig } from "./classConfig";

export const SCHOOL_NAME = "Ayodele Schools";
export const SITE_NAME = "SST Result Management System";
/** School crest — used for favicon, PWA icon, and social preview images */
/** Public file copied from original `ayodele logo.webp` (no spaces — reliable in URLs & Next/Image). */
export const SCHOOL_LOGO_PATH = "/ayodele-logo1.webp";
export const DEFAULT_DESCRIPTION =
  "Secure school result management for teachers and administrators — enter, view, and manage student result slips across JSS classes.";

const schoolLogoIcons = {
  icon: [{ url: SCHOOL_LOGO_PATH, type: "image/webp" }],
  shortcut: SCHOOL_LOGO_PATH,
  apple: SCHOOL_LOGO_PATH,
};

const schoolLogoOpenGraphImages = [
  {
    url: SCHOOL_LOGO_PATH,
    alt: `${SCHOOL_NAME} logo`,
    width: 512,
    height: 512,
  },
];

function getSiteUrl() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (url) return url.replace(/\/$/, "");
  return "https://result-management-kappa.vercel.app/";
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
    icons: schoolLogoIcons,
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
      images: schoolLogoOpenGraphImages,
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description,
      images: [SCHOOL_LOGO_PATH],
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
    title: "Term Results",
    description: "View, search, and manage term result slips submitted by teachers.",
    path: "/admin/results",
  },
  overallResults: {
    title: "Overall Cumulative Results",
    description:
      "View annual cumulative results calculated from 1st, 2nd, and 3rd term scores across all classes.",
    path: "/admin/overall-results",
  },
  checkResult: {
    title: "Result Check Portal",
    description:
      "Student and parent portal to look up result slips by admission number, year, and term.",
    path: "/checkResult",
  },
  passports: {
    title: "Student Passports",
    description: "Browse and manage student passport photos uploaded with result submissions.",
    path: "/admin/passports",
  },
  teachers: {
    title: "Manage Class Teachers",
    description:
      "Add classes, assign teachers, and set staff IDs and passwords for teacher dashboard login.",
    path: "/admin/teachers",
  },
  broadcast: {
    title: "Staff Broadcast",
    description: "Send announcements and messages to teachers and school staff.",
    path: "/admin/broadcast",
  },
  settings: {
    title: "School Settings",
    description:
      "Configure school name, address, motto, and register students for each class.",
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
    cumulative: `/dashboard/${classSlug}/cumulative`,
  };
  const titles = {
    dashboard: `${cfg.label} Teacher Dashboard`,
    results: `${cfg.label} Student Results`,
    entry: `${cfg.label} Enter Student Result`,
    cumulative: `${cfg.label} Cumulative Results`,
  };
  const descriptions = {
    dashboard: `Teacher overview and quick links for ${cfg.className} result management.`,
    results: `View and search submitted student result slips for ${cfg.className}.`,
    entry: `Record scores, remarks, and submit printable result slips for ${cfg.className} students.`,
    cumulative: `Calculate and submit annual cumulative results from 1st, 2nd, and 3rd term for ${cfg.className}.`,
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
  icons: schoolLogoIcons,
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
    images: schoolLogoOpenGraphImages,
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [SCHOOL_LOGO_PATH],
  },
  robots: { index: true, follow: true },
};
