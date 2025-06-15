
import React from "react";

const insights = [
  {
    stat: "2x",
    label: "Faster client approvals",
    desc: "Clients sign off on work quickly with transparent milestones and real-time updates."
  },
  {
    stat: "98%",
    label: "On-time deliverables",
    desc: "Keep every project on track—no more missed deadlines or scattered handoffs."
  },
  {
    stat: "3x",
    label: "Fewer payment issues",
    desc: "Automated payment protection gives clients peace of mind and you reliable cash flow."
  },
];

const InsightsCards = () => (
  <section className="py-16 px-3 bg-white">
    <div className="container mx-auto">
      <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-black text-center mb-12">
        Project results your clients (and bottom line) will notice
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
