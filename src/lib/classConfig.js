export const CLASS_CONFIG = {
  classone: { label: "JSS 1", className: "JSS 1" },
  classtwo: { label: "JSS 2", className: "JSS 2" },
  classthree: { label: "JSS 3", className: "JSS 3" },
  classfour: { label: "SSS 1", className: "SSS 1" },
  classfive: { label: "SSS 2", className: "SSS 2" },
  classsix: { label: "SSS 3", className: "SSS 3" },
};

export const CLASS_SLUGS = Object.keys(CLASS_CONFIG);

export function getClassConfig(classSlug) {
  return CLASS_CONFIG[classSlug] || CLASS_CONFIG.classone;
}

/** Resolve Firebase record to a known class slug. */
export function resolveClassSlug(item) {
  if (item?.classSlug && CLASS_CONFIG[item.classSlug]) {
    return item.classSlug;
  }
  const name = item?.className || item?.class || "";
  const byName = CLASS_SLUGS.find(
    (slug) =>
      CLASS_CONFIG[slug].className === name || CLASS_CONFIG[slug].label === name
  );
  return byName || null;
}

/** Group result records by class in JSS 1 → JSS 6 order. */
export function groupResultsByClass(results = []) {
  const buckets = CLASS_SLUGS.map((slug) => ({
    slug,
    label: CLASS_CONFIG[slug].label,
    className: CLASS_CONFIG[slug].className,
    items: [],
  }));

  const other = {
    slug: "other",
    label: "Uncategorized",
    className: "Other",
    items: [],
  };

  for (const item of results) {
    const slug = resolveClassSlug(item);
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
export function getClassResultCounts(results = []) {
  const grouped = groupResultsByClass(results);
  return CLASS_SLUGS.map((slug) => {
    const group = grouped.find((g) => g.slug === slug);
    return {
      slug,
      ...CLASS_CONFIG[slug],
      count: group?.items.length ?? 0,
      items: group?.items ?? [],
    };
  });
}
