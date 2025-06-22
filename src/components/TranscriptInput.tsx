import React, { useState, useRef } from 'react';
import { Upload, FileText, Mic, Type, AlertCircle, Eye, Zap, CheckCircle, Presentation, File } from 'lucide-react';
import { Transcript } from '../types';
import { PDFProcessor } from '../services/pdfProcessor';
import { DOCProcessor } from '../services/docProcessor';
import { PPTProcessor } from '../services/pptProcessor';

interface TranscriptInputProps {
  onTranscriptSubmit: (transcript: Transcript) => void;
  isProcessing: boolean;
}

export default function TranscriptInput({ onTranscriptSubmit, isProcessing }: TranscriptInputProps) {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [inputMethod, setInputMethod] = useState<'text' | 'file'>('text');
  const [isExtractingFile, setIsExtractingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileProgress, setFileProgress] = useState<{ progress: number; message: string } | null>(null);
  const [fileSuccess, setFileSuccess] = useState(false);
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setFileError(null);
    setFileProgress(null);
    setFileSuccess(false);

    try {
      setIsExtractingFile(true);
      let extractedText = '';

      if (file.type === 'application/pdf') {
        extractedText = await PDFProcessor.extractTextFromPDF(
          file, 
          (progress, message) => {
            setFileProgress({ progress, message });
          }
        );
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.toLowerCase().endsWith('.docx')
      ) {
        extractedText = await DOCProcessor.extractTextFromDOC(
          file,
          (progress, message) => {
            setFileProgress({ progress, message });
          }
        );
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        file.name.toLowerCase().endsWith('.pptx')
      ) {
        extractedText = await PPTProcessor.extractTextFromPPT(
          file,
          (progress, message) => {
            setFileProgress({ progress, message });
          }
        );
      } else if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        // Handle text files
        setFileProgress({ progress: 50, message: 'Reading text file...' });
        
        const reader = new FileReader();
        reader.onload = (event) => {
          const result = event.target?.result as string;
          setContent(result);
          setTitle(file.name.replace(/\.[^/.]+$/, ''));
          setFileProgress({ progress: 100, message: 'File loaded successfully!' });
          setFileSuccess(true);
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            setFileSuccess(false);
            setIsExtractingFile(false);
            setFileProgress(null);
          }, 2000);
        };
        
        reader.onerror = () => {
          throw new Error('Failed to read the text file');
        };
        
        reader.readAsText(file);
        return; // Exit early for text files as they handle their own success flow
      } else {
        throw new Error('Unsupported file type. Please use PDF, DOCX, PPTX, TXT, or MD files.');
      }

      // For non-text files (PDF, DOC, PPT)
      setContent(extractedText);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setFileSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setFileSuccess(false), 3000);
        
    } catch (error) {
      setFileError(error instanceof Error ? error.message : 'Failed to process file');
    } finally {
      // Clear file input and states for non-text files
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setIsExtractingFile(false);
      setFileProgress(null);
    }
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
          Paste, upload, or extract text from your lecture transcript to generate intelligent notes
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
              accept=".txt,.md,.pdf,.docx,.pptx"
              onChange={handleFileUpload}
              className="hidden"
              disabled={isExtractingFile}
            />
            <div
              onClick={() => !isExtractingFile && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-all cursor-pointer ${
                isExtractingFile 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {isExtractingFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-3" />
                  <p className="text-blue-600 font-medium">
                    {fileProgress?.message || 'Processing file...'}
                  </p>
                  {fileProgress && (
                    <div className="w-full max-w-xs mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(fileProgress.progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${fileProgress.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Click to upload transcript file</p>
                  <p className="text-gray-400 text-sm mt-1">Supports PDF, DOCX, PPTX, TXT, and MD files</p>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-gray-500 max-w-md mx-auto">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>Text-based PDFs</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      <span>Scanned PDFs (OCR)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <File className="w-3 h-3" />
                      <span>Word Documents</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Presentation className="w-3 h-3" />
                      <span>PowerPoint Slides</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Text Files</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      <span>Markdown Files</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {fileSuccess && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-green-800 font-medium text-sm">File Processed Successfully!</h4>
                    <p className="text-green-700 text-sm mt-1">
                      Content has been extracted and is ready for note generation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {fileError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-red-800 font-medium text-sm">File Processing Error</h4>
                    <p className="text-red-700 text-sm mt-1">{fileError}</p>
                    <div className="mt-2 text-red-600 text-xs">
                      <p><strong>Troubleshooting tips:</strong></p>
                      <ul className="list-disc list-inside mt-1 space-y-1">
                        <li>Ensure the file is not password-protected or corrupted</li>
                        <li>Try a smaller file (under 100MB for Office files, 50MB for PDFs)</li>
                        <li>For scanned documents, ensure images are clear</li>
                        <li>Check that text files are properly encoded (UTF-8)</li>
                        <li>For older Office formats (.doc, .ppt), try saving as newer formats (.docx, .pptx)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
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
              disabled={isProcessing || isExtractingFile}
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
              disabled={isProcessing || isExtractingFile}
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
            disabled={!content.trim() || !title.trim() || isProcessing || isExtractingFile}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : isExtractingFile ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Extracting File...
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