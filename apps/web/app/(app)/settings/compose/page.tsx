"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useSettings } from "@/components/SettingsProvider";

export default function ComposeSettingsPage() {
  const { settings, saveSettings } = useSettings();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);

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
        <h1 className="text-2xl font-semibold text-gray-900">Compose and Reply</h1>
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
        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Undo Send</h3>
          <div className="flex items-center gap-4 max-w-xl">
            <label className="text-sm font-medium text-gray-700">Send cancellation period:</label>
            <select 
              value={draft.undoSendSeconds.toString()}
              onChange={(e) => update('undoSendSeconds', parseInt(e.target.value, 10))}
              className="bg-white text-gray-900 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-32"
            >
              <option value="0">Off</option>
              <option value="5">5 seconds</option>
              <option value="10">10 seconds</option>
              <option value="20">20 seconds</option>
              <option value="30">30 seconds</option>
            </select>
          </div>
        </section>

        <hr className="border-gray-200" />

        <section>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Default Reply Behavior</h3>
          <div className="space-y-3 max-w-xl">
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="reply" 
                value="reply"
                checked={draft.replyBehavior === 'reply'}
                onChange={() => update('replyBehavior', 'reply')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-800">Reply</span>
            </label>
            
            <label className="flex items-center gap-3 cursor-pointer">
              <input 
                type="radio" 
                name="reply" 
                value="reply-all"
                checked={draft.replyBehavior === 'reply-all'}
                onChange={() => update('replyBehavior', 'reply-all')}
                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-800">Reply All</span>
            </label>
          </div>
        </section>
      </div>
    </div>
  );
}
