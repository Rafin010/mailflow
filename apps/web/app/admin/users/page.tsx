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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [domains, setDomains] = useState<any[]>([]);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
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

  useEffect(() => {
    loadUsers();
    
    // Load domains for the dropdown
    const loadDomains = async () => {
      try {
        const domRes = await fetchApi('/api/admin/v1/domains');
        if (domRes && domRes.items && domRes.items.length > 0) {
          setDomains(domRes.items);
          setSelectedDomain(domRes.items[0].domain_name);
        } else {
          setDomains([{ id: 'mock', domain_name: 'mailflow.dev' }]);
          setSelectedDomain('mailflow.dev');
        }
      } catch (err) {
        setDomains([{ id: 'mock', domain_name: 'mailflow.dev' }]);
        setSelectedDomain('mailflow.dev');
      }
    };
    loadDomains();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    try {
      const email = `${username}@${selectedDomain}`;
      await fetchApi('/api/admin/v1/users', {
        method: "POST",
        body: JSON.stringify({
          email: email,
          first_name: firstName,
          last_name: lastName,
          password: password,
          role: role,
        }),
      });
      setIsModalOpen(false);
      setFirstName(""); setLastName(""); setUsername(""); setPassword("");
      await loadUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to add user");
    } finally {
      setSubmitting(false);
    }
  };

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
          <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors">
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

      {/* Add User Slide-over */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-gray-900/40 transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
            <div className="w-full h-full bg-white shadow-2xl flex flex-col animate-fade-in">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add User</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new mail account for your organization</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-2 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                <form id="add-user-form" onSubmit={handleAddUser} className="p-6 space-y-6">
                  {errorMsg && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-100 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" /> {errorMsg}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">First Name</label>
                      <input required type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" placeholder="e.g. John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Last Name <span className="text-gray-400 font-normal">(Optional)</span></label>
                      <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" placeholder="e.g. Doe" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                    <div className="flex border border-gray-300 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-shadow bg-white">
                      <input required type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9.-_]/g, ''))} className="flex-1 px-3 py-2.5 text-sm focus:outline-none border-none ring-0" placeholder="username" />
                      <div className="bg-gray-50 border-l border-gray-300 px-3 flex items-center">
                        <span className="text-gray-500 text-sm font-medium mr-1">@</span>
                        <select value={selectedDomain} onChange={e => setSelectedDomain(e.target.value)} className="bg-transparent text-sm text-gray-700 focus:outline-none font-medium cursor-pointer">
                          {domains.map(d => <option key={d.id} value={d.domain_name}>{d.domain_name}</option>)}
                        </select>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">This will be the user's login ID and primary email address.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" placeholder="Minimum 8 characters" minLength={8} />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow cursor-pointer bg-white">
                      <option value="member">User</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1.5">Admins can manage settings. Users only have access to their mailbox.</p>
                  </div>
                </form>
              </div>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-200 bg-white border border-gray-300 rounded-md transition-colors shadow-sm">
                  Cancel
                </button>
                <button form="add-user-form" type="submit" disabled={submitting} className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Adding..." : "Add User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
