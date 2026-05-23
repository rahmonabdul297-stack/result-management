export const DEFAULT_CLASS_CONFIG = {
  classone: { label: "PRY 1", className: "PRY 1", order: 1 },
  classtwo: { label: "PRY 2", className: "PRY 2", order: 2 },
  classthree: { label: "PRY 3", className: "PRY 3", order: 3 },
  classfour: { label: "PRY 4", className: "PRY 4", order: 4 },
  classfive: { label: "PRY 5", className: "PRY 5", order: 5 },
  classsix: { label: "PRY 6", className: "PRY 6", order: 6 },
};

/** @deprecated Use DEFAULT_CLASS_CONFIG or fetchSchoolClasses() */
export const CLASS_CONFIG = DEFAULT_CLASS_CONFIG;

/** @deprecated Use getClassSlugsFromConfig after loading classes */
export const CLASS_SLUGS = Object.keys(DEFAULT_CLASS_CONFIG);

export function getClassConfig(classSlug, classConfig = DEFAULT_CLASS_CONFIG) {
  return (
    classConfig[classSlug] ||
    classConfig.classone ||
    DEFAULT_CLASS_CONFIG.classone
  );
}

/** Resolve Firebase record to a known class slug. */
export function resolveClassSlug(item, classConfig = DEFAULT_CLASS_CONFIG) {
  const slugs = Object.keys(classConfig);
  if (item?.classSlug && classConfig[item.classSlug]) {
    return item.classSlug;
  }
  const name = item?.className || item?.class || "";
  const byName = slugs.find(
    (slug) =>
      classConfig[slug].className === name || classConfig[slug].label === name,
  );
  return byName || null;
}

/** Group result records by class in configured order. */
export function groupResultsByClass(results = [], classConfig = DEFAULT_CLASS_CONFIG) {
  const slugs = Object.keys(classConfig);
  const buckets = slugs.map((slug) => ({
    slug,
    label: classConfig[slug].label,
    className: classConfig[slug].className,
    items: [],
  }));

  const other = {
    slug: "other",
    label: "Uncategorized",
    className: "Other",
    items: [],
  };

  for (const item of results) {
    const slug = resolveClassSlug(item, classConfig);
    if (slug) {
      buckets.find((b) => b.slug === slug).items.push(item);
    } else {
      other.items.push(item);
    }
  }

  const filled = buckets.filter((b) => b.items.length > 0);
  if (other.items.length > 0) filled.push(other);
  return filled;
}

/** Per-class counts for all configured classes (including zeros). */
export function getClassResultCounts(results = [], classConfig = DEFAULT_CLASS_CONFIG) {
  const grouped = groupResultsByClass(results, classConfig);
  const slugs = Object.keys(classConfig);
  return slugs.map((slug) => {
    const group = grouped.find((g) => g.slug === slug);
    return {
      slug,
      ...classConfig[slug],
      count: group?.items.length ?? 0,
      items: group?.items ?? [],
    };
  });
}
