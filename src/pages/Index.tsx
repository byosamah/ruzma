
import React from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <Layout>
      <div>
        {/* HERO SECTION */}
        <section className="min-h-[65vh] md:min-h-[60vh] bg-[#FFFDEE] relative flex flex-col lg:flex-row items-center justify-between px-2 md:px-10 py-12 md:py-20 rounded-2xl overflow-hidden">
          <div className="flex-1 z-20 max-w-2xl space-y-7">
            <img
              src="/lovable-uploads/1e178334-5b19-4d80-b95b-5e0b05ddfde9.png"
              alt="huzma landing hero"
              className="block md:hidden mb-5 w-32"
            />
            <h1 className="text-4xl md:text-5xl font-extrabold text-[#111729] leading-tight">
              Get your clients pay{" "}
              <span className="inline-block mt-2 md:mt-0">
                <span className="px-2 py-1 bg-[#FFE16A] rounded-md text-[#242D31] font-extrabold text-3xl md:text-4xl align-middle ml-1">
                  on&nbsp;time
                </span>
              </span>
            </h1>
            <p className="mt-2 text-lg md:text-xl text-[#6D7692] max-w-xl">
              Set up projects with milestones, share them with clients, and ensure you get paid before they access deliverables—no more chasing payments.
            </p>
            {/* WAITLIST FORM */}
            <form
              className="flex w-full md:w-[400px] mt-6 bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm"
              onSubmit={(e) => {
                e.preventDefault();
                // handle waitlist submission
              }}
            >
              <input
                type="email"
                placeholder="name@email.com"
                required
                className="flex-1 py-3 px-4 focus:outline-none border-none bg-transparent text-base"
              />
              <Button
                type="submit"
                className="bg-[#FFE16A] text-[#242D31] rounded-none font-extrabold px-6 text-base h-auto hover:bg-yellow-400 transition"
                size="lg"
              >
                Join Waitlist
              </Button>
            </form>
          </div>
          {/* Hero right illustration - only on md+ */}
          <div className="hidden md:block flex-1 z-10 relative">
            <img
              src="/lovable-uploads/1e178334-5b19-4d80-b95b-5e0b05ddfde9.png"
              alt="huzma hero"
              className="w-[450px] max-w-full ml-auto"
              style={{ filter: "drop-shadow(0 6px 32px #FFE16A33)" }}
            />
            {/* Blurbs around hero image */}
            <div className="absolute -top-3 -right-8">
              <span className="bg-[#D7F5D7] text-[#232F1F] rounded-full px-4 py-2 text-sm font-medium shadow hover:scale-105 transition inline-block rotate-[18deg] border border-green-200">
                Milestone payment
              </span>
            </div>
            <div className="absolute top-32 -left-12">
              <span className="bg-[#FFE9E8] text-[#30201D] rounded-full px-4 py-2 text-sm font-medium shadow hover:scale-105 transition inline-block -rotate-12 border border-pink-200">
                Payment tracking
              </span>
            </div>
            <div className="absolute bottom-4 left-2/3">
              <span className="bg-[#ECF7ED] text-[#232F1F] rounded-full px-4 py-2 text-sm font-medium shadow hover:scale-105 transition inline-block -rotate-3 border border-green-200">
                Seamless payment
              </span>
            </div>
          </div>
        </section>

        {/* FEATURES/EXPLANATION SECTION */}
        <section className="mt-20 mb-16">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="mb-3 flex justify-center">
              <span className="text-xs rounded-2xl px-3 py-1 border bg-[#FCFCFA] text-[#5E647B] border-[#ECECED] font-medium flex gap-1 items-center">
                <span className="w-2 h-2 bg-[#FFE16A] rounded-full mr-1"></span>
                Features
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-[#111729] mb-3">
              Focus on your work, <br className="hidden md:inline" />
              let us handle the payments.
            </h2>
            <p className="text-lg text-[#6D7692] leading-relaxed">
              We’ve built a simple, hassle-free way to manage payment requests, so clients pay before they receive deliverables. No more back-and-forth.
            </p>
          </div>
          {/* Feature card */}
          <div className="md:flex md:justify-center md:items-stretch gap-10">
            <div className="flex-1 bg-[#FEFCF6] rounded-3xl shadow px-7 py-8 mb-8 md:mb-0">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs rounded-2xl px-3 py-1 border bg-[#FFF] text-[#5E647B] border-[#ECECED] font-medium flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[#FFE16A] rounded-full mr-1"></span>
                  Secure File Access
                </span>
              </div>
              <h3 className="text-2xl font-bold text-[#111729] mb-3">
                Clients must make payment before unlocking and downloading work files
              </h3>
              <div className="flex flex-col items-center">
                <img
                  src="/lovable-uploads/00daa8cf-737b-44e4-92a0-bc1518bcddfa.png"
                  alt="File access example"
                  className="rounded-2xl object-cover max-h-56 w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* MILESTONE-BASED & REMINDERS */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-[#FEFCF6] rounded-3xl shadow px-7 py-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs rounded-2xl px-3 py-1 border bg-[#FFF] text-[#5E647B] border-[#ECECED] font-medium flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[#FFE16A] rounded-full mr-1"></span>
                  Milestone-Based Payments
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#111729] mb-2">
                Secure Milestone-Based Payments with No Additional Commission Fees
              </h3>
              <div className="my-2">
                <img
                  src="/lovable-uploads/cd2a1725-8a9f-44a7-ad4d-1b381d2353f0.png"
                  alt="Milestones Card"
                  className="rounded-xl object-cover w-full"
                />
              </div>
            </div>
            <div className="bg-[#FEFCF6] rounded-3xl shadow px-7 py-8">
              <div className="mb-4 flex items-center gap-2">
                <span className="text-xs rounded-2xl px-3 py-1 border bg-[#FFF] text-[#5E647B] border-[#ECECED] font-medium flex gap-1 items-center">
                  <span className="w-2 h-2 bg-[#FFE16A] rounded-full mr-1"></span>
                  Client Reminder System
                </span>
              </div>
              <h3 className="text-xl font-bold text-[#111729] mb-2">
                Automated Client Reminder System for Timely Updates and Follow-Ups
              </h3>
              <div className="my-2">
                <img
                  src="/lovable-uploads/cd2a1725-8a9f-44a7-ad4d-1b381d2353f0.png"
                  alt="Reminder Card"
                  className="rounded-xl object-cover w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* EMAIL WAITLIST CTA */}
        <section className="mb-20 flex flex-col items-center">
          <div className="w-full bg-gradient-to-r from-[#F6F8E9] to-[#FFF8CF] rounded-2xl shadow-md p-8 md:p-12 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#111729] mb-2">
              Ready to get paid without the hassle? <span role="img" aria-label="money">💰</span>
            </h2>
            <p className="text-lg text-[#6D7692] mb-7 max-w-2xl mx-auto">
              Drop your email, and we’ll let you know as soon as our solution is ready to help you get paid on time effortlessly.
            </p>
            <form
              className="flex flex-col md:flex-row items-center w-full gap-3 max-w-xl mx-auto"
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
                type="email"
                placeholder="name@email.com"
                required
                className="flex-1 py-3 px-4 rounded-l-lg border border-slate-200 text-base focus:outline-none"
              />
              <Button
                type="submit"
                className="bg-[#FFE16A] text-[#242D31] rounded-none rounded-r-lg font-extrabold px-7 text-base h-auto hover:bg-yellow-400 transition"
                size="lg"
              >
                Join Waitlist
              </Button>
            </form>
          </div>
        </section>

        {/* PROCESS STEPS SECTION */}
        <section className="pb-20">
          <div className="text-center mb-12">
            <div className="mb-3 flex justify-center">
              <span className="text-xs rounded-2xl px-3 py-1 border bg-[#FCFCFA] text-[#5E647B] border-[#ECECED] font-medium flex gap-1 items-center">
                <span className="w-2 h-2 bg-[#FFE16A] rounded-full mr-1"></span>
                How it work
              </span>
            </div>
            <h2 className="text-4xl font-extrabold text-[#111729] mb-3">
              See how simple it is
            </h2>
            <p className="text-lg text-[#6D7692] max-w-2xl mx-auto">
              Get paid on time with an effortless, no-hassle process—just set milestones, share, and let clients pay before they receive deliverables.
            </p>
          </div>
          {/* STEPS */}
          <div className="flex flex-col md:flex-row gap-6 items-center justify-center mb-10">
            {/* Step 1 */}
            <div className="bg-[#FEF7E6] w-full md:w-72 rounded-2xl p-7 flex flex-col items-center border border-yellow-200 mx-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="block text-2xl md:text-3xl font-extrabold text-[#FFE16A]">01</span>
                <span className="font-bold text-[#2A2A2A] text-base ml-2">Set up a project</span>
              </div>
              <div className="border-t border-slate-200 w-10 my-2"/>
              <p className="text-[#6D7692] text-base text-center">Add milestones, files, and payment amounts.</p>
            </div>
            <span className="hidden md:inline-block text-2xl text-[#E5E4E2] mx-2">→</span>
            {/* Step 2 */}
            <div className="bg-[#FEF7E6] w-full md:w-72 rounded-2xl p-7 flex flex-col items-center border border-yellow-200 mx-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="block text-2xl md:text-3xl font-extrabold text-[#FFE16A]">02</span>
                <span className="font-bold text-[#2A2A2A] text-base ml-2">Upload deliverables</span>
              </div>
              <div className="border-t border-slate-200 w-10 my-2"/>
              <p className="text-[#6D7692] text-base text-center">Clients get notified but can't download yet.</p>
            </div>
            <span className="hidden md:inline-block text-2xl text-[#E5E4E2] mx-2">→</span>
            {/* Step 3 */}
            <div className="bg-[#FEF7E6] w-full md:w-72 rounded-2xl p-7 flex flex-col items-center border border-yellow-200 mx-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="block text-2xl md:text-3xl font-extrabold text-[#FFE16A]">03</span>
                <span className="font-bold text-[#2A2A2A] text-base ml-2">Client pays</span>
              </div>
              <div className="border-t border-slate-200 w-10 my-2"/>
              <p className="text-[#6D7692] text-base text-center">Once they pay, they can access the deliverables.</p>
            </div>
          </div>
        </section>

        {/* FINAL WAITLIST CTA/FOOTER */}
        <footer className="w-full bg-[#111729] py-12 text-center rounded-t-2xl">
          <div className="max-w-2xl mx-auto flex flex-col items-center">
            <div className="flex items-center gap-2 mb-3">
              <img src="/lovable-uploads/1e178334-5b19-4d80-b95b-5e0b05ddfde9.png" alt="huzma" className="w-20" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Still not on our waitlist?</h3>
            <p className="text-[#D1D5DB] mb-4">
              Drop your email, and we’ll notify you the moment we launch.
            </p>
            <form
              className="flex w-full md:w-[400px] bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="name@email.com"
                required
                className="flex-1 py-3 px-4 focus:outline-none border-none bg-transparent text-base"
              />
              <Button
                type="submit"
                className="bg-[#FFE16A] text-[#242D31] rounded-none font-extrabold px-6 text-base h-auto hover:bg-yellow-400 transition"
                size="lg"
              >
                Join Waitlist
              </Button>
            </form>
            <div className="mt-6 text-xs text-[#9FA6B2]">Copyright &copy; 2025 All rights reserved</div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Index;

