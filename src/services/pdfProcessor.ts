import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// Configure PDF.js worker - use a more reliable approach for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export class PDFProcessor {
  static async extractTextFromPDF(
    file: File,
    onProgress?: (progress: number, message: string) => void
  ): Promise<string> {
    try {
      onProgress?.(5, 'Initializing PDF processor...');
      
      // Validate file
      if (!file || file.type !== 'application/pdf') {
        throw new Error('Invalid PDF file');
      }

      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        throw new Error('PDF file is too large. Please use a file smaller than 50MB.');
      }

      onProgress?.(10, 'Loading PDF document...');
      
      const arrayBuffer = await file.arrayBuffer();
      
      // Load PDF with error handling
      let pdf;
      try {
        pdf = await pdfjsLib.getDocument({ 
          data: arrayBuffer,
          useSystemFonts: true,
          disableFontFace: false
        }).promise;
      } catch (pdfError) {
        throw new Error('Failed to load PDF. The file may be corrupted or password-protected.');
      }

      onProgress?.(20, `Processing ${pdf.numPages} pages...`);
      
      let fullText = '';
      let hasSelectableText = false;
      let totalTextLength = 0;
      
      // Extract selectable text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        try {
          const page = await pdf.getPage(pageNum);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .filter((item: any) => item.str && typeof item.str === 'string')
            .map((item: any) => item.str.trim())
            .filter(text => text.length > 0)
            .join(' ');
          
          if (pageText.length > 10) { // Meaningful text threshold
            hasSelectableText = true;
            fullText += pageText + '\n\n';
            totalTextLength += pageText.length;
          }
          
          onProgress?.(
            20 + (pageNum / pdf.numPages) * 30,
            `Extracting text from page ${pageNum}...`
          );
        } catch (pageError) {
          console.warn(`Error processing page ${pageNum}:`, pageError);
          // Continue with other pages
        }
      }
      
      // Clean up extracted text
      fullText = fullText
        .replace(/\s+/g, ' ') // Normalize whitespace
        .replace(/\n\s*\n/g, '\n\n') // Clean up line breaks
        .trim();
      
      // If we have sufficient selectable text, return it
      if (hasSelectableText && totalTextLength > 100) {
        onProgress?.(100, 'Text extraction completed successfully!');
        return fullText;
      }
      
      // If no selectable text or insufficient text, try OCR
      onProgress?.(60, 'No selectable text found. Initializing OCR...');
      
      let worker;
      try {
        worker = await createWorker('eng', 1, {
          logger: () => {} // Disable tesseract logging
        });
      } catch (ocrError) {
        throw new Error('Failed to initialize OCR engine. Please try a different PDF or check your internet connection.');
      }
      
      let ocrText = '';
      
      try {
        for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) { // Limit OCR to first 10 pages
          onProgress?.(
            60 + (pageNum / Math.min(pdf.numPages, 10)) * 35,
            `Processing page ${pageNum} with OCR...`
          );
          
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          
          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            throw new Error('Failed to create canvas context for OCR');
          }
          
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          
          // Render page to canvas
          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;
          
          // Convert to image and perform OCR
          const imageData = canvas.toDataURL('image/png');
          const { data: { text } } = await worker.recognize(imageData);
          
          if (text && text.trim().length > 10) {
            ocrText += text.trim() + '\n\n';
          }
        }
      } finally {
        if (worker) {
          await worker.terminate();
        }
      }
      
      // Combine results
      const combinedText = (fullText + '\n\n' + ocrText).trim();
      
      if (combinedText.length < 50) {
        throw new Error('Unable to extract meaningful text from this PDF. The document may contain only images, be encrypted, or be corrupted.');
      }
      
      onProgress?.(100, 'PDF processing completed successfully!');
      return combinedText;
      
    } catch (error) {
      console.error('PDF processing error:', error);
      
      if (error instanceof Error) {
        // Re-throw known errors
        throw error;
      }
      
      // Handle unknown errors
      throw new Error('An unexpected error occurred while processing the PDF. Please try again or use a different file.');
    }
  }
}