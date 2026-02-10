import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Calculator from "./components/calculator/Calculator";
import "./App.css";
import TodoList from "./components/todoList/TodoList";
import Weather3DApp from "./components/weather/Weather";

function AppContent() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  // Progress loader
  useEffect(() => {
    const duration = 3000;
    const interval = 50;
    let time = 0;

    const timer = setInterval(() => {
      time += interval;
      setProgress(Math.min((time / duration) * 100, 100));
      if (time >= duration) {
        clearInterval(timer);
        setTimeout(() => setLoading(false), 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Sparkles generator
  const colors = ["#FFD700", "#FF4500", "#FFFFFF", "#1E90FF"];
  const generateSparkles = (count) => {
    const sparkles = [];
    for (let i = 0; i < count; i++) {
      const size = Math.random() * 4 + 2;
      const top = Math.random() * 100 + "%";
      const left = Math.random() * 100 + "%";
      const delay = Math.random() * 10 + "s";
      const duration = Math.random() * 20 + 10 + "s";
      const radius = Math.random() * 50 + 50;
      const color = colors[Math.floor(Math.random() * colors.length)];

      sparkles.push(
        <div
          key={i}
          className="sparkle"
          style={{
            width: size + "px",
            height: size + "px",
            top,
            left,
            backgroundColor: color,
            animationDelay: delay,
            animationDuration: duration,
            position: "absolute",
            borderRadius: "50%",
            transform: `translateX(${radius}px)`,
          }}
        />
      );
    }
    return sparkles;
  };

  return (
    <div className="relative min-h-full bg-gray-900 text-white overflow-hidden">
   
      {!loading && location.pathname === "/" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {generateSparkles(100)}
        </div>
      )}

      {loading ? (
        <div className="loading-screen">
          <div className="loading-box">
            <h2 className="loading-text">Loading Portfolio...</h2>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="loading-percent">{Math.floor(progress)}%</p>
          </div>
        </div>
      ) : (
        <Routes>
          {/* Home Page */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <Hero />
                <Projects />
                <Skills />
                <Contact />
                <Footer />
              </>
            }
          />
          {/* Calculator Page */}
          <Route path="/calculator" element={<Calculator />} />
          <Route path="/todolist" element={<TodoList />} />
          <Route path="/weather" element={<Weather3DApp />} />
        </Routes>
      )}
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