# The Quad - Community Platform

<p align="center">
  <img src="https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle" />
  <img src="https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white" alt="Socket.io" />
  <img src="https://img.shields.io/badge/Google_Gemini-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini AI" />
</p>

<p align="center">
  <strong>The AI-powered student community for Resources, Q&A, Blogs, Opportunities & Real-Time Collaboration</strong><br/>
  <em>Volume 02 - Powered by peers, for peers</em>
</p>



## Overview

**The Quad** is a modern, full-stack, AI-powered community platform built for college students and learners in the tech ecosystem. Released as **Volume 02** with major AI integrations across the entire platform.

Designed with a premium dark/light themed UI and a focus on speed and developer experience, The Quad unifies the best parts of a university resource repository, a StackOverflow-style Q&A forum, a technical blogging platform, a real-time chat system, and an opportunities board into one cohesive hub.

It features deep integrations (GitHub and LeetCode tracking on user profiles), an AI-powered Platform Guide chatbot, semantic search and recommendations powered by vector embeddings, and a comprehensive multi-tier moderation system.



## Features

### Resources
- Upload and share notes, PYQs (Previous Year Questions), cheat sheets, assignments, and other study materials.
- Rich metadata tagging: Branch, Semester, Subject, College, Tags.
- Upvoting, downvoting, commenting, bookmarking, and reporting mechanics.
- Filter and sort resources by multiple dimensions simultaneously.
- AI: Chat with any PDF resource to ask the AI questions about its content using Retrieval-Augmented Generation.

### Q&A Forum
- Ask technical or community-related questions with rich Markdown support.
- Threaded answers with voting, bookmarking, and reporting.
- Question owners can mark one answer as the Accepted Answer.
- Upvote-driven reputation system.

### Blog Posts (Knowledge Publishing)
- Full GitHub Flavored Markdown editor with code blocks, syntax highlighting, images, and rich formatting.
- Four post categories:
  - Learning Journals: Daily learning progress, study logs, coding journeys.
  - DSA Editorials: Detailed explanations and solutions for Data Structures and Algorithms.
  - Interview Experiences: Interview processes, questions, and preparation strategies.
  - Project Breakdowns: Architecture, implementation, challenges, and lessons learned.
- Series Posts: Link related posts for a continuous reading experience.
- Draft saving and cover image uploading.
- AI: Generate TL;DR on any long post using Gemini AI with auto-extracted tags.

### The Library
- Explore free PDF books across programming and academic domains.
- Read books directly in the browser with a custom-themed built-in PDF viewer.
- Fullscreen reading mode for a distraction-free experience.

### Opportunities Board
- Discover coding contests, hackathons, open-source programs, internships, and campus ambassador roles.
- Supports search, filtering, bookmarking, and links to official registration pages.
- Managed and curated by the admin team.

### Real-Time Chat and Lounges
- Global Public Lounges for broad community discussions.
- Ephemeral Study Rooms: Create private or public rooms that auto-delete after 10 minutes of inactivity.
- Direct Messaging with live typing indicators, online presence dots, and unread message counts.
- Vertical "Chats" tab that peeks from the right edge of the screen as a drawer handle.

### AI Guide (Platform Chatbot)
- A built-in conversational AI powered by Google Gemini to help users navigate the platform.
- Answers questions about features, rules, policies, reputation, and contact information.
- Time-aware greeting (Good morning, afternoon, evening) with randomized variants.
- Available to guest users for up to 3 messages before prompting signup.
- Unlimited usage for authenticated users.

### Developer Profiles
- Connect GitHub to display repositories, language breakdown, contribution graph, and statistics (refreshed every 12 hours via server-side cache).
- Connect LeetCode to display global rank and solved problem statistics.
- Dynamic network banners, avatar uploads, bio, and detailed profile data.
- Follow / unfollow users and view public bookmarks.

### AI-Powered Search and Recommendations
- Semantic Search: A vector embedding model understands meaning beyond keywords.
- AI Recommendations: Builds a semantic interest profile from recent activity and surfaces content with mathematically similar meaning from a local in-memory vector cache.

### Role-Based Moderation System
- Three tiers: Student (default), Moderator, Admin.
- Reporting: Users can flag inappropriate content with context.
- Moderator Console: Manage reports and review flagged content.
- Admin Console: User management (warnings, suspensions, bans), system analytics, opportunities, featured content, books, and chat room management.
- Automated emails dispatched on critical moderation actions via Gmail SMTP.

### Reputation and Points

| Action | Points |
|---|---|
| Your question upvoted | +4 |
| Your answer upvoted | +15 |
| Your resource or post upvoted | +10 |
| You upvote someone else | +3 |
| Your content downvoted | -2 |

- Monthly Top Contributors leaderboard on the home page.
- Lifetime Points: cumulative total since account creation.

