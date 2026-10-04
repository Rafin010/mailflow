import { SettingsSidebar } from "@/components/SettingsSidebar";
import { ReactNode } from "react";

export const metadata = {
  title: "Settings - Mail Flow",
};

// The main app Sidebar is provided by app/(app)/layout.tsx.
export default function SettingsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      <SettingsSidebar />
      <div className="flex-1 overflow-y-auto bg-white">
        {children}
      </div>
    </div>
  );
}
