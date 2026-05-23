"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTchPortalNavs } from "./Arrays";
import { useToogleContext } from "./context/page";

const Navbar = () => {
  const pathname = usePathname();
  const { showMenu, UrlPath, setUrlPath, setshowMenu } = useToogleContext();
  const classSlug = UrlPath || "classone";
  const TchPortalNavs = getTchPortalNavs(classSlug);

  useEffect(() => {
    const match = pathname.match(/\/dashboard\/([^/]+)/);
    if (match) setUrlPath(match[1]);
  }, [pathname, setUrlPath]);

  const getActiveId = () => {
    if (pathname.includes("/resultdetails")) return 2;
    if (pathname.includes("/cumulative")) return 3;
    if (pathname.includes("/results")) return 4;
    if (pathname === `/dashboard/${classSlug}`) return 1;
    return 1;
  };

  const activeId = getActiveId();
  const closeMenu = () => setshowMenu(false);

  return (
    <>
      {showMenu ? (
        <button
          type="button"
          aria-label="Close menu"
          className="teacher-sidebar-backdrop fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={closeMenu}
        />
      ) : null}

      <aside
        className={`teacher-sidebar fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] w-[min(240px,85vw)] flex-col overflow-y-auto bg-AppWhite py-4 shadow-lg transition-transform duration-200 lg:top-[68px] lg:h-[calc(100vh-68px)] lg:w-[200px] lg:shadow-none ${
          showMenu
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${showMenu ? "flex" : "hidden lg:flex"}`}
      >
        <div className="flex items-center justify-between px-3">
          <div className="uppercase text-md p-2 text-AppGray">main</div>
          <span className="bg-AppGreen text-AppWhite text-xs capitalize rounded-2xl px-2 py-1">
            teacher portal
          </span>
        </div>
        <nav className="mt-2 flex flex-col">
          {TchPortalNavs.map((itm) => (
            <Link
              className={
                activeId === itm.id
                  ? "sb-item active capitalize hover:bg-AppBlack/40 hover:text-white"
                  : "sb-item capitalize hover:bg-AppBlack/40 hover:text-AppWhite"
              }
              key={itm.id}
              href={itm.url}
              onClick={closeMenu}
            >
              <span className="ico">{itm.icon}</span>
              {itm.navs}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Navbar;