### Authentication and Security
- JWT-based authentication with Access Tokens (short-lived) and HTTP-Only Refresh Cookies (long-lived).
- Automated JWT refresh via Axios interceptors, transparent to the user.
- OTP Email Verification during registration (6-digit code, 10-minute expiry).
- OAuth 2.0: Google sign-in support.
- Password reset via time-limited email link.
- Account suspension enforcement: suspended users can read but cannot post, comment, or vote.

### Soft-Delete and Recovery
- All deleted content enters a 14-day Recovery Window where it is hidden but not erased.
- Users can request recovery within 14 days by emailing support.
- After 14 days, content is permanently purged.


## Tech Stack

### Frontend (client/)

| Technology | Purpose |
|---|---|
| React 18 + Vite | UI framework and fast build tooling |
| Tailwind CSS | Utility-first styling with custom CSS design tokens |
| lucide-react | Consistent iconography |
| react-router-dom v6 | Client-side routing |
| Context API | Global state (Auth, App, Theme) |
| Axios | HTTP client with automated JWT refresh interceptors |
| socket.io-client | Real-time bi-directional communication |
| ReactMarkdown | Render GitHub Flavored Markdown |
| react-pdf | In-browser PDF viewing for The Library |

### Backend (server/)

| Technology | Purpose |
|---|---|
| Node.js + Express.js | HTTP server and REST API |
| Socket.io | WebSocket server for real-time chat and presence |
| PostgreSQL | Primary relational database |
| Drizzle ORM | Type-safe schema definitions, relations, and queries |
| Google Gemini API | AI Guide chatbot, TL;DR generation, vector embeddings |
| Nodemailer + Gmail SMTP | Transactional emails (OTP, moderation, password reset) |
| JWT | Stateless authentication tokens |
| Multer | File upload handling |
| Winston | Structured server-side logging |

### Infrastructure

| Service | Purpose |
|---|---|
| Render | Production server hosting |
| Gmail SMTP | Production email delivery |
| PostgreSQL (managed) | Production database |



## Getting Started (Local Development)

### Prerequisites
- Node.js v18+
- PostgreSQL (local or managed instance)
- Google Gemini API key (for AI features)
- Gmail App Password (for transactional emails)

### 1. Clone the Repository

### 2. Backend Setup
```bash
cd server
npm install
```

Copy `.env.example` to `.env` and configure

Push the Drizzle schema:
```bash
npm run db:push
```

Start the backend dev server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd client
npm install
```

Start the Vite dev server:
```bash
npm run dev
```

App runs at: http://localhost:5173

### 4. Admin Access
Manually update the role field for a registered user in the database:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```



## Project Structure

```text
PeerVerse-CommunityApp/
├── client/
│   ├── public/
│   │   ├── favicons/          # App icons and web manifest
│   │   ├── robots.txt         # SEO crawler directives
│   │   └── sitemap.xml        # SEO sitemap for all public routes
│   ├── src/
│   │   ├── components/        # Reusable UI components and layout shells
│   │   │   ├── chat/          # ChatSidebar, AIGuideChat, room components
│   │   │   ├── admin/         # Admin-specific UI components
│   │   │   └── ui/            # Base primitives (Button, Input, Dropdown, etc.)
│   │   ├── context/           # React Contexts (AppContext, AuthContext, ThemeContext)
│   │   ├── hooks/             # Custom hooks (useDocumentTitle, etc.)
│   │   ├── pages/             # Full-page route components
│   │   │   └── admin/         # Admin console pages
│   │   ├── services/          # Axios API instances and socket.io client
│   │   ├── utils/             # Helper functions (fallbacks, formatters)
│   │   └── index.css          # Global styles, design tokens, animations
│   ├── index.html             # App shell with full SEO meta tags and Open Graph
│   └── tailwind.config.js     # Tailwind configuration with custom theme
└── server/
    ├── src/
    │   ├── db/                # Drizzle ORM schema definitions and DB client
    │   ├── modules/           # Feature modules (resources, chat, posts, auth, etc.)
    │   │   └── */             # Each module: routes, controller, service, socket handler
    │   ├── utils/             # Email, JWT, Logger, AI helpers, platform context
    │   └── server.js          # Express app init, Socket.io attachment, middleware
    └── drizzle.config.js      # Drizzle ORM configuration
```



## SEO and Discoverability
- Full Open Graph meta tags for Facebook, LinkedIn, WhatsApp, and other platforms.
- Twitter/X Card support with large image previews.
- Per-page dynamic title tags via the `useDocumentTitle` hook.
- `sitemap.xml` listing all major public routes with priority and change frequency.
- `robots.txt` allowing full crawler access with a sitemap reference.



## Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes with clear messages.
4. Submit a Pull Request against the `main` branch.

Please ensure your code conforms to the existing style guidelines and runs successfully in the local development environment before submitting a PR.



## Contact and Support

For platform inquiries, content recovery, or to report abuse:

**Email: thequad.community@gmail.com**

---

<div align="center">
  <p>Built with ❤️ and lots of 🍵 for learners, by a learner.</p>
  <p><em>The Quad — Vol.02 · AI-Powered · Open to all builders.</em></p>
</div>

---
