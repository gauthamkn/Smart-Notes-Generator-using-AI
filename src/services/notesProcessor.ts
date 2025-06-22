import { Transcript, GeneratedNotes, NoteFormat, ProcessingStatus } from '../types';

class NotesProcessor {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async processTranscript(
    transcript: Transcript,
    format: NoteFormat,
    onProgress?: (status: ProcessingStatus) => void
  ): Promise<GeneratedNotes> {
    const stages: ProcessingStatus[] = [
      { stage: 'analyzing', progress: 20, message: 'Analyzing transcript content...' },
      { stage: 'extracting', progress: 45, message: 'Extracting key information...' },
      { stage: 'structuring', progress: 70, message: 'Structuring notes...' },
      { stage: 'finalizing', progress: 90, message: 'Finalizing output...' },
      { stage: 'complete', progress: 100, message: 'Notes generated successfully!' }
    ];

    for (const status of stages) {
      onProgress?.(status);
      await this.delay(800 + Math.random() * 400);
    }

    return this.generateNotes(transcript, format);
  }

  private generateNotes(transcript: Transcript, format: NoteFormat): GeneratedNotes {
    const keywords = this.extractKeywords(transcript.content);
    const summary = this.generateSummary(transcript.content);
    
    let content: string;
    
    switch (format) {
      case 'summary':
        content = this.generateSummaryNotes(transcript.content, transcript.title);
        break;
      case 'bullets':
        content = this.generateBulletNotes(transcript.content, transcript.title);
        break;
      case 'concepts':
        content = this.generateConceptNotes(transcript.content, transcript.title);
        break;
      case 'qna':
        content = this.generateQANotes(transcript.content, transcript.title);
        break;
      case 'outline':
        content = this.generateOutlineNotes(transcript.content, transcript.title);
        break;
      default:
        content = this.generateSummaryNotes(transcript.content, transcript.title);
    }

    return {
      id: Date.now().toString(),
      transcriptId: transcript.id,
      format,
      content,
      createdAt: new Date(),
      keywords,
      summary
    };
  }

