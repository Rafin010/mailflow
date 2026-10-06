"use client";

import { useEffect, useState, useRef, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { User, Search, Plus, MoreVertical, X, AlertTriangle, Loader2, Eye, EyeOff, ChevronDown, ChevronUp, Check, Copy, Edit, Lock, Ban, Trash2 } from "lucide-react";

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

function CustomRoleSelect({ value, onChange }: { value: string, onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { value: "member", label: "User", desc: "Only has access to their mailbox." },
    { value: "admin", label: "Admin", desc: "Can manage settings and users." },
    { value: "super_admin", label: "Super Admin", desc: "Full access to all system features." }
  ];
  
  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow flex items-center justify-between text-left"
      >
        <span className="text-gray-900">{selected.label}</span>
        <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-[100] w-full bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 max-h-60 overflow-auto animate-fade-in">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => { onChange(option.value); setIsOpen(false); }}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-start gap-2 ${value === option.value ? 'bg-blue-50/50' : ''}`}
            >
              <div className="mt-0.5 w-4 flex justify-center shrink-0">
                {value === option.value && <Check className="w-4 h-4 text-blue-600" />}
              </div>
              <div>
                <div className={`text-sm ${value === option.value ? 'text-blue-700 font-medium' : 'text-gray-900'}`}>{option.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{option.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CustomDomainSelect({ value, onChange, domains }: { value: string, onChange: (val: string) => void, domains: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 bg-transparent text-sm text-gray-700 hover:text-gray-900 focus:outline-none font-medium py-1"
      >
        <span>{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-[100] max-h-60 overflow-auto animate-fade-in">
          {domains.map((d) => (
            <div
              key={d.id || d.domain_name}
              onClick={() => { onChange(d.domain_name); setIsOpen(false); }}
              className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 flex items-center justify-between ${value === d.domain_name ? 'bg-blue-50/50 text-blue-700 font-medium' : 'text-gray-700'}`}
            >
              <span className="truncate">{d.domain_name}</span>
              {value === d.domain_name && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const UserTableRow = memo(function UserTableRow({
  user,
  isOpen,
  onToggle,
  onClose
}: {
  user: UserData;
  isOpen: boolean;
  onToggle: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <tr className="hover:bg-gray-50 transition-colors group">
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
      <td className="px-6 py-4 text-right">
        <div className="relative inline-block text-left" data-dropdown="user-actions">
          <button 
            onClick={() => onToggle(user.id)}
            className={`p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all ${isOpen ? 'opacity-100 bg-gray-100' : 'opacity-0 group-hover:opacity-100'}`}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {isOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-md shadow-sm py-1 z-[50] animate-in fade-in zoom-in-95 duration-100 text-left">
              <button 
                onClick={onClose} 
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors group/item"
              >
                <Edit className="w-4 h-4 text-gray-400 group-hover/item:text-blue-600 transition-colors" />
                <span className="group-hover/item:text-blue-600 transition-colors">Edit User</span>
              </button>
              <button 
                onClick={onClose} 
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors group/item"
              >
                <Lock className="w-4 h-4 text-gray-400 group-hover/item:text-blue-600 transition-colors" />
                <span className="group-hover/item:text-blue-600 transition-colors">Reset Password</span>
              </button>
              <button 
                onClick={onClose} 
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors group/item"
              >
                <Ban className="w-4 h-4 text-gray-400 group-hover/item:text-orange-600 transition-colors" />
                <span className="group-hover/item:text-orange-600 transition-colors">Suspend User</span>
              </button>
              <div className="h-px bg-gray-100 my-1"></div>
              <button 
                onClick={onClose} 
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors group/item"
              >
                <Trash2 className="w-4 h-4 text-red-500 group-hover/item:text-red-700 transition-colors" />
                <span className="group-hover/item:text-red-700 transition-colors">Delete User</span>
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
});

export default function Users() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown="user-actions"]')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = useCallback((id: string) => {
    setOpenDropdownId(prev => prev === id ? null : id);
  }, []);

  const closeDropdown = useCallback(() => {
    setOpenDropdownId(null);
  }, []);

  const [domains, setDomains] = useState<any[]>([]);
  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedDomain, setSelectedDomain] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");
  const [submitting, setSubmitting] = useState(false);
  const [createdUser, setCreatedUser] = useState<{email: string, password: string} | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
      setCreatedUser({ email, password });
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
                <UserTableRow
                  key={user.id}
                  user={user}
                  isOpen={openDropdownId === user.id}
                  onToggle={toggleDropdown}
                  onClose={closeDropdown}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add User Slide-over */}
      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in flex flex-col max-h-[90vh]">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Add User</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Create a new mail account for your organization</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 p-2 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              
              {createdUser ? (
                <div className="p-8 flex flex-col items-center justify-center text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">User Created Successfully!</h3>
                  <p className="text-gray-500 text-sm mb-6 max-w-sm">Please copy the temporary password below and send it to the user securely. For security reasons, you won't be able to see it again.</p>
                  
                  <div className="w-full bg-gray-50 border border-gray-200 rounded-lg p-5 text-left space-y-4">
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Email Address</p>
                      <p className="text-sm font-medium text-gray-900 bg-white border border-gray-200 px-3 py-2 rounded">{createdUser.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1.5">Temporary Password</p>
                      <div className="flex items-center justify-between gap-2">
                        <code className="text-sm font-mono text-gray-900 bg-white px-3 py-2 rounded border border-gray-200 flex-1 overflow-hidden text-ellipsis">{createdUser.password}</code>
                        <button type="button" onClick={() => { navigator.clipboard.writeText(createdUser.password); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="text-blue-600 hover:text-blue-700 px-3 py-2 hover:bg-blue-50 rounded border border-transparent transition-colors flex items-center gap-1.5 text-sm font-medium shrink-0">
                          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          {copied ? <span className="text-green-600">Copied!</span> : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full pt-8">
                    <button type="button" onClick={() => { setIsModalOpen(false); setTimeout(() => { setCreatedUser(null); setFirstName(""); setLastName(""); setUsername(""); setPassword(""); setCopied(false); }, 300); }} className="w-full px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors shadow-sm">
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <>
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
                    <div className="flex border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-shadow bg-white relative">
                      <input required type="text" value={username} onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9.-_]/g, ''))} className="flex-1 px-3 py-2.5 text-sm focus:outline-none border-none ring-0 rounded-l-md bg-transparent" placeholder="username" />
                      <div className="bg-gray-50 border-l border-gray-300 px-3 flex items-center rounded-r-md">
                        <span className="text-gray-500 text-sm font-medium mr-1">@</span>
                        <CustomDomainSelect value={selectedDomain} onChange={setSelectedDomain} domains={domains} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5">This will be the user's login ID and primary email address.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                    <div className="relative">
                      <input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-md px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-shadow" placeholder="Minimum 8 characters" minLength={8} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
                    <CustomRoleSelect value={role} onChange={setRole} />
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
                </>
              )}
            </div>
        </div>,
        document.body
      )}
    </div>
  );
}
