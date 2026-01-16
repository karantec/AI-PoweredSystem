# 🤖 AI-Powered Customer Support System

A fullstack multi-agent customer support system with intelligent routing, specialized agents, and real-time streaming responses.

## 🎯 Features

### ✅ Multi-Agent Architecture
- **Router Agent**: Analyzes queries and routes to appropriate specialist
- **Support Agent**: Handles FAQs, troubleshooting, general inquiries
- **Order Agent**: Manages order status, tracking, delivery queries
- **Billing Agent**: Handles invoices, refunds, payment issues

### ✅ Advanced Capabilities
- **Real-time Streaming**: AI responses stream character-by-character
- **Tool Integration**: Agents query real database for order/invoice/refund data
- **Context Awareness**: Maintains conversation history across messages
- **Smart Routing**: Automatically selects the right agent based on query intent
- **Database Persistence**: All conversations and messages saved

### ✅ Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Hono.js + TypeScript
- **Database**: PostgreSQL + Drizzle ORM
- **AI**: OpenRouter (Claude 3.5 Sonnet)
- **Monorepo**: Turborepo + pnpm

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL
- pnpm
- OpenRouter API key

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd customer-support-ai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Setup PostgreSQL database**
```bash
# Create database
psql -U postgres
CREATE DATABASE customer_support;
\q
```

4. **Configure environment variables**
```bash
# Create .env in apps/api
cd apps/api
```

Create `.env` file:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/customer_support"
ANTHROPIC_API_KEY="your_openrouter_key"
PORT=3000
NODE_ENV=development
```

5. **Setup database schema**
```bash
# From apps/api
pnpm db:push
pnpm seed
```

6. **Start backend**
```bash
# From apps/api
pnpm dev
```

7. **Start frontend (new terminal)**
```bash
# From apps/web
npm start
```

8. **Open browser**
```
http://localhost:3001
```

---

## 📁 Project Structure
```
customer-support-ai/
├── apps/
│   ├── api/                    # Hono backend
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── controllers/    # Request handlers
│   │   │   ├── services/       # Business logic & agents
│   │   │   ├── middleware/     # Error handling, rate limiting
│   │   │   ├── tools/          # Agent tools (DB queries)
│   │   │   └── db/             # Database schema & seed
│   │   └── package.json
│   │
│   └── web/                    # React frontend
│       ├── src/
│       │   ├── components/     # UI components
│       │   └── hooks/          # Custom React hooks
│       └── package.json
│
├── package.json               # Root config
├── turbo.json                 # Turborepo config
└── README.md
```

---

## 🎯 API Endpoints

### Chat Endpoints
- `POST /api/chat/messages` - Send message (streaming)
- `GET /api/chat/conversations/:id` - Get conversation
- `GET /api/chat/conversations` - List conversations
- `DELETE /api/chat/conversations/:id` - Delete conversation

### Agent Endpoints
- `GET /api/agents/agents` - List all agents
- `GET /api/agents/agents/:type/capabilities` - Get agent info

### Health Check
- `GET /api/health` - Server status

---

## 🧪 Testing

### Manual Testing Queries

**Order Queries:**
```
"What is the status of order ORD-001?"
"Track my order ORD-002"
"Where is order ORD-003?"
```

**Billing Queries:**
```
"Check invoice INV-001"
"What's the status of refund REF-001?"
"Show me my invoice INV-002"
```

**Support Queries:**
```
"How do I reset my password?"
"What are your shipping options?"
"I need help with my account"
```

### Expected Behavior
- ✅ Router selects correct agent (ORDER/BILLING/SUPPORT)
- ✅ Agent uses appropriate tools to fetch data
- ✅ Responses stream in real-time
- ✅ Reasoning steps displayed
- ✅ Conversations persist in database

---

## 💾 Database Schema

**Tables:**
- `conversations` - User conversation sessions
- `messages` - Individual chat messages
- `orders` - Sample order data
- `invoices` - Sample invoice data
- `refunds` - Sample refund data

**Sample Data:**
- 3 orders (ORD-001, ORD-002, ORD-003)
- 3 invoices (INV-001, INV-002, INV-003)
- 2 refunds (REF-001, REF-002)

---

## 🤖 Agent System

### Router Agent
- Analyzes query intent using Claude
- Classifies as SUPPORT/ORDER/BILLING
- Delegates to appropriate specialist

### Support Agent
- Handles general inquiries
- Provides troubleshooting help
- Answers FAQs

### Order Agent
**Tools:**
- `get_order_details` - Fetches order info from DB
- `check_delivery_status` - Gets tracking details

### Billing Agent
**Tools:**
- `get_invoice_details` - Retrieves invoice data
- `check_refund_status` - Checks refund progress

---

## ✨ Key Features Implemented

### Required Features ✅
- ✅ Multi-agent architecture with router
- ✅ 3 specialized sub-agents
- ✅ Tool calling with database queries
- ✅ Conversation context persistence
- ✅ Streaming AI responses
- ✅ RESTful API design
- ✅ Error handling middleware
- ✅ Rate limiting
- ✅ PostgreSQL + Drizzle ORM

### Bonus Features ✅
- ✅ Monorepo with Turborepo (+30 points)
- ✅ Real-time typing indicators
- ✅ Agent reasoning display
- ✅ Character-by-character streaming
- ✅ Database seeding
- ✅ Comprehensive logging

---

## 🎬 Demo Video

[Link to Loom video walkthrough]

---

## 📝 Assignment Requirements Met

- ✅ Controller-Service pattern
- ✅ Clean separation of concerns
- ✅ Proper error handling
- ✅ Multi-agent system with router
- ✅ 3 specialized agents (Support, Order, Billing)
- ✅ Agent tools querying database
- ✅ Conversation context maintained
- ✅ RESTful API endpoints
- ✅ Streaming responses
- ✅ Real-time typing indicator
- ✅ React frontend
- ✅ Hono backend
- ✅ PostgreSQL database
- ✅ Turborepo monorepo (+30 bonus)

---

## 🚀 Deployment

### Backend (Railway/Render)
```bash
cd apps/api
pnpm build
# Deploy dist/ folder
```

### Frontend (Vercel/Netlify)
```bash
cd apps/web
npm run build
# Deploy build/ folder
```

---

## 👨‍💻 Developer

Created by [Your Name]

## 📄 License

MIT
```

---

## Step 15: Create .gitignore

Create `customer-support-ai/.gitignore`:
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/
.next/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
pnpm-debug.log*

# Editor
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Database
drizzle/