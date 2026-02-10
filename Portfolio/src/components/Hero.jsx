import React from "react";
import profileimg from "./img/aditya.png";
const Hero = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative pt-20">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="floating mb-8">
          <div className="w-48 h-48 mx-auto glass rounded-full neon-glow flex  items-center justify-center">
            <img
              src={profileimg}
              alt="Aditya Profile"
              className="glow-ring w-full h-full rounded-full object-cover"
            />
          </div>
        </div>
        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
          Aditya M
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8">
          Frontend Engineer • React • DevOps Learner
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="glass px-8 py-4 rounded-full hover-glow font-semibold"
            onClick={() =>
              window.open(
                "https://github.com/aditya31031?tab=repositories",
                "_blank"
              )
            }>
            View My Work
          </button>
          <a href="/resume/AdityaResume.pdf" download="Aditya_Resume.pdf">
            <button className="border border-purple-400 px-8 py-4 rounded-full hover:bg-purple-400 hover:bg-opacity-20 transition-al">
              Download CV
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
