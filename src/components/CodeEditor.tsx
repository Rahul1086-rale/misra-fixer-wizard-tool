import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Play, FileText, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Violation {
  id: string;
  rule: string;
  severity: "critical" | "major" | "minor" | "info";
  line: number;
  column: number;
  message: string;
  suggestion?: string;
}

const CodeEditor = () => {
  const [code, setCode] = useState(`// Example C code with MISRA violations
#include <stdio.h>

int main() {
    int x = 5; // MISRA 9.1: Uninitialized variable potential
    int y;     // MISRA 9.1: Uninitialized variable
    
    if (x = 6) { // MISRA 13.4: Assignment in condition
        printf("Hello World\\n");
    }
    
    return 0;
}`);

  const [violations, setViolations] = useState<Violation[]>([
    {
      id: "1",
      rule: "MISRA C:2012 Rule 9.1",
      severity: "critical",
      line: 5,
      column: 9,
      message: "Variable 'y' is not initialized before use",
      suggestion: "Initialize variable 'y' at declaration: int y = 0;"
    },
    {
      id: "2", 
      rule: "MISRA C:2012 Rule 13.4",
      severity: "major",
      line: 7,
      column: 8,
      message: "Assignment operator used in conditional expression",
      suggestion: "Use comparison operator '==' instead of assignment '='"
    }
  ]);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    // Simulate API call to Python backend
    setTimeout(() => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: `Found ${violations.length} MISRA violations`,
      });
    }, 2000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCode(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-violation-critical";
      case "major": return "bg-violation-major"; 
      case "minor": return "bg-violation-minor";
      case "info": return "bg-violation-info";
      default: return "bg-muted";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Suggestion copied successfully",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Code Editor Panel */}
      <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Code Editor
          </h3>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".c,.cpp,.h,.hpp"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
            <Button
              variant="analysis"
              size="sm"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <Play className="h-4 w-4" />
              {isAnalyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </div>
        
        <div className="flex-1 relative">
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="h-full min-h-[400px] font-mono text-sm bg-code-bg border-border resize-none"
            placeholder="Paste your C/C++ code here or upload a file..."
          />
          <div className="absolute top-2 right-2 text-xs text-muted-foreground">
            Lines: {code.split('\n').length}
          </div>
        </div>
      </Card>

      {/* Violations Panel */}
      <Card className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">MISRA Violations</h3>
          <Badge variant="outline">
            {violations.length} Issues Found
          </Badge>
        </div>
        
        <div className="flex-1 space-y-4 overflow-y-auto">
          {violations.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              No violations found. Run analysis to check your code.
            </div>
          ) : (
            violations.map((violation) => (
              <Card key={violation.id} className="p-4 border-l-4 border-l-current">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className={`${getSeverityColor(violation.severity)} text-white`}>
                      {violation.severity}
                    </Badge>
                    <span className="text-sm font-medium">{violation.rule}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Line {violation.line}:{violation.column}
                  </span>
                </div>
                
                <p className="text-sm text-foreground mb-3">
                  {violation.message}
                </p>
                
                {violation.suggestion && (
                  <div className="bg-muted p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Suggested Fix:
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(violation.suggestion!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="text-xs text-foreground">
                      {violation.suggestion}
                    </code>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default CodeEditor;