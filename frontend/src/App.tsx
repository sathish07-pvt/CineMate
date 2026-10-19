import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { PwaInstallPrompt } from './components/common/PwaInstallPrompt';

import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { DetailsPage } from './pages/DetailsPage';
import { MoodPage } from './pages/MoodPage';
import { WatchlistPage } from './pages/WatchlistPage';
import { RoomsPage } from './pages/RoomsPage';
import { WatchRoomPage } from './pages/WatchRoomPage';
import { FriendsPage } from './pages/FriendsPage';
import { ProfilePage } from './pages/ProfilePage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex flex-col min-h-screen bg-cinemate-bg text-slate-100 antialiased selection:bg-cinemate-accent selection:text-white">
          <Navbar />

          <main className="flex-1 pb-16 lg:pb-0">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/movie/:id" element={<DetailsPage />} />
              <Route path="/tv/:id" element={<DetailsPage />} />
              <Route path="/mood" element={<MoodPage />} />
              <Route path="/watchlist" element={<WatchlistPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/room/:roomCode" element={<WatchRoomPage />} />
              <Route path="/friends" element={<FriendsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </main>

          <Footer />
          <MobileNav />
          <AuthModal />
          <PwaInstallPrompt />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
