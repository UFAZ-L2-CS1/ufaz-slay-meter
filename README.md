# 🌟 UFAZ Slay Meter

**A social vibes application** that allows users to send and receive positive messages ("vibes"), compete in daily vibe wars, and climb leaderboards based on community engagement [file:1].

> *"That's so fetch!"* - A modern platform for spreading positivity and celebrating personality.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- **Send Vibes**: Send personalized messages to other users (authenticated or anonymous)
- **Profile Management**: Customizable user profiles with avatars, bios, and social links
- **Vibe Reactions**: React to vibes with multiple emoji types (like, love, funny, sparkle)
- **Tag System**: Categorize vibes with custom tags and view statistics

### Social Features
- **Daily Vibe Wars**: Scheduled daily competitions where two random vibes compete for votes
- **Leaderboard**: Global rankings based on vibe popularity and user engagement
- **Explore Page**: Discover trending vibes and popular users
- **User Profiles**: View user statistics, vibe collections, and tag analytics

### Technical Features
- **Real-time Updates**: Live vote counting and war status tracking
- **Rate Limiting**: Prevents spam and abuse with intelligent rate limiting
- **Anonymous Vibes**: Send vibes without revealing your identity
- **Pagination**: Efficient data loading for large datasets
- **Responsive Design**: Mobile-first, fully responsive UI

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | ^18.2.0 | UI framework |
| React Router | ^6.15.0 | Client-side routing |
| Axios | ^1.5.0 | HTTP client |
| date-fns | ^2.30.0 | Date manipulation |
| Vite | Latest | Build tool & dev server |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | >=18 | Runtime environment |
| Express | ^5.1.0 | Web framework |
| MongoDB | ^8.19.2 | Database (via Mongoose) |
| JWT | ^9.0.2 | Authentication |
| bcryptjs | ^3.0.2 | Password hashing |
| node-cron | ^3.0.3 | Scheduled tasks (wars) |

### DevOps
- **Docker**: Containerization
- **Nginx**: Reverse proxy & static file serving
- **MongoDB Atlas**: Cloud database hosting

---

## 🏗 Architecture

# Project Architecture

## Project Structure

``` bash
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   ├── VibeWars.jsx
│   │   │   ├── Leaderboard.jsx
│   │   │   ├── ExplorePage.jsx
│   │   │   ├── SendVibe.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── Navigation.jsx
│   │   │   ├── AuthModal.jsx
│   │   │   └── VibeCard.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── ThemeContext.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Vibe.js
│   │   │   └── War.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── vibeRoutes.js
│   │   │   ├── profileRoutes.js
│   │   │   ├── usersRoutes.js
│   │   │   ├── exploreRoutes.js
│   │   │   ├── warsRoutes.js
│   │   │   └── apiRoutes.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validate.js
│   │   │   ├── rateLimit.js
│   │   │   ├── errorHandler.js
│   │   │   └── warScheduler.js
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── config/
│   │   │   └── db.js
│   │   └── server.js
│   ├── package.json
│
├── nginx.conf
├── docker-compose.yml
└── README.md
```



### Data Models

#### User Model
{
name: String, // Display name
email: String, // Unique email
password: String, // Hashed password
handle: String, // Unique username (@handle)
bio: String, // Profile bio (max 240 chars)
avatarUrl: String, // Profile picture URL
links: {
instagram: String,
tiktok: String,
website: String
}
}

#### Vibe Model
{
recipientId: ObjectId, // User receiving the vibe
senderId: ObjectId, // User sending (null if anonymous)
isAnonymous: Boolean, // Anonymous flag
text: String, // Vibe message (max 280 chars)
tags: [String], // Category tags
emojis: [String], // Associated emojis
reactions: [{
userId: ObjectId,
type: String // like, love, funny, sparkle
}],
isVisible: Boolean
}

#### War Model
{
contestant1: {
userId: ObjectId,
vibeId: ObjectId,
votes: Number
},
contestant2: {
userId: ObjectId,
vibeId: ObjectId,
votes: Number
},
startTime: Date, // War start (scheduled)
endTime: Date, // War end
status: String, // scheduled, active, ended
votes: [{
userId: ObjectId,
contestantNumber: Number // 1 or 2
}],
winner: Number // 1, 2, or null (tie)
}

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn
- (Optional) Docker & Docker Compose

### Quick Start

#### 1. Clone the Repository
git clone https://github.com/UFAZ-L2-CS1/ufaz-slay-meter.git
cd ufaz-slay-meter

#### 2. Install Dependencies

**Frontend:**
cd frontend
npm install

**Backend:**
cd backend
npm install

#### 3. Environment Configuration

Create `.env` file in `backend/` directory:

Server
PORT=5000
NODE_ENV=development

MongoDB
MONGO_URI=mongodb+srv://admin:admin123@cluster0.qbyx8y3.mongodb.net/ufaz_slay_db

JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

#### 4. Run Development Servers

**Backend:**
cd backend
npm run dev

**Frontend:**
cd frontend
npm start

The app will be available at:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## 🔧 Configuration

### Vite Configuration
The frontend uses Vite with proxy configuration for API requests [file:8]:
export default defineConfig({
plugins: [react()],
server: {
port: 3000,
proxy: {
'/api': 'http://localhost:5000'
}
}
})

### Nginx Configuration
For production deployment, nginx serves the frontend and proxies API requests [file:4]:
- Static files served from `/usr/share/nginx/html`
- API requests proxied to `http://127.0.0.1:5000`
- React Router support with `try_files`

### War Scheduler
Daily vibe wars are automatically created using `node-cron` [file:13]:
- **Schedule**: Daily at 9:30 AM (Asia/Baku timezone)
- **Duration**: 1 hour (9:30 AM - 10:30 AM)
- **Contestants**: 2 random users with visible vibes
- **Auto-end**: Wars automatically end and calculate winners

---

## 📡 API Documentation

### Base URL
http://localhost:5000/api

### Authentication Endpoints

#### Register
POST /api/auth/register
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com",
"password": "password123"
}

#### Login

POST /api/auth/login
Content-Type: application/json

{
"email": "john@example.com",
"password": "password123"
}

GET /api/auth/me
Authorization: Bearer <token>

### Vibe Endpoints

#### Send Authenticated Vibe
POST /api/vibes
Authorization: Bearer <token>
Content-Type: application/json

{
"recipientHandle": "johndoe",
"text": "You're awesome!",
"tags": ["kind", "inspiring"],
"emojis": ["✨", "🔥"]
}

#### Send Anonymous Vibe

POST /api/vibes/anon
Content-Type: application/json

{
"recipientHandle": "johndoe",
"text": "You're amazing!",
"tags": ["supportive"]
}

#### Get User's Vibes

GET /api/vibes/user/:handle?page=1&limit=10

#### React to Vibe

POST /api/vibes/:id/react
Authorization: Bearer <token>
Content-Type: application/json

{
"type": "love" // like, love, funny, sparkle
}

### War Endpoints

#### Get Current War
GET /api/wars/current

#### Vote in War

POST /api/wars/:id/vote
Authorization: Bearer <token>
Content-Type: application/json

{
"contestant": 1 // 1 or 2
}

#### Get War History

GET /api/wars/history?limit=10

### User Endpoints

#### Get User Profile

GET /api/users/:handle

#### Get Leaderboard

GET /api/users/leaderboard?limit=20

#### Search Users

GET /api/users/search?q=john&limit=10

---

## 🐳 Deployment

### Docker Deployment

#### Build and Run
docker-compose up --build

The app will be available at `http://localhost:8080`

#### Docker Compose Configuration [file:2]

services:
app:
build: .
ports:
- "8080:10000"
environment:
- PORT=10000
networks:
- app_net

networks:
app_net:

text

### Production Deployment

#### Build Frontend

cd frontend
npm run build

#### Deploy to Hosting Provider
1. Upload built frontend to static hosting (Netlify, Vercel, etc.)
2. Deploy backend to Node.js hosting (Heroku, Railway, DigitalOcean)
3. Configure environment variables
4. Update CORS origins in backend
5. Set up MongoDB Atlas connection

### Environment Variables for Production
NODE_ENV=production
MONGO_URI=<your-production-mongodb-uri>
JWT_SECRET=<strong-random-secret>
FRONTEND_URL=<your-production-frontend-url>

---

## 🔒 Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Rate Limiting**: Prevents abuse and DDoS attacks
- **Input Validation**: Express-validator for all inputs
- **CORS Configuration**: Whitelist-based origin control
- **Cookie Security**: httpOnly, secure cookies
- **XSS Protection**: Input sanitization

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint configuration
- Follow React best practices
- Write clear commit messages
- Add comments for complex logic

---

## 📝 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Project Name**: UFAZ Slay Meter
- **Version**: 1.0.0
- **Institution**: UFAZ (French-Azerbaijani University)

---

## 🐛 Known Issues

- War scheduler timezone is currently set to Asia/Baku
- Anonymous vibe rate limiting is per-IP
- Profile picture upload not yet implemented (URL-based only)

---

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Contact the development team
- Check documentation wiki

---

## 🗺 Roadmap

- [ ] Real-time notifications with WebSockets
- [ ] Image upload for profile pictures
- [ ] Direct messaging between users
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode enhancements

---

**Made with ❤️ by the UFAZ Slay Meter Team**
