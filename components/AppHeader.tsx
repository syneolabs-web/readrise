import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { getNotifications } from "@/lib/activity";
import { Avatar } from "./ui";
import { LogoutButton } from "./LogoutButton";
import { ThemeMenu } from "./ThemeMenu";
import { NotificationBell } from "./NotificationBell";
import { ReadriseLogo } from "@/components/marketing/ReadriseLogo";
import { MobileNav } from "./MobileNav";

/** Server component: fetches the viewer's notifications for the bell. */
export async function AppHeader({
  user,
  children,
}: {
  user: SessionUser;
  children?: React.ReactNode;
}) {
  const notifications = await getNotifications(user.id);

  return (
    <>
    {/* The 3px rule along the top edge is the book's series colour — the
        same band the landing's cover is printed in, carried into every page. */}
    <header className="sticky top-0 z-30 border-t-[3px] border-b border-t-series border-b-ink-800 bg-ink-950/90 backdrop-blur">

      {/*
        Wraps to two rows on a phone.

        Logo + circle name + Books/Vault + theme + bell + avatar + "Sign out"
        cannot fit 370px. Forced onto one line they overlapped each other and
        "Sign out" broke across two lines. Dropping controls would have been
        the easy fix, but Sign out lives nowhere else in the app, so instead
        the page context (children) takes its own full-width row below the
        identity controls. Single DOM node either way — no duplicate nav for
        screen readers.
      */}
      <div className="flex flex-wrap items-center gap-x-3 px-4 py-2 sm:h-14 sm:flex-nowrap sm:gap-x-4 sm:px-6 sm:py-0">
        <Link href="/circles" aria-label="Readrise home" className="flex shrink-0 items-center gap-2">
          <ReadriseLogo />
        </Link>

        {children && (
          <div className="order-last w-full min-w-0 pt-1 sm:order-none sm:w-auto sm:pt-0">
            {children}
          </div>
        )}

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <ThemeMenu />
          <NotificationBell items={notifications} />
          <Avatar name={user.name} color={user.avatarColor} image={(user as any).avatarImage} size={26} />
          <LogoutButton />
        </div>
      </div>
    </header>
    <MobileNav />
    </>
  );
}
