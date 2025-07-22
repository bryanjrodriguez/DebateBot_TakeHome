# Kopi Debate API

A FastAPI-based chatbot API that holds a debate and attempts to convince the other side of its views. Built with vertical slice architecture, Supabase for persistence, and Docker for deployment.

## Features
- Post a message to start or continue a debate
- Fetch all chats
- Fetch chat history
- Delete a chat
- Enterprise-level, vertically-sliced architecture

## API Endpoints

- `POST /api/v1/chat/message` — Post a message (start or continue a debate)
- `GET /api/v1/chat/chats` — Fetch all chats
- `GET /api/v1/chat/history/{conversation_id}` — Fetch chat history for a conversation
- `DELETE /api/v1/chat/{conversation_id}` — Delete a chat

## Environment Variables

Create a `.env` file in the root directory with the following:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GOOGLE_API_KEY=your_google_api_key
```

## Setup

1. **Create the database schema in Supabase:**
   - Open the [Supabase SQL Editor](https://app.supabase.com/project/_/sql)
   - Copy and run the SQL from `supabase_schema.sql` in your project
2. **Install requirements:**
   ```sh
   make install
   ```
3. **Run the service (with Docker):**
   ```sh
   make run
   ```
4. **Teardown services:**
   ```sh
   make down
   ```
5. **Clean all containers/volumes:**
   ```sh
   make clean
   ```
6. **Run tests:**
   ```sh
   make test
   ```

## Database
- Uses Supabase (Postgres) for chat message storage.
- Schema includes two tables with relationships:
  1. `conversations`: Stores debate conversation metadata
     - `conversation_id` (text, PRIMARY KEY)
     - `topic` (text)
     - `stance` (text) 
     - `created_at` (timestamp)
  2. `chat_messages`: Stores individual messages
     - `id` (uuid, PRIMARY KEY)
     - `conversation_id` (text, FOREIGN KEY)
     - `role` (text, CHECK IN ('user', 'bot'))
     - `message` (text)
     - `created_at` (timestamp)
     - Indexed on `conversation_id` for faster lookups
     - Foreign key constraint ensures referential integrity with conversations

See `supabase_schema.sql` for the complete schema.

## Architecture

- **app/core/**: shared config, db, DI container
- **app/features/chat/**: all chat-related logic (controllers, services, repos, models)
- **Dependency Injection**: services receive repositories via DI
- **Supabase**: used for persistent storage
