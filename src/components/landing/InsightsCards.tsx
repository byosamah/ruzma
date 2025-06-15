
import React from "react";

const insights = [
  {
    stat: "87%",
    label: "Quicker resolution rate",
    desc: "Customers receive faster answers thanks to real-time task assignment and smart queues."
  },
  {
    stat: "18%",
    label: "Fewer emails, work-arounds",
    desc: "Centralized support means less back-and-forth, lower context switching, and more focus."
  },
  {
    stat: "26%",
    label: "Boost your team's efficiency",
    desc: "Automatic follow-ups and easy hand-offs let agents deliver more value in less time."
  },
];

const InsightsCards = () => (
  <section className="py-16 px-3 bg-white">
    <div className="container mx-auto">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black text-center mb-12">
        Performance insights for your productivity
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {insights.map((insight, i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow px-6 py-8 flex flex-col items-center hover:shadow-lg transition">
            <div className="text-brand-yellow text-4xl font-extrabold mb-2">{insight.stat}</div>
            <div className="font-bold text-brand-black text-lg mb-2 text-center">{insight.label}</div>
            <div className="text-brand-navy/70 text-sm text-center">{insight.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default InsightsCards;
