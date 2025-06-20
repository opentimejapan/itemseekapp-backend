# ItemSeek Backend Setup Guide

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/opentimejapan/itemseekapp-backend.git
cd itemseekapp-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Database

#### Option A: Using PostgreSQL locally
```bash
# macOS
brew install postgresql
brew services start postgresql

# Create database
createdb itemseek
```

#### Option B: Using Docker
```bash
docker run --name itemseek-db -e POSTGRES_DB=itemseek -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15
```

### 4. Configure Environment
```bash
# Copy example env file
cp .env.example .env

# Edit .env and update DATABASE_URL
# For local PostgreSQL (replace 'youruser' with your system username):
DATABASE_URL=postgresql://youruser@localhost:5432/itemseek

# For Docker:
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/itemseek
```

### 5. Setup Database Tables
```bash
# Generate migration files (if needed)
npm run db:generate

# Apply migrations to create tables
npm run db:push

# Seed with demo data
npm run db:seed
```

### 6. Start Server
```bash
npm run dev
```

Server will start on http://localhost:3100

## Verify Setup

Check the health endpoint:
```bash
curl http://localhost:3100/health
```

## Common Issues

### DATABASE_URL environment variable is required
Make sure you've created the `.env` file and it contains the DATABASE_URL.

### Connection refused to PostgreSQL
1. Check PostgreSQL is running: `pg_isready`
2. Check you can connect: `psql -d itemseek`
3. Verify the DATABASE_URL format

### Permission denied
If using local PostgreSQL, try:
```bash
DATABASE_URL=postgresql://$(whoami)@localhost:5432/itemseek
```

## Next Steps

1. Start the frontend apps: https://github.com/opentimejapan/itemseekapp
2. Access API documentation at http://localhost:3100/api-docs (coming soon)
3. Use Drizzle Studio to view data: `npm run db:studio`