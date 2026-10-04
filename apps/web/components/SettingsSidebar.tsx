"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sliders, Palette, Edit3, PenTool, Clock, Shield, User } from "lucide-react";

export function SettingsSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/settings/profile", label: "Profile", icon: User },
    { href: "/settings", label: "General", icon: Sliders },
    { href: "/settings/compose", label: "Compose", icon: Edit3 },
    { href: "/settings/signatures", label: "Signatures", icon: PenTool },
    { href: "/settings/security", label: "Security", icon: Shield },
  ];

  return (
    <div className="w-64 bg-gray-50 h-full flex flex-col">
      <div className="h-14 px-6 flex items-center">
        <h2 className="font-semibold text-gray-800 text-lg">Settings</h2>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link 
                  href={link.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium
                    ${isActive 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
