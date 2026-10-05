"use client";

import { useEffect, useState } from "react";
import { User, Search, Plus, MoreVertical } from "lucide-react";

import { fetchApi } from "@/lib/api";

interface UserData {
  id: string;
  name: string;
  email: string;
  status: "Active" | "Inactive";
  role: string;
  lastLogin: string;
}

const mockUsers: UserData[] = [
  { id: "1", name: "Alice Smith", email: "alice@example.com", status: "Active", role: "Super Admin", lastLogin: "Oct 4, 2026 10:23 AM" },
  { id: "2", name: "Bob Johnson", email: "bob@example.com", status: "Active", role: "User", lastLogin: "Oct 3, 2026 02:45 PM" },
  { id: "3", name: "Charlie Brown", email: "charlie@example.com", status: "Inactive", role: "User", lastLogin: "Sep 28, 2026 09:12 AM" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", status: "Active", role: "Admin", lastLogin: "Oct 5, 2026 08:30 AM" },
];

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const response = await fetchApi('/api/admin/v1/users');
        if (response && response.items) {
          setUsers(response.items.map((u: any) => ({
            id: u.id,
            name: u.display_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Unknown User',
            email: u.email,
            status: u.status === 'active' ? 'Active' : 'Inactive',
            role: u.role,
            lastLogin: u.created_at || 'Never'
          })));
        } else {
          setUsers(mockUsers);
        }
      } catch (err) {
        setUsers(mockUsers);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  return (
    <div className="bg-white rounded border border-gray-200">
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Users & Mailboxes</h2>
          <p className="text-sm text-gray-500 mt-1">Manage user accounts and email access</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-gray-500">Loading users...</div>
        ) : (
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email Address</th>
                <th className="px-6 py-3 font-medium">Role</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Last Login</th>
                <th className="px-6 py-3 font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-900">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500">{user.lastLogin}</td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
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
