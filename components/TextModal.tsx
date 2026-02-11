'use client';

import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface TextModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

export default function TextModal({ title, content, onClose }: TextModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[80vh]">
        
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line leading-relaxed border border-gray-100 font-medium">
            {content}
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end">
          <button 
            onClick={handleCopy}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 transition-all ${copied ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200'}`}
          >
            {copied ? <><Check className="w-4 h-4" /> Copiado!</> : <><Copy className="w-4 h-4" /> Copiar Texto</>}
          </button>
        </div>

      </div>
    </div>
  );
}
