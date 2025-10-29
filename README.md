# SocialFlow

**Enterprise Multi-Platform Social Media Management**

A comprehensive social media content management platform supporting Instagram, YouTube, LinkedIn, Facebook, and Threads.

![SocialFlow](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Proprietary-red)

---

## 🚀 Quick Start for Developers

### Clone and Run

```bash
# Clone the repository
git clone <your-repo-url>
cd <repo-name>
git checkout apps/socialflow

# Install frontend dependencies
cd frontend
yarn install

# Install backend dependencies
cd ../backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start the app (use provided scripts)
cd ..
chmod +x start.sh
./start.sh
```

**Or run separately:**

```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2 - Frontend  
cd frontend
yarn start
```

App will be available at:
- **Frontend**: http://localhost:7001
- **Backend API**: http://localhost:7002
- **API Docs**: http://localhost:7002/docs

---

## 🚀 Features

- **Multi-Platform Support**: Manage content across 5 major social media platforms
- **Kanban Workflow**: Draft → Scheduled → Posted
- **Content Preview**: Platform-specific realistic previews
- **Analytics Dashboard**: Track engagement and performance
- **Search & Filter**: Find content quickly
- **Duplicate Content**: Copy content between platforms
- **RESTful API**: Complete backend API with documentation

## 🏗️ Tech Stack

**Frontend:**
- React 19
- Tailwind CSS
- Shadcn UI Components
- React Router
- Axios

**Backend:**
- FastAPI (Python 3.9+)
- MongoDB
- Motor (Async MongoDB driver)
- Pydantic validation

## 📦 Installation

### Prerequisites

- Node.js 18+ and Yarn
- Python 3.9+
- MongoDB 5.0+

### Quick Start

**1. Clone the repository**
```bash
git clone <your-repo-url>
git checkout apps/socialflow
cd socialflow
```

**2. Install Dependencies**

**Frontend:**
```bash
cd frontend
yarn install
cp .env.example .env
# Edit .env with your configuration
```

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
```

**3. Start MongoDB**
```bash
# Make sure MongoDB is running on port 27019
mongod --port 27019 --dbpath /data/socialflow
```

**4. Start the Application**

**Backend (Terminal 1):**
```bash
cd backend
source venv/bin/activate
python main.py
# Or: uvicorn main:app --reload --port 7002
```

**Frontend (Terminal 2):**
```bash
cd frontend
yarn start
# Runs on http://localhost:7001
```

**OR use the startup script:**
```bash
chmod +x start.sh
./start.sh
```

## 🌐 Access Points

- **Frontend**: http://localhost:7001
- **Backend API**: http://localhost:7002
- **API Docs**: http://localhost:7002/docs
- **Health Check**: http://localhost:7002/health

## 📁 Project Structure

```
socialflow/
├── README.md
├── DEPLOYMENT.md          # Deployment guide
├── start.sh              # Startup script
├── stop.sh               # Stop script
├── frontend/             # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── SocialFlow.jsx
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
└── backend/              # FastAPI application
    ├── app/
    │   ├── api/          # API routes
    │   ├── core/         # Configuration
    │   ├── models/       # Data models
    │   └── services/     # Business logic
    ├── main.py
    ├── requirements.txt
    └── .env.example
```

## 🔧 Configuration

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=http://localhost:7002
REACT_APP_NAME=SocialFlow
REACT_APP_VERSION=1.0.0
```

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27019
DB_NAME=socialflow
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:7001,http://localhost:3000
```

## 🎨 Available Scripts

### Frontend

```bash
yarn start          # Start development server (port 7001)
yarn build          # Build for production
yarn test           # Run tests
```

### Backend

```bash
python main.py                    # Start server
uvicorn main:app --reload        # Start with hot reload
pytest                            # Run tests
```

## 📊 Sample Data

The app comes with 50 sample content pieces (10 per platform) for testing:
- Instagram: Posts, Reels, Stories, Carousels
- YouTube: Videos, Shorts, Community Posts
- LinkedIn: Posts, Articles, Polls
- Facebook: Posts, Videos, Events
- Threads: Text posts, Threads, Polls

## 🔐 Security

- JWT authentication ready
- Password hashing with bcrypt
- CORS configuration
- Input validation with Pydantic
- Environment-based secrets

## 📈 Scaling

- Async operations with FastAPI
- MongoDB indexing
- Stateless architecture
- Horizontal scaling ready
- Redis caching ready (optional)

## 🚀 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy with Docker

```bash
# Coming soon
docker-compose up -d
```

## 📝 API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:7002/docs
- ReDoc: http://localhost:7002/redoc

### Key Endpoints

**Content Management:**
- `POST /api/v1/content` - Create content
- `GET /api/v1/content` - List content
- `GET /api/v1/content/{id}` - Get content
- `PUT /api/v1/content/{id}` - Update content
- `DELETE /api/v1/content/{id}` - Delete content
- `POST /api/v1/content/{id}/duplicate` - Duplicate content

**Analytics:**
- `GET /api/v1/analytics/overview` - Overall stats
- `GET /api/v1/analytics/platform/{platform}` - Platform stats

## 🤝 Contributing

This is a proprietary product by Elysiom.

## 📞 Support

- Website: https://elysiom.com
- Email: support@elysiom.com

## 📄 License

Proprietary - © 2024 Elysiom. All rights reserved.

---

**Powered by Elysiom** - Agentic Automation Platform