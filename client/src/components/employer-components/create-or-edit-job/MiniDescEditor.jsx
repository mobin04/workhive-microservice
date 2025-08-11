import React, { useEffect, useContext, useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Blockquote from "@tiptap/extension-blockquote";
import { TextStyle } from "@tiptap/extension-text-style";
import { Extension } from "@tiptap/core";
import { ThemeContext } from "../../../contexts/ThemeContext";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Type,
} from "lucide-react";

// Custom FontSize extension
const FontSize = Extension.create({
  name: "fontSize",

  addOptions() {
    return {
      types: ["textStyle"],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) =>
              element.style.fontSize?.replace(/['"]+/g, "") || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize) =>
        ({ chain }) => {
          return chain().setMark("textStyle", { fontSize }).run();
        },
      unsetFontSize:
        () =>
        ({ chain }) => {
          return chain()
            .setMark("textStyle", { fontSize: null })
            .removeEmptyTextStyle()
            .run();
        },
    };
  },
});

export default function MiniEditor({
  value = "",
  onChange,
  disabled = false,
  placeholder = "Enter job description...",
}) {
  const { isDark } = useContext(ThemeContext);
  const [activeFormats, setActiveFormats] = useState({});
  const [currentFontSize, setCurrentFontSize] = useState("16px");
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);

  const fontSizes = [
    { label: "Small", value: "12px" },
    { label: "Normal", value: "16px" },
    { label: "Large", value: "18px" },
    { label: "X-Large", value: "20px" },
  ];

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "bullet-list",
          },
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
          HTMLAttributes: {
            class: "ordered-list",
          },
        },
        listItem: {
          HTMLAttributes: {
            class: "list-item",
          },
        },
        paragraph: {
          HTMLAttributes: {
            class: "paragraph",
          },
        },
        hardBreak: {
          addKeyboardShortcuts() {
            return {
              "Shift-Enter": () => this.editor.commands.setHardBreak(),
            };
          },
        },
      }),
      Bold,
      Italic,
      Underline,
      Strike,
      Blockquote.configure({
        HTMLAttributes: {
          class: "blockquote",
        },
      }),
      TextStyle,
      FontSize,
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class: `prose prose-sm max-w-none focus:outline-none ${
          isDark ? "prose-invert" : ""
        }`,
        spellcheck: "true",
        "data-placeholder": placeholder,
      },
      handleKeyDown: (view, event) => {
        // Handle Enter key for better spacing control
        if (event.key === "Enter" && !event.shiftKey) {
          const { state } = view;
          const { selection } = state;
          const { $from } = selection;

          // If we're in a list, let TipTap handle it naturally
          if ($from.parent.type.name === "listItem") {
            return false;
          }

          // For paragraphs, let TipTap handle it naturally too
          return false;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      if (!isInternalUpdate) {
        const html = editor.getHTML();
        onChange?.(html);
        updateActiveFormats(editor);
      }
    },
    onSelectionUpdate: ({ editor }) => updateActiveFormats(editor),
    onFocus: ({ editor }) => updateActiveFormats(editor),
    editable: !disabled,
  });

  const updateActiveFormats = useCallback((editor) => {
    if (!editor) return;

    const formats = {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      underline: editor.isActive("underline"),
      strike: editor.isActive("strike"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      blockquote: editor.isActive("blockquote"),
    };

    setActiveFormats(formats);

    // Get current font size
    const fontSize = editor.getAttributes("textStyle").fontSize || "16px";
    setCurrentFontSize(fontSize);
  }, []);

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      setIsInternalUpdate(true);
      editor.commands.setContent(value || "", false);
      setIsInternalUpdate(false);
    }
  }, [value, editor]);

  const handleFontSizeChange = useCallback(
    (fontSize) => {
      if (editor) {
        if (fontSize === "16px") {
          editor.chain().focus().unsetFontSize().run();
        } else {
          editor.chain().focus().setFontSize(fontSize).run();
        }
        setCurrentFontSize(fontSize);
      }
    },
    [editor]
  );

  if (!editor) return null;

  const btnBase =
    "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";
  const btnActive = "bg-blue-600 text-white shadow-md hover:bg-blue-700";
  const btnInactive = isDark
    ? "bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600"
    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300";

  const toolbarButtons = [
    {
      name: "bold",
      icon: <BoldIcon className="w-4 h-4" />,
      label: "Bold (Ctrl+B)",
      cmd: () => editor.chain().focus().toggleBold().run(),
    },
    {
      name: "italic",
      icon: <ItalicIcon className="w-4 h-4" />,
      label: "Italic (Ctrl+I)",
      cmd: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      name: "underline",
      icon: <UnderlineIcon className="w-4 h-4" />,
      label: "Underline (Ctrl+U)",
      cmd: () => editor.chain().focus().toggleUnderline().run(),
    },
    {
      name: "strike",
      icon: <Strikethrough className="w-4 h-4" />,
      label: "Strikethrough",
      cmd: () => editor.chain().focus().toggleStrike().run(),
    },
    {
      name: "bulletList",
      icon: <List className="w-4 h-4" />,
      label: "Bullet List",
      cmd: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      name: "orderedList",
      icon: <ListOrdered className="w-4 h-4" />,
      label: "Numbered List",
      cmd: () => editor.chain().focus().toggleOrderedList().run(),
    },
    {
      name: "blockquote",
      icon: <Quote className="w-4 h-4" />,
      label: "Quote",
      cmd: () => editor.chain().focus().toggleBlockquote().run(),
    },
  ];

  return (
    <>
      <style>{`
        /* Clean editor styling with proper spacing */
        .ProseMirror {
          min-height: 150px;
          max-height: 400px;
          overflow-y: auto;
          padding: 12px;
          line-height: 1.4;
          font-size: 14px;
          white-space: pre-wrap;
        }
        
        .ProseMirror:focus {
          outline: none;
        }
        
        /* Paragraph styling - normal spacing */
        .ProseMirror p,
        .ProseMirror .paragraph {
          margin: 8px 0;
        }
        
        .ProseMirror p:first-child,
        .ProseMirror .paragraph:first-child {
          margin-top: 0;
        }
        
        .ProseMirror p:last-child,
        .ProseMirror .paragraph:last-child {
          margin-bottom: 0;
        }
        
        /* List styling - proper markers and spacing */
        .ProseMirror ul.bullet-list {
          list-style-type: disc;
          margin: 8px 0;
          padding-left: 20px;
        }
        
        .ProseMirror ol.ordered-list {
          list-style-type: decimal;
          margin: 8px 0;
          padding-left: 20px;
        }
        
        .ProseMirror li.list-item {
          display: list-item;
          margin: 4px 0;
          padding-left: 4px;
        }
        
        .ProseMirror li.list-item p {
          margin: 0;
          display: inline;
        }
        
        /* Nested lists */
        .ProseMirror ul.bullet-list ul.bullet-list {
          list-style-type: circle;
          margin: 4px 0;
          padding-left: 16px;
        }
        
        .ProseMirror ul.bullet-list ul.bullet-list ul.bullet-list {
          list-style-type: square;
        }
        
        .ProseMirror ol.ordered-list ol.ordered-list {
          list-style-type: lower-alpha;
          margin: 4px 0;
          padding-left: 16px;
        }
        
        .ProseMirror ol.ordered-list ol.ordered-list ol.ordered-list {
          list-style-type: lower-roman;
        }
        
        /* Blockquote styling */
        .ProseMirror blockquote.blockquote {
          border-left: 3px solid #3b82f6;
          padding: 5px 8px;
          margin: 12px 0;
          font-style: italic;
          color: ${isDark ? "#9ca3af" : "#6b7280"};
          background: ${isDark ? "#374151" : "#f9fafb"};
          border-radius: 0 4px 4px 0;
        }
          
        /* Hard break handling */
        .ProseMirror br {
          content: "\\A";
          white-space: pre;
        }
        
        /* Placeholder styling */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: ${isDark ? "#6b7280" : "#9ca3af"};
          pointer-events: none;
          font-style: italic;
        }
        
        /* Selection styling */
        .ProseMirror ::selection {
          background: ${isDark ? "#3b82f6" : "#bfdbfe"};
        }
        
        /* Focus styling */
        .ProseMirror-focused {
          box-shadow: none;
        }
        
        /* Clean spacing between different elements */
        .ProseMirror > * + * {
          margin-top: 8px;
        }
        
        .ProseMirror > *:first-child {
          margin-top: 0;
        }
        
        .ProseMirror > *:last-child {
          margin-bottom: 0;
        }
        
        /* Better list to paragraph transitions */
        .ProseMirror ul.bullet-list + p,
        .ProseMirror ol.ordered-list + p {
          margin-top: 8px;
        }
        
        .ProseMirror p + ul.bullet-list,
        .ProseMirror p + ol.ordered-list {
          margin-top: 8px;
        }
      `}</style>

      <div
        className={`border rounded-lg overflow-hidden shadow-sm ${
          isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"
        } ${disabled ? "opacity-60" : ""} ${
          editor?.isFocused ? "ring-2 ring-blue-500 ring-opacity-20" : ""
        }`}
      >
        {/* Toolbar */}
        <div
          className={`flex flex-wrap items-center gap-1 p-2 border-b ${
            isDark
              ? "border-gray-600 bg-gray-750"
              : "border-gray-200 bg-gray-50"
          }`}
        >
          {/* Font Size Selector */}
          <div className="flex items-center gap-2 mr-2">
            <Type className="w-4 h-4 text-gray-500" />
            <select
              value={currentFontSize}
              onChange={(e) => handleFontSizeChange(e.target.value)}
              disabled={disabled}
              className={`text-xs px-2 py-1 rounded border focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                isDark
                  ? "bg-gray-700 border-gray-600 text-gray-200"
                  : "bg-white border-gray-300 text-gray-700"
              }`}
            >
              {fontSizes.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Formatting Buttons */}
          {toolbarButtons.map(({ name, icon, label, cmd }) => (
            <button
              key={name}
              type="button"
              onClick={cmd}
              disabled={disabled}
              title={label}
              className={`${btnBase} ${
                activeFormats[name] ? btnActive : btnInactive
              }`}
              aria-label={label}
              aria-pressed={activeFormats[name]}
            >
              {icon}
            </button>
          ))}
        </div>

        {/* Editor Content */}
        <div className={`${isDark ? "bg-gray-800" : "bg-white"}`}>
          <EditorContent
            editor={editor}
            className="focus-within:ring-0"
            data-placeholder={placeholder}
          />
        </div>
      </div>
    </>
  );
}
