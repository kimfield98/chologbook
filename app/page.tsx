import HomeClient from "@/app/HomeClient";
import {
  INSTALL_GUIDE_COOKIE,
  isInstallGuideDismissedCookie,
} from "@/lib/chologbook/installGuideCookie";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const dismissed = isInstallGuideDismissedCookie(
    cookieStore.get(INSTALL_GUIDE_COOKIE)?.value,
  );

  return <HomeClient initialShowInstallGuide={!dismissed} />;
}
