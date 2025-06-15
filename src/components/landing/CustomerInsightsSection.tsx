
import React from "react";
import { BarChart2, CircleUser, LineChart, Activity, Mail, Users2 } from "lucide-react";

const features = [
  {
    icon: <Activity className="w-5 h-5 text-brand-blue" />,
    title: "Centralized dashboard",
    text: "Get a crystal-clear view of project health, tasks, and payments in one portal."
  },
  {
    icon: <LineChart className="w-5 h-5 text-brand-yellow" />,
    title: "Client feedback, at a glance",
    text: "Integrated ratings and comments keep you one step ahead of client needs."
  },
  {
    icon: <Mail className="w-5 h-5 text-brand-navy" />,
    title: "Effortless file sharing",
    text: "Secure, trackable delivery for designs, docs, and final assets."
  },
  {
    icon: <Users2 className="w-5 h-5 text-brand-navy" />,
    title: "Unlimited collaborators",
    text: "Invite clients or teammates to any project—no extra seats required."
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-brand-blue" />,
    title: "Performance reporting",
    text: "Export progress reports to prove your impact and win repeat business."
  }
];

const CustomerInsightsSection = () => (
  <section className="py-16 px-3 bg-white">
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold text-brand-black mb-12 text-center">Deeper client insights, less manual tracking</h2>
      <div className="grid md:grid-cols-3 gap-7 mb-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
          <LineChart className="w-9 h-9 text-brand-yellow mb-2" />
          <h3 className="font-bold text-brand-black text-lg mb-1">Project overview</h3>
          <p className="text-sm text-brand-navy/70 text-center">Instantly see every project's key metrics—budget, status, activity—across all clients.</p>
        </div>
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
          <Activity className="w-9 h-9 text-brand-blue mb-2" />
          <h3 className="font-bold text-brand-black text-lg mb-1">Detailed logs</h3>
          <p className="text-sm text-brand-navy/70 text-center">Drill into any deliverable, message, or approval—no digging through emails.</p>
        </div>
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
          <Users2 className="w-9 h-9 text-brand-navy mb-2" />
          <h3 className="font-bold text-brand-black text-lg mb-1">Integrated reports</h3>
          <p className="text-sm text-brand-navy/70 text-center">Auto-generated summaries help you keep clients up-to-date (and happy) with zero effort.</p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-5 md:gap-8">
        {features.map((f, i) => (
          <div key={i} className="bg-white flex items-center gap-2 text-brand-navy/80 text-sm px-4 py-2 rounded-lg border border-slate-100 shadow hover:shadow-md transition font-medium">
            <span>{f.icon}</span>
            <span>{f.title}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);
export default CustomerInsightsSection;
