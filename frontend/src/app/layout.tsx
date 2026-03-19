import type { Metadata } from "next";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AgentForge - Autonomous AI Company",
  description: "Manage your AI workforce.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-900 min-h-screen flex selection:bg-indigo-100 selection:text-indigo-900" suppressHydrationWarning>
        <ConvexClientProvider>
          <div className="flex w-full h-screen overflow-hidden relative z-10">
            <Sidebar />
            <main className="flex-1 flex flex-col overflow-y-auto bg-white border-l border-slate-200 relative z-10 shadow-sm">
              {children}
            </main>
          </div>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
