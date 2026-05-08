import AppShellClient from "@/app/app/AppShellClient";

export default function TourLayout({ children }: { children: React.ReactNode }) {
  return <AppShellClient variant="tour">{children}</AppShellClient>;
}

