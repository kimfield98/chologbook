import AppShellClient from "@/app/app/AppShellClient";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShellClient>{children}</AppShellClient>;
}

