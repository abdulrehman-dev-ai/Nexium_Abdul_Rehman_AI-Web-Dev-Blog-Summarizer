# Blog Summariser & Urdu Translator

A modern Next.js application that extracts content from blog URLs, generates AI-powered summaries, translates them to Urdu, and stores the data in both Supabase and MongoDB databases.

## ✨ Features

- 🔗 **URL Processing**: Extract content from any blog URL
- 🤖 **AI Summary**: Generate intelligent summaries of blog content
- 🌍 **Urdu Translation**: Automatic translation using MyMemory API
- 💾 **Dual Database Storage**: 
  - Summaries stored in Supabase
  - Full blog content stored in MongoDB
- 🎨 **Modern UI**: Beautiful glassmorphism design with dark/light themes
- 📱 **Responsive**: Mobile-optimized interface
- 📋 **Copy to Clipboard**: Easy sharing functionality

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Animations**: Framer Motion
- **Databases**: Supabase (PostgreSQL), MongoDB
- **APIs**: MyMemory Translation API
- **Content Extraction**: @extractus/article-extractor

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- MongoDB instance (local or cloud)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd assignment-2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://<username>:<password>@<host>/<db>
   MONGODB_DB=blog_summarizer
   ```

### Database Setup

#### Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Create the blog_summaries table**:
   ```sql
   CREATE TABLE blog_summaries (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     url TEXT NOT NULL,
     title TEXT,
     english_summary TEXT NOT NULL,
     urdu_summary TEXT NOT NULL,
     word_count INTEGER,
     reading_time INTEGER,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Add index for better performance
   CREATE INDEX idx_blog_summaries_url ON blog_summaries(url);
   CREATE INDEX idx_blog_summaries_created_at ON blog_summaries(created_at DESC);
   ```

3. **Configure Row Level Security (RLS)**:
   ```sql
   -- Enable RLS
   ALTER TABLE blog_summaries ENABLE ROW LEVEL SECURITY;
   
   -- Allow public read access
   CREATE POLICY "Allow public read access" ON blog_summaries
     FOR SELECT USING (true);
   
   -- Allow public insert access
   CREATE POLICY "Allow public insert access" ON blog_summaries
     FOR INSERT WITH CHECK (true);
   ```

#### MongoDB Setup

**Option 1: Local MongoDB**
1. Install MongoDB locally
2. Start MongoDB service
3. The application will automatically create the database and collections

**Option 2: MongoDB Atlas (Cloud)**
1. Create account at [mongodb.com](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGODB_URI` in `.env.local`

### Running the Application

1. **Development mode**
   ```bash
   npm run dev
   ```

2. **Production build**
   ```bash
   npm run build
   npm start
   ```

3. **Open your browser** and navigate to `http://localhost:3000`

## 📊 Database Schema

### Supabase (blog_summaries)
```typescript
interface BlogSummary {
  id: string
  url: string
  title?: string
  english_summary: string
  urdu_summary: string
  word_count?: number
  reading_time?: number
  created_at: string
}
```

### MongoDB (blog_contents)
```typescript
interface BlogContent {
  _id: string
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
```

## 🔧 API Endpoints

### POST /api/process-blog
Processes a blog URL and saves data to both databases.

**Request:**
```json
{
  "url": "https://example.com/blog-post"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Blog Title",
    "englishSummary": "Generated summary...",
    "urduSummary": "اردو خلاصہ...",
    "wordCount": 1500,
    "readingTime": 8,
    "mongoId": "mongodb-object-id",
    "supabaseId": "supabase-uuid"
  }
}
```

## 🎨 UI Features

- **Theme Toggle**: Switch between light and dark modes
- **Glassmorphism Design**: Modern glass-like effects
- **Responsive Layout**: Works on all device sizes
- **Copy to Clipboard**: Easy sharing of summaries
- **Loading States**: Step-by-step progress indicators
- **Error Handling**: User-friendly error messages

## 🔒 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `MONGODB_DB` | MongoDB database name | Yes |

## 📝 Requirements Fulfilled

- ✅ **Input: Blog URL → scrape text** - Using @extractus/article-extractor
- ✅ **Simulate AI summary (static logic)** - Intelligent content summarization
- ✅ **Translate to Urdu using API** - MyMemory Translation API
- ✅ **Save summary in Supabase; full text in MongoDB** - Dual database persistence
- ✅ **Use ShadCN UI** - Modern component library
- ✅ **Code in assignment-2/** - Project structure

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify environment variables are set correctly
   - Check network connectivity to databases
   - Ensure database credentials are valid

2. **Translation API Errors**
   - MyMemory API has rate limits
   - Check internet connectivity
   - API may be temporarily unavailable

3. **Content Extraction Issues**
   - Some websites block content extraction
   - Ensure URL is accessible and contains readable content
   - Try different blog URLs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

## 🚀 Deployment on Vercel

You can easily deploy this project to [Vercel](https://vercel.com/) for free.

### Steps

1. **Push your code to GitHub** (or any Git provider supported by Vercel).

2. **Sign in to [Vercel](https://vercel.com/)** and click **"New Project"**.

3. **Import your repository** and follow the prompts.

4. **Set Environment Variables** in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `MONGODB_URI`
   - `MONGODB_DB`

5. **Build Command:**  
   ```
   npm run build
   ```

6. **Output Directory:**  
   ```
   .next
   ```

7. **Click "Deploy"** and wait for your site to go live!

> **Tip:** You can manage environment variables for each deployment (Production, Preview, Development) in the Vercel dashboard under "Settings" → "Environment Variables".

---

**Your app will be live at `https://your-project-name.vercel.app`!**

---

**Made with ❤️ at Nexium.ltd – Summer Internship Project**
"# Nexium_Abdul_Rehman_AI-Web-Dev-Blog-Summarizer"
