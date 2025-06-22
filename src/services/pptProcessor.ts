import PizZip from 'pizzip';

export class PPTProcessor {
  static async extractTextFromPPT(
    file: File,
    onProgress?: (progress: number, message: string) => void
  ): Promise<string> {
    try {
      onProgress?.(10, 'Reading PPT file...');
      
      // Validate file
      if (!file) {
        throw new Error('No file provided');
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB limit
        throw new Error('PPT file is too large. Please use a file smaller than 100MB.');
      }

      onProgress?.(30, 'Processing presentation structure...');
      
      const arrayBuffer = await file.arrayBuffer();
      
      onProgress?.(50, 'Extracting slide content...');
      
      // Use PizZip to read the PPTX file
      const zip = new PizZip(arrayBuffer);
      
      onProgress?.(70, 'Parsing slide text...');
      
      let extractedText = '';
      let slideCount = 0;
      
      // Extract text from slides
      const slideFiles = Object.keys(zip.files).filter(filename => 
        filename.startsWith('ppt/slides/slide') && filename.endsWith('.xml')
      );
      
      for (const slideFile of slideFiles) {
        try {
          const slideXml = zip.files[slideFile].asText();
          const textMatches = slideXml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
          
          if (textMatches) {
            slideCount++;
            extractedText += `\n\n--- Slide ${slideCount} ---\n\n`;
            
            textMatches.forEach(match => {
              const text = match.replace(/<[^>]*>/g, '').trim();
              if (text && text.length > 0) {
                extractedText += text + '\n';
              }
            });
          }
        } catch (slideError) {
          console.warn(`Error processing slide ${slideFile}:`, slideError);
          // Continue with other slides
        }
      }
      
      onProgress?.(90, 'Cleaning up text...');
      
      // Clean up the extracted text
      extractedText = extractedText
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        .replace(/^\s+|\s+$/g, '')
        .trim();
      
      if (extractedText.length < 10) {
        throw new Error('No readable text found in the presentation. The file may be empty, corrupted, or contain only images.');
      }
      
      onProgress?.(100, 'PPT processing completed successfully!');
      return extractedText;
      
    } catch (error) {
      console.error('PPT processing error:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('Invalid or corrupted zip file')) {
          throw new Error('The PPT file appears to be corrupted or is not a valid PowerPoint file.');
        }
        throw error;
      }
      
      throw new Error('An unexpected error occurred while processing the PPT file. Please try again or use a different file.');
    }
  }
}