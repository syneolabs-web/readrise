import Link from "next/link";
import type { SessionUser } from "@/lib/auth";
import { getNotifications } from "@/lib/activity";
import { Avatar } from "./ui";
import { LogoutButton } from "./LogoutButton";
import { ThemeMenu } from "./ThemeMenu";
import { NotificationBell } from "./NotificationBell";
import { ReadriseLogo } from "@/components/marketing/ReadriseLogo";

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
    <header className="sticky top-0 z-30 border-b border-ink-800 bg-ink-950/85 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-6">
        <Link href="/circles" className="flex shrink-0 items-center gap-2">
          <ReadriseLogo />
        </Link>

        {children}

        <div className="ml-auto flex items-center gap-3">
          <ThemeMenu />
          <NotificationBell items={notifications} />
          <Avatar name={user.name} color={user.avatarColor} image={(user as any).avatarImage} size={26} />
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
