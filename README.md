# Auto Follow AI 🤖

A comprehensive WhatsApp automation platform that enables businesses to connect their WhatsApp accounts and automatically engage with clients through AI-powered agents.

## 🚀 Features

### Core Functionality

- **WhatsApp Integration**: Connect your WhatsApp account via QR code scanning
- **AI-Powered Agents**: Create and configure custom AI agents with specific prompts and behaviors
- **Automated Follow-ups**: Schedule and automate follow-up messages to clients
- **Client Management**: Organize and manage your client database
- **Real-time Messaging**: Live chat functionality with message logging
- **Multi-company Support**: Support for multiple companies with role-based access

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

### Backend

- **Node.js** with **Express.js** - Server framework
- **MongoDB** with **Mongoose** - Database and ODM
- **Redis** - Caching and real-time messaging
- **Socket.IO** - Real-time communication
- **Clerk** - Authentication and user management
- **WhatsApp API** - WhatsApp integration

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time communication
- **Lucide React** - Icon library

## 📋 Prerequisites

Before running this project, make sure you have:

- **Node.js** (v18 or higher)
- **MongoDB** (local or cloud instance)
- **Redis** (local or cloud instance)
- **Clerk Account** (for authentication)
- **WhatsApp Business API** access

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd autofollow-express
```

### 2. Backend Setup

```bash
cd be
npm install
```

Create a `.env` file in the `be` directory:

```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_connection_string
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### 3. Frontend Setup

```bash
cd ../fe
npm install
```

Create a `.env` file in the `fe` directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_URL=http://localhost:3000/api
```

### 4. Start the Development Servers

**Backend:**

```bash
cd be
npm run dev
```

**Frontend:**

```bash
cd fe
npm run dev
```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:3000/api`

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
├── be/                          # Backend
│   ├── database/
│   │   └── db.js               # MongoDB connection
│   │   ├── models/                 # Database models
│   │   │   ├── agent.js           # AI agent model
│   │   │   ├── client.js          # Client model
│   │   │   ├── company.js         # Company model
│   │   │   ├── followup.js        # Follow-up model
│   │   │   └── messageLog.js      # Message logging
│   │   ├── router/                # API routes
│   │   ├── services/              # External services
│   │   ├── utils/                 # Utility functions
│   │   └── index.js              # Main server file
│   └── redis.js              # Redis configuration
├── fe/                        # Frontend
│   ├── src/
│   │   ├── admin/            # Admin dashboard components
│   │   ├── dashboard/        # User dashboard components
│   │   ├── hooks/           # Custom React hooks
│   │   └── config/          # Configuration files
│   └── package.json
└── README.md
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

## 🚀 Deployment

### Backend Deployment

1. Set up environment variables in your hosting platform
2. Install dependencies: `npm install`
3. Start the server: `npm start`

### Frontend Deployment

1. Build the project: `npm run build`
2. Deploy the `dist` folder to your hosting platform
3. Configure environment variables

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

## 🔮 Roadmap

- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Integration with CRM systems
- [ ] Mobile app development
- [ ] Advanced AI agent training
- [ ] Bulk messaging capabilities
- [ ] Message templates
- [ ] Performance optimization

---

**Auto Follow AI** - Automating client engagement with AI-powered WhatsApp conversations 🤖📱

Run podman DEV

```
podman compose --profile dev up -d
```

```
podman compose --profile dev down
```

See latest logs

```
podman compose --profile dev logs -f be-dev fe-dev | cat
```

```
podman compose --env-file .env --profile dev stop && podman compose --env-file .env --profile dev up -d be-dev wwebjs-bot-dev
```
