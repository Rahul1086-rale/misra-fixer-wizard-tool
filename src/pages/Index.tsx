import { useState } from "react";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import CodeEditor from "@/components/CodeEditor";
import Settings from "@/components/Settings";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard />;
      case "editor":
        return <CodeEditor />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold capitalize mb-1">
              {currentView === "editor" ? "Code Editor" : currentView}
            </h2>
            <p className="text-muted-foreground">
              {currentView === "dashboard" && "Monitor your MISRA compliance status and recent analyses"}
              {currentView === "editor" && "Analyze your C/C++ code for MISRA violations and get fix suggestions"}
              {currentView === "settings" && "Configure MISRA standards and analysis options"}
            </p>
          </div>
          
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;
