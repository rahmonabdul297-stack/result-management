"use client";

export const getTchPortalNavs = (urlPath = "classone") => [
  { id: 1, icon: "🏠", url: `/dashboard/${urlPath}`, navs: "overview" },
  { id: 2, icon: "✏️", url: `/dashboard/${urlPath}/resultdetails`, navs: "enter results" },
  { id: 3, icon: "📋", url: `/dashboard/${urlPath}/results`, navs: "all results" },
  { id: 4, icon: "🔍", url: `/dashboard/${urlPath}/results`, navs: "search" },
  { id: 5, icon: "📊", url: `/dashboard/${urlPath}/results`, navs: "analytics" },
  { id: 6, icon: "💬", url: `/dashboard/${urlPath}`, navs: "chat" },
];

export const AdminPortalNavs = [
  { id: 1, icon: "📊", url: "/admin", navs: "overview" },
  { id: 2, icon: "📋", url: "/admin/results", navs: "all results" },
  { id: 3, icon: "📷", url: "/admin/passports", navs: "passports" },
  { id: 4, icon: "👨‍🏫", url: "/admin/teachers", navs: "class teachers" },
  { id: 5, icon: "⚙️", url: "/admin/settings", navs: "settings" },
  { id: 6, icon: "💬", url: "/admin/broadcast", navs: "broadcast" },
];
