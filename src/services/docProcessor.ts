import mammoth from 'mammoth';

export class DOCProcessor {
  static async extractTextFromDOC(
    file: File,
    onProgress?: (progress: number, message: string) => void
  ): Promise<string> {
    try {
      onProgress?.(10, 'Reading DOC file...');
      
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error('DOC file is too large. Please use a file smaller than 100MB.');
      }

      onProgress?.(30, 'Processing document structure...');
      
      const arrayBuffer = await file.arrayBuffer();
      
      onProgress?.(60, 'Extracting text content...');
      
      // Use mammoth to extract text from .docx files
      const result = await mammoth.extractRawText({ arrayBuffer });
      
      onProgress?.(90, 'Cleaning up text...');
      
      const extractedText = result.value
        .replace(/\r\n/g, '\n')
        .replace(/\n\s*\n/g, '\n\n')
        .trim();
      
      if (extractedText.length < 10) {
        throw new Error('No readable text found in the document. The file may be empty or corrupted.');
      }
      
      onProgress?.(100, 'DOC processing completed successfully!');
      return extractedText;
      
    } catch (error) {
      console.error('DOC processing error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('not supported')) {
          throw new Error('This DOC format is not supported. Please try converting to DOCX format or use a different file.');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred while processing the DOC file. Please try again or use a different file.');
    }
  }
}