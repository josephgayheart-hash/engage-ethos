// Reading Level Analysis Utilities

export interface ReadingLevelResult {
  fleschKincaid: number;
  fleschReadingEase: number;
  gradeLevel: string;
  readingTime: number;
  wordCount: number;
  sentenceCount: number;
  avgWordsPerSentence: number;
  avgSyllablesPerWord: number;
  suggestions: string[];
}

// Count syllables in a word (approximation)
function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;
  
  // Count vowel groups
  const vowels = 'aeiouy';
  let count = 0;
  let prevIsVowel = false;
  
  for (let i = 0; i < word.length; i++) {
    const isVowel = vowels.includes(word[i]);
    if (isVowel && !prevIsVowel) {
      count++;
    }
    prevIsVowel = isVowel;
  }
  
  // Adjust for silent e
  if (word.endsWith('e') && count > 1) {
    count--;
  }
  
  // Adjust for common endings
  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) {
    count++;
  }
  
  return Math.max(1, count);
}

// Split text into sentences
function getSentences(text: string): string[] {
  return text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Split text into words
function getWords(text: string): string[] {
  return text
    .split(/\s+/)
    .map(w => w.replace(/[^a-zA-Z0-9'-]/g, ''))
    .filter(w => w.length > 0);
}

// Calculate Flesch-Kincaid Grade Level
export function calculateFleschKincaid(text: string): number {
  const words = getWords(text);
  const sentences = getSentences(text);
  
  if (words.length === 0 || sentences.length === 0) return 0;
  
  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;
  
  // Flesch-Kincaid Grade Level formula
  const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
  
  return Math.max(0, Math.round(gradeLevel * 10) / 10);
}

// Calculate Flesch Reading Ease
export function calculateFleschReadingEase(text: string): number {
  const words = getWords(text);
  const sentences = getSentences(text);
  
  if (words.length === 0 || sentences.length === 0) return 0;
  
  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  const avgWordsPerSentence = words.length / sentences.length;
  const avgSyllablesPerWord = totalSyllables / words.length;
  
  // Flesch Reading Ease formula
  const ease = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
  
  return Math.max(0, Math.min(100, Math.round(ease * 10) / 10));
}

// Get grade level description
export function getGradeLevelDescription(gradeLevel: number): string {
  if (gradeLevel <= 5) return '5th grade or below (Very Easy)';
  if (gradeLevel <= 6) return '6th grade (Easy)';
  if (gradeLevel <= 7) return '7th grade (Fairly Easy)';
  if (gradeLevel <= 8) return '8th grade (Standard)';
  if (gradeLevel <= 9) return '9th grade (Fairly Difficult)';
  if (gradeLevel <= 10) return '10th grade (Difficult)';
  if (gradeLevel <= 12) return '11th-12th grade (Very Difficult)';
  return 'College level (Extremely Difficult)';
}

// Get reading ease description
export function getReadingEaseDescription(score: number): string {
  if (score >= 90) return 'Very Easy - 5th grade';
  if (score >= 80) return 'Easy - 6th grade';
  if (score >= 70) return 'Fairly Easy - 7th grade';
  if (score >= 60) return 'Standard - 8th-9th grade';
  if (score >= 50) return 'Fairly Difficult - 10th-12th grade';
  if (score >= 30) return 'Difficult - College level';
  return 'Very Difficult - College graduate';
}

// Calculate estimated reading time (words per minute)
export function calculateReadingTime(text: string, wpm: number = 200): number {
  const words = getWords(text);
  return Math.ceil(words.length / wpm);
}

// Generate improvement suggestions
export function generateSuggestions(text: string): string[] {
  const suggestions: string[] = [];
  const words = getWords(text);
  const sentences = getSentences(text);
  
  if (sentences.length === 0 || words.length === 0) return suggestions;
  
  const avgWordsPerSentence = words.length / sentences.length;
  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  const avgSyllablesPerWord = totalSyllables / words.length;
  
  // Check sentence length
  if (avgWordsPerSentence > 20) {
    suggestions.push('Consider breaking up longer sentences. Aim for 15-20 words per sentence.');
  }
  
  // Check word complexity
  if (avgSyllablesPerWord > 1.7) {
    suggestions.push('Use simpler words where possible. Replace multi-syllable words with shorter alternatives.');
  }
  
  // Check for complex words
  const complexWords = words.filter(w => countSyllables(w) >= 4);
  if (complexWords.length > words.length * 0.1) {
    suggestions.push(`Found ${complexWords.length} complex words (4+ syllables). Consider simplifying.`);
  }
  
  // Check passive voice indicators
  const passiveIndicators = ['was', 'were', 'been', 'being', 'is', 'are', 'am'];
  const hasPassive = words.some(w => passiveIndicators.includes(w.toLowerCase()));
  if (hasPassive) {
    suggestions.push('Consider using active voice for more direct communication.');
  }
  
  // Check for jargon/academic words common in higher ed
  const jargonWords = ['pursuant', 'heretofore', 'aforementioned', 'notwithstanding', 'matriculate', 'disbursement'];
  const foundJargon = words.filter(w => jargonWords.includes(w.toLowerCase()));
  if (foundJargon.length > 0) {
    suggestions.push(`Replace jargon: "${foundJargon.join('", "')}" with simpler alternatives.`);
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Good readability! Your text is clear and accessible.');
  }
  
  return suggestions;
}

// Full analysis
export function analyzeReadingLevel(text: string): ReadingLevelResult {
  const words = getWords(text);
  const sentences = getSentences(text);
  const totalSyllables = words.reduce((acc, word) => acc + countSyllables(word), 0);
  
  const fleschKincaid = calculateFleschKincaid(text);
  const fleschReadingEase = calculateFleschReadingEase(text);
  
  return {
    fleschKincaid,
    fleschReadingEase,
    gradeLevel: getGradeLevelDescription(fleschKincaid),
    readingTime: calculateReadingTime(text),
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: sentences.length > 0 ? Math.round((words.length / sentences.length) * 10) / 10 : 0,
    avgSyllablesPerWord: words.length > 0 ? Math.round((totalSyllables / words.length) * 100) / 100 : 0,
    suggestions: generateSuggestions(text),
  };
}
