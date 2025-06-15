
import React from "react";

const TaskPrioritizationSection = () => (
  <section className="py-16 bg-slate-50 px-3">
    <div className="container mx-auto flex flex-col md:flex-row items-center gap-10">
      {/* Person image */}
      <div className="flex-1 flex justify-center">
        <img
          src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=500&q=80"
          alt="Task Prioritization"
          className="rounded-xl shadow-lg max-w-xs h-64 object-cover"
        />
      </div>
      {/* Copy */}
      <div className="flex-1">
        <h3 className="text-2xl font-bold text-brand-black mb-4">
          Smart task prioritization for optimal workflow
        </h3>
        <ul className="space-y-3 text-brand-navy/90 text-base mb-6">
          <li>
            <span className="inline-block w-5 h-5 rounded-full bg-brand-yellow mr-2 align-middle"></span>
            Assign tasks intelligently to reduce manual effort
          </li>
          <li>
            <span className="inline-block w-5 h-5 rounded-full bg-brand-blue mr-2 align-middle"></span>
            AI-driven prioritization highlights what's urgent
          </li>
          <li>
            <span className="inline-block w-5 h-5 rounded-full bg-brand-navy mr-2 align-middle"></span>
            See what's next on your team's dashboard
          </li>
        </ul>
        <div className="flex flex-col gap-2 text-sm text-brand-navy/70">
          <span>• Management made easy</span>
          <span>• Keep teams focused on what matters most</span>
        </div>
      </div>
    </div>
  </section>
);
export default TaskPrioritizationSection;
