
import React from "react";
import { BarChart2, CircleUser, LineChart, Activity, Mail, Users2 } from "lucide-react";

const features = [
  {
    icon: <Activity className="w-5 h-5 text-brand-blue" />,
    title: "Zaplytic’s All-in-One",
    text: "Unified dashboard to spot trends, client engagement, and overall project health."
  },
  {
    icon: <LineChart className="w-5 h-5 text-brand-yellow" />,
    title: "Data-backed Insights",
    text: "Quick analytics on customer feedback and satisfaction at a glance."
  },
  {
    icon: <Mail className="w-5 h-5 text-brand-navy" />,
    title: "Automatic sync points",
    text: "Export reports to email. Reliable sharing for global teams."
  },
  {
    icon: <Users2 className="w-5 h-5 text-brand-navy" />,
    title: "Find customer fit",
    text: "Segment and filter by company, vertical, or account stage."
  },
  {
    icon: <BarChart2 className="w-5 h-5 text-brand-blue" />,
    title: "Scale your outreach",
    text: "Boost retention with targeted engagement and onboarding tools."
  }
];

const CustomerInsightsSection = () => (
  <section className="py-16 px-3 bg-white">
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold text-brand-black mb-12 text-center">Powerful insights to know your customers</h2>
      <div className="grid md:grid-cols-3 gap-7 mb-8">
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
          <LineChart className="w-9 h-9 text-brand-yellow mb-2" />
          <h3 className="font-bold text-brand-black text-lg mb-1">Overview</h3>
          <p className="text-sm text-brand-navy/70 text-center">Get all campaign analytics and overall project sentiment in one glance.</p>
        </div>
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
          <Activity className="w-9 h-9 text-brand-blue mb-2" />
          <h3 className="font-bold text-brand-black text-lg mb-1">Details</h3>
          <p className="text-sm text-brand-navy/70 text-center">Drill down by audience, campaign, or region. Instantly filter your data.</p>
        </div>
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center">
          <Users2 className="w-9 h-9 text-brand-navy mb-2" />
          <h3 className="font-bold text-brand-black text-lg mb-1">Reports</h3>
          <p className="text-sm text-brand-navy/70 text-center">Automatic reports make showing results to leadership easy and repeatable.</p>
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
