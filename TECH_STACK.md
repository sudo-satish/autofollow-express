# Tech Stack

## Backend Technologies

### Core Framework

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js

### AI & ML

- **LangGraph** - Framework for building stateful, multi-actor applications with LLMs
- **Anthropic Claude** - Large Language Model (LLM) for AI-powered features
  - _Planned Migration_: AWS Bedrock integration

### Database & Caching

- **MongoDB** - NoSQL document database for data persistence
- **Redis** - In-memory data structure store
  - Used as Event Bridge for real-time communication and caching

### Authentication

- **Clerk** - Authentication and user management service
  - _Planned Migration_: Custom authentication system

### External Services

- **Tavily** - AI-powered web search API for research and information gathering

### Communication

- **WhatsApp Web.js** - WhatsApp Business API integration
  - _Planned Migration_: ChatDaddy integration

## Frontend Technologies

### Core Framework

- **React** - JavaScript library for building user interfaces
- **Vite** - Build tool and development server

### Styling

- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

## DevOps & Infrastructure

### Containerization

- **Docker** - Containerization platform
  - _Planned_: Kubernetes (K8s) orchestration

### Development Tools

- **Nodemon** - Development server with auto-restart
- **ESLint** - Code linting and formatting

## Project Structure

```
autofollow-express/
├── be/                 # Backend (Node.js + Express)
├── fe/                 # Frontend (React + Vite)
├── wwebjs-bot/         # WhatsApp bot service
└── docker-compose.yml  # Multi-service orchestration
```

## Key Features

- **Multi-Agent System** - Built with LangGraph for intelligent automation
- **Real-time Communication** - Redis-powered event system
- **AI-Powered Follow-ups** - LLM-driven customer engagement
- **WhatsApp Integration** - Business communication automation
- **Knowledge Management** - RAG (Retrieval-Augmented Generation) system
- **Multi-tenant Architecture** - Company and user management

## Migration Roadmap

1. **Phase 1**: Replace WhatsApp Web.js with ChatDaddy
2. **Phase 2**: Migrate from Anthropic to AWS Bedrock
3. **Phase 3**: Implement custom authentication system
4. **Phase 4**: Deploy to Kubernetes cluster

## Development Commands

```bash
# Backend
cd be
npm run dev          # Start development server

# Frontend
cd fe
npm run dev          # Start Vite dev server

# Docker
docker-compose up    # Start all services
```
