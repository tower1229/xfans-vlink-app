"use client";

import { AuthProvider } from "../_hooks/useAuth";

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
