"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function NewProject() {
  const createProject = useMutation(api.projects.createProject);
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !description) return;
    
    setLoading(true);
    try {
      const projectId = await createProject({ name, description });
      
      // Trigger Python Agent Engine to start planning
      await fetch('/api/agents/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, requirement: description })
      });

      router.push(`/project/${projectId}`);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto w-full h-full relative bg-slate-50/50">
      <div className="max-w-2xl mx-auto mt-16 bg-white p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-500"></div>
        
        <h1 className="text-4xl font-extrabold mb-3 relative z-10 tracking-tight text-slate-900">Initialize Project</h1>
        <p className="text-slate-500 mb-10 relative z-10 font-medium leading-relaxed">Describe your software requirement in detail, and the AI engineering team will handle the rest.</p>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="group">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 transition-colors group-focus-within:text-indigo-600">Project Name</label>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
              placeholder="e.g. Modern Hospital Management System"
              required
            />
          </div>

          <div className="group">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 transition-colors group-focus-within:text-indigo-600">Detailed Requirement</label>
            <textarea 
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-4 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 min-h-[180px] transition-all resize-y leading-relaxed placeholder:text-slate-400"
              placeholder="Describe the main features, target audience, specific pages, data models, or anything else you need..."
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:opacity-70 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center text-lg mt-2 relative overflow-hidden group"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Deploying Agent Team...
              </>
            ) : (
              <span className="flex items-center gap-2">
                Start Planning Phase
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
