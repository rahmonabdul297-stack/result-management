"use client";

import { useRouter } from "next/navigation";
import Logo from "./logo";
import { HiBars4 } from "react-icons/hi2";
import { useToogleContext } from "./context/page";

const AdminHeader = () => {
  const route = useRouter();
  const { setshowMenu } = useToogleContext();
  const onSignOut = () => route.push("/auth");

  return (
    <header className="AdminHeaderBG fixed top-0 z-40 w-full border-b border-white/10 shadow-md">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-3 px-4 lg:h-[68px] lg:px-6">
        {/* Mobile: menu */}
        <button
          type="button"
          aria-label="Toggle menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 lg:hidden"
          onClick={() => setshowMenu((prev) => !prev)}
        >
          <HiBars4 size={26} />
        </button>

        {/* Brand block */}
        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 lg:justify-start">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white/30 bg-white lg:h-11 lg:w-11">
            <Logo />
          </div>

          <div className="min-w-0 text-left hidden sm:block">
            <p className="truncate text-sm font-semibold leading-tight text-white lg:text-base">
              Ayodele Schools
            </p>
            <p className="truncate text-xs text-white/75">Result Management System</p>
          </div>

          <span className="hidden shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white lg:inline-block">
            Admin Portal
          </span>
        </div>

        {/* Sign out */}
        <button
          type="button"
          className="shrink-0 rounded-lg border border-white/30 bg-white/10 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20 sm:px-4 sm:text-sm sm:normal-case"
          onClick={onSignOut}
        >
          Sign out
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
