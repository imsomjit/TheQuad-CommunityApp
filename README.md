# 🌐 The Quad Community App


<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle" />
</p>

**The Student Community for Resources, Q&A, Blogs, Opportunities, and Real-Time Collaboration**


## 📖 Overview

**The Quad** is a modern, full-stack, community-driven platform built explicitly for college students and learners in the tech ecosystem. 

Designed with a premium dark/light mode UI and a focus on speed, The Quad combines the best parts of a university resource repository, a StackOverflow-style Q&A forum, a tech blogging platform, and an opportunities board into one cohesive hub. It features rich integrations (like GitHub & LeetCode tracking on profiles) and a comprehensive moderation architecture to maintain a high-quality community environment.

---

## ✨ Key Features

### 📚 Resource Library
- Upload and download study materials, PYQs (Previous Year Questions), and lecture notes.
- Rich metadata tagging (Branch, Semester, Subject, College).
- Upvoting, downvoting, and bookmarking mechanics.

### 📖 The Library
- Explore free PDF books and study materials across various domains.
- Read books directly in the browser with a custom-themed built-in PDF viewer.
- Fullscreen reading mode for a distraction-free experience.

### ⚡ Real-Time Chat & Lounges
- Global public lounges for broad community discussions.
- Create private or public ephemeral study rooms that auto-delete after 10 minutes of inactivity.
- Direct Messaging (DMs) with real-time typing indicators, online presence dots, and read receipts.

### 💬 Q&A Forum
- Tech-focused Q&A system.
- Accept answers, upvote solutions, and engage in threaded discussions.

### ✍️ Knowledge Publishing (Blogs)
- Dedicated Markdown-enabled editor for writing technical articles.
- Draft saving, cover image uploading, and series organization.

### 🎯 Opportunities Board
- Discover internships, hackathons, open-source programs, and campus ambassador roles.
- Curated and managed by the Admin/Moderation team.

### 🧑‍💻 Developer Profiles
- Connect GitHub to automatically display your repositories, languages breakdown, and contribution graph.
- Connect LeetCode to display your global rank and solved problem statistics.
- Dynamic network banners, avatar uploads, and detailed bio data.

### 🛡️ Role-Based Moderation System
- **Roles**: Student (default), Moderator, Admin.
- Dedicated **Moderator Console** for managing user reports and flagging/removing content.
- Dedicated **Admin Console** for user management, system analytics, issuing warnings, and enacting temporary suspensions or permanent bans.
- Automated email alerts dispatched on critical moderation actions via Gmail SMTP.

---

## 🏗️ Architecture & Tech Stack

The Quad is structured as a monorepo containing a `client` and `server`.

### Frontend (`client/`)
- **Framework**: React 18 powered by Vite.
- **Styling**: Tailwind CSS with custom semantic tokens and highly customized CSS variables for robust Light/Dark mode toggling.
- **Icons & UI**: `lucide-react` for iconography and custom Radix UI/Shadcn-inspired accessible primitives.
- **Routing**: `react-router-dom` v6.
- **State & Data Fetching**: Context API combined with robust Axios interceptors for automated JWT refresh.
- **Real-Time Communication**: `socket.io-client` for seamless live updates, typing indicators, and presence tracking.

### Backend (`server/`)
- **Runtime**: Node.js with Express.js.
- **Real-Time Engine**: `socket.io` for bi-directional event-based communication.
- **Database**: PostgreSQL hosted in production.
- **ORM**: Drizzle ORM for type-safe schema definitions, relationships, and queries.
- **Authentication**: JWT-based (Access & HTTP-Only Refresh Cookies) with OTP email verification during registration.
- **Email**: `nodemailer` configured for robust connection timeouts with Gmail SMTP (Optimized for Render.com cold starts).

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- PostgreSQL (Local or managed instance)

### 1. Database Setup
Ensure you have a PostgreSQL database running.

### 2. Backend Configuration
1. Navigate to the server directory: `cd server`
2. Install dependencies: `npm install`
3. Duplicate `.env.example` to `.env` and fill in the variables:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Connection
DATABASE_URL=postgresql://user:password@localhost:5432/the quad

# JWT Secrets (Generate secure random strings)
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email / SMTP configuration
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=your_gmail_app_password
```
4. Push the Drizzle schema to your database: `npm run db:push`
5. Start the backend server: `npm run dev`

### 3. Frontend Configuration
1. Navigate to the client directory: `cd client`
2. Install dependencies: `npm install`
3. Duplicate `.env.example` to `.env` and configure:
```env
VITE_API_URL=http://localhost:5000/api
```
4. Start the Vite development server: `npm run dev`

### 4. Admin Access
To create your first admin or moderator user, you can manually insert them into your database or execute a short seed script targeting the `users` table with the role set to `'admin'`.

---

## 📂 Project Structure

```text
The Quad-CommunityApp/
├── client/
│   ├── public/              # Static assets, Favicons, SEO files
│   ├── src/
│   │   ├── components/      # Reusable UI components & layouts
│   │   ├── context/         # React Contexts (App, Auth, Theme)
│   │   ├── pages/           # Route views (Home, Profile, Admin Console, etc.)
│   │   ├── services/        # Axios API configurations & Socket integrations
│   │   └── utils/           # Helper functions
│   └── tailwind.config.js
└── server/
    ├── src/
    │   ├── db/              # Drizzle ORM setup & schemas
    │   ├── modules/         # Feature-based routes, controllers, services, and socket events
    │   ├── utils/           # Utilities (Email, JWT, Logger, Errors)
    │   └── server.js        # Express App initialization & Socket.io attachment
    └── drizzle.config.js
```

---

## 🤝 Contributing

Contributions are welcome! Please follow standard fork-and-pull request workflows. Ensure that your code conforms to the existing style guidelines and runs successfully in the development environment before submitting a PR.

---

<div align="center">
  <p>Built with ❤️ and lots of ☕ for learners like me_</p>
</div>
