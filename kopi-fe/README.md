# Kopi Debate Frontend

A Next.js frontend for the debate API takehome project. Built with TypeScript, Tailwind CSS, and Radix UI components.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set environment:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/                   # App router components
│   ├── components/       # Page-specific components
│   ├── hooks/           # Custom React hooks
│   ├── providers/       # Context providers
│   └── types/           # TypeScript definitions
├── components/           # Shared UI components
└── pages/api/           # API routes
```

## API Routes

- `POST /api/v1/chat/message` - Send message
- `GET /api/v1/chat/chats` - Get all chats
- `GET /api/v1/chat/history/{conversationId}` - Get history
- `DELETE /api/v1/chat/{conversationId}` - Delete chat
