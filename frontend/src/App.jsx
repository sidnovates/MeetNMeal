import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';
import { wsService } from './services/websocket';
import Home from "./pages/Home";
import Join from "./pages/Join";
import Preferences from "./pages/Preferences";
import Results from "./pages/Results";

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export default function App() {
  const [session, setSession] = useState({
    groupId: null,
    userId: null,
  });
  const [closingTimer, setClosingTimer] = useState(null);

  // Global WebSocket Listeners
  useEffect(() => {
    const unsubClosing = wsService.on('SESSION_CLOSING', (data) => {
      setClosingTimer(data.time_left);
    });

    const unsubExpired = wsService.on('SESSION_EXPIRED', () => {
      alert("Session has ended.");
      setSession({ groupId: null, userId: null });
      setClosingTimer(null);
    });

    return () => {
      unsubClosing && unsubClosing();
      unsubExpired && unsubExpired();
    };
  }, []);

  // Clear timer if user leaves session
  useEffect(() => {
    if (!session.groupId) {
      setClosingTimer(null);
    }
  }, [session.groupId]);

  // Countdown effect
  useEffect(() => {
    if (closingTimer !== null && closingTimer > 0) {
      const timer = setInterval(() => {
        setClosingTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (closingTimer === 0) {
      setSession({ groupId: null, userId: null });
      setClosingTimer(null);
    }
  }, [closingTimer]);

  return (
    <AppContext.Provider value={{ session, setSession }}>
      <Toaster position="top-center" />

      {/* Global Notification Overlay */}
      {closingTimer !== null && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-bounce-in">
          <div className="bg-red-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold border-4 border-red-400">
            <RotateCcw className="animate-spin-slow" size={20} />
            <span>Session ending in {closingTimer}s...</span>
          </div>
        </div>
      )}

      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/join/:groupId" element={<Join />} />
          <Route path="/preferences" element={
            session.userId ? <Preferences /> : <Navigate to="/" />
          } />
          <Route path="/results" element={
            session.userId ? <Results /> : <Navigate to="/" />
          } />
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
}
