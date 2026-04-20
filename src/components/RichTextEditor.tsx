import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import { Type } from 'lucide-react';

interface RichTextEditorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  lineHeight?: number;
  onLineHeightChange?: (value: number) => void;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ 
  label, 
  value, 
  onChange, 
  placeholder,
  lineHeight,
  onLineHeightChange
}) => {
  const [isDark, setIsDark] = useState(false);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] block pl-1">{label}</label>
      
      <div className={`rounded-xl border border-gray-200 overflow-hidden flex flex-col ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white shadow-sm'}`}>
        {/* Integrated Toolbar Header */}
        <div className={`flex items-center justify-between px-3 py-1.5 border-b ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-100'}`}>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Formatting Tools</span>
          </div>
          
          <div className="flex items-center gap-4">
            {onLineHeightChange && (
              <div className="flex items-center gap-2 pr-4 border-r border-gray-200">
                <Type className={`w-3.5 h-3.5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
                <div className="flex items-center gap-2 min-w-[90px]">
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    step="0.1" 
                    value={lineHeight || 1.5}
                    onChange={(e) => onLineHeightChange(parseFloat(e.target.value))}
                    className="w-16 h-1 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <span className={`text-[10px] font-bold w-6 text-right ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {(lineHeight || 1.5).toFixed(1)}
                  </span>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-tight ${isDark ? 'text-gray-400' : 'text-gray-400'}`}>Mode Gelap</span>
              <button
                onClick={() => setIsDark(!isDark)}
                className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                  isDark ? 'bg-emerald-600' : 'bg-gray-300'
                }`}
              >
                <div
                  className={`inline-block h-3 w-3 transform rounded-full bg-white shadow-sm transition-transform ${
                    isDark ? 'translate-x-4' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          placeholder={placeholder}
          className={`quill-custom ${isDark ? 'quill-dark' : ''}`}
        />
      </div>

      <style>{`
        .quill-custom .ql-toolbar {
          border: none !important;
          border-bottom: 1px solid ${isDark ? '#374151' : '#f3f4f6'} !important;
          background: ${isDark ? '#1f2937' : '#fff'} !important;
          padding: 8px 12px !important;
        }
        .quill-custom .ql-container {
          border: none !important;
          min-height: 120px;
          font-family: inherit;
          background: transparent !important;
        }
        .quill-custom .ql-editor {
          padding: 16px !important;
          font-size: 14px;
          line-height: normal; /* We set line-height at generator level */
        }
        .quill-dark .ql-editor {
          color: #fff;
        }
        .quill-dark .ql-editor.ql-blank::before {
          color: #94a3b8;
        }
        .quill-custom .ql-editor p {
          margin-bottom: 0.5rem;
        }
        .quill-custom .ql-picker {
          color: ${isDark ? '#e2e8f0' : '#64748b'} !important;
        }
        .quill-custom .ql-stroke {
          stroke: ${isDark ? '#e2e8f0' : '#64748b'} !important;
        }
        .quill-custom .ql-fill {
          fill: ${isDark ? '#e2e8f0' : '#64748b'} !important;
        }
        .quill-custom .ql-picker-options {
          background-color: ${isDark ? '#1f2937' : '#fff'} !important;
          border-color: ${isDark ? '#374151' : '#e5e7eb'} !important;
          color: ${isDark ? '#fff' : '#000'} !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
