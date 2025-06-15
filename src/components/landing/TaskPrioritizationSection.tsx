
import React from "react";

const TaskPrioritizationSection = () => (
  <section className="py-16 bg-slate-50 px-3">
    <div className="container mx-auto flex flex-col md:flex-row items-center gap-10">
      {/* Person image */}
      <div className="flex-1 flex justify-center">
        <img
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=80"
          alt="Freelancer workflow"
          className="rounded-xl shadow-lg max-w-xs h-64 object-cover"
        />
      </div>
      {/* Copy */}
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-brand-black mb-4">
          Smarter task management, smoother delivery
        </h3>
        <ul className="space-y-3 text-brand-navy/90 text-base mb-6">
          <li>
            <span className="inline-block w-5 h-5 rounded-full bg-brand-yellow mr-2 align-middle"></span>
            Automated reminders for you and your client every step
          </li>
          <li>
            <span className="inline-block w-5 h-5 rounded-full bg-brand-blue mr-2 align-middle"></span>
            Prioritize key milestones to reduce back-and-forth
          </li>
          <li>
            <span className="inline-block w-5 h-5 rounded-full bg-brand-navy mr-2 align-middle"></span>
            Visual dashboard to track status and next actions
          </li>
        </ul>
        <div className="flex flex-col gap-2 text-sm text-brand-navy/70">
          <span>• Nothing slips through the cracks</span>
          <span>• Deliver stellar client experience</span>
        </div>
      </div>
    </div>
  </section>
);
export default TaskPrioritizationSection;
