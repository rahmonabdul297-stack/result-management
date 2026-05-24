"use client";

export const getTchPortalNavs = (urlPath = "classone") => [
  { id: 1, icon: "🏠", url: `/dashboard/${urlPath}`, navs: "overview" },
  { id: 2, icon: "✏️", url: `/dashboard/${urlPath}/resultdetails`, navs: "enter results" },
  { id: 3, icon: "📊", url: `/dashboard/${urlPath}/cumulative`, navs: "cumulative" },
  { id: 4, icon: "📋", url: `/dashboard/${urlPath}/results`, navs: "all results" },
];

export const AdminPortalNavs = [
  { id: 1, icon: "📊", url: "/admin", navs: "overview" },
  { id: 2, icon: "📋", url: "/admin/results", navs: "term results" },
  { id: 3, icon: "📈", url: "/admin/overall-results", navs: "overall results" },
  { id: 4, icon: "🔍", url: "/checkResult", navs: "result check" },
  { id: 5, icon: "📷", url: "/admin/passports", navs: "passports" },
  { id: 6, icon: "👨‍🏫", url: "/admin/teachers", navs: "class teachers" },
  { id: 7, icon: "⚙️", url: "/admin/settings", navs: "settings" },
];
