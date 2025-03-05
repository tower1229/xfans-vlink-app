"use client";

import { AuthProvider } from "../_hooks/useAuth";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProvider>{children}</AuthProvider>;
}
