import { NextRequest, NextResponse } from 'next/server'
import { extract } from '@extractus/article-extractor'
import axios from 'axios'
import { saveSummaryToSupabase } from '@/lib/supabase'
import { saveBlogContentToMongoDB } from '@/lib/mongodb'

// Utility to strip HTML tags
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Enhanced professional summary generator with comprehensive content analysis
function generateEnglishSummary(fullText: string): string {
  // Remove HTML tags and clean the text
  const cleanText = stripHtmlTags(fullText);
  
  if (!cleanText || cleanText.length < 100) {
    return "Unable to generate summary: insufficient content.";
  }

  // Advanced text preprocessing
  const paragraphs = cleanText.split(/\n\s*\n/).filter(p => p.trim().length > 50);
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 25 && s.length < 300)
    .filter(s => !s.match(/^(Click|Read|Subscribe|Follow|Share|Like|Download|Sign up|Log in|Register|Join|Contact)/i))
    .filter(s => !s.match(/^(Copyright|©|All rights reserved|Privacy|Terms|Cookie)/i));

  if (sentences.length === 0) {
    return "This article contains valuable information. Please refer to the full content for complete details.";
  }

  // Content analysis for topic identification
  const wordFrequency = new Map<string, number>();
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'your', 'our', 'their', 'its', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'first', 'second', 'third', 'last', 'next', 'previous', 'new', 'old', 'good', 'bad', 'big', 'small', 'long', 'short', 'high', 'low', 'more', 'most', 'less', 'least', 'many', 'much', 'few', 'little', 'some', 'any', 'all', 'each', 'every', 'other', 'another', 'same', 'different', 'here', 'there', 'where', 'when', 'how', 'why', 'what', 'who', 'which', 'whose', 'whom', 'now', 'then', 'today', 'tomorrow', 'yesterday', 'always', 'never', 'sometimes', 'often', 'usually', 'about', 'above', 'below', 'between', 'through', 'during', 'before', 'after', 'while', 'until', 'since', 'because', 'if', 'unless', 'although', 'though', 'however', 'therefore', 'thus', 'so', 'also', 'too', 'very', 'quite', 'rather', 'just', 'only', 'even', 'still', 'yet', 'already', 'again', 'back', 'away', 'up', 'down', 'out', 'off', 'over', 'under', 'into', 'onto', 'from', 'within', 'without', 'against', 'toward', 'towards', 'across', 'around', 'near', 'far', 'inside', 'outside', 'beside', 'behind', 'ahead', 'along', 'among', 'between', 'beyond', 'despite', 'except', 'including', 'regarding', 'concerning', 'according', 'due', 'thanks', 'owing', 'instead', 'rather', 'besides', 'moreover', 'furthermore', 'additionally', 'meanwhile', 'otherwise', 'nevertheless', 'nonetheless', 'however', 'therefore', 'thus', 'hence', 'consequently', 'accordingly', 'similarly', 'likewise', 'conversely', 'alternatively', 'specifically', 'particularly', 'especially', 'generally', 'basically', 'essentially', 'actually', 'really', 'truly', 'certainly', 'definitely', 'probably', 'possibly', 'perhaps', 'maybe', 'likely', 'unlikely', 'sure', 'unsure', 'clear', 'unclear', 'obvious', 'apparent', 'evident', 'obvious', 'simple', 'complex', 'easy', 'difficult', 'hard', 'soft', 'strong', 'weak', 'fast', 'slow', 'quick', 'rapid', 'sudden', 'gradual', 'immediate', 'instant', 'direct', 'indirect', 'straight', 'curved', 'round', 'square', 'flat', 'sharp', 'dull', 'bright', 'dark', 'light', 'heavy', 'thick', 'thin', 'wide', 'narrow', 'deep', 'shallow', 'full', 'empty', 'complete', 'incomplete', 'whole', 'part', 'half', 'quarter', 'double', 'single', 'multiple', 'several', 'various', 'different', 'similar', 'equal', 'unequal', 'same', 'opposite', 'reverse', 'forward', 'backward', 'left', 'right', 'center', 'middle', 'side', 'top', 'bottom', 'front', 'back', 'end', 'beginning', 'start', 'finish', 'stop', 'continue', 'pause', 'break', 'rest', 'work', 'play', 'study', 'learn', 'teach', 'show', 'tell', 'say', 'speak', 'talk', 'ask', 'answer', 'question', 'reply', 'respond', 'listen', 'hear', 'see', 'look', 'watch', 'observe', 'notice', 'find', 'search', 'seek', 'discover', 'explore', 'investigate', 'examine', 'check', 'test', 'try', 'attempt', 'effort', 'practice', 'exercise', 'train', 'prepare', 'plan', 'organize', 'arrange', 'order', 'sort', 'group', 'separate', 'divide', 'combine', 'join', 'connect', 'link', 'attach', 'detach', 'remove', 'add', 'include', 'exclude', 'contain', 'hold', 'carry', 'bring', 'take', 'give', 'receive', 'get', 'obtain', 'acquire', 'gain', 'lose', 'miss', 'lack', 'need', 'want', 'wish', 'hope', 'expect', 'believe', 'think', 'know', 'understand', 'realize', 'recognize', 'remember', 'forget', 'recall', 'remind', 'imagine', 'dream', 'feel', 'sense', 'touch', 'taste', 'smell', 'sound', 'noise', 'music', 'song', 'voice', 'word', 'language', 'text', 'write', 'read', 'book', 'page', 'line', 'sentence', 'paragraph', 'chapter', 'story', 'article', 'report', 'news', 'information', 'data', 'fact', 'truth', 'lie', 'false', 'true', 'real', 'fake', 'correct', 'wrong', 'right', 'mistake', 'error', 'problem', 'solution', 'answer', 'result', 'outcome', 'effect', 'cause', 'reason', 'purpose', 'goal', 'aim', 'target', 'objective', 'plan', 'idea', 'thought', 'opinion', 'view', 'point', 'perspective', 'angle', 'way', 'method', 'approach', 'technique', 'skill', 'ability', 'talent', 'gift', 'power', 'strength', 'force', 'energy', 'effort', 'action', 'activity', 'movement', 'motion', 'change', 'shift', 'turn', 'move', 'go', 'come', 'arrive', 'leave', 'depart', 'return', 'stay', 'remain', 'keep', 'maintain', 'preserve', 'protect', 'save', 'rescue', 'help', 'assist', 'support', 'encourage', 'motivate', 'inspire', 'influence', 'affect', 'impact', 'improve', 'enhance', 'increase', 'decrease', 'reduce', 'lower', 'raise', 'lift', 'drop', 'fall', 'rise', 'grow', 'develop', 'progress', 'advance', 'succeed', 'fail', 'win', 'lose', 'compete', 'fight', 'struggle', 'battle', 'war', 'peace', 'calm', 'quiet', 'silent', 'loud', 'noisy', 'busy', 'active', 'passive', 'lazy', 'tired', 'sleepy', 'awake', 'alert', 'aware', 'conscious', 'unconscious', 'alive', 'dead', 'born', 'die', 'live', 'exist', 'happen', 'occur', 'take', 'place', 'event', 'situation', 'condition', 'state', 'status', 'position', 'location', 'place', 'area', 'region', 'zone', 'space', 'room', 'house', 'home', 'building', 'structure', 'construction', 'material', 'substance', 'matter', 'thing', 'object', 'item', 'piece', 'part', 'component', 'element', 'factor', 'aspect', 'feature', 'characteristic', 'quality', 'property', 'attribute', 'trait', 'nature', 'type', 'kind', 'sort', 'category', 'class', 'group', 'team', 'organization', 'company', 'business', 'industry', 'market', 'economy', 'money', 'cost', 'price', 'value', 'worth', 'benefit', 'advantage', 'disadvantage', 'positive', 'negative', 'neutral', 'normal', 'usual', 'common', 'rare', 'special', 'unique', 'original', 'copy', 'duplicate', 'repeat', 'again', 'once', 'twice', 'time', 'moment', 'instant', 'second', 'minute', 'hour', 'day', 'week', 'month', 'year', 'decade', 'century', 'age', 'period', 'era', 'season', 'weather', 'climate', 'temperature', 'hot', 'cold', 'warm', 'cool', 'wet', 'dry', 'rain', 'snow', 'wind', 'storm', 'sun', 'moon', 'star', 'sky', 'cloud', 'earth', 'ground', 'soil', 'rock', 'stone', 'mountain', 'hill', 'valley', 'river', 'lake', 'sea', 'ocean', 'water', 'fire', 'air', 'gas', 'liquid', 'solid', 'metal', 'wood', 'paper', 'plastic', 'glass', 'cloth', 'fabric', 'color', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey', 'silver', 'gold', 'number', 'count', 'amount', 'quantity', 'size', 'length', 'width', 'height', 'depth', 'weight', 'mass', 'volume', 'capacity', 'speed', 'rate', 'level', 'degree', 'grade', 'scale', 'measure', 'unit', 'system', 'process', 'procedure', 'step', 'stage', 'phase', 'cycle', 'pattern', 'design', 'style', 'fashion', 'trend', 'custom', 'tradition', 'culture', 'society', 'community', 'public', 'private', 'personal', 'individual', 'person', 'people', 'human', 'man', 'woman', 'child', 'baby', 'adult', 'old', 'young', 'age', 'family', 'parent', 'father', 'mother', 'son', 'daughter', 'brother', 'sister', 'friend', 'enemy', 'stranger', 'neighbor', 'colleague', 'partner', 'member', 'leader', 'follower', 'teacher', 'student', 'doctor', 'patient', 'customer', 'client', 'user', 'player', 'actor', 'artist', 'writer', 'author', 'reader', 'viewer', 'listener', 'speaker', 'singer', 'musician', 'dancer', 'athlete', 'worker', 'employee', 'employer', 'boss', 'manager', 'director', 'president', 'king', 'queen', 'prince', 'princess', 'lord', 'lady', 'sir', 'madam', 'mr', 'mrs', 'ms', 'dr', 'prof', 'professor']);
  
  // Extract key terms for topic understanding with better filtering
  const words = cleanText.toLowerCase().match(/\b[a-z]{4,}\b/g) || [];
  words.forEach(word => {
    if (!stopWords.has(word) && word.length >= 4) {
      wordFrequency.set(word, (wordFrequency.get(word) || 0) + 1);
    }
  });
  
  // Filter and prioritize meaningful terms
  const keyTerms = Array.from(wordFrequency.entries())
    .filter(([word, count]) => count >= 2 && word.length >= 4) // Must appear at least twice and be 4+ chars
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  // Intelligent sentence scoring and selection
  const scoredSentences = sentences.map((sentence, index) => {
    let score = 0;
    const lowerSentence = sentence.toLowerCase();
    
    // Score based on key terms presence
    keyTerms.forEach(term => {
      if (lowerSentence.includes(term)) {
        score += 2;
      }
    });
    
    // Boost sentences with numbers, statistics, or specific data
    if (sentence.match(/\d+[%$]|\d+\s*(percent|million|billion|thousand)/i)) {
      score += 3;
    }
    
    // Boost sentences with action words or conclusions
    if (sentence.match(/\b(shows?|reveals?|demonstrates?|indicates?|suggests?|concludes?|finds?|discovers?|proves?|explains?|highlights?)/i)) {
      score += 2;
    }
    
    // Boost sentences with important connectors
    if (sentence.match(/\b(however|therefore|furthermore|moreover|additionally|consequently|as a result|in conclusion)/i)) {
      score += 1;
    }
    
    // Position-based scoring (beginning and end are often more important)
    if (index < sentences.length * 0.2) score += 1; // First 20%
    if (index > sentences.length * 0.8) score += 1; // Last 20%
    
    // Length-based scoring (prefer medium-length sentences)
    if (sentence.length > 50 && sentence.length < 150) score += 1;
    
    return { sentence, score, index };
  });
  
  // Select top sentences ensuring diversity
  const selectedSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(8, Math.max(4, Math.floor(sentences.length * 0.2))))
    .sort((a, b) => a.index - b.index); // Restore original order

  // Build comprehensive summary
  const wordCount = cleanText.split(/\s+/).length;
  const estimatedReadTime = Math.ceil(wordCount / 200);
  
  // Determine article category/topic
  let topicCategory = "general";
  const techTerms = ['technology', 'software', 'programming', 'development', 'code', 'algorithm', 'data', 'ai', 'machine learning', 'digital', 'computer', 'internet'];
  const businessTerms = ['business', 'marketing', 'strategy', 'management', 'finance', 'revenue', 'growth', 'market', 'sales', 'profit', 'investment'];
  const healthTerms = ['health', 'medical', 'wellness', 'fitness', 'nutrition', 'disease', 'treatment', 'therapy', 'exercise', 'diet'];
  const spiritualTerms = ['god', 'scripture', 'bible', 'prayer', 'meditation', 'faith', 'spiritual', 'church', 'psalm', 'lord', 'jesus', 'christ', 'holy', 'worship', 'blessing'];
  const educationTerms = ['education', 'learning', 'teaching', 'student', 'school', 'university', 'course', 'study', 'knowledge', 'academic'];
  const lifestyleTerms = ['lifestyle', 'personal', 'self-improvement', 'motivation', 'inspiration', 'habits', 'productivity', 'mindfulness'];
  
  const contentLower = cleanText.toLowerCase();
  if (spiritualTerms.some(term => contentLower.includes(term))) topicCategory = "spiritual/religious";
  else if (techTerms.some(term => contentLower.includes(term))) topicCategory = "technology";
  else if (businessTerms.some(term => contentLower.includes(term))) topicCategory = "business";
  else if (healthTerms.some(term => contentLower.includes(term))) topicCategory = "health";
  else if (educationTerms.some(term => contentLower.includes(term))) topicCategory = "education";
  else if (lifestyleTerms.some(term => contentLower.includes(term))) topicCategory = "lifestyle";
  
  const summaryParts = [];
  
  // Dynamic introduction based on content analysis
  const topKeyTerms = keyTerms.slice(0, 3).join(', ');
  summaryParts.push(`**Article Overview** (${wordCount} words, ~${estimatedReadTime} min read)`);
  summaryParts.push(`This ${topicCategory} article focuses on: ${topKeyTerms}\n`);
  
  // Main content points
  summaryParts.push("**Key Insights:**");
  selectedSentences.forEach((item, index) => {
    const bullet = index < 3 ? "🔹" : "•";
    summaryParts.push(`${bullet} ${item.sentence}`);
  });
  
  // Add statistical summary if numbers are present
  const numbers = cleanText.match(/\d+[%$]|\d+\s*(percent|million|billion|thousand|years?|months?|days?)/gi);
  if (numbers && numbers.length > 0) {
    summaryParts.push(`\n**Key Statistics:** ${numbers.slice(0, 3).join(', ')}`);
  }
  
  // Professional conclusion
  summaryParts.push(`\n**Summary:** This article provides comprehensive insights into ${topKeyTerms}, offering valuable information for readers interested in ${topicCategory}. The content delivers actionable knowledge and detailed analysis worth the ${estimatedReadTime}-minute read.`);
  
  return summaryParts.join('\n');
}

