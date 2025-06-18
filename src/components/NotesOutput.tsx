import React, { useState } from 'react';
import { GeneratedNotes, NoteFormat } from '../types';
import { Copy, Download, Edit3, Share, FileText, List, Lightbulb, HelpCircle, Layout, Check } from 'lucide-react';

interface NotesOutputProps {
  notes: GeneratedNotes;
  onFormatChange: (format: NoteFormat) => void;
  isRegenerating: boolean;
}

export default function NotesOutput({ notes, onFormatChange, isRegenerating }: NotesOutputProps) {
  const [copied, setCopied] = useState(false);

  const formatOptions: { value: NoteFormat; label: string; icon: React.ComponentType<any>; description: string }[] = [
    { value: 'summary', label: 'Summary', icon: FileText, description: 'Comprehensive overview' },
    { value: 'bullets', label: 'Bullet Points', icon: List, description: 'Key points organized' },
    { value: 'concepts', label: 'Key Concepts', icon: Lightbulb, description: 'Core ideas explained' },
    { value: 'qna', label: 'Q&A Format', icon: HelpCircle, description: 'Questions and answers' },
    { value: 'outline', label: 'Detailed Outline', icon: Layout, description: 'Hierarchical structure' }
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([notes.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-${notes.format}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-teal-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Edit3 className="w-5 h-5" />
          Generated Smart Notes
        </h2>
        <p className="text-green-100 text-sm mt-1">
          AI-powered structured notes from your transcript
        </p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Note Format</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {formatOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  onClick={() => onFormatChange(option.value)}
                  disabled={isRegenerating}
                  className={`p-3 rounded-lg border text-left transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    notes.format === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-2" />
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                </button>
              );
            })}
          </div>
        </div>

        {notes.keywords.length > 0 && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Extracted Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {notes.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={() => navigator.share?.({ text: notes.content, title: 'Generated Notes' })}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all"
          >
            <Share className="w-4 h-4" />
            Share
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {isRegenerating ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">Regenerating notes...</span>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div 
                className="prose max-w-none"
                style={{ whiteSpace: 'pre-wrap' }}
                dangerouslySetInnerHTML={{
                  __html: notes.content
                    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold text-gray-800 mt-6 mb-3">$1</h3>')
                    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
                    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-6">$1</h1>')
                    .replace(/^\*\*(.+)\*\*$/gm, '<p class="font-semibold text-gray-800 mt-4 mb-2">$1</p>')
                    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
                    .replace(/^• (.+)$/gm, '<li class="text-gray-700 mb-1">$1</li>')
                    .replace(/^  - (.+)$/gm, '<li class="text-gray-600 mb-1 ml-4">$1</li>')
                    .replace(/^(\d+\.) (.+)$/gm, '<li class="text-gray-700 mb-2">$2</li>')
                    .replace(/^([A-Z]\.) (.+)$/gm, '<li class="text-gray-700 mb-2 ml-4">$2</li>')
                    .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed mb-4">')
                    .replace(/^(?!<)(.+)$/gm, '<p class="text-gray-700 leading-relaxed mb-4">$1</p>')
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-4 text-xs text-gray-500 flex justify-between">
          <span>Generated: {notes.createdAt.toLocaleString()}</span>
          <span>Format: {formatOptions.find(f => f.value === notes.format)?.label}</span>
        </div>
      </div>
    </div>
  );
}