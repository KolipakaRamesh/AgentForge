"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";

export default function ProjectView() {
  const params = useParams();
  const projectId = params.id as Id<"projects">;
  
  const [approving, setApproving] = useState(false);

  const project = useQuery(api.projects.getProject, { projectId });
  const logs = useQuery(api.logs.getLogsByProjectId, { projectId });
  const plan = useQuery(api.plans.getPlanByProjectId, { projectId });
  
  const approvePlan = useMutation(api.plans.approvePlan);
  const updateProjectStatus = useMutation(api.projects.updateProjectStatus);

  const handleApprove = async () => {
    if (!plan) return;
    setApproving(true);
    try {
      await approvePlan({ planId: plan._id });
      await updateProjectStatus({ projectId, status: "executing" });
      
      await fetch('/api/agents/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, planId: plan._id })
      });
    } catch (err) {
      console.error(err);
    } finally {
      setApproving(false);
    }
  };

  if (project === undefined) return (
    <div className="flex-1 flex items-center justify-center p-8 text-slate-500 font-mono text-sm tracking-widest uppercase">
      <div className="flex items-center gap-3">
        <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        Synchronizing Context...
      </div>
    </div>
  );
  if (project === null) return <div className="p-8 text-red-500 font-medium">Project not found</div>;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50 relative">
      {/* Header */}
      <header className="px-8 py-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0 z-20 shadow-sm relative">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            {project.name}
          </h1>
          <p className="text-sm text-slate-500 mt-1 truncate max-w-2xl font-medium">{project.description}</p>
        </div>
        <div className="flex items-center gap-5">
          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 ${
            project.status === 'planning' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
            project.status === 'waiting_approval' ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm' :
            project.status === 'executing' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' :
            project.status === 'done' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>  
            {(project.status === 'executing' || project.status === 'planning') && (
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
            )}
            {project.status.replace("_", " ")}
          </span>
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noreferrer" className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 transition-all shadow-sm flex items-center gap-2 hover:shadow">
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"></path></svg>
              View Repository
            </a>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Panel: Activity Timeline (Now just Logs) */}
        <div className="w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col overflow-hidden relative z-10 custom-scrollbar">
          <div className="px-5 py-6 border-b border-slate-200 shrink-0 flex items-center justify-between bg-white sticky top-0 z-20 shadow-sm">
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
              Execution Logs
            </h2>
            <span className="text-[9px] font-bold uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full shadow-sm">{logs?.length || 0}</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {logs === undefined ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-white rounded-2xl w-full border border-slate-200"></div>
                <div className="h-16 bg-white rounded-2xl w-full border border-slate-200"></div>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 py-8 px-4">
                <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mb-3 bg-white">
                   <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                </div>
                <p className="text-xs font-medium">Waiting for signals...</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={log._id} className="relative group">
                  {idx !== logs.length - 1 && <div className="absolute top-10 left-3.5 w-[1px] h-[calc(100%+16px)] bg-slate-200 -z-10"></div>}
                  <div className="flex gap-3">
                    <div className="shrink-0 mt-1">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center border bg-white ${
                        log.agentType === 'planner' ? 'border-blue-200 text-blue-600' :
                        log.agentType === 'dev' ? 'border-indigo-200 text-indigo-600' :
                        log.agentType === 'qa' ? 'border-emerald-200 text-emerald-600' : 
                        log.agentType === 'research' ? 'border-purple-200 text-purple-600' :
                        log.agentType === 'critic' ? 'border-rose-200 text-rose-600' : 'border-slate-200 text-slate-600'
                      } shadow-sm`}>
                        <span className="text-[10px] font-bold">{log.agentType[0].toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-2xl transition-colors flex-1 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className={`text-[10px] font-extrabold uppercase tracking-wider ${
                          log.agentType === 'planner' ? 'text-blue-600' :
                          log.agentType === 'dev' ? 'text-indigo-600' :
                          log.agentType === 'qa' ? 'text-emerald-600' :
                          log.agentType === 'research' ? 'text-purple-600' :
                          log.agentType === 'critic' ? 'text-rose-600' : 'text-slate-600'
                        }`}>{log.agentType}</span>
                        <span className="text-[9px] text-slate-400 font-medium font-mono">{new Date(log._creationTime).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{log.message}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Content with Top Agent Bar */}
        <div className="flex-1 flex flex-col bg-slate-100/30 overflow-hidden relative">
          
          {/* Horizontal Agent Status Bar */}
          <div className="px-8 py-4 bg-white border-b border-slate-200 shadow-sm z-10 flex items-center gap-4 overflow-x-auto no-scrollbar">
            <div className="flex-shrink-0 flex flex-col mr-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">AI Workflow</span>
              <span className="text-[9px] text-slate-300 font-bold uppercase tracking-tighter mt-1">Multi-Agent System</span>
            </div>
            <div className="flex items-center gap-3">
              {['planner', 'dev', 'qa', 'critic', 'research'].map(type => {
                const latestLog = logs && logs.length > 0 ? logs[logs.length - 1] : null;
                const isWorking = 
                  (project.status === 'planning' && type === 'planner') || 
                  (project.status === 'executing' && latestLog?.agentType === type);
                
                const hasStarted = logs?.some(l => l.agentType === type);
                const isOverallDone = project.status === 'done';
                const isFailed = project.status === 'failed';
                
                const statusColor = 
                    isWorking ? 'blue' : 
                    isFailed ? 'rose' : 
                    isOverallDone ? 'emerald' : 
                    hasStarted ? 'amber' : 'slate';

                return (
                  <div key={type} className={`px-4 py-2 rounded-xl border flex items-center gap-3 transition-all duration-300 min-w-[140px] ${
                    isWorking ? `border-blue-200 bg-blue-50/50 shadow-sm ring-1 ring-blue-100` : 
                    isFailed ? `border-rose-200 bg-rose-50/50` :
                    isOverallDone ? `border-emerald-200 bg-emerald-50/30` :
                    hasStarted ? `border-amber-200 bg-amber-50/50` : 
                    'border-slate-100 bg-white/50 opacity-70'
                  }`}>
                    <div className="relative flex h-2 w-2">
                      {isWorking && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-60`}></span>}  
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${
                        isWorking ? `bg-blue-500 shadow-sm` : 
                        isFailed ? `bg-rose-500 shadow-sm` :
                        isOverallDone ? `bg-emerald-500 shadow-sm` : 
                        hasStarted ? `bg-amber-500 shadow-sm` : 
                        'bg-slate-200'
                      }`}></span>
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[10px] font-extrabold uppercase tracking-widest truncate ${
                        isWorking ? `text-blue-700` : 
                        isFailed ? `text-rose-700` :
                        isOverallDone ? `text-emerald-700` : 
                        hasStarted ? `text-amber-700` : 
                        'text-slate-500'
                      }`}>{type}</p>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-tight mt-0.5">
                        {isWorking ? 'Active' : isFailed ? 'Error' : isOverallDone ? 'Completed' : hasStarted ? 'Back & Forth' : 'Standby'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {project.status === 'waiting_approval' && plan ? (
            <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
              <div className="max-w-4xl mx-auto">
                <div className="bg-white border border-slate-200 p-10 rounded-[2rem] mb-8 isolate relative shadow-xl shadow-slate-200/50 overflow-hidden">
                  <div className="flex items-start justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight drop-shadow-sm">Architectural Blueprint</h2>
                      <p className="text-slate-500 text-sm font-medium">Review the agent-generated architecture before execution.</p>
                    </div>
                    <div className="px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-700 text-xs font-bold uppercase tracking-wider shadow-sm">
                      Requires Approval
                    </div>
                  </div>
                  
                  <div className="bg-slate-900 rounded-2xl p-6 md:p-8 border border-slate-800 shadow-inner mb-8 overflow-hidden relative">
                     {/* Window controls decoration */}
                     <div className="flex gap-2 mb-6 border-b border-slate-700 pb-4">
                       <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                       <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                       <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                     </div>
                    <pre className="text-slate-300 text-[13px] leading-relaxed whitespace-pre-wrap font-mono custom-scrollbar overflow-x-auto">
                      {plan.content}
                    </pre>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={handleApprove}
                      disabled={approving}
                      className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:opacity-70 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center min-w-[200px]"
                    >
                      {approving ? "Initiating..." : "Approve & Execute"}
                    </button>
                    <button className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-semibold transition-colors border border-slate-200 shadow-sm hover:shadow">
                      Dismiss Plan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
             <div className="flex-1 flex items-center justify-center p-8 bg-transparent relative z-0"> 
               <div className="text-center max-w-lg relative z-10 p-10 bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50">
                 <div className="w-20 h-20 bg-slate-50 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-inner border border-slate-200 relative overflow-hidden">
                   <svg className="w-8 h-8 text-slate-400 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                   </svg>
                 </div>
                 <h2 className="text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Code Workspace</h2>
                 <p className="text-slate-500 text-sm flex items-center justify-center gap-3 font-medium px-4">
                   {project.status === 'planning' ? (
                     <>
                      <svg className="animate-spin h-5 w-5 text-indigo-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      <span className="leading-relaxed">The Planner agent is analyzing requirements and structuring the architecture...</span>
                     </>
                   ) : project.status === 'executing' ? (
                     <>
                      <svg className="animate-spin h-5 w-5 text-indigo-600 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                      <span className="leading-relaxed">Agents are generating, reviewing, and executing code. Stand by...</span>
                     </>
                   ) : (
                     "Deployment sequence complete. Repository is available for viewing."
                   )}
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}