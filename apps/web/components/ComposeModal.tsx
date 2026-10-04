"use client";

import { useState, useEffect, useRef } from "react";
import { 
  X, Paperclip, Image as ImageIcon, Link as LinkIcon, SendHorizontal,
  Bold, Italic, Strikethrough, Underline as UnderlineIcon, List, ListOrdered, AlignLeft, AlignCenter, AlignRight, Maximize2, Minimize2, Minus, ChevronDown, Check, Baseline, File as FileIcon, Highlighter
} from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import ImageExtension from '@tiptap/extension-image';
import { useSettings } from "@/components/SettingsProvider";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ToolbarButton = ({ onClick, isActive, disabled, children, title }: any) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
      isActive 
        ? 'bg-blue-100 text-blue-700' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    {children}
  </button>
);

const FONT_FAMILIES = [
  { label: "Sans Serif", value: "Arial, sans-serif" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Fixed width", value: "'Courier New', Courier, monospace" },
  { label: "Wide", value: "'Arial Black', sans-serif" },
  { label: "Narrow", value: "'Arial Narrow', sans-serif" },
  { label: "Comic Sans MS", value: "'Comic Sans MS', cursive" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
];

const FONT_SIZES = [
  { label: "Small", value: "12px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "24px" },
  { label: "Huge", value: "32px" },
];

const TEXT_COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#cccccc', '#ffffff',
  '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
];

const BG_COLORS = [
  'transparent', '#cccccc',
  '#ffcccc', '#ffda66', '#ffff99', '#ccffcc', '#ccffff', '#ccccff',
  '#ff9999', '#ffb366', '#ffff66', '#99ff99', '#99ffff', '#9999ff',
];

export function ComposeModal({ isOpen, onClose }: ComposeModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Menus
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showSizeMenu, setShowSizeMenu] = useState(false);
  const [showTextColorMenu, setShowTextColorMenu] = useState(false);
  const [showBgColorMenu, setShowBgColorMenu] = useState(false);
  
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkSelection, setLinkSelection] = useState<any>(null);

  interface Attachment {
    id: string;
    file: File;
    progress: number;
    status: 'uploading' | 'completed';
  }
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  // Refs for outside click
  const fontMenuRef = useRef<HTMLDivElement>(null);
  const sizeMenuRef = useRef<HTMLDivElement>(null);
  const textColorMenuRef = useRef<HTMLDivElement>(null);
  const bgColorMenuRef = useRef<HTMLDivElement>(null);
  const attachMenuRef = useRef<HTMLDivElement>(null);
  const linkMenuRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Undo Send state
  const [sendingState, setSendingState] = useState<"idle" | "countdown" | "sending">("idle");
  const [countdown, setCountdown] = useState(0);

  const { settings } = useSettings();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (fontMenuRef.current && !fontMenuRef.current.contains(event.target as Node)) setShowFontMenu(false);
      if (sizeMenuRef.current && !sizeMenuRef.current.contains(event.target as Node)) setShowSizeMenu(false);
      if (textColorMenuRef.current && !textColorMenuRef.current.contains(event.target as Node)) setShowTextColorMenu(false);
      if (bgColorMenuRef.current && !bgColorMenuRef.current.contains(event.target as Node)) setShowBgColorMenu(false);
      if (attachMenuRef.current && !attachMenuRef.current.contains(event.target as Node)) setShowAttachMenu(false);
      if (linkMenuRef.current && !linkMenuRef.current.contains(event.target as Node)) setShowLinkMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ 
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TextStyle,
      FontFamily,
      Color,
      FontSize,
      Highlight.configure({ multicolor: true }),
      ImageExtension.configure({
        inline: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-md border border-gray-200 my-2',
        },
      }),
    ],
    content: '<p></p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[300px] h-full w-full px-4 py-3 max-w-none',
      },
    },
  });

  useEffect(() => {
    if (isOpen && editor) {
      if (settings.defaultSignatureNew) {
        const sig = settings.signatures.find(s => s.id === settings.defaultSignatureNew);
        if (sig) {
          editor.commands.setContent(`<p></p><br/>${sig.html}`);
        } else {
          editor.commands.setContent('<p></p>');
        }
      } else {
        editor.commands.setContent('<p></p>');
      }
      setIsMinimized(false);
      setIsFullscreen(false);
      setAttachments([]);
    } else if (!isOpen) {
      setTo("");
      setSubject("");
      setSendingState("idle");
      setCountdown(0);
      setShowFontMenu(false);
      setShowSizeMenu(false);
      setShowTextColorMenu(false);
      setShowBgColorMenu(false);
      setShowAttachMenu(false);
      setShowLinkMenu(false);
      setAttachments([]);
    }
  }, [isOpen, editor, settings]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sendingState === "countdown" && countdown > 0) {
      timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    } else if (sendingState === "countdown" && countdown === 0) {
      executeSend();
    }
    return () => clearTimeout(timer);
  }, [sendingState, countdown]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (settings.undoSendSeconds > 0) {
      setCountdown(settings.undoSendSeconds);
      setSendingState("countdown");
    } else {
      executeSend();
    }
  };

  const cancelSend = () => {
    setSendingState("idle");
    setCountdown(0);
  };

  const executeSend = async () => {
    setSendingState("sending");
    try {
      await new Promise(r => setTimeout(r, 600));
    } catch (error) {
      console.error("API error:", error);
    } finally {
      onClose();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        id: Math.random().toString(36).substring(7),
        file,
        progress: 0,
        status: 'uploading' as const
      }));

      setAttachments(prev => [...prev, ...newFiles]);

      newFiles.forEach(attachment => {
        let currentProgress = 0;
        const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 20) + 10;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
          }
          
          setAttachments(prev => prev.map(a => 
            a.id === attachment.id 
              ? { ...a, progress: currentProgress, status: currentProgress === 100 ? 'completed' : 'uploading' }
              : a
          ));
        }, 300);
      });
    }
    setShowAttachMenu(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (editor && event.target?.result) {
          editor.chain().focus().setImage({ src: event.target.result as string }).run();
        }
      };
      reader.readAsDataURL(file);
    }
    setShowAttachMenu(false);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleInsertLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl && editor && linkSelection) {
      const validUrl = /^https?:\/\//i.test(linkUrl) ? linkUrl : `https://${linkUrl}`;
      editor.chain().focus().setTextSelection(linkSelection).setLink({ href: validUrl }).run();
    } else if (editor && linkSelection) {
      editor.chain().focus().setTextSelection(linkSelection).unsetLink().run();
    }
    setShowLinkMenu(false);
    setLinkUrl("");
    setLinkSelection(null);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  const currentFontFamily = editor?.getAttributes('textStyle').fontFamily || "Arial, sans-serif";
  const currentFontSize = editor?.getAttributes('textStyle').fontSize || "16px";
  const currentColor = editor?.getAttributes('textStyle').color || "#000000";
  const currentHighlight = editor?.getAttributes('highlight').color || "transparent";

  // Dynamic layout classes
  const modalClasses = isFullscreen
    ? "fixed inset-10 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden transition-all duration-200"
    : isMinimized
    ? "fixed bottom-0 right-24 w-[400px] bg-white rounded-t-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden transition-all duration-200 h-12"
    : "fixed bottom-0 right-24 w-[600px] bg-white rounded-t-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden transition-all duration-200 h-[600px]";

  return (
    <div className={modalClasses}>
      {/* Hidden inputs for attachments */}
      <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
      <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={handleImageUpload} />

      {/* Header */}
      <div 
        className="bg-slate-800 text-white px-4 flex items-center justify-between cursor-pointer h-12 shrink-0 rounded-t-xl"
        onClick={() => isMinimized && setIsMinimized(false)}
      >
        <h3 className="text-sm font-medium">New Message</h3>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} disabled={sendingState !== "idle"} className="p-1.5 text-gray-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50" title="Minimize">
            <Minus className="h-4 w-4" />
          </button>
          {!isMinimized && (
            <button onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); }} disabled={sendingState !== "idle"} className="p-1.5 text-gray-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50" title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} disabled={sendingState !== "idle"} className="p-1.5 text-gray-300 hover:text-white hover:bg-slate-700 rounded transition-colors disabled:opacity-50" title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="flex flex-col flex-1 overflow-hidden animate-fade-in">
          {/* Inputs */}
          <div className="px-4 py-2 border-b border-gray-100 flex items-center transition-colors focus-within:border-gray-300 shrink-0">
            <span className="text-gray-500 text-sm w-14">To</span>
            <input 
              type="email" 
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={sendingState !== "idle"}
              className="flex-1 outline-none text-sm text-gray-900 disabled:opacity-70 disabled:bg-white bg-transparent py-1" 
              placeholder="recipient@example.com"
            />
          </div>
          <div className="px-4 py-2 border-b border-gray-100 flex items-center transition-colors focus-within:border-gray-300 shrink-0">
            <input 
              type="text" 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={sendingState !== "idle"}
              className="flex-1 outline-none text-sm font-medium text-gray-900 disabled:opacity-70 disabled:bg-white bg-transparent py-1 placeholder:text-gray-500 placeholder:font-normal" 
              placeholder="Subject"
            />
          </div>

          {/* Tiptap Editor */}
          <div 
            className={`flex-1 overflow-y-auto bg-white cursor-text ${sendingState !== "idle" ? "pointer-events-none opacity-70" : ""}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                editor?.chain().focus().run();
              }
            }}
          >
            <EditorContent editor={editor} className="h-full" />
          </div>

          {/* Attachments List at the bottom */}
          {attachments.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50 flex flex-wrap gap-3 shrink-0 max-h-32 overflow-y-auto">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="group relative flex flex-col w-48 bg-white border border-gray-200 rounded-lg p-2.5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className={`p-1.5 rounded ${attachment.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <FileIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="truncate text-xs font-medium text-gray-700">{attachment.file.name}</span>
                        <span className="text-[10px] text-gray-400">{(attachment.file.size / 1024).toFixed(0)} KB</span>
                      </div>
                    </div>
                    <button onClick={() => removeAttachment(attachment.id)} className="text-gray-400 hover:text-red-500 transition-colors p-0.5 rounded-full hover:bg-red-50 opacity-0 group-hover:opacity-100">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  
                  {/* Progress Bar */}
                  {attachment.status === 'uploading' && (
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-auto overflow-hidden">
                      <div 
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300 ease-out" 
                        style={{ width: `${attachment.progress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer / Toolbar */}
          {sendingState === "countdown" ? (
            <div className="border-t p-4 bg-yellow-50 flex items-center justify-between shrink-0">
              <span className="text-sm text-yellow-800 font-medium animate-pulse">Sending in {countdown}s...</span>
              <button onClick={cancelSend} className="text-sm font-medium text-blue-600 hover:text-blue-800 underline">
                Undo
              </button>
            </div>
          ) : (
            <div className="border-t border-gray-100 p-3 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center flex-wrap gap-y-2 w-full">
                <div className="flex items-center gap-1 mr-4">
                  <div className="flex items-center rounded-full shadow-sm">
                    <button 
                      onClick={handleSend}
                      disabled={!to || sendingState !== "idle"}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-5 py-1.5 rounded-l-full text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {sendingState === "sending" ? (
                        <>Sending...</>
                      ) : (
                        <>
                          <span>Send</span>
                          <SendHorizontal className="h-4 w-4" />
                        </>
                      )}
                    </button>
                    <div className="w-px h-8 bg-blue-700/50"></div>
                    <button 
                      disabled={!to || sendingState !== "idle"}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-2 py-1.5 rounded-r-full flex items-center justify-center transition-colors"
                      title="More send options"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Attachments Menu */}
                  <div className="relative ml-2" ref={attachMenuRef}>
                    <button
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      disabled={sendingState !== "idle"}
                      className="p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center"
                      title="Attach files"
                    >
                      <Paperclip className="h-5 w-5" />
                    </button>
                    {showAttachMenu && (
                      <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 shadow-xl rounded-lg py-1.5 z-50 animate-fade-in">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <FileIcon className="h-4 w-4 text-gray-400" />
                          Upload File
                        </button>
                        <button 
                          onClick={() => imageInputRef.current?.click()}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                        >
                          <ImageIcon className="h-4 w-4 text-gray-400" />
                          Insert Image
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {editor && (
                  <div className="flex items-center bg-gray-50 rounded-md border border-gray-200 p-1 flex-wrap relative">
                    
                    {/* Font Family Dropdown */}
                    <div className="relative" ref={fontMenuRef}>
                      <button 
                        onClick={() => setShowFontMenu(!showFontMenu)}
                        disabled={sendingState !== "idle"}
                        className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1.5 rounded text-sm text-gray-700 disabled:opacity-50 transition-colors"
                        title="Font"
                      >
                        <span className="truncate max-w-[80px]">
                          {FONT_FAMILIES.find(f => currentFontFamily.includes(f.value.split(',')[0]))?.label || "Sans Serif"}
                        </span>
                        <ChevronDown className="h-3 w-3 opacity-70" />
                      </button>
                      {showFontMenu && (
                        <div className="absolute bottom-full left-0 mb-1 w-48 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50 animate-fade-in max-h-64 overflow-y-auto">
                          {FONT_FAMILIES.map(font => (
                            <button
                              key={font.label}
                              onClick={() => { editor.chain().focus().setFontFamily(font.value).run(); setShowFontMenu(false); }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center justify-between group"
                              style={{ fontFamily: font.value }}
                            >
                              <span className="text-gray-800 text-sm group-hover:text-blue-600">{font.label}</span>
                              {currentFontFamily.includes(font.value.split(',')[0]) && <Check className="h-4 w-4 text-blue-600" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-px h-5 bg-gray-300 mx-1"></div>

                    {/* Font Size Dropdown */}
                    <div className="relative" ref={sizeMenuRef}>
                      <button 
                        onClick={() => setShowSizeMenu(!showSizeMenu)}
                        disabled={sendingState !== "idle"}
                        className="flex items-center gap-1 hover:bg-gray-200 px-2 py-1.5 rounded text-sm text-gray-700 disabled:opacity-50 transition-colors font-serif"
                        title="Font Size"
                      >
                        <span className="text-base font-bold">T</span>T
                        <ChevronDown className="h-3 w-3 opacity-70 ml-0.5" />
                      </button>
                      {showSizeMenu && (
                        <div className="absolute bottom-full left-0 mb-1 w-32 bg-white border border-gray-200 shadow-xl rounded-md py-1 z-50 animate-fade-in">
                          {FONT_SIZES.map(size => (
                            <button
                              key={size.label}
                              onClick={() => { editor.chain().focus().setFontSize(size.value).run(); setShowSizeMenu(false); }}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 group"
                            >
                              {currentFontSize === size.value ? <Check className="h-4 w-4 text-blue-600 shrink-0" /> : <div className="w-4 shrink-0" />}
                              <span className="text-gray-800 group-hover:text-blue-600" style={{ fontSize: size.value }}>{size.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-px h-5 bg-gray-300 mx-1"></div>

                    {/* Standard Tools */}
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} disabled={sendingState !== "idle"} title="Bold (Ctrl+B)"><Bold className="h-4 w-4" /></ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} disabled={sendingState !== "idle"} title="Italic (Ctrl+I)"><Italic className="h-4 w-4" /></ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} disabled={sendingState !== "idle"} title="Underline (Ctrl+U)"><UnderlineIcon className="h-4 w-4" /></ToolbarButton>
                    
                    {/* Text Color Picker Menu */}
                    <div className="relative flex items-center" ref={textColorMenuRef}>
                      <button
                        onClick={() => setShowTextColorMenu(!showTextColorMenu)}
                        disabled={sendingState !== "idle"}
                        className="flex flex-col items-center justify-center h-8 w-8 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 ml-1"
                        title="Text Color"
                      >
                        <Baseline className="h-4 w-4 text-gray-700" />
                        <div className="h-1 w-4 rounded-sm mt-0.5" style={{ backgroundColor: currentColor }}></div>
                      </button>

                      {showTextColorMenu && (
                        <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-50 animate-fade-in">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Text Color</h4>
                          <div className="grid grid-cols-6 gap-2 mb-3">
                            {TEXT_COLORS.map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  editor.chain().focus().setColor(color).run();
                                  setShowTextColorMenu(false);
                                }}
                                className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center
                                  ${currentColor === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-gray-200'}`}
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-1">
                            <span className="text-xs text-gray-500 font-medium">Custom</span>
                            <input
                              type="color"
                              onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
                              value={currentColor}
                              className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer rounded-full overflow-hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Highlight Color Picker Menu */}
                    <div className="relative flex items-center" ref={bgColorMenuRef}>
                      <button
                        onClick={() => setShowBgColorMenu(!showBgColorMenu)}
                        disabled={sendingState !== "idle"}
                        className="flex flex-col items-center justify-center h-8 w-8 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 mr-1"
                        title="Highlight Color"
                      >
                        <Highlighter className="h-4 w-4 text-gray-700" />
                        <div className="h-1 w-4 rounded-sm mt-0.5" style={{ backgroundColor: currentHighlight === 'transparent' ? '#ccc' : currentHighlight }}></div>
                      </button>

                      {showBgColorMenu && (
                        <div className="absolute bottom-full left-0 mb-1 w-64 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-50 animate-fade-in">
                          <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">Highlight Color</h4>
                          <div className="grid grid-cols-6 gap-2 mb-3">
                            {BG_COLORS.map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  if (color === 'transparent') {
                                    editor.chain().focus().unsetHighlight().run();
                                  } else {
                                    editor.chain().focus().setHighlight({ color }).run();
                                  }
                                  setShowBgColorMenu(false);
                                }}
                                className={`w-6 h-6 rounded-full border shadow-sm transition-transform hover:scale-110 flex items-center justify-center
                                  ${currentHighlight === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-gray-200'}`}
                                style={{ backgroundColor: color === 'transparent' ? '#fff' : color }}
                                title={color === 'transparent' ? 'None' : color}
                              >
                                {color === 'transparent' && <span className="text-[10px] text-gray-400 font-bold leading-none">X</span>}
                              </button>
                            ))}
                          </div>
                          <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-1">
                            <span className="text-xs text-gray-500 font-medium">Custom</span>
                            <input
                              type="color"
                              onInput={event => editor.chain().focus().setHighlight({ color: (event.target as HTMLInputElement).value }).run()}
                              value={currentHighlight === 'transparent' ? '#ffffff' : currentHighlight}
                              className="w-6 h-6 p-0 border-0 bg-transparent cursor-pointer rounded-full overflow-hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="w-px h-5 bg-gray-300 mx-1"></div>
                    
                    <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} disabled={sendingState !== "idle"} title="Bullet List"><List className="h-4 w-4" /></ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} disabled={sendingState !== "idle"} title="Numbered List"><ListOrdered className="h-4 w-4" /></ToolbarButton>

                    <div className="w-px h-5 bg-gray-300 mx-1"></div>
                    
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} disabled={sendingState !== "idle"} title="Align Left"><AlignLeft className="h-4 w-4" /></ToolbarButton>
                    <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} disabled={sendingState !== "idle"} title="Align Center"><AlignCenter className="h-4 w-4" /></ToolbarButton>
                    
                    <div className="w-px h-5 bg-gray-300 mx-1"></div>
                    
                    {/* Custom Link Popover */}
                    <div className="relative flex items-center" ref={linkMenuRef}>
                      <button
                        onClick={() => {
                          if (editor.isActive('link')) {
                            editor.chain().focus().unsetLink().run();
                          } else {
                            // Save selection before opening popup
                            setLinkSelection(editor.state.selection);
                            const previousUrl = editor.getAttributes('link').href;
                            setLinkUrl(previousUrl || "");
                            setShowLinkMenu(true);
                          }
                        }}
                        disabled={sendingState !== "idle"}
                        className={`p-1.5 rounded transition-colors disabled:opacity-50 flex items-center justify-center ${
                          editor.isActive('link') ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                        title="Insert link (Ctrl+K)"
                      >
                        <LinkIcon className="h-4 w-4" />
                      </button>
                      
                      {showLinkMenu && (
                        <div className="absolute bottom-full -right-4 mb-1 w-72 bg-white border border-gray-200 shadow-xl rounded-lg p-3 z-50 animate-fade-in origin-bottom-right">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Link URL</label>
                          <form onSubmit={handleInsertLink} className="flex gap-2">
                            <input 
                              type="text" 
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              placeholder="https://example.com"
                              className="flex-1 px-2.5 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <button 
                              type="submit"
                              disabled={!linkUrl.trim()}
                              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
                            >
                              Add
                            </button>
                          </form>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
