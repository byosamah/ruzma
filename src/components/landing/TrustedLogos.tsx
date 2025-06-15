
import React from "react";

const companyLogos = [
  { name: "Orbit Group", src: "https://upload.wikimedia.org/wikipedia/commons/4/44/SAP_2011_logo.svg" },
  { name: "Nexora", src: "https://upload.wikimedia.org/wikipedia/commons/0/02/Microsoft_logo.svg" },
  { name: "Proline", src: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
  { name: "HiTech", src: "https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" },
  { name: "Spark Flow", src: "https://upload.wikimedia.org/wikipedia/commons/2/2d/Google-favicon-2015.png" },
];

const TrustedLogos = () => (
  <section className="bg-[#ebfbe2] py-6 px-3 border-y border-slate-100">
    <div className="container mx-auto flex flex-col items-center">
      <p className="text-sm text-brand-black font-bold mb-4">Trusted by consultants, studios, and digital teams worldwide</p>
      <div className="flex flex-wrap justify-center items-center gap-7 md:gap-12">
        {companyLogos.map((logo) => (
          <img key={logo.name} src={logo.src} alt={logo.name} className="h-7 opacity-70 grayscale brightness-110" />
        ))}
      </div>
    </div>
  </section>
);
export default TrustedLogos;
