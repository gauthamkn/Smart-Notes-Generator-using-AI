import React, { useState, useRef } from 'react';
import { Upload, FileText, Mic, Type } from 'lucide-react';
import { Transcript } from '../types';

interface TranscriptInputProps {
  onTranscriptSubmit: (transcript: Transcript) => void;
  isProcessing: boolean;
}

export default function TranscriptInput({ onTranscriptSubmit, isProcessing }: TranscriptInputProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !title.trim()) return;

    const transcript: Transcript = {
      id: Date.now().toString(),
      title: title.trim(),
      content: content.trim(),
      createdAt: new Date(),
      wordCount: content.trim().split(/\s+/).length
    };

    onTranscriptSubmit(transcript);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setContent(result);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsText(file);
  };

  const sampleTranscripts = [
    {
      title: "Introduction to Machine Learning",
      preview: "Today we'll explore the fundamental concepts of machine learning, including supervised and unsupervised learning paradigms..."
    },
    {
      title: "Climate Change and Environmental Policy",
      preview: "The relationship between human activity and climate change has become increasingly evident through decades of research..."
    },
    {
      title: "Modern Web Development Practices",
      preview: "Building scalable web applications requires understanding of modern frameworks, deployment strategies, and performance optimization..."
    }
  ];

  const loadSample = (sample: typeof sampleTranscripts[0]) => {
    setTitle(sample.title);
    setContent(`${sample.preview}

This is a comprehensive lecture covering multiple aspects of ${sample.title.toLowerCase()}. The discussion begins with foundational concepts and progresses through advanced applications.

Key topics include:
- Fundamental principles and theories
- Current research and developments  
- Practical applications and case studies
- Future trends and implications
- Hands-on examples and demonstrations

The lecture emphasizes both theoretical understanding and practical implementation, providing students with a complete framework for applying these concepts in real-world scenarios.

Throughout the presentation, we'll examine various methodologies, analyze successful case studies, and discuss common challenges encountered in professional practice. The goal is to provide a thorough understanding that bridges academic knowledge with industry applications.

Students will gain insights into best practices, learn to identify potential pitfalls, and develop strategies for continuous learning and adaptation in this rapidly evolving field.`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Lecture Transcript Input
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          Paste or upload your lecture transcript to generate intelligent notes
        </p>
      </div>

      <div className="p-6">
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setInputMethod('text')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              inputMethod === 'text'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Type className="w-4 h-4" />
            Type/Paste Text
          </button>
          <button
            type="button"
            onClick={() => setInputMethod('file')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              inputMethod === 'file'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
        </div>

        {inputMethod === 'file' && (
          <div className="mb-6">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
            >
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 font-medium">Click to upload transcript file</p>
              <p className="text-gray-400 text-sm mt-1">Supports TXT, MD, DOC, DOCX files</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Lecture Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a descriptive title for the lecture"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isProcessing}
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Transcript Content
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste the lecture transcript here or use the file upload option above..."
              rows={12}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              disabled={isProcessing}
            />
            <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
              <span>
                {content.trim() ? `${content.trim().split(/\s+/).length} words` : '0 words'}
              </span>
              <span>Minimum 50 words recommended</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || !title.trim() || isProcessing}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Generate Smart Notes
              </>
            )}
          </button>
        </form>

        {!content && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Try Sample Transcripts</h3>
            <div className="grid gap-3">
              {sampleTranscripts.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => loadSample(sample)}
                  className="text-left p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <h4 className="font-medium text-gray-900">{sample.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{sample.preview}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}