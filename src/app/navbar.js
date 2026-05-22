"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getTchPortalNavs } from "./Arrays";
import { useToogleContext } from "./context/page";

const Navbar = () => {
  const pathname = usePathname();
  const { showMenu, UrlPath, setUrlPath } = useToogleContext();
  const classSlug = UrlPath || "classone";
  const TchPortalNavs = getTchPortalNavs(classSlug);

  useEffect(() => {
    const match = pathname.match(/\/dashboard\/(class(?:one|two|three|four|five|six))/);
    if (match) setUrlPath(match[1]);
  }, [pathname, setUrlPath]);

  const getActiveId = () => {
    if (pathname.includes("/resultdetails")) return 2;
    if (pathname.includes("/results")) return 3;
    if (pathname === `/dashboard/${classSlug}`) return 1;
    return 1;
  };

  const activeId = getActiveId();

  return (
    <div>
      <div
        className={
          showMenu
            ? "bg-AppWhite w-[200px] h-screen py-4"
            : "hidden lg:flex flex-col bg-AppWhite w-[200px] h-screen py-4"
        }
      >
        <div className="flex items-center justify-between px-3">
          <div className="uppercase text-md p-2 text-AppGray">main</div>
          {showMenu ? (
            <span className="bg-AppGreen text-AppWhite text-xs capitalize p-1 rounded-2xl">
              teacher portal
            </span>
          ) : (
            ""
          )}
        </div>
        {TchPortalNavs.map((itm) => (
          <Link
            className={
              activeId === itm.id
                ? "sb-item active capitalize hover:bg-AppBlack/40 hover:text-white"
                : "sb-item capitalize hover:bg-AppBlack/40 hover:text-AppWhite"
            }
            key={itm.id}
            href={itm.url}
          >
            <span className="ico">{itm.icon}</span>
            {itm.navs}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Navbar;