  private extractKeywords(content: string): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'this', 'that', 'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
      'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'can', 'may', 'might', 'must', 'shall', 'from', 'up', 'out', 'down', 'off', 'over',
      'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
      'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other',
      'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too',
      'very', 'just', 'now', 'also', 'well', 'like', 'get', 'go', 'come', 'know',
      'think', 'see', 'make', 'take', 'say', 'tell', 'give', 'find', 'use', 'work',
      'call', 'try', 'ask', 'need', 'feel', 'become', 'leave', 'put', 'mean', 'keep',
      'let', 'begin', 'seem', 'help', 'talk', 'turn', 'start', 'show', 'hear', 'play',
      'run', 'move', 'live', 'believe', 'hold', 'bring', 'happen', 'write', 'provide',
      'sit', 'stand', 'lose', 'pay', 'meet', 'include', 'continue', 'set', 'learn',
      'change', 'lead', 'understand', 'watch', 'follow', 'stop', 'create', 'speak',
      'read', 'allow', 'add', 'spend', 'grow', 'open', 'walk', 'win', 'offer', 'remember',
      'love', 'consider', 'appear', 'buy', 'wait', 'serve', 'die', 'send', 'expect',
      'build', 'stay', 'fall', 'cut', 'reach', 'kill', 'remain'
    ]);

    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    const frequency: { [key: string]: number } = {};
    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return Object.entries(frequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
  }

  private generateSummary(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length === 0) return content.substring(0, 150) + '...';
    
    // Take first 2-3 sentences or up to 200 characters
    let summary = '';
    for (let i = 0; i < Math.min(3, sentences.length); i++) {
      const sentence = sentences[i].trim();
      if (summary.length + sentence.length < 200) {
        summary += sentence + '. ';
      } else {
        break;
      }
    }
    
    return summary.trim() || content.substring(0, 150) + '...';
  }

  private extractMainTopics(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const topics: string[] = [];
    
    // Look for topic indicators
    const topicIndicators = [
      /(?:first|firstly|initially|to begin|starting with|let's start|we begin)/i,
      /(?:second|secondly|next|then|following|after that|moving on)/i,
      /(?:third|thirdly|another|also|additionally|furthermore|moreover)/i,
      /(?:finally|lastly|in conclusion|to conclude|to summarize)/i,
      /(?:important|key|main|primary|essential|crucial|significant)/i,
      /(?:topic|subject|concept|idea|principle|theory|method|approach)/i
    ];

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed.length > 30 && trimmed.length < 150) {
        // Check if sentence contains topic indicators
        const hasTopicIndicator = topicIndicators.some(pattern => pattern.test(trimmed));
        if (hasTopicIndicator || trimmed.split(' ').length < 20) {
          topics.push(trimmed);
        }
      }
    });

    return topics.slice(0, 8); // Return up to 8 main topics
  }

  private extractKeyPoints(content: string): string[] {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 15);
    const keyPoints: string[] = [];
    
    // Look for sentences that seem to contain important information
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      const words = trimmed.toLowerCase();
      
      // Score sentences based on importance indicators
      let score = 0;
      
      // Boost score for sentences with important keywords
      const importantWords = ['important', 'key', 'main', 'primary', 'essential', 'crucial', 'significant', 'fundamental', 'basic', 'core'];
      importantWords.forEach(word => {
        if (words.includes(word)) score += 2;
      });
      
      // Boost score for sentences with numbers or statistics
      if (/\d+/.test(trimmed)) score += 1;
      
      // Boost score for sentences with definitions
      if (words.includes('is') || words.includes('are') || words.includes('means') || words.includes('refers')) score += 1;
      
      // Prefer medium-length sentences
      if (trimmed.length > 30 && trimmed.length < 200) score += 1;
      
      if (score >= 2 && trimmed.length > 20) {
        keyPoints.push(trimmed);
      }
    });

    // If we don't have enough key points, add some well-formed sentences
    if (keyPoints.length < 5) {
      sentences.forEach(sentence => {
        const trimmed = sentence.trim();
        if (trimmed.length > 40 && trimmed.length < 150 && !keyPoints.includes(trimmed)) {
          keyPoints.push(trimmed);
        }
      });
    }

    return keyPoints.slice(0, 10);
  }

  private generateSummaryNotes(content: string, title: string): string {
    const keyPoints = this.extractKeyPoints(content);
    const mainTopics = this.extractMainTopics(content);
    
    let notes = `# ${title}\n\n## Executive Summary\n\n`;
    
    // Generate summary from first few sentences
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    if (sentences.length > 0) {
      const summaryText = sentences.slice(0, 3).join('. ').trim() + '.';
      notes += `${summaryText}\n\n`;
    }
    
    if (mainTopics.length > 0) {
      notes += `## Main Topics Covered\n\n`;
      mainTopics.forEach((topic, index) => {
        notes += `${index + 1}. ${topic}\n`;
      });
      notes += '\n';
    }
    
    if (keyPoints.length > 0) {
      notes += `## Key Points\n\n`;
      keyPoints.forEach(point => {
        notes += `• ${point}\n`;
      });
      notes += '\n';
    }
    
    // Add conclusion
    const lastSentences = sentences.slice(-2);
    if (lastSentences.length > 0) {
      notes += `## Conclusion\n\n${lastSentences.join('. ').trim()}.`;
    }
    
    return notes;
  }

  private generateBulletNotes(content: string, title: string): string {
    const keyPoints = this.extractKeyPoints(content);
    const mainTopics = this.extractMainTopics(content);
    
    let notes = `# ${title} - Key Points\n\n`;
    
    if (mainTopics.length > 0) {
      notes += `## Main Topics\n\n`;
      mainTopics.forEach(topic => {
        notes += `• **${topic}**\n`;
      });
      notes += '\n';
    }
    
    if (keyPoints.length > 0) {
      notes += `## Important Points\n\n`;
      keyPoints.forEach(point => {
        notes += `• ${point}\n`;
      });
      notes += '\n';
    }
    
    // Extract any numbered lists or structured content
    const numberedItems = content.match(/\d+\.\s+[^.]+/g);
    if (numberedItems && numberedItems.length > 0) {
      notes += `## Structured Information\n\n`;
      numberedItems.forEach(item => {
        notes += `• ${item.replace(/^\d+\.\s*/, '')}\n`;
      });
    }
    
    return notes;
  }

  private generateConceptNotes(content: string, title: string): string {
    const keyPoints = this.extractKeyPoints(content);
    const keywords = this.extractKeywords(content);
    
    let notes = `# ${title} - Key Concepts\n\n`;
    
    // Extract definitions and explanations
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const definitions: string[] = [];
    const explanations: string[] = [];
    
    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      const lower = trimmed.toLowerCase();
      
      if (lower.includes(' is ') || lower.includes(' are ') || lower.includes(' means ') || lower.includes(' refers to ')) {
        definitions.push(trimmed);
      } else if (lower.includes('because') || lower.includes('therefore') || lower.includes('thus') || lower.includes('consequently')) {
        explanations.push(trimmed);
      }
    });
    
    if (keywords.length > 0) {
      notes += `## Key Terms\n\n`;
      keywords.forEach(keyword => {
        // Try to find context for each keyword
        const contextSentence = sentences.find(s => 
          s.toLowerCase().includes(keyword.toLowerCase()) && s.length < 200
        );
        if (contextSentence) {
          notes += `### ${keyword}\n${contextSentence.trim()}\n\n`;
        } else {
          notes += `### ${keyword}\n*Key term mentioned in the content*\n\n`;
        }
      });
    }
    
    if (definitions.length > 0) {
      notes += `## Definitions & Explanations\n\n`;
      definitions.slice(0, 5).forEach(def => {
        notes += `• ${def}\n`;
      });
      notes += '\n';
    }
    
    if (explanations.length > 0) {
      notes += `## Cause & Effect Relationships\n\n`;
      explanations.slice(0, 5).forEach(exp => {
        notes += `• ${exp}\n`;
      });
    }
    
    return notes;
  }

  private generateQANotes(content: string, title: string): string {
    const keyPoints = this.extractKeyPoints(content);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    let notes = `# ${title} - Q&A Format\n\n`;
    
    // Generate questions based on content
    const questions: Array<{question: string, answer: string}> = [];
    
    // Look for question-like content or create questions from key points
    keyPoints.forEach(point => {
      if (point.includes('what') || point.includes('how') || point.includes('why') || point.includes('when') || point.includes('where')) {
        // If the point is already a question, use it
        questions.push({
          question: point.endsWith('?') ? point : point + '?',
          answer: 'Based on the content provided in the transcript.'
        });
      } else {
        // Generate a question from the statement
        let question = '';
        const lower = point.toLowerCase();
        
        if (lower.includes(' is ') || lower.includes(' are ')) {
          question = `What ${point.substring(point.toLowerCase().indexOf(' is ') + 4)}?`;
        } else if (lower.includes('because') || lower.includes('due to')) {
          question = `Why ${point.split(/because|due to/i)[0].trim()}?`;
        } else {
          question = `What can you tell me about: ${point.split(' ').slice(0, 8).join(' ')}?`;
        }
        
        questions.push({
          question: question,
          answer: point
        });
      }
    });
    
    // Add some general questions
    questions.push({
      question: `What is the main topic of "${title}"?`,
      answer: sentences.length > 0 ? sentences[0].trim() : 'This content covers the main concepts and ideas presented in the transcript.'
    });
    
    if (sentences.length > 2) {
      questions.push({
        question: 'What are the key takeaways from this content?',
        answer: keyPoints.slice(0, 3).join(' ') || 'The key takeaways include the main concepts and practical applications discussed.'
      });
    }
    
    // Format as Q&A
    questions.slice(0, 8).forEach((qa, index) => {
      notes += `## Q${index + 1}: ${qa.question}\n\n**A:** ${qa.answer}\n\n`;
    });
    
    return notes;
  }

  private generateOutlineNotes(content: string, title: string): string {
    const mainTopics = this.extractMainTopics(content);
    const keyPoints = this.extractKeyPoints(content);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    
    let notes = `# ${title} - Detailed Outline\n\n`;
    
    notes += `## I. Introduction\n`;
    if (sentences.length > 0) {
      notes += `   A. ${sentences[0].trim()}\n`;
      if (sentences.length > 1) {
        notes += `   B. ${sentences[1].trim()}\n`;
      }
    }
    notes += '\n';
    
    if (mainTopics.length > 0) {
      mainTopics.forEach((topic, index) => {
        const romanNumeral = ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][index] || `${index + 2}`;
        notes += `## ${romanNumeral}. ${topic}\n`;
        
        // Try to find related key points for this topic
        const relatedPoints = keyPoints.filter(point => 
          topic.toLowerCase().split(' ').some(word => 
            word.length > 3 && point.toLowerCase().includes(word)
          )
        );
        
        if (relatedPoints.length > 0) {
          relatedPoints.slice(0, 3).forEach((point, pointIndex) => {
            const letter = String.fromCharCode(65 + pointIndex); // A, B, C...
            notes += `   ${letter}. ${point}\n`;
          });
        } else {
          notes += `   A. Key aspects and details\n   B. Practical applications\n`;
        }
        notes += '\n';
      });
    }
    
    // Add remaining key points as additional sections
    const remainingPoints = keyPoints.filter(point => 
      !mainTopics.some(topic => 
        topic.toLowerCase().split(' ').some(word => 
          word.length > 3 && point.toLowerCase().includes(word)
        )
      )
    );
    
    if (remainingPoints.length > 0) {
      const nextRoman = mainTopics.length > 0 ? 
        ['II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][mainTopics.length] || `${mainTopics.length + 2}` : 
        'II';
      notes += `## ${nextRoman}. Additional Key Points\n`;
      remainingPoints.slice(0, 5).forEach((point, index) => {
        const letter = String.fromCharCode(65 + index);
        notes += `   ${letter}. ${point}\n`;
      });
      notes += '\n';
    }
    
    // Add conclusion
    if (sentences.length > 2) {
      const conclusionRoman = mainTopics.length > 0 ? 
        ['III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'][mainTopics.length] || `${mainTopics.length + 3}` : 
        'III';
      notes += `## ${conclusionRoman}. Conclusion\n`;
      const lastSentences = sentences.slice(-2);
      lastSentences.forEach((sentence, index) => {
        const letter = String.fromCharCode(65 + index);
        notes += `   ${letter}. ${sentence.trim()}\n`;
      });
    }
    
    return notes;
  }
}

export const notesProcessor = new NotesProcessor();