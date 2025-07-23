# Kopi Monorepo

## Live Demo

- **Website**: [https://bryanrodriguez.dev](https://bryanrodriguez.dev)
- **Live API**: [https://api.bryanbrodriguez.dev](https://api.bryanbrodriguez.dev)

A debate platform monorepo containing the following components:

```
kopi-monorepo/
├── kopi-fe/           # Next.js Frontend 
├── kopi-debate-api/   # FastAPI Backend 
└── infra/            # Terraform 
```

See individual project READMEs for detailed documentation.

## Prerequisites
1. Node.js 20.x or later
2. Python 3.11 or later
3. Docker and Docker Compose
4. Make
5. Supabase account (for database see more in kopi-debate-api readme)

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

## Infrastructure Setup

- **Frontend**: The Next.js frontend is hosted on Vercel.
- **Backend**: The FastAPI backend is hosted on AWS ECS Fargate. The infrastructure is managed with Terraform and can be found in the `infra/` directory.

## Production Considerations

Given the time constraints of a take-home assignment, I couldn't implement all the infrastructure and practices I would for a production-grade project. If this was a funded project the following would be completed:

- **Multiple Environments**: Separate environments for development, staging, and production to ensure a robust development and release cycle.
- **Observability**: Integration with a platform like Datadog for comprehensive monitoring, logging, and alerting.
- **Real-time LLM Streaming**: Implementing WebSockets to stream the AI's response token-by-token, providing a more interactive and responsive chat interface.
- **AWS Bedrock Integration**: Adding support for AWS Bedrock to allow users to select from a variety of foundation models to debate against.
- **Retry Strategies**: Implementing robust retry mechanisms for transient failures in API calls and other services.
- **Rate Limiting**: Protecting the API from abuse and ensuring fair usage with rate limiting.
- **Authentication**: Adding User accounts so debate conversations are private