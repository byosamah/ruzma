
import React from "react";
import { FileBarChart, BarChartHorizontal, Wallet, Rocket } from "lucide-react";

const SupportFeaturesSection = () => (
  <section className="py-16 bg-slate-50 px-3">
    <div className="container mx-auto">
      <h2 className="text-2xl font-bold mb-10 text-brand-black text-center">
        Seamless &amp; powerful customer support features
      </h2>
      <div className="grid md:grid-cols-3 gap-8 mb-10">
        <div className="bg-yellow-100 rounded-xl border border-brand-yellow/40 p-6 flex flex-col justify-between shadow min-h-[180px]">
          <div className="flex gap-2 items-center mb-2">
            <Wallet className="w-7 h-7 text-brand-yellow" />
            <span className="font-semibold text-brand-black">Track all your marketing expenses</span>
          </div>
          <p className="text-brand-navy/70 text-sm mb-4">View, analyze, and compare operational budgets with clarity. Transparency for every project.</p>
        </div>
        <div className="bg-purple-100 rounded-xl border border-purple-200 p-6 flex flex-col justify-between shadow min-h-[180px]">
          <div className="flex gap-2 items-center mb-2">
            <FileBarChart className="w-7 h-7 text-brand-navy" />
            <span className="font-semibold text-brand-black">Get automatic reports for all campaigns</span>
          </div>
          <p className="text-brand-navy/70 text-sm mb-4">Scheduled project analytics straight to your inbox. Stay on top of performance.</p>
        </div>
        <div className="bg-red-100 rounded-xl border border-red-200 p-6 flex flex-col justify-between shadow min-h-[180px]">
          <div className="flex gap-2 items-center mb-2">
            <Rocket className="w-7 h-7 text-red-400" />
            <span className="font-semibold text-brand-black">Boost your targeting audience</span>
          </div>
          <p className="text-brand-navy/70 text-sm mb-4">Enhance your reach with smart audience signals, tailored recommendations, and segmentation tools.</p>
        </div>
      </div>
      <div className="text-center">
        <a href="#integrations" className="inline-block text-brand-black font-semibold px-8 py-3 bg-brand-yellow rounded-lg shadow hover:bg-brand-yellow/90 transition mt-4 text-base">
          View all integrations
        </a>
      </div>
    </div>
  </section>
);
export default SupportFeaturesSection;
