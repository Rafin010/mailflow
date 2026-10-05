"use client";

import { useEffect, useState } from "react";
import { Users, Search, Plus, MoreVertical } from "lucide-react";

import { fetchApi } from "@/lib/api";

interface GroupData {
  id: string;
  name: string;
  email: string;
  membersCount: number;
  description: string;
}

const mockGroups: GroupData[] = [
  { id: "1", name: "Sales Team", email: "sales@example.com", membersCount: 12, description: "General sales inquiries and leads" },
  { id: "2", name: "Marketing", email: "marketing@example.com", membersCount: 8, description: "Marketing and PR team" },
  { id: "3", name: "Support", email: "support@example.com", membersCount: 24, description: "Customer support tickets" },
  { id: "4", name: "Engineering", email: "engineering@example.com", membersCount: 45, description: "Software development team" },
];

export default function Groups() {
  const [groups, setGroups] = useState<GroupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGroups = async () => {
      try {
        const response = await fetchApi('/api/admin/v1/groups');
        if (Array.isArray(response)) {
          setGroups(response.map((g: any) => ({
            id: g.id,
            name: g.name,
            email: g.email,
            membersCount: g.members_count || 0,
            description: g.description || ''
          })));
        } else {
          setGroups(mockGroups);
        }
      } catch (err) {
        setGroups(mockGroups);
      } finally {
        setLoading(false);
      }
    };
    loadGroups();
  }, []);

  return (
    <div className="bg-white rounded border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Groups</h2>
          <p className="text-sm text-gray-500 mt-1">Manage distribution lists and team groups</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search groups..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>Create Group</span>
          </button>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading groups...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Group Name</th>
                <th className="px-6 py-3 font-medium">Group Email</th>
                <th className="px-6 py-3 font-medium">Members</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50 transition-colors group/row">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-gray-900">{group.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{group.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {group.membersCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{group.description}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
