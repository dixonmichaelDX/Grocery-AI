import React from "react";
import item3 from "../components/img/icon/devops2.png";
import item1 from "../components/img/frontend2.png";
import item2 from "../components/img/backend.png";
import react from "../components/img/icon/react.png";
import jsimg from "../components/img/icon/jsimg.png";
import htmlimg from "../components/img/icon/html.png";
import cssimg from "../components/img/icon/css.png";
import dockerimg from "../components/img/icon/docker.png";
import awsimg from "../components/img/icon/hero.png";
import k8img from "../components/img/icon/k8.png";
import cicdImg from "../components/img/icon/cicd5.png";
import nodeimp from "../components/img/icon/nodejs.png";
import exprimg from "../components/img/icon/express2.png";
import monimg from "../components/img/icon/mongodb.png";

const skillsData = [
  {
    category: "Frontend Development",
    description: "Building beautiful user interfaces",
    color: "#29303d",
    emoji: item1,
    skills: [
      { name: "React", icon: react, from: "from-blue-400", to: "to-blue-600" },
      {
        name: "JavaScript",
        icon: jsimg,
        from: "from-yellow-400",
        to: "to-yellow-600",
      },
      {
        name: "Html",
        icon: htmlimg,
        from: "from-cyan-400",
        to: "to-cyan-600",
      },
      {
        name: "Css",
        icon: cssimg,
        from: "",
        to: "",
      },
    ],
  },
  {
    category: "Backend Development",
    description: "Powering applications with robust APIs",
    color: "text-green-300",
    emoji: item2,
    skills: [
      {
        name: "Node.js",
        icon: nodeimp,

      },
      {
        name: "Express.js",
        icon: exprimg,
        from: "from-gray-600",
        to: "to-gray-800",
      },
      {
        name: "MongoDB",
        icon: monimg,
        from: "from-green-500",
        to: "to-green-700",
      },
      {
        name: "PostgreSQL",
        icon: "🐘",
        from: "from-blue-600",
        to: "to-blue-800",
      },
    ],
  },
  {
    category: "DevOps & Cloud",
    description: "Deploying and scaling applications",
    color: "text-purple-300",
    emoji: item3,
    skills: [
      { name: "Docker", icon: dockerimg, from: "from-blue-500", to: "to-blue-700" },
      { name: "AWS", icon: awsimg, from: "", to: "" },
      { name: "CI/CD", icon: cicdImg, from: "from-red-500", to: "to-red-700" },
      {
        name: "Kubernetes",
        icon: k8img,
        from: "",
        to: "",
      },
    ],
  },
];

const Skills = () => {
  return (
    <section id="skills" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-center mb-16 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Skills & Technologies
        </h2>
        <div className="grid lg:grid-cols-3 gap-8">
          {skillsData.map((cat, idx) => (
            <div
              key={idx}
              className="glass rounded-3xl p-8 hover-glow transition-transform duration-300">
              {/* Card Header */}
              <div className="text-center mb-8">
                <div className="w-23 h-30 mx-auto mb-4  rounded-2xl flex items-center justify-center">
                  {typeof cat.emoji === "string" ? (
                    <img
                      src={cat.emoji}
                      alt={`${cat.category} icon`}
                      className=" w-40 h-40 object-contain"
                    />
                  ) : (
                    <span className="text-3xl">{cat.emoji}</span>
                  )}
                </div>

                <h3 className={`text-2xl font-bold ${cat.color}`}>
                  {cat.category}
                </h3>
                <p className="text-gray-400 mt-2">{cat.description}</p>
              </div>

              {/* Skills */}
              <div className="grid grid-cols-2 gap-4 ">
                {cat.skills.map((s, i) => (
                  <div key={i} className="glass rounded-xl p-4 text-center box1 ">
                    <div
                      className={`w-12 h-12 mx-auto mb-3 bg-gradient-to-br ${s.from} ${s.to} rounded-lg flex items-center justify-center box2`}>
                      {/* <span className="text-lg font-bold">{s.icon}</span> */}
                      <img src={s.icon} alt="loading" />
                    </div>
                    <h4 className="font-semibold text-sm">{s.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
