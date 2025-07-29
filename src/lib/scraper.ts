// assignment-2/lib/scraper.ts

import { extract } from '@extractus/article-extractor'

export async function extractBlogContent(url: string) {
  try {
    const article = await extract(url)
    if (!article || !article.content) {
      throw new Error('Unable to extract article content.')
    }

    return {
      title: article.title ?? 'Untitled',
      content: article.content.replace(/<[^>]*>?/gm, '') // remove HTML tags
    }
  } catch (error: any) {
    console.error('Extraction Error:', error)
    throw new Error('Failed to extract article content.')
  }
}
