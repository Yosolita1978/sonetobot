# 🤖 Spanish Poetry Automation Platform

**Intelligent full-stack web application that automatically discovers, formats, and shares Spanish poetry on Mastodon.**

![Next.js](https://img.shields.io/badge/Next.js-000000?logo=nextdotjs) ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase) ![Mastodon](https://img.shields.io/badge/Mastodon-6364FF?logo=mastodon)

🌐 **Live Demo**: [https://sonetobot.vercel.app](https://sonetobot.vercel.app)  
🐘 **Bot Account**: [@sonetobot@col.social](https://col.social/@sonetobot)

---

## Features

### **Public Homepage**
- 📖 Interactive poetry discovery with Spanish-inspired design
- 📊 Real-time database statistics and recent posts
- 🎨 Beautiful responsive UI with cultural theming

### **Protected Admin Dashboard**
- 🔐 GitHub OAuth authentication (single-user access)
- 🤖 Smart web scraping with AI-powered formatting
- 🐘 Automated Mastodon posting with duplicate prevention
- 🧪 Format testing and preview capabilities

---

## Tech Stack

- **Framework**: Next.js 14 + TypeScript + Tailwind CSS
- **Auth**: NextAuth.js with GitHub OAuth
- **Database**: Supabase (PostgreSQL)
- **APIs**: Mastodon integration + intelligent web scraping
- **Deployment**: Vercel with serverless functions

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Yosolita1978/sonetobot.git
cd sonetobot
npm install
```

### 2. Environment Setup

**Database**

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

**Authentication**

```
NEXTAUTH_SECRET=your_secret
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret
AUTHORIZED_GITHUB_USERNAME=your_username
```

**Mastodon**

```
MASTODON_ACCESS_TOKEN=your_token
MASTODON_API_URL=https://col.social
```

### 3. Database Schema

```sql
CREATE TABLE poems (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  excerpt TEXT NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  posted_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Run Development

```bash
npm run dev
```

Visit `http://localhost:3000` for the public site or `/admin` for the dashboard.

---

## Project Structure

```
src/
├── app/
│   ├── admin/          # Protected admin dashboard
│   ├── api/
│   │   ├── admin/      # Protected API routes
│   │   ├── auth/       # NextAuth.js config
│   │   └── public/     # Public API endpoints
│   ├── login/          # Authentication page
│   └── page.tsx        # Public homepage
├── components/
│   ├── admin/          # Dashboard components
│   ├── auth/           # Auth components
│   └── public/         # Homepage components
├── lib/                # Database, scraping, Mastodon logic
└── middleware.ts       # Route protection
```

---

## API Endpoints

### **Public**
- `GET /api/public/stats` – Database statistics
- `GET /api/public/random-poem` – Random poem display
- `GET /api/public/mastodon-posts` – Recent posts

### **Admin (Protected)**
- `POST /api/admin/test-db` – Scraping & database operations
- `POST /api/admin/post-poem` – Mastodon posting

---

## Deployment

1. Push to GitHub
2. Connect to [Vercel](https://vercel.com)
3. Add environment variables
4. Update GitHub OAuth URLs for production
5. Deploy automatically

---

## Features Showcase

### **Full-Stack Development**
- Modern Next.js 14 with App Router and TypeScript
- Secure authentication with OAuth and middleware protection
- PostgreSQL database with optimized queries
- External API integrations (Mastodon + web scraping)

### **Spanish Language Processing**
- Intelligent text formatting for poetry
- Cultural design elements and theming
- Automatic line break detection and preservation

### **Modern Web Practices**
- Serverless architecture with edge optimization
- Responsive design with mobile-first approach
- Real-time data updates and interactive UI

---

**Built by [Yosolita1978](https://github.com/Yosolita1978) for poetry lovers and technical interviews** 🇪🇸📚

*Demonstrates full-stack development, authentication systems, database design, and API integrations.*