"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { Camera, Mail, Phone, ShieldCheck, Edit2, X, CalendarDays, UploadCloud } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryPhone, setRecoveryPhone] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setShowSuccess(false);
    setError("");

    try {
      // For now we mock the actual backend save since Phase 1 backend didn't implement /me update
      // But we can simulate a successful save for the UI
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setIsSaving(false);
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFirstName(user?.first_name || "");
    setLastName(user?.last_name || "");
    setError("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size exceeds 5MB limit. Please choose a smaller file.");
      return;
    }

    // Convert to object URL to preview
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  // Format join date mock
  const joinDate = new Date().toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });

  if (!user) return null;

  return (
    <div className="max-w-4xl p-10 pr-16 animate-fade-in pb-20">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your personal information and security details.</p>
        </div>
        
        {!isEditing ? (
          <button 
            onClick={() => setIsEditing(true)}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
          >
            <Edit2 className="h-4 w-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button 
              onClick={handleCancel}
              disabled={isSaving}
              className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}
      </div>

      {showSuccess && (
        <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-md border border-green-200 flex items-center gap-3 animate-fade-in">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <p className="text-sm font-medium">Profile updated successfully.</p>
        </div>
      )}
      
      {error && (
        <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-md border border-red-200 flex items-center gap-3 animate-fade-in">
          <X className="h-5 w-5 text-red-600" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="space-y-12">
        {/* Basic Info Section */}
        <section>
          <h2 className="text-lg font-medium text-gray-900 mb-6 flex items-center gap-2">
            Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center border-4 border-white shadow-md">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl text-blue-600 font-semibold">{user.first_name.charAt(0)}{user.last_name.charAt(0)}</span>
                  )}
                </div>
                
                {isEditing && (
                  <div 
                    className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="h-6 w-6 text-white mb-1" />
                    <span className="text-white text-xs font-medium">Upload (Max 5MB)</span>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/gif, image/webp" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange} 
                />
              </div>
              <p className="text-xs text-gray-500 mt-4 text-center">
                {isEditing ? "Click to upload an image." : "Your profile picture."}
              </p>
            </div>

            <div className="col-span-2 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="First name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
                    placeholder="Last name"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 bg-gray-100 rounded-md text-gray-600 text-sm cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">Primary email address cannot be changed.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border border-gray-200 w-fit">
                  <CalendarDays className="h-4 w-4 text-gray-500" />
                  Joined on {joinDate}
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Recovery System Section */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Account Recovery System</h2>
              <p className="text-sm text-gray-500 mt-1">Make sure you have recovery methods set up in case you lose access.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-50 p-2 rounded-full">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Recovery Email</h3>
                </div>
              </div>
              <input
                type="email"
                value={recoveryEmail}
                onChange={(e) => setRecoveryEmail(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Alternative email address"
              />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-50 p-2 rounded-full">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Recovery Phone</h3>
                </div>
              </div>
              <input
                type="tel"
                value={recoveryPhone}
                onChange={(e) => setRecoveryPhone(e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="+880 1711-xxxxxx"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
