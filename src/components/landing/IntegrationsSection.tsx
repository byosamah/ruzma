
import React from "react";
import { Zap, Slack, Mail, Trello, Github, Chrome } from "lucide-react";

const integrations = [
  { icon: <Slack className="w-10 h-10 text-cyan-500" />, name: "Slack" },
  { icon: <Mail className="w-10 h-10 text-orange-400" />, name: "Mail" },
  { icon: <Trello className="w-10 h-10 text-blue-500" />, name: "Trello" },
  { icon: <Github className="w-10 h-10 text-black" />, name: "Github" },
  { icon: <Chrome className="w-10 h-10 text-gray-600" />, name: "Chrome" },
];

const IntegrationsSection = () => (
  <section id="integrations" className="py-14 px-3 bg-brand-black">
    <div className="container mx-auto flex flex-col items-center">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-6">Seamless integration with favourite tools</h2>
      <div className="flex flex-row flex-wrap justify-center items-center gap-8 py-6 mb-2">
        {integrations.map((item, i) => (
          <div key={i} className="flex flex-col items-center justify-center bg-white/10 rounded-full p-4 hover:scale-105 transition">
            {item.icon}
            <span className="text-xs text-white/80 mt-2">{item.name}</span>
          </div>
        ))}
      </div>
      {/* Playful logo centerpiece */}
      <div className="rounded-full bg-brand-yellow w-24 h-24 flex items-center justify-center shadow-lg mt-2 mb-2">
        <Zap className="w-14 h-14 text-brand-black" />
      </div>
    </div>
  </section>
);
export default IntegrationsSection;
