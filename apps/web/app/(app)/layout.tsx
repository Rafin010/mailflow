"use client";

import { ReactNode, useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { ComposeModal } from "@/components/ComposeModal";
import { MailProvider } from "@/components/MailProvider";
import { LoadingToast } from "@/components/LoadingToast";

import { SettingsProvider } from "@/components/SettingsProvider";
import { useAuth } from "@/components/AuthProvider";
import { AvatarMenu } from "@/components/AvatarMenu";

export default function AppShellLayout({ children }: { children: ReactNode }) {
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading App...</div>;
  }

  const section = pathname.startsWith("/settings") ? "settings" : "mail";

  return (
    <SettingsProvider>
      <MailProvider>
        <div className="flex h-screen w-full overflow-hidden bg-white relative">
          <Sidebar onCompose={() => setIsComposeOpen(true)} />
          <main key={section} className="flex flex-1 overflow-hidden animate-page-in">
            {children}
          </main>
          <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
          <div className="absolute top-3 right-4 z-50">
            <AvatarMenu />
          </div>
        </div>
        <LoadingToast />
      </MailProvider>
    </SettingsProvider>
  );
}
