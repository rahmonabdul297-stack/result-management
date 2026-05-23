"use client";

import "../globals.css";
import AdminHeader from "../AdminHeader";
import AdminNavbar from "../adminavbar";
import { ContextPageProvider } from "../context/page";
import { SchoolClassesProvider } from "../context/SchoolClassesContext";

export default function AdminLayoutShell({ children }) {
  return (
    <ContextPageProvider>
      <SchoolClassesProvider>
      <div className="admin-layout min-h-screen bg-[var(--surface)]">
        <AdminHeader />

        <section className="admin-shell relative flex min-h-screen">
          <AdminNavbar />

          <main className="admin-content page-content w-full min-h-screen min-w-0 px-3 pb-10 pt-16 sm:px-5 lg:ml-[200px] lg:max-w-[calc(100%-200px)] lg:px-8 lg:pt-[68px]">
            {children}
          </main>
        </section>
      </div>
      </SchoolClassesProvider>
    </ContextPageProvider>
  );
}
