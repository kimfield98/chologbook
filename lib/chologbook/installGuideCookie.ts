export const INSTALL_GUIDE_COOKIE = "chologbook_installGuideDismissed";

export function isInstallGuideDismissedCookie(value: string | undefined): boolean {
  return value === "1";
}

