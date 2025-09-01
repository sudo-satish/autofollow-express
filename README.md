# Auto Follow AI 🤖

A comprehensive WhatsApp automation platform that enables businesses to connect their WhatsApp accounts and automatically engage with clients through AI-powered agents built with LangGraph.

## 🚀 Features

### Core Functionality

- **WhatsApp Integration**: Connect your WhatsApp account via QR code scanning
- **AI-Powered Agents**: Create and configure custom AI agents with LangGraph for intelligent automation
- **Automated Follow-ups**: Schedule and automate follow-up messages to clients
- **Client Management**: Organize and manage your client database
- **Real-time Messaging**: Live chat functionality with message logging
- **Multi-company Support**: Support for multiple companies with role-based access
- **Knowledge Management**: RAG (Retrieval-Augmented Generation) system for intelligent responses

### Admin Features

- **Super Admin Dashboard**: Manage companies, agents, and system-wide settings
- **Agent Management**: Create, edit, and configure AI agents
- **Company Management**: Oversee multiple companies and their users
- **User Management**: Manage user access and permissions

### User Features

- **Dashboard**: Overview of clients, follow-ups, and WhatsApp status
- **Client Management**: Add, edit, and track client information
- **Follow-up Scheduling**: Create automated follow-up sequences
- **WhatsApp Status**: Monitor connection status and manage WhatsApp integration

## 🛠️ Tech Stack

### Backend Technologies

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework for Node.js
- **LangGraph** - Framework for building stateful, multi-actor applications with LLMs
- **Anthropic Claude** - Large Language Model (LLM) for AI-powered features
  - _Planned Migration_: AWS Bedrock integration
- **MongoDB** - NoSQL document database for data persistence
- **Redis** - In-memory data structure store (Event Bridge for real-time communication)
- **Clerk** - Authentication and user management service
  - _Planned Migration_: Custom authentication system

### Frontend Technologies

- **React** - JavaScript library for building user interfaces
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development

### External Services

- **Tavily** - AI-powered web search API for research and information gathering
- **WhatsApp Web.js** - WhatsApp Business API integration
  - _Planned Migration_: ChatDaddy integration

### DevOps & Infrastructure

- **Docker** - Containerization platform
  - _Planned_: Kubernetes (K8s) orchestration
- **Nodemon** - Development server with auto-restart
- **ESLint** - Code linting and formatting

## 📋 Prerequisites

Before running this project, make sure you have:

