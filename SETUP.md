# Auto Follow Express - Setup Guide 🚀

This guide will walk you through setting up the Auto Follow Express project step by step.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

- **Git** - for cloning the repository
- **Node.js** (v18 or higher) - for running the application
- **Docker & Docker Compose** - for containerized services
- **Clerk Account** - for authentication (sign up at [clerk.com](https://clerk.com))

## 🚀 Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd autofollow-express
```

### 2. Install Dependencies

Install dependencies for all services:

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

### 3. Docker Setup

#### Create Environment File

Create a `.env` file in the root directory:

```bash
# Copy the example environment file (if available) or create manually
touch .env
```

Add the following environment variables to your `.env` file:

```env
# Database Configuration
MONGO_DB=autofollow
MONGO_PORT=27017
REDIS_PORT=6379

# Backend Configuration
BE_PORT=3000
CLERK_SECRET_KEY=your_clerk_secret_key_here
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
TAVILY_API_KEY=your_tavily_api_key_here (Needed for now, You can use provided test API key)

# Frontend Configuration
FE_PORT=5173
API_URL=http://localhost:3000/api
SOCKET_URL=http://localhost:3000

# Puppeteer Configuration
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
```

**Important:** Replace the placeholder values with your actual Clerk API keys and other service credentials.

#### Start Docker Services

Start the development environment:

```bash
# Start all services in development mode
docker-compose --profile dev up -d

# Verify services are running
docker-compose --profile dev ps
```

**Useful Docker Commands:**

```bash
# View logs
docker-compose --profile dev logs -f

# Stop services
docker-compose --profile dev down

# Restart services
docker-compose --profile dev restart

# Rebuild and restart
docker-compose --profile dev stop && docker-compose --profile dev up -d --build
```

### 4. Seed the Database

Populate the database with initial data:

```bash
# Navigate to backend directory
cd be

# Run the seed script
npm run seed
```

This will create:

- Sample AI agents
- Sample companies
- Sample users
- Sample followup messages

### 5. Configure Clerk Authentication

#### Get Clerk Credentials

Use provided Clerk credentials, because the database seeded user is linked with the clerk test account.
(Don't worry its just a test account, which we will delete later)

- Client Id
- Client secret

#### Update Environment Variables

Update your `.env` file with the actual Clerk credentials:

```env
CLERK_SECRET_KEY=pk_test_your_actual_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
```

Then, Login with company admin with provided credentials,
Once logged in, Select Dashboard. (ignore playground)

#### Restart Services

After updating the environment variables:

```bash
docker-compose --profile dev restart
```

### 6. Create a Client with WhatsApp Number

#### Access the Dashboard

1. Open your browser and go to `http://localhost:5173`
2. Sign in using Clerk authentication
3. Navigate to the **Dashboard**

#### Add a New Client

1. Go to **Clients** section
2. Click **"Add New Client"**
3. Fill in the client details:
   - **Name**: Client's full name
   - **Phone**: WhatsApp number (include country code, e.g., +1234567890)
   - **Status**: Active/Inactive
   - **Company**: Select your company
4. Click **Save**

### 7. Create a Followup with Auto Mode

#### Create Followup

1. Go to **Followups** section
2. Click **"Create Follow-up"**
3. Configure the followup:
   - **Client**: Select the client you just created
   - **Follow-up Date/Time**: Set when the followup should occur
   - **Auto Mode**: ✅ **Enable this checkbox**
   - **Context**: Just copy paste the provided context
   - **Agent**: Select an AI agent (e.g., "Gigger Followup Agent")
4. Click **Save**

### 8. Login with WhatsApp Web

#### Connect WhatsApp

1. In your dashboard, look for **WhatsApp Status**
2. Click **"Connect WhatsApp"**
3. A QR code will appear on the screen
4. Open WhatsApp on your phone
5. Go to **Settings** → **Linked Devices** → **Link a Device**
6. Scan the QR code displayed on your dashboard
7. Wait for the connection to be established

**Note:** Keep your phone connected to the internet while using the WhatsApp Web integration.

### 9. Start Conversation Manually

#### Test the Setup

1. **Send a message** from your WhatsApp to the client's number you added
2. **Check the dashboard** to see if the message appears
3. **Verify auto-responses** if auto mode is working
4. **Monitor the conversation** in the dashboard

#### Manual Testing Steps

1. Go to **Dashboard** → **Overview**
2. Check if WhatsApp status shows as "Connected"
3. Send a test message from your phone to the client number
4. Verify the message appears in the dashboard
5. Check if the AI agent responds automatically (if auto mode is enabled)

## 🔧 Troubleshooting

### Common Issues

#### Docker Services Not Starting

```bash
# Check Docker status
docker --version
docker-compose --version

# Check if ports are already in use
lsof -i :3000
lsof -i :5173
lsof -i :27017
lsof -i :6379
```

#### Database Connection Issues

```bash
# Check MongoDB container
docker-compose --profile dev logs mongo

# Check Redis container
docker-compose --profile dev logs redis
```

#### WhatsApp Connection Problems

- Ensure your phone has a stable internet connection
- Try disconnecting and reconnecting WhatsApp Web
- Check if the WhatsApp Web session is still active on your phone

#### Clerk Authentication Issues

- Verify your Clerk API keys are correct
- Check if your Clerk application is properly configured
- Ensure the redirect URLs are set correctly in Clerk dashboard

### Reset Everything

If you need to start fresh:

```bash
# Stop all services
docker-compose --profile dev down

# Remove all containers and volumes
docker-compose --profile dev down -v

# Rebuild and start
docker-compose --profile dev up -d --build

# Re-seed the database
cd be && npm run seed
```

## 📱 Access Points

After successful setup, you can access:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379

## 🎯 Next Steps

Once everything is working:

1. **Customize AI Agents** - Modify agent prompts and behaviors
2. **Add More Clients** - Import or manually add your client database
3. **Configure Followups** - Set up automated followup sequences
4. **Monitor Performance** - Use the dashboard to track engagement
5. **Scale Up** - Add more agents and companies as needed

## 🆘 Getting Help

If you encounter issues:

1. Check the logs: `docker-compose --profile dev logs -f`
2. Verify environment variables are set correctly
3. Ensure all services are running: `docker-compose --profile dev ps`
4. Check the browser console for frontend errors
5. Review the backend logs for API errors

---

**🎉 Congratulations!** Your Auto Follow Express system is now set up and ready to automate WhatsApp conversations with AI-powered agents.
