import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Shield, 
  Github,
  ExternalLink,
  Menu,
  X
} from "lucide-react";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const Navigation = ({ currentView, onViewChange }: NavigationProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      description: "Overview and analytics"
    },
    {
      id: "editor",
      label: "Code Editor",
      icon: FileText,
      description: "Analyze and fix code"
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "Configure MISRA rules"
    }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <Card className="hidden lg:block w-64 h-screen p-6 rounded-none border-r">
        <div className="flex items-center gap-2 mb-8">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold">MISRA Tool</h1>
            <p className="text-xs text-muted-foreground">Code Compliance Assistant</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className="w-full justify-start h-auto p-3"
                onClick={() => onViewChange(item.id)}
              >
                <Icon className="h-5 w-5 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.description}</div>
                </div>
              </Button>
            );
          })}
        </nav>

        <div className="mt-8 pt-4 border-t border-border">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">STATUS</span>
              <Badge variant="default" className="bg-success text-success-foreground">
                Online
              </Badge>
            </div>
            
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Backend:</span>
                <span className="text-foreground">Connected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Standard:</span>
                <span className="text-foreground">MISRA C:2012</span>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer">
              <Github className="h-4 w-4 mr-2" />
              View on GitHub
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </Button>
        </div>
      </Card>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Card className="p-4 rounded-none border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-bold">MISRA Tool</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </Card>

        {mobileMenuOpen && (
          <Card className="p-4 rounded-none border-b">
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      onViewChange(item.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </Card>
        )}
      </div>
    </>
  );
};

export default Navigation;