"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useSettings, Signature } from "@/components/SettingsProvider";

export default function SignaturesSettingsPage() {
  const { settings, saveSettings } = useSettings();
  const [draft, setDraft] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [activeSigId, setActiveSigId] = useState<string | null>(settings.signatures[0]?.id ?? null);

  useEffect(() => {
    setDraft(settings);
    if (!settings.signatures.find(s => s.id === activeSigId) && settings.signatures.length > 0) {
      setActiveSigId(settings.signatures[0].id);
    }
  }, [settings]);

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(settings);
  const activeSig = draft.signatures.find((s) => s.id === activeSigId);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: activeSig?.html || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (activeSigId) {
        updateSignature(activeSigId, { html: editor.getHTML() });
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[150px] p-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-b-md',
      },
    },
  });

  // Re-sync editor if active signature changes
  useEffect(() => {
    if (editor && activeSig && editor.getHTML() !== activeSig.html) {
      editor.commands.setContent(activeSig.html);
    }
  }, [activeSigId, editor]); // intentionally missing activeSig so we don't reset on every keystroke

  const handleSave = () => {
    saveSettings(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const updateDraft = (key: keyof typeof draft, value: any) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const addSignature = () => {
    const id = Math.random().toString(36).substr(2, 9);
    const newSig: Signature = { id, name: `Signature ${draft.signatures.length + 1}`, html: "" };
    setDraft((prev) => ({ ...prev, signatures: [...prev.signatures, newSig] }));
    setActiveSigId(id);
  };

  const deleteSignature = (id: string) => {
    setDraft((prev) => {
      const sigs = prev.signatures.filter(s => s.id !== id);
      if (prev.defaultSignatureNew === id) prev.defaultSignatureNew = null;
      if (prev.defaultSignatureReply === id) prev.defaultSignatureReply = null;
      return { ...prev, signatures: sigs };
    });
    if (activeSigId === id) setActiveSigId(null);
  };

  const updateSignature = (id: string, patch: Partial<Signature>) => {
    setDraft((prev) => ({
      ...prev,
      signatures: prev.signatures.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 pr-16">
        <h1 className="text-2xl font-semibold text-gray-900">Signatures</h1>
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

      <div className="flex gap-8">
        {/* Signature List */}
        <div className="w-64 border border-gray-200 rounded-md bg-white flex flex-col h-[400px]">
          <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center shrink-0">
            <span className="text-sm font-semibold text-gray-700">My Signatures</span>
            <button onClick={addSignature} className="text-blue-600 hover:bg-blue-100 p-1 rounded transition-colors" title="Add Signature">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <ul className="divide-y divide-gray-100 flex-1 overflow-y-auto">
            {draft.signatures.length === 0 ? (
              <li className="p-4 text-center text-sm text-gray-500">No signatures yet</li>
            ) : (
              draft.signatures.map((sig) => (
                <li 
                  key={sig.id}
                  onClick={() => setActiveSigId(sig.id)}
                  className={`group p-3 flex items-center justify-between text-sm cursor-pointer transition-colors ${activeSigId === sig.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <span className="truncate pr-2">{sig.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteSignature(sig.id); }} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 p-1 rounded transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Editor */}
        <div className="flex-1">
          {!activeSig ? (
            <div className="h-[400px] flex items-center justify-center text-gray-400 border border-dashed border-gray-300 rounded-md">
              Select or create a signature
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Signature Name</label>
                <input 
                  type="text" 
                  value={activeSig.name}
                  onChange={(e) => updateSignature(activeSig.id, { name: e.target.value })}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-w-sm"
                />
              </div>

              <div className="border border-gray-200 rounded-t-md bg-white p-2 flex gap-2">
                <button 
                  className={`px-2 py-1 rounded text-sm font-bold transition-colors ${editor?.isActive('bold') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`} 
                  onClick={() => editor?.chain().focus().toggleBold().run()}
                >
                  B
                </button>
                <button 
                  className={`px-2 py-1 rounded text-sm italic transition-colors ${editor?.isActive('italic') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`} 
                  onClick={() => editor?.chain().focus().toggleItalic().run()}
                >
                  I
                </button>
                <button 
                  className={`px-2 py-1 rounded text-sm underline transition-colors ${editor?.isActive('underline') ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`} 
                  onClick={() => editor?.chain().focus().toggleUnderline().run()}
                >
                  U
                </button>
              </div>
              <EditorContent editor={editor} />
            </div>
          )}
          
          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col gap-4">
            <h4 className="text-sm font-medium text-gray-900">Signature defaults</h4>
            <div className="grid grid-cols-2 gap-4 max-w-sm">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">For new emails use</label>
                <select 
                  value={draft.defaultSignatureNew || ""}
                  onChange={(e) => updateDraft('defaultSignatureNew', e.target.value || null)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">No signature</option>
                  {draft.signatures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">On reply/forward use</label>
                <select 
                  value={draft.defaultSignatureReply || ""}
                  onChange={(e) => updateDraft('defaultSignatureReply', e.target.value || null)}
                  className="w-full bg-white text-gray-900 border border-gray-300 rounded-md py-1.5 px-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">No signature</option>
                  {draft.signatures.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
