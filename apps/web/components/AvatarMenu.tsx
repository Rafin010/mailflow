"use client";

import { useState, useRef, useEffect } from "react";
import { Settings, LogOut } from "lucide-react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function AvatarMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {user.avatarUrl ? (
          <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 z-50 w-64 rounded-xl bg-white shadow-xl ring-1 ring-black/5 animate-fade-in overflow-hidden">
          <div className="flex flex-col items-center bg-gray-50 p-6 border-b border-gray-100">
            <div className="relative mb-3 h-16 w-16 overflow-hidden rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="text-base font-semibold text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email || "rafin@example.com"}</div>
          </div>
          
          <div className="p-2">
            <Link 
              href="/settings/profile" 
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Settings className="h-4 w-4 text-gray-500" />
              <span>Settings</span>
            </Link>
            <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
              <LogOut className="h-4 w-4 text-gray-500" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
