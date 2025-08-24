# Game Discovery Platform

A full-stack web application for discovering and managing your favorite games.

## Features

- User authentication (login/register)
- Search for games using Twitch IGDB API
- Game detail pages with trailers, ratings, and descriptions
- Save games to favorites
- Responsive design for desktop and mobile

## Tech Stack

- **Frontend**: React, React Router, Axios, CSS3
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **API**: Twitch IGDB (Internet Game Database) API
- **Authentication**: JWT tokens

## Project Structure

```
game-discovery-platform/
├── backend/                 # Node.js + Express backend
│   ├── config/             # Database and API configurations
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Authentication middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── public/           # Static files
│   ├── src/              # React source code
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   ├── context/      # React context
│   │   └── styles/       # CSS files
│   └── package.json      # Frontend dependencies
└── README.md             # This file
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file with your environment variables:

   ```
   MONGODB_URI=mongodb://localhost:27017/game-discovery
   JWT_SECRET=d2I04UVowsx2xprVNYXmMJm1WAfW95qUMWvI89CcnSs=
   TWITCH_CLIENT_ID=vn016iiktgs2cj1foc31e3bfvzdn8m
   TWITCH_CLIENT_SECRET=n190shs70lkcnseqmphzkoiuug83xk
   PORT=5000
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   npm install
   ```

2. Start the React development server:
   ```bash
   npm start
   ```

### Getting Twitch IGDB API Credentials

1. Visit [Twitch Developers Console](https://dev.twitch.tv/console)
2. Create a new application
3. Get your Client ID and Client Secret
4. Add them to your backend `.env` file

The IGDB API provides comprehensive game data including:

- Game details, ratings, and release dates
- Screenshots and video trailers
- Developer and publisher information
- Platform availability and genre classifications

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/games/search` - Search games
- `GET /api/games/:id` - Get game details
- `GET /api/favorites` - Get user favorites
- `POST /api/favorites` - Add game to favorites
- `DELETE /api/favorites/:gameId` - Remove from favorites
