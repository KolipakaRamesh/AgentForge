"use client";

import Link from "next/link";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter, useParams } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const projects = useQuery(api.projects.getProjects);
  const deleteProject = useMutation(api.projects.deleteProject);
  const router = useRouter();
  const params = useParams();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (projectId: any) => {
    try {
      console.log("Executing deletion for project:", projectId);
      await deleteProject({ projectId });
      console.log("Project deleted successfully:", projectId);
      setConfirmDeleteId(null);
      if (params?.id === projectId) {
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert("Failed to delete project. See console for details.");
    }
  };

  return (
    <aside className="w-[280px] bg-white text-slate-600 flex flex-col h-full border-r border-slate-200 shrink-0 z-20">
      <div className="p-8 pb-6">
        <Link href="/" className="text-xl font-extrabold text-slate-900 flex items-center gap-3 hover:opacity-80 transition-opacity tracking-tight">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-indigo-600 text-lg leading-none mt-0.5">✷</span>
          </div>
          AgentForge
        </Link>
      </div>
      
      <div className="px-6 mb-8">
        <Link href="/new" className="group flex items-center justify-center w-full py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow">
          <span className="mr-2 text-lg leading-none opacity-70 group-hover:rotate-90 transition-transform duration-300">+</span> New Project
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 custom-scrollbar">
        <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">Your Projects</h2>
        <ul className="space-y-1.5 list-none">
          {projects === undefined ? (
            <li className="animate-pulse px-2 py-2 space-y-3">
               <div className="h-4 bg-slate-100 rounded w-3/4"></div>
               <div className="h-4 bg-slate-100 rounded w-1/2"></div>
            </li>
          ) : projects?.map((p) => (
            <li key={p._id} className="relative group">
              <Link 
                href={`/project/${p._id}`}
                className={`block py-2.5 px-3 rounded-xl transition-all duration-200 text-sm truncate pr-8 ${
                  p.status === 'executing' 
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-semibold' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                } ${confirmDeleteId === p._id ? 'opacity-50 blur-[0.5px]' : ''}`}
              >
                {p.status === 'executing' && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-500 rounded-r-full" />
                )}
                <span className="ml-1">{p.name}</span>
              </Link>
              
              {confirmDeleteId === p._id ? (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 z-20">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(p._id);
                    }}
                    className="p-1 px-2 bg-red-600 text-white text-[10px] font-bold rounded-md hover:bg-red-700 shadow-sm"
                  >
                    Confirm
                  </button>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setConfirmDeleteId(null);
                    }}
                    className="p-1 px-2 bg-slate-200 text-slate-700 text-[10px] font-bold rounded-md hover:bg-slate-300"
                  >
                    Esc
                  </button>
                </div>
              ) : (
                <button 
                   onClick={(e) => { 
                     e.preventDefault(); 
                     e.stopPropagation();
                     setConfirmDeleteId(p._id);
                   }}
                   className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-md bg-red-50 text-red-600 hover:text-red-700 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10"
                   title="Delete Project"
                >
                   <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              )}
            </li>
          ))}
          {projects?.length === 0 && (
            <li className="text-sm text-slate-500 px-2 italic py-3 bg-slate-50 rounded-xl border border-slate-100 text-center mt-2">No projects yet</li>
          )}
        </ul>
      </nav>

      <div className="p-4 mb-6 mx-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">System Status</span>
          <span className="text-xs text-slate-600 font-medium tracking-wide">Agent Engine <span className="text-emerald-600 font-semibold ml-1">Online</span></span>
        </div>
      </div>
    </aside>
  );
}
