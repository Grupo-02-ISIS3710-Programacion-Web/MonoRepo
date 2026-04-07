# Frontend & Backend Integration Setup

## 🎯 Quick Start

### Frontend + Backend Integration (Development)

The Skin4All application consists of a Next.js frontend and NestJS backend, now fully integrated!

```bash
# Terminal 1: Start the Backend (runs on port 5001)
cd Back-end
npm install  # or pnpm install
npm run start:dev

# Terminal 2: Start the Frontend (runs on port 3000)
cd Front-end
npm install  # or pnpm install
npm run dev
```

Then open **http://localhost:3000** in your browser to access the integrated application.

## 📋 Architecture

```
┌─────────────────┐
│  Frontend       │
│  (Next.js)      │
│  Port 3000      │
└────────┬────────┘
         │ HTTP Requests
         │ (localhost:5001/api)
         ▼
┌─────────────────┐
│  Backend        │
│  (NestJS)       │
│  Port 5001      │
└─────────────────┘
```

## 🔧 Environment Configuration

### Backend `.env` File
Location: `/Back-end/.env`

```
PORT=5001
NODE_ENV=development
SKIP_DB_INIT=true

# Database Configuration (for future PostgreSQL integration)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=skin4all
```

### Frontend `.env.local` File
Location: `/Front-end/.env.local`

```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## 🌐 API Endpoints

All API endpoints are available at: `http://localhost:5001/api`

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `GET /api/products/category/:category` - Filter by category
- `GET /api/products/skin-type/:skinType` - Filter by skin type

### Users
- `GET /api/users` - List users
- `GET /api/users/:id` - Get user profile
- `POST /api/auth/login` - User login
- `POST /api/users` - Create new user

### Routines
- `GET /api/routines` - List all routines
- `GET /api/routines/:id` - Get routine details
- `POST /api/routines` - Create new routine
- `PUT /api/routines/:id` - Update routine
- `DELETE /api/routines/:id` - Delete routine
- `POST /api/routines/:id/upvote` - Upvote routine
- `POST /api/routines/:id/downvote` - Downvote routine

### Comments
- `GET /api/routines/:id/comments` - List comments
- `POST /api/routines/:id/comments` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

### AI Features
- `POST /api/ai/routines/generate` - Generate routine from user profile
- `POST /api/ai/products/suggest` - Suggest products based on concerns
- `GET /api/ai/tools` - List available AI tools
- `POST /api/ai/agent/chat` - Chat with AI agent
- `POST /api/ai/agent/search` - Search products via AI agent

## 🗄️ Database Setup (Optional - Docker)

To run with a real PostgreSQL database using Docker Compose:

```bash
cd Back-end

# Remove the SKIP_DB_INIT=true flag from .env
# Set DB_HOST=postgres in .env for Docker networking

# Start all services
docker-compose up -d

# This will:
# - Start PostgreSQL on port 5432
# - Start the backend on port 5001
# - Initialize the database schema
```

**Docker Compose includes:**
- PostgreSQL 16 Alpine image
- Backend service with hot-reload
- Automatic health checks
- Volume persistence

## 🧪 Testing the Integration

### Backend API
```bash
# Test products endpoint
curl http://localhost:5001/api/products | jq '.data | length'

# Test users endpoint
curl http://localhost:5001/api/users | jq '.data | length'
```

### Frontend
```bash
# Open in browser
http://localhost:3000

# Or test with curl
curl http://localhost:3000/en | grep "<title>"
```

## 📁 Project Structure

```
.
├── Back-end/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── product/
│   │   │   ├── user/
│   │   │   ├── routine/
│   │   │   ├── comment/
│   │   │   └── ai/
│   │   ├── database/        (TypeORM entities and config)
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── .env
│   ├── docker-compose.yml
│   ├── Dockerfile
│   ├── init-db.sql
│   └── package.json
│
└── Front-end/
    ├── app/
    ├── components/
    ├── lib/
    │   ├── api.ts          (Mock data - for fallback)
    │   └── api-client.ts   (Backend integration)
    ├── .env.local
    └── package.json
```

## 🔌 API Client Usage

The frontend has a dedicated API client (`lib/api-client.ts`) for communicating with the backend:

```typescript
import {
  fetchProducts,
  fetchUserById,
  generateRoutineWithAI,
  chatWithAI,
} from '@/lib/api-client';

// Fetch products from backend
const products = await fetchProducts();

// Generate routine with AI
const routine = await generateRoutineWithAI({
  userId: 'u1',
  skinType: 'grasa',
  concerns: ['acne', 'oily'],
  routineType: 'morning',
});

// Chat with AI agent
const response = await chatWithAI('Find products for dry skin');
```

## 🚀 Production Deployment

For production, you can:

1. **Use Docker Compose** for both frontend and backend
2. **Environment Configuration**:
   - Update `NODE_ENV=production`
   - Use a real PostgreSQL database
   - Configure proper CORS settings
   - Add environment-specific secrets

3. **Build for production**:
   ```bash
   # Backend
   npm run build
   npm run start:prod

   # Frontend
   npm run build
   npm run start
   ```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process on port 5001
lsof -ti :5001 | xargs kill -9

# Or use a different port
PORT=5002 npm run start:dev
```

### Frontend Can't Connect to Backend
1. Verify backend is running: `curl http://localhost:5001/api`
2. Check `.env.local` has correct `NEXT_PUBLIC_API_URL`
3. Check CORS settings in `src/main.ts`
4. Browser console will show specific error

### Database Connection Issues (Docker)
```bash
# Check containers
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs postgres

# Reset everything
docker-compose down -v
docker-compose up -d
```

## 📝 Notes

- **In-Memory Data**: By default, the backend uses in-memory mock data (no database required)
- **API Format**: All responses follow the format `{ data: T, statusCode: number, message?: string }`
- **CORS**: Enabled for `http://localhost:3000`
- **Swagger Docs**: Available at `http://localhost:5001/api` (when backend is running)

## 🔄 Integration Workflow

1. Frontend (Next.js) runs on port 3000
2. Frontend makes HTTP requests to backend API (`http://localhost:5001/api`)
3. Backend (NestJS) processes requests and returns data
4. Frontend displays data to user
5. All data is managed through RESTful API endpoints

## 📚 Additional Resources

- Backend API Documentation: See `IMPLEMENTATION_SUMMARY.md` in Back-end folder
- Frontend Structure: See `README.md` in Front-end folder
- API Endpoints: See `API_ENDPOINTS.md` in Back-end folder
