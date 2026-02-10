import React, { useState } from "react";

const Contact = () => {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    e.target.reset();
  };

  return (
    <section id="contact" className="min-h-screen py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-400 bg-clip-text text-transparent">
          Get In Touch
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 glass p-8 rounded-2xl">
          <input type="text" name="name" placeholder="Your Name" required className="p-4 rounded-lg bg-gray-800 text-gray-100 focus:outline-none" />
          <input type="email" name="email" placeholder="Your Email" required className="p-4 rounded-lg bg-gray-800 text-gray-100 focus:outline-none" />
          <textarea name="message" placeholder="Your Message" required className="p-4 rounded-lg bg-gray-800 text-gray-100 focus:outline-none h-32"></textarea>
          <button type="submit" className="px-8 py-3 rounded-full glass hover-glow font-semibold">
            {sent ? "Message Sent! ✨" : "Send Message"}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;
