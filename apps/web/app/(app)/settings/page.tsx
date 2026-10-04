"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/Switch";
import { Save } from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";

export default function GeneralSettingsPage() {
  const { settings, saveSettings } = useSettings();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

  // Sync draft if settings change globally
  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings);

  const handleSave = () => {
    saveSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const update = (key: keyof typeof draft, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 pr-16">
        <h1 className="text-2xl font-semibold text-gray-900">General Settings</h1>
        <div className="flex items-center gap-4">
          {saved && <span className="text-sm font-medium text-green-600 animate-fade-in">Settings saved!</span>}
          <button 
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="space-y-10">
        {/* Localization */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Region</h3>
          <div className="grid grid-cols-2 gap-6 max-w-xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
              <select 
                value={draft.timezone}
                onChange={(e) => update('timezone', e.target.value)}
                className="w-full bg-white text-gray-900 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="UTC">GMT / UTC</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="Asia/Dhaka">Bangladesh Time (BST)</option>
              </select>
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* List Options */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Mail View</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between max-w-xl">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Show message snippets</h4>
                <p className="text-sm text-gray-500">Show a brief preview of the message in the email list</p>
              </div>
              <Switch checked={draft.showSnippets} onChange={(v) => update('showSnippets', v)} />
            </div>

            <div className="flex items-center justify-between max-w-xl">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Hover actions</h4>
                <p className="text-sm text-gray-500">Enable quick actions (archive, delete) when hovering over emails</p>
              </div>
              <Switch checked={draft.hoverActions} onChange={(v) => update('hoverActions', v)} />
            </div>
          </div>
        </section>

        <hr className="border-gray-200" />

        {/* Notifications */}
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between max-w-xl">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Desktop Notifications</h4>
                <p className="text-sm text-gray-500">Get alerted when new emails arrive</p>
              </div>
              <Switch checked={draft.desktopNotifications} onChange={(v) => update('desktopNotifications', v)} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
