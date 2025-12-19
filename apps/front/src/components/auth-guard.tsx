"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { isAuthenticated } from "@/lib/api";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const authenticated = isAuthenticated();
    const isAuthPage = pathname === "/login" || pathname === "/signup";

    if (!authenticated && !isAuthPage) {
      router.push("/signup");
      return;
    }

    if (authenticated && isAuthPage) {
      router.push("/");
      return;
    }

    setIsChecking(false);
  }, [pathname, router]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return <>{children}</>;
}
