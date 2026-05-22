"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminPortalNavs } from "./Arrays";
import { useToogleContext } from "./context/page";

function isNavActive(pathname, url) {
  if (url === "/admin") return pathname === "/admin";
  return pathname === url || pathname.startsWith(`${url}/`);
}

const AdminNavbar = () => {
  const pathname = usePathname();
  const { showMenu, setshowMenu } = useToogleContext();

  const closeMenu = () => setshowMenu(false);

  return (
    <>
      {showMenu ? (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={closeMenu}
        />
      ) : null}

      <aside
        className={`admin-sidebar fixed left-0 top-[65px] z-30 h-[calc(100vh-65px)] w-[200px] flex-col bg-AppWhite py-4 shadow-lg transition-transform lg:top-[68px] lg:flex lg:h-[calc(100vh-68px)] lg:shadow-none ${
          showMenu ? "flex translate-x-0" : "hidden -translate-x-full lg:flex lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between px-3 pb-3 border-b border-[var(--border)]">
          <span className="uppercase text-md p-2 text-AppGray">main</span>
          <span className="bg-AppPurple text-AppWhite text-xs capitalize px-2 py-1 rounded-2xl">
            admin
          </span>
        </div>

        <nav className="flex flex-col gap-1 mt-3 px-2 overflow-y-auto flex-1">
          {AdminPortalNavs.map((itm) => {
            const active = isNavActive(pathname, itm.url);
            return (
              <Link
                key={itm.id}
                href={itm.url}
                onClick={closeMenu}
                className={`sb-item admin-sb-item capitalize ${
                  active ? "admin-sb-item-active" : ""
                }`}
              >
                <span className="ico">{itm.icon}</span>
                {itm.navs}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminNavbar;
