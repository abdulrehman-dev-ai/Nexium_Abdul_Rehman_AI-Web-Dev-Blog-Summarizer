import { MongoClient, Db, Collection } from 'mongodb'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017'
const MONGODB_DB = process.env.MONGODB_DB || 'blog_summarizer'

// Global variable to store the MongoDB client
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

// Interface for blog content
export interface BlogContent {
  _id?: string
  url: string
  title?: string
  fullText: string
  metadata?: {
    author?: string
    publishDate?: string
    wordCount: number
    extractedAt: Date
  }
  createdAt: Date
}

// Connect to MongoDB
export async function connectToMongoDB(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  try {
    const client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB)
    
    cachedClient = client
    cachedDb = db
    
    console.log('Connected to MongoDB')
    return { client, db }
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

// Save full blog content to MongoDB
export async function saveBlogContentToMongoDB(blogData: Omit<BlogContent, '_id' | 'createdAt'>) {
  try {
    const { db } = await connectToMongoDB()
    const collection: Collection<BlogContent> = db.collection('blog_contents')
    
    const contentToSave: BlogContent = {
      ...blogData,
      createdAt: new Date()
    }
    
    const result = await collection.insertOne(contentToSave)
    console.log('Blog content saved to MongoDB with ID:', result.insertedId)
    
    return result.insertedId
  } catch (error) {
    console.error('Failed to save blog content to MongoDB:', error)
    throw error
  }
}

// Get blog content from MongoDB
export async function getBlogContentFromMongoDB(url: string) {
  try {
    const { db } = await connectToMongoDB()
    const collection: Collection<BlogContent> = db.collection('blog_contents')
    
    const content = await collection.findOne({ url })
    return content
  } catch (error) {
    console.error('Failed to get blog content from MongoDB:', error)
    throw error
  }
}

// Get recent blog contents
export async function getRecentBlogContents(limit = 10) {
  try {
    const { db } = await connectToMongoDB()
    const collection: Collection<BlogContent> = db.collection('blog_contents')
    
    const contents = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()
    
    return contents
  } catch (error) {
    console.error('Failed to get recent blog contents from MongoDB:', error)
    throw error
  }
}
