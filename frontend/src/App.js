import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import GameDetail from './pages/GameDetail';
import Favorites from './pages/Favorites';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Discover from './pages/Discover';
import Browse from './pages/Browse';
import TopCharts from './pages/TopCharts';
import Upcoming from './pages/Upcoming';
import News from './pages/News';
import Community from './pages/Community';
import Wishlist from './pages/Wishlist';
import Recent from './pages/Recent';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PrivateRoute from './components/PrivateRoute';
import './App.css';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname)
    || location.pathname.startsWith('/reset-password/');

  if (isAuthPage) {
    return (
      <div className="App">
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ background: 'var(--bg-root)' }}
        >
          <Routes>
            <Route path="/login"            element={<Login />} />
            <Route path="/register"          element={<Register />} />
            <Route path="/forgot-password"   element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <Navbar />
      <Sidebar />
      <main>
        <Routes>
          {/* Core pages */}
          <Route path="/"          element={<Home />} />
          <Route path="/game/:id"  element={<GameDetail />} />

          {/* Discover / Search */}
          <Route path="/discover"  element={<Discover />} />

          {/* Browse */}
          <Route path="/browse"    element={<Browse />} />

          {/* Charts */}
          <Route path="/charts"    element={<TopCharts />} />

          {/* Upcoming */}
          <Route path="/upcoming"  element={<Upcoming />} />

          {/* Sidebar destinations */}
          <Route path="/news"       element={<News />} />
          <Route path="/community"  element={<Community />} />

          {/* Auth-protected */}
          <Route
            path="/favorites"
            element={
              <PrivateRoute>
                <Favorites />
              </PrivateRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <PrivateRoute>
                <Wishlist />
              </PrivateRoute>
            }
          />
          <Route
            path="/recent"
            element={
              <PrivateRoute>
                <Recent />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
