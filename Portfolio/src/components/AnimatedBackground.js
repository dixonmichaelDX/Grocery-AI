// src/components/AnimatedBackground.jsx
import React from "react";
import Particles from "react-tsparticles";

const AnimatedBackground = () => {
  return (
    <Particles
      id="tsparticles"
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: { color: "transparent" },
        fpsLimit: 60,
        interactivity: {
          events: {
            onHover: { enable: true, mode: "repulse" },
            onClick: { enable: true, mode: "push" },
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 4 },
          },
        },
        particles: {
          number: { value: 80, density: { enable: true, area: 800 } },
          color: { value: ["#667eea", "#764ba2", "#f093fb"] },
          shape: { type: "circle" },
          opacity: { value: 0.5 },
          size: { value: { min: 1, max: 4 } },
          move: {
            enable: true,
            speed: 1.5,
            direction: "none",
            outModes: "bounce",
          },
          links: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.1,
            width: 1,
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default AnimatedBackground;
