"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Users, Globe, Shield, CreditCard, LayoutDashboard, Mail, LayoutGrid } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { AvatarMenu } from "@/components/AvatarMenu";
import { Orbitron } from 'next/font/google';

const orbitron = Orbitron({ subsets: ['latin'], weight: '800' });

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (!['admin', 'super_admin'].includes(user.role)) {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !user || !['admin', 'super_admin'].includes(user.role)) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-400">Loading Admin Console...</div>;
  }

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? "bg-slate-800 text-white" 
        : "text-slate-400 hover:text-white hover:bg-slate-800"
    }`;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden relative font-sans">
      <div className="absolute top-4 right-8 z-50">
        <AvatarMenu />
      </div>
      
      {/* Admin Sidebar */}
      <div className="w-64 bg-slate-900 flex flex-col">
        <div className="px-6 py-4 flex items-center h-16">
          <Link href="/admin" className="flex items-center gap-2">
            <Image src="/logo.svg" alt="MailFlow Logo" width={28} height={28} priority className="object-contain brightness-0 invert" />
            <div className="flex flex-col">
              <span className={`${orbitron.className} text-white text-sm tracking-wider leading-none`}>Mail Flow</span>
              <span className="text-xs text-blue-400 font-bold uppercase tracking-wider mt-0.5">Admin</span>
            </div>
          </Link>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-1 px-4">
            <li>
              <Link href="/admin" className={getLinkClasses("/admin")}>
                <LayoutDashboard className={`h-4 w-4 ${pathname === "/admin" ? "text-blue-400" : "text-slate-400"}`} /> Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/domains" className={getLinkClasses("/admin/domains")}>
                <Globe className={`h-4 w-4 ${pathname.startsWith("/admin/domains") ? "text-blue-400" : "text-slate-400"}`} /> Domains
              </Link>
            </li>
            <li>
              <Link href="/admin/users" className={getLinkClasses("/admin/users")}>
                <Users className={`h-4 w-4 ${pathname.startsWith("/admin/users") ? "text-blue-400" : "text-slate-400"}`} /> Users
              </Link>
            </li>
            <li>
              <Link href="/admin/groups" className={getLinkClasses("/admin/groups")}>
                <LayoutGrid className={`h-4 w-4 ${pathname.startsWith("/admin/groups") ? "text-blue-400" : "text-slate-400"}`} /> Groups
              </Link>
            </li>
            <li>
              <Link href="/admin/security" className={getLinkClasses("/admin/security")}>
                <Shield className={`h-4 w-4 ${pathname.startsWith("/admin/security") ? "text-blue-400" : "text-slate-400"}`} /> Security
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 px-4">
          <Link href="/inbox" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 px-3 py-2 rounded-md transition-colors">
            <Mail className="h-4 w-4" /> Back to Mail
          </Link>
        </div>
      </div>

      {/* Admin Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar (Header) */}
        <header className="h-16 flex items-center px-8 bg-white shrink-0">
          <h2 className="text-lg font-semibold text-gray-900 pr-16 capitalize">
            {pathname === "/admin" ? "Dashboard" : pathname.split('/').pop()}
          </h2>
        </header>
        {/* Main Page Content */}
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