// Function to translate text to Urdu using MyMemory API
async function translateToUrdu(text: string): Promise<string> {
  try {
    const maxChunkLength = 500
    const chunks: string[] = []
    
    // Split text into chunks
    for (let i = 0; i < text.length; i += maxChunkLength) {
      chunks.push(text.substring(i, i + maxChunkLength))
    }
    
    let translatedText = ''
    
    // Translate each chunk
    for (const chunk of chunks) {
      const response = await axios.get('https://api.mymemory.translated.net/get', {
        params: {
          q: chunk,
          langpair: 'en|ur'
        }
      })
      
      if (response.data && response.data.responseData) {
        translatedText += response.data.responseData.translatedText + ' '
      }
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return translatedText.trim()
  } catch (error) {
    console.error('Translation error:', error)
    return 'ترجمے میں خرابی ہوئی۔ براہ کرم دوبارہ کوشش کریں۔'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }
    
    // Step 1: Extract article content
    console.log('Extracting content from:', url)
    const article = await extract(url)
    
    if (!article || !article.content) {
      return NextResponse.json(
        { error: 'Failed to extract content from the provided URL' },
        { status: 400 }
      )
    }
    
    const fullText = article.content
    const title = article.title || 'Untitled Article'
    const wordCount = fullText.split(' ').length
    
    // Step 2: Generate English summary
    console.log('Generating English summary...')
    const englishSummary = generateEnglishSummary(fullText)
    
    // Step 3: Translate to Urdu
    console.log('Translating to Urdu...')
    const urduSummary = await translateToUrdu(englishSummary)
    
    // Step 4: Save summary to Supabase
    console.log('Saving summary to Supabase...')
    let supabaseData = null
    try {
      supabaseData = await saveSummaryToSupabase(url, englishSummary)
      console.log('Successfully saved to Supabase:', supabaseData?.id)
    } catch (supabaseError) {
      console.error('Failed to save to Supabase:', supabaseError)
      // Continue processing even if Supabase fails
    }
    
    // Step 5: Save full content to MongoDB
    console.log('Saving full content to MongoDB...')
    let mongoData = null
    try {
      mongoData = await saveBlogContentToMongoDB({
        url,
        title,
        fullText,
        metadata: {
          author: article.author || undefined,
          publishDate: article.published || undefined,
          wordCount,
          extractedAt: new Date()
        }
      })
      console.log('Successfully saved to MongoDB:', mongoData)
    } catch (mongoError) {
      console.error('Failed to save to MongoDB:', mongoError)
      // Continue processing even if MongoDB fails
    }
    
    return NextResponse.json({
      success: true,
      data: {
        title,
        englishSummary,
        urduSummary,
        wordCount,
        readingTime: Math.ceil(wordCount / 200),
        supabaseId: supabaseData?.id || null,
        mongoId: mongoData?.toString() || null
      }
    })
    
  } catch (error) {
    console.error('Error processing blog:', error)
    return NextResponse.json(
      { 
        error: 'Failed to process blog',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
