# Kopi Monorepo

A debate platform monorepo containing the following components:

```
kopi-monorepo/
├── kopi-fe/           # Next.js Frontend 
├── kopi-debate-api/   # FastAPI Backend 
└── infra/            # Terraform 
```

See individual project READMEs for detailed documentation.

## Quick Start

```bash
# Install all dependencies
make install

# Start both frontend and backend
make dev
```

This will start:
- Frontend at http://localhost:3000
- Backend API at http://localhost:8000

## Prerequisites
1. Node.js 20.x or later
2. Python 3.11 or later
3. Docker and Docker Compose
4. Make
5. Supabase account (for database)

## Environment Setup

1. **Frontend (.env in kopi-fe/)**
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

2. **Backend (.env in kopi-debate-api/)**
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   GOOGLE_API_KEY=your_google_api_key
   ```

## Available Commands

```bash
make install  # Install all dependencies
make dev      # Start development environment
make down     # Stop all services
make clean    # Clean up all artifacts
```
