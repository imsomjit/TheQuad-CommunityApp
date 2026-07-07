# The Quad Server

Backend API for the quad academic collaboration platform.

## Tech Stack
- **Runtime**: Node.js 20 + Express.js
- **Database**: PostgreSQL 16 (local dev) 
- **ORM**: Drizzle ORM + Drizzle Kit
- **Auth**: JWT (access token in header, refresh token in httpOnly cookie)
- **File Storage**: Cloudinary
- **Real-time**: Server-Sent Events (SSE)
- **Validation**: Zod
- **Logging**: Winston

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16 running locally
- Cloudinary account

### Installation

```bash
cd server
npm install
```

### Environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

### Database
```bash
# Generate migration SQL from schema
npm run db:generate

# Apply migrations to local DB
npm run db:migrate

# Open Drizzle Studio (GUI for DB)
npm run db:studio
```

### Development
```bash
npm run dev
```

Server starts at `http://localhost:5000`

## API Base URL
`http://localhost:5000/api`