- **Git** - for cloning the repository
- **Node.js** (v18 or higher) - for running the application
- **Docker & Docker Compose** - for containerized services
- **Clerk Account** - for authentication (sign up at [clerk.com](https://clerk.com))

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd autofollow-express
```

### 2. Install Dependencies

```bash
# Backend dependencies
cd be
npm install

# Frontend dependencies
cd ../fe
npm install

# WhatsApp bot dependencies
cd ../wwebjs-bot
npm install

# Return to root directory
cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Database Configuration
MONGO_DB=autofollow
MONGO_PORT=27017
REDIS_PORT=6379

# Backend Configuration
BE_PORT=3000
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
TAVILY_API_KEY=your_tavily_api_key_here

# Frontend Configuration
FE_PORT=5173
API_URL=http://localhost:3000/api
SOCKET_URL=http://localhost:3000

# Puppeteer Configuration
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

### 4. Start Services

```bash
# Start all services in development mode
docker-compose --profile dev up -d

# Verify services are running
docker-compose --profile dev ps
```

### 5. Seed the Database

```bash
cd be
npm run seed
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## 📱 Usage Guide

### 1. Authentication

- Sign up/sign in using Clerk authentication
- Super admins will have access to the admin dashboard
- Regular users will be directed to the main dashboard

### 2. WhatsApp Connection

1. Navigate to your dashboard
2. Click on "Connect WhatsApp"
3. Scan the QR code with your WhatsApp mobile app
4. Once connected, your WhatsApp status will show as "Connected"

### 3. Creating AI Agents

1. Go to Admin Dashboard → Agents
2. Click "Create New Agent"
3. Configure:
   - **Name**: Agent identifier
   - **System Prompt**: Define the agent's behavior and personality
   - **Description**: Optional description of the agent's purpose
4. Save the agent

### 4. Managing Clients

1. Go to Dashboard → Clients
2. Click "Add New Client"
3. Fill in:
   - **Name**: Client's full name
   - **Phone**: Phone number (with country code)
   - **Status**: Current client status
4. Save the client

### 5. Scheduling Follow-ups

1. Go to Dashboard → Follow-ups
2. Click "Create Follow-up"
3. Configure:
   - **Client**: Select the target client
   - **Follow-up Date/Time**: When the follow-up should occur
   - **Auto Mode**: Enable for automated messaging
   - **Context**: Brief description of the follow-up purpose
   - **Agent**: Select the AI agent to handle the conversation
4. Save the follow-up

## 🏗️ Project Structure

```
autofollow-express/
├── be/                          # Backend (Node.js + Express)
│   ├── database/
│   │   └── db.js               # MongoDB connection
│   ├── models/                  # Database models
│   │   ├── agent.js            # AI agent model
│   │   ├── client.js           # Client model
│   │   ├── company.js          # Company model
│   │   ├── followup.js         # Follow-up model
│   │   └── messageLog.js       # Message logging
│   ├── router/                  # API routes
│   ├── services/                # External services
│   ├── utils/                   # Utility functions
│   └── index.js                # Main server file
├── fe/                          # Frontend (React + Vite)
│   ├── src/
│   │   ├── admin/              # Admin dashboard components
│   │   ├── dashboard/          # User dashboard components
│   │   ├── hooks/              # Custom React hooks
│   │   └── config/             # Configuration files
│   └── package.json
├── wwebjs-bot/                  # WhatsApp bot service
├── docker-compose.yml           # Multi-service orchestration
└── README.md
```

## 🔧 Development Commands

```bash
# Backend
cd be
npm run dev          # Start development server

# Frontend
cd fe
npm run dev          # Start Vite dev server

# Docker
docker-compose --profile dev up -d    # Start all services
docker-compose --profile dev down     # Stop all services
docker-compose --profile dev logs -f  # View logs
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/*` - Clerk authentication endpoints

### Companies

- `GET /api/companies` - Get user's companies
- `POST /api/companies` - Create new company
- `PUT /api/companies/:id` - Update company
- `DELETE /api/companies/:id` - Delete company

### Agents

- `GET /api/agents` - Get all agents
- `POST /api/agents` - Create new agent
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent

### Clients

- `GET /api/clients` - Get company clients
- `POST /api/clients` - Create new client
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### Follow-ups

- `GET /api/followups` - Get company follow-ups
- `POST /api/followups` - Create new follow-up
- `PUT /api/followups/:id` - Update follow-up
- `DELETE /api/followups/:id` - Delete follow-up

### WhatsApp

- `POST /api/whatsapp/connect` - Connect WhatsApp
- `POST /api/whatsapp/disconnect` - Disconnect WhatsApp
- `GET /api/whatsapp/status` - Get connection status

## 🔒 Security

- **Authentication**: Clerk handles user authentication and session management
- **Authorization**: Role-based access control (super_admin, user)
- **API Security**: Protected routes with JWT tokens
- **Data Validation**: Input validation on all endpoints

## 🚀 Migration Roadmap

1. **Phase 1**: Replace WhatsApp Web.js with ChatDaddy
2. **Phase 2**: Migrate from Anthropic to AWS Bedrock
3. **Phase 3**: Implement custom authentication system
4. **Phase 4**: Deploy to Kubernetes cluster

## 🔮 Future Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with CRM systems
- [ ] Mobile app development
- [ ] Advanced AI agent training with LangGraph
- [ ] Bulk messaging capabilities
- [ ] Message templates
- [ ] Performance optimization
- [ ] Kubernetes deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Auto Follow AI** - Automating client engagement with AI-powered WhatsApp conversations using LangGraph 🤖📱

## 🐳 Docker Commands (Podman Compatible)

```bash
# Start development environment
podman compose --profile dev up -d

# Stop development environment
podman compose --profile dev down

# View logs
podman compose --profile dev logs -f be-dev fe-dev | cat

# Restart services
podman compose --env-file .env --profile dev stop && podman compose --env-file .env --profile dev up -d
```
