"use client";

import { useState } from "react";
import { ShieldCheck, Eye, EyeOff, Loader2, Save } from "lucide-react";

export default function SecuritySettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const hasChanges = currentPassword !== "" || newPassword !== "" || confirmPassword !== "";

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    if (!currentPassword) {
      setError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSaving(true);
    // Simulate network latency
    await new Promise((r) => setTimeout(r, 800));
    
    if (currentPassword === "wrongpassword") {
      setError("Current password is incorrect.");
      setIsSaving(false);
      return;
    }

    setSuccess(true);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsSaving(false);

    setTimeout(() => {
      setSuccess(false);
    }, 5000);
  };

  const inputClasses = "w-full bg-white text-gray-900 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 pr-16">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Security</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your password and secure your Mail Flow account.</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>

      <div className="space-y-10">
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
          
          <div className="max-w-xl space-y-6">
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-sm text-red-700 border border-red-200 animate-fade-in">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-md bg-green-50 text-sm text-green-700 border border-green-200 flex items-center gap-2 animate-fade-in">
                <ShieldCheck className="h-4 w-4 text-green-600" />
                Password successfully updated.
              </div>
            )}

            <div>
              <label htmlFor="current" className={labelClasses}>Current Password</label>
              <div className="relative">
                <input
                  id="current"
                  type={showCurrent ? "text" : "password"}
                  className={inputClasses}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="new_password" className={labelClasses}>New Password</label>
              <div className="relative">
                <input
                  id="new_password"
                  type={showNew ? "text" : "password"}
                  className={inputClasses}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isSaving}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters long.</p>
            </div>

            <div>
              <label htmlFor="confirm_password" className={labelClasses}>Confirm New Password</label>
              <input
                id="confirm_password"
                type={showNew ? "text" : "password"}
                className={inputClasses}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSaving}
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
