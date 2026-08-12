import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AppProvider } from "./context/AppContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import StoryPage from "./pages/StoryPage";
import Passport from "./pages/Passport";
import Suara from "./pages/Suara";

function Footer() {
  return (
    <footer className="border-t border-sepia/25 py-8 text-center text-sm text-sepia">
      <p className="font-display text-base text-tinta">Jelajah Nusa</p>
      <p className="mt-1">Kenali Indonesia. Satu cerita, satu perjalanan.</p>
    </footer>
  );
}

export default function App() {
  return (
    <div className="App">
      <AppProvider>
        <BrowserRouter>
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/jelajah/:slug" element={<StoryPage />} />
              <Route path="/passport" element={<Passport />} />
              <Route path="/suara" element={<Suara />} />
            </Routes>
          </main>
          <Footer />
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}
