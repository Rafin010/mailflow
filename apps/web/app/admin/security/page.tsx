"use client";

import { useEffect, useState } from "react";
import { Shield, Smartphone, Key, Globe, Lock, AlertTriangle } from "lucide-react";

import { fetchApi } from "@/lib/api";

interface SecuritySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: React.ReactNode;
}

const mockSettings: SecuritySetting[] = [
  {
    id: "mfa",
    title: "Multi-Factor Authentication (MFA)",
    description: "Require users to provide two forms of identification when logging in.",
    enabled: true,
    icon: <Smartphone className="w-5 h-5 text-gray-600" />
  },
  {
    id: "pwd_policy",
    title: "Strict Password Policy",
    description: "Enforce passwords with at least 12 characters, mixing letters, numbers, and symbols.",
    enabled: true,
    icon: <Key className="w-5 h-5 text-gray-600" />
  },
  {
    id: "ip_restrict",
    title: "IP Restrictions",
    description: "Restrict access to the admin console from specific IP addresses or ranges.",
    enabled: false,
    icon: <Globe className="w-5 h-5 text-gray-600" />
  },
  {
    id: "session_timeout",
    title: "Idle Session Timeout",
    description: "Automatically log users out after 30 minutes of inactivity.",
    enabled: true,
    icon: <Lock className="w-5 h-5 text-gray-600" />
  },
  {
    id: "suspicious_login",
    title: "Suspicious Login Alerts",
    description: "Send email alerts to admins when logins occur from unusual locations.",
    enabled: true,
    icon: <AlertTriangle className="w-5 h-5 text-gray-600" />
  }
];

export default function Security() {
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPolicy = async () => {
      try {
        const policy = await fetchApi('/api/admin/v1/security/policy');
        if (policy) {
          const mergedSettings = mockSettings.map(s => {
            if (s.id === 'mfa' && policy.enforce_mfa !== undefined) return { ...s, enabled: policy.enforce_mfa };
            if (s.id === 'pwd_policy' && policy.password_require_symbol !== undefined) return { ...s, enabled: policy.password_require_symbol };
            if (s.id === 'session_timeout' && policy.session_timeout_minutes !== undefined) return { ...s, enabled: policy.session_timeout_minutes > 0 };
            return s;
          });
          setSettings(mergedSettings);
        } else {
          setSettings(mockSettings);
        }
      } catch (err) {
        setSettings(mockSettings);
      } finally {
        setLoading(false);
      }
    };
    loadPolicy();
  }, []);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h2 className="text-xl font-medium text-gray-900">Security & Compliance</h2>
        <p className="text-sm text-gray-500 mt-1">Manage security policies, authentication methods, and access controls</p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-sm text-gray-500 bg-white border border-gray-200 rounded">
          Loading security settings...
        </div>
      ) : (
        <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
          <div className="p-6 bg-gray-50/50 flex items-center space-x-3 border-b border-gray-100">
            <Shield className="w-5 h-5 text-blue-600" />
            <h3 className="font-medium text-gray-900">Global Security Policies</h3>
          </div>
          
          {settings.map((setting) => (
            <div key={setting.id} className="p-6 flex items-start justify-between hover:bg-gray-50/30 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-gray-50 rounded border border-gray-100 mt-0.5">
                  {setting.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{setting.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 max-w-lg">{setting.description}</p>
                </div>
              </div>
              <div className="ml-4">
                <button 
                  onClick={() => toggleSetting(setting.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    setting.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                  role="switch"
                  aria-checked={setting.enabled}
                >
                  <span 
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      setting.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
