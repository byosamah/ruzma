
import React from "react";
import { Users2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const FinalCtaSection = () => (
  <section className="py-16 bg-white px-3">
    <div className="container mx-auto text-center">
      <h2 className="text-2xl md:text-3xl font-extrabold text-brand-black mb-5">
        Why company leaders love Zaplytic
      </h2>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-brand-yellow rounded-lg py-6 px-10 flex items-center gap-3 max-w-xl mx-auto text-brand-black font-semibold text-lg shadow">
          <Users2 className="w-8 h-8 text-brand-black" />
          "Zaplytic lets our whole team deliver support at enterprise scale without the bloat. Our CSAT scores are higher than ever — it's our hub for growth."
        </div>
        <span className="text-brand-navy/50 text-sm mt-2">Sarah Moore, Head of Customer Operations, Sitewide</span>
      </div>
      <Button className="mt-8 bg-brand-black text-white font-bold px-11 py-4 rounded-lg hover:bg-brand-navy transition text-base shadow">
        Get started free
      </Button>
    </div>
  </section>
);
export default FinalCtaSection;
