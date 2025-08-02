# 🤖 SonetoBot

> **Automated Spanish Poetry Bot for Mastodon**

SonetoBot is an intelligent poetry-sharing bot that automatically scrapes Spanish poems from online sources and shares them on Mastodon. Built with Next.js, TypeScript, and modern web technologies.

![SonetoBot Dashboard](https://img.shields.io/badge/Status-Active-green) ![TypeScript](https://img.shields.io/badge/TypeScript-blue) ![Next.js](https://img.shields.io/badge/Next.js-black) ![Mastodon](https://img.shields.io/badge/Mastodon-6364FF)

## ✨ Features

- 🔍 **Smart Web Scraping** - Extracts poems, authors, and titles from poetry websites
- 🐘 **Mastodon Integration** - Automatically posts to your Mastodon account
- 📚 **Database Management** - Tracks posted poems to avoid duplicates
- 🎭 **Rich Content** - Posts include poem titles, authors, excerpts, and hashtags
- 🚀 **One-Click Operation** - Simple dashboard for manual or automated posting
- 📱 **Responsive Dashboard** - Clean admin interface for monitoring and control
- ⚡ **Batch Processing** - Scrape multiple poems and save them for later posting

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Social Platform**: [Mastodon](https://joinmastodon.org/) via [Megalodon](https://github.com/h3poteto/megalodon)
- **Web Scraping**: [node-html-parser](https://github.com/taoqf/node-html-parser)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Vercel](https://vercel.com/) (recommended)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- A [Supabase](https://supabase.com/) account and project
- A [Mastodon](https://joinmastodon.org/) account and API access token

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/sonetobot.git
cd sonetobot
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Mastodon Configuration
MASTODON_ACCESS_TOKEN=your_mastodon_access_token
MASTODON_API_URL=https://your-mastodon-instance.com
```

### 3. Database Setup

Run the SQL migration in your Supabase SQL editor:

```sql
-- Create poems table
CREATE TABLE poems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  scraped_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  posted_date TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_poems_used ON poems(used);
CREATE INDEX idx_poems_posted_date ON poems(posted_date);
```

### 4. Get Mastodon Access Token

1. Go to your Mastodon instance settings
2. Navigate to Development → New Application
3. Create an app with `read` and `write` permissions
4. Copy the access token to your `.env.local`

### 5. Run the Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to access the dashboard.

## 📖 Usage

### Dashboard Features

The main dashboard provides several key functions:

#### 🔍 **Scrape New Poems**
- Fetches 25 random poems from poetry websites
- Extracts titles, authors, and excerpts
- Saves new poems to the database
- Shows success/error feedback

#### 🚀 **Post Random Poem**
- Selects an unused poem from the database
- Formats it for Mastodon (title, excerpt, author, hashtags)
- Posts to your Mastodon account
- Marks the poem as used to avoid duplicates

#### ⚡ **Scrape & Post**
- Combines both operations in sequence
- Perfect for automated workflows

### Example Mastodon Post

```
"Elegía nocturna"

Quién nos hubiera dicho... Que todo acabaría como acaba en la sombra 
la claridad del día. Fuiste como la lluvia cayendo sobre un río para 
que fuera tuyo... Todo lo que era mío.

— José Angel Buesa

#PoesíaEspañola #Poesía #Spanish #Poetry #Literatura
```

## 🔌 API Endpoints

### GET /api/test_db
Tests all system components and returns status information.

### POST /api/test_db
Accepts actions for scraping and database operations:

**Scrape and save poems:**
```json
{
  "action": "scrape_and_save"
}
```

**Test poem posting:**
```json
{
  "action": "test_post_poem"
}
```

### POST /api/post-poem
Posts a random poem to Mastodon and returns posting details.

## 🏗️ Project Structure

```
sonetobot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── test_db/route.ts    # Main API endpoints
│   │   │   └── post-poem/route.ts  # Mastodon posting
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx               # Main dashboard
│   ├── lib/
│   │   ├── supabase.ts           # Database operations
│   │   ├── scraper.ts            # Web scraping logic
│   │   └── mastodon.ts           # Mastodon integration
│   └── types/
│       └── poem.ts               # TypeScript definitions
├── .env.local                    # Environment variables
├── package.json
└── README.md
```

## 🔧 Configuration

### Scraping Configuration

Modify `src/lib/scraper.ts` to:
- Change target websites
- Adjust scraping patterns
- Modify content filtering

### Mastodon Formatting

Edit `src/lib/mastodon.ts` to customize:
- Post format and styling
- Hashtags and mentions
- Content length limits

### Database Schema

The `poems` table structure:
- `id`: Primary key
- `title`: Poem title
- `author`: Poet name  
- `excerpt`: Poem content
- `used`: Whether already posted
- `posted_date`: When posted to Mastodon
- `scraped_date`: When scraped from source

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com/)
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Environment Variables for Production

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MASTODON_ACCESS_TOKEN=
MASTODON_API_URL=
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for all new code
- Follow the existing code style
- Add error handling for external API calls
- Test scraping changes thoroughly
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Legal Notice

SonetoBot respects copyright and intellectual property rights. The bot:
- Only extracts brief excerpts for sharing purposes
- Always attributes content to original authors
- Aims to promote poetry appreciation and discovery
- Follows fair use guidelines

Please ensure you have permission to share content and comply with applicable copyright laws in your jurisdiction.

## 🙏 Acknowledgments

- [Palabra Virtual](https://palabravirtual.com/) - Poetry source
- [Mastodon](https://joinmastodon.org/) - Decentralized social platform
- [Supabase](https://supabase.com/) - Database and backend services
- [Next.js](https://nextjs.org/) - React framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/sonetobot/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/sonetobot/discussions)
- **Mastodon**: [@sonetobot@your-instance.com](https://your-instance.com/@sonetobot)

---

**Made with ❤️ for poetry lovers everywhere** 📚✨