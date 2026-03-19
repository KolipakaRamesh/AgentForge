export default function Dashboard() {
  return (
    <div className="flex-1 p-8 flex flex-col items-center justify-center text-center h-full relative overflow-hidden bg-slate-50/50">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>
      
      <div className="w-24 h-24 bg-white border border-indigo-100 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-100/50">
        <span className="text-5xl drop-shadow-sm text-indigo-600">✷</span>
      </div>
      
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight text-slate-900">
        Welcome to AgentForge
      </h1>
      
      <p className="text-lg text-slate-500 max-w-xl mx-auto mb-10 leading-relaxed font-medium">
        Your Autonomous AI Software Company. Create a new project to spin up a team of specialized AI agents that will dynamically plan, develop, test, and deploy your software.
      </p>
      
      <div className="flex items-center gap-6">
        <a href="/new" className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold transition-all duration-300 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-0.5">
          <span>Start New Project</span>
          <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}