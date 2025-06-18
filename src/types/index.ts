export interface Transcript {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  wordCount: number;
}

export interface GeneratedNotes {
  id: string;
  transcriptId: string;
  format: NoteFormat;
  content: string;
  createdAt: Date;
  keywords: string[];
  summary: string;
}

export type NoteFormat = 'summary' | 'bullets' | 'concepts' | 'qna' | 'outline';

export interface ProcessingStatus {
  stage: 'analyzing' | 'extracting' | 'structuring' | 'finalizing' | 'complete';
  progress: number;
  message: string;
}