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
