"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, MailCheck, File, Archive, Trash2, Settings, UserCircle, Menu, PenLine, AlertCircle } from "lucide-react";
import { useAuth } from "./AuthProvider";
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: '800' });

interface SidebarProps {
  onCompose?: () => void;
}

export function Sidebar({ onCompose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user } = useAuth();

  const isActivePath = (path: string) =>
    path === "/inbox" ? pathname === "/inbox" : pathname === path || pathname.startsWith(`${path}/`);

  const getLinkClasses = (path: string) => {
    const isActive = isActivePath(path);
    return `flex items-center gap-3 px-3 py-2 rounded-md font-medium transition-colors duration-150 active:scale-[0.98] ${
      isActive 
        ? "bg-blue-100 text-blue-700" 
        : "text-gray-700 hover:bg-gray-100"
    } ${isCollapsed ? "justify-center px-0" : ""}`;
  };

  return (
    <div className={`bg-gray-50 h-screen flex flex-col transition-all duration-300 ${isCollapsed ? "w-[72px]" : "w-64"}`}>
      {/* Top Header */}
      <div className={`px-4 py-4 flex items-center h-14 ${isCollapsed ? "justify-center" : "justify-between"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MailFlow Logo" width={32} height={32} priority className="object-contain" />
            <span className={`${orbitron.className} text-black text-lg tracking-wider`}>Mail Flow</span>
          </div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="text-gray-500 hover:text-gray-700 focus:outline-none p-1 rounded-md hover:bg-gray-100"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>
      
      {/* Body Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className={`pt-6 pb-4 ${isCollapsed ? "px-2" : "px-4"}`}>
          <button 
            onClick={onCompose}
            className={`bg-slate-900 text-white rounded-2xl py-3.5 font-medium hover:bg-black hover:shadow-md transition-all shadow-sm flex items-center justify-center gap-3 ${isCollapsed ? "w-12 h-12 rounded-full p-0 mx-auto" : "w-[160px]"}`}
            title="Compose Email"
          >
            <PenLine className="w-5 h-5" />
            {!isCollapsed && <span className="text-[15px]">Compose</span>}
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-2">
          <ul className="space-y-1 px-2">
            <li>
              <Link href="/inbox" className={getLinkClasses("/inbox")} title="Inbox">
                <Mail className="h-5 w-5" />
                {!isCollapsed && <span>Inbox</span>}
              </Link>
            </li>
            <li>
              <Link href="/sent" className={getLinkClasses("/sent")} title="Sent">
                <MailCheck className="h-5 w-5" />
                {!isCollapsed && <span>Sent</span>}
              </Link>
            </li>
            <li>
              <Link href="/drafts" className={getLinkClasses("/drafts")} title="Drafts">
                <File className="h-5 w-5" />
                {!isCollapsed && <span>Drafts</span>}
              </Link>
            </li>
            <li>
              <Link href="/archive" className={getLinkClasses("/archive")} title="Archive">
                <Archive className="h-5 w-5" />
                {!isCollapsed && <span>Archive</span>}
              </Link>
            </li>
            <li>
              <Link href="/spam" className={getLinkClasses("/spam")} title="Spam">
                <AlertCircle className="h-5 w-5" />
                {!isCollapsed && <span>Spam</span>}
              </Link>
            </li>
            <li>
              <Link href="/trash" className={getLinkClasses("/trash")} title="Trash">
                <Trash2 className="h-5 w-5" />
                {!isCollapsed && <span>Trash</span>}
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4">
          <Link href="/settings" className={getLinkClasses("/settings")} title="Settings">
            <Settings className="h-5 w-5" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
          {user?.role && ['admin', 'super_admin'].includes(user.role) && (
            <Link href="/admin" className={`${getLinkClasses("/admin")} mt-1`} title="Admin Console">
              <UserCircle className="h-5 w-5" />
              {!isCollapsed && <span>Admin Console</span>}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
