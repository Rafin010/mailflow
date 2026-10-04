"use client";

import { useEffect, useState } from "react";
import { fetchApi } from "@/lib/api";
import { Users, Globe, LayoutGrid, HardDrive, ShieldAlert, Activity } from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  users: { total: number; active: number };
  domains: { total: number; verified: number };
  groups: number;
  aliases: number;
  storage: { total_used_mb: number; total_allocated_mb: number };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await fetchApi("/api/admin/v1/dashboard");
        setStats(data);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading || !stats) {
    return <div className="animate-pulse flex space-x-4">
      <div className="flex-1 space-y-4 py-1">
        <div className="h-2 bg-slate-200 rounded"></div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-2 bg-slate-200 rounded col-span-2"></div>
            <div className="h-2 bg-slate-200 rounded col-span-1"></div>
          </div>
          <div className="h-2 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>;
  }

  const statCards = [
    { name: "Total Users", value: stats.users.total, icon: Users, color: "text-blue-600", bg: "bg-blue-50", link: "/admin/users" },
    { name: "Verified Domains", value: `${stats.domains.verified} / ${stats.domains.total}`, icon: Globe, color: "text-emerald-600", bg: "bg-emerald-50", link: "/admin/domains" },
    { name: "Groups", value: stats.groups, icon: LayoutGrid, color: "text-purple-600", bg: "bg-purple-50", link: "/admin/groups" },
    { name: "Storage Used", value: `${(stats.storage.total_used_mb / 1024).toFixed(2)} GB`, icon: HardDrive, color: "text-amber-600", bg: "bg-amber-50", link: "/admin/users" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((item) => (
          <Link key={item.name} href={item.link} className="bg-white overflow-hidden shadow-sm rounded-lg hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-3 rounded-md ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                    <dd>
                      <div className="text-2xl font-semibold text-gray-900">{item.value}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-gray-400" />
            Security Alerts
          </h3>
          <div className="text-sm text-gray-500 text-center py-8">
            No active security alerts for your organization.
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-gray-400" />
            Recent Activity
          </h3>
          <div className="text-sm text-gray-500 text-center py-8">
            <Link href="/admin/security" className="text-blue-600 hover:underline">
              View Audit Logs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
