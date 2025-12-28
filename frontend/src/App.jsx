import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, createContext, useContext } from 'react';
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

  return (
    <AppContext.Provider value={{ session, setSession }}>
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
