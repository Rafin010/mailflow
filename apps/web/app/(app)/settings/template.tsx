import { ReactNode } from "react";

// template.tsx remounts on every settings sub-route change, replaying the enter animation.
export default function SettingsTemplate({ children }: { children: ReactNode }) {
  return <div className="animate-page-in">{children}</div>;
}
