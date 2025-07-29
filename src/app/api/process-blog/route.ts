import { NextRequest, NextResponse } from 'next/server'
import { extract } from '@extractus/article-extractor'
import axios from 'axios'
import { saveSummaryToSupabase } from '@/lib/supabase'
import { saveBlogContentToMongoDB } from '@/lib/mongodb'

// Utility to strip HTML tags
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Improved summary generator
function generateEnglishSummary(fullText: string): string {
  // Remove HTML tags
  const cleanText = stripHtmlTags(fullText);

  // Split into sentences and filter for meaningful length
  const sentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 40);

  // If not enough sentences, fallback to shorter ones
  const fallbackSentences = cleanText
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);

  // Select up to 6 key points
  const keyPoints = (sentences.length >= 4 ? sentences : fallbackSentences).slice(0, 6);

  // If still not enough, add a note
  if (keyPoints.length < 3) {
    keyPoints.push("Further details are available in the full article.");
  }

  return [
    "This article provides an in-depth analysis of a critical cybersecurity event, outlining the methods, impact, and lessons learned.",
    "",
    "Key takeaways:",
    ...keyPoints.map(point => `• ${point}`),
    "",
    "The article offers valuable insights for professionals seeking to understand the evolving landscape of cyber threats and organizational responses."
  ].join('\n');
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
