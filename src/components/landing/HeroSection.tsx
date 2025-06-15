
import React from "react";
import { Button } from "@/components/ui/button";

const HeroSection = () => (
  <section className="relative overflow-x-clip bg-white pt-14 pb-16 md:pb-28">
    {/* Doodle top left */}
    <svg className="absolute -top-8 left-4 w-20 h-16 opacity-80" fill="none" viewBox="0 0 70 45">
      <path d="M5,30 Q20,5 50,30 T95,20" stroke="#070E1B" strokeWidth="4" fill="none" strokeDasharray="12 7"/>
    </svg>
    <div className="container mx-auto px-5 md:px-10 flex flex-col items-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-brand-black text-center mb-5 leading-tight">
        Deliver collaborative
        <span className="relative inline-block mx-2">
          B2B
          <span className="absolute -bottom-2 left-0 w-full h-2 bg-brand-yellow rounded-full -z-10 opacity-80" />
        </span>
        customer support
      </h1>
      <p className="max-w-2xl text-center text-base md:text-lg text-brand-navy opacity-80 mb-7">
        Streamline your team's communication. Track insights. Measure what matters. Modern and reliable. Perfect for dedicated teams.
      </p>
      <Button className="bg-brand-yellow text-brand-black font-bold px-7 rounded-lg shadow hover:bg-brand-yellow/90 transition mb-6">
        Get started free
      </Button>
      <span className="text-xs text-brand-navy/60 font-medium">No credit card needed</span>
      {/* Product screenshot */}
      <div className="relative mt-10 md:mt-16 w-full max-w-3xl rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80"
          alt="Product UI screenshot"
          className="w-full object-cover h-[260px] md:h-[350px] bg-white"
          style={{ objectPosition: "top center" }}
        />
        <span className="absolute top-3 right-6 text-xs font-semibold bg-white/70 rounded-full px-4 py-1 text-brand-black border border-brand-yellow shadow-sm">Nexora</span>
      </div>
    </div>
    {/* Doodle bottom right */}
    <svg className="absolute -bottom-10 right-8 w-24 h-16 opacity-80 rotate-6" fill="none" viewBox="0 0 70 42">
      <path d="M5,20 Q30,40 65,20" stroke="#FFD424" strokeWidth="4" fill="none" strokeDasharray="10 8"/>
    </svg>
  </section>
);
export default HeroSection;
