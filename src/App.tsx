import React, { useState } from 'react';
import Header from './components/Header';
import TranscriptInput from './components/TranscriptInput';
import ProcessingStatus from './components/ProcessingStatus';
import NotesOutput from './components/NotesOutput';
import { Transcript, GeneratedNotes, ProcessingStatus as ProcessingStatusType, NoteFormat } from './types';
import { notesProcessor } from './services/notesProcessor';

function App() {
  const [currentTranscript, setCurrentTranscript] = useState<Transcript | null>(null);
  const [generatedNotes, setGeneratedNotes] = useState<GeneratedNotes | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatusType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleTranscriptSubmit = async (transcript: Transcript) => {
    setCurrentTranscript(transcript);
    setGeneratedNotes(null);
    setIsProcessing(true);

    try {
      const notes = await notesProcessor.processTranscript(
        transcript,
        'summary',
        setProcessingStatus
      );
      setGeneratedNotes(notes);
    } catch (error) {
      console.error('Error processing transcript:', error);
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  const handleFormatChange = async (format: NoteFormat) => {
    if (!currentTranscript || !generatedNotes || generatedNotes.format === format) return;

    setIsRegenerating(true);

    try {
      const notes = await notesProcessor.processTranscript(
        currentTranscript,
        format,
        () => {} // No progress callback for format changes
      );
      setGeneratedNotes(notes);
    } catch (error) {
      console.error('Error regenerating notes:', error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleNewTranscript = () => {
    setCurrentTranscript(null);
    setGeneratedNotes(null);
    setProcessingStatus(null);
    setIsProcessing(false);
    setIsRegenerating(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {!generatedNotes && (
              <TranscriptInput
                onTranscriptSubmit={handleTranscriptSubmit}
                isProcessing={isProcessing}
              />
            )}
            
            {processingStatus && (
              <ProcessingStatus status={processingStatus} />
            )}

            {generatedNotes && !isProcessing && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Session</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Transcript:</span>
                    <p className="text-gray-900">{currentTranscript?.title}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Word Count:</span>
                    <p className="text-gray-900">{currentTranscript?.wordCount} words</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Generated:</span>
                    <p className="text-gray-900">{generatedNotes.createdAt.toLocaleString()}</p>
                  </div>
                </div>
                <button
                  onClick={handleNewTranscript}
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Start New Transcript
                </button>
              </div>
            )}
          </div>

          <div>
            {generatedNotes && (
              <NotesOutput
                notes={generatedNotes}
                onFormatChange={handleFormatChange}
                isRegenerating={isRegenerating}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2025 Smart Notes Generator. Powered by advanced AI processing for intelligent note generation.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;