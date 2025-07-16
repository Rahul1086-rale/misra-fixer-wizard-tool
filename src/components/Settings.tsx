import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  Shield, 
  Code, 
  Server, 
  Save,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const [misraStandard, setMisraStandard] = useState("misra-c-2012");
  const [enabledRules, setEnabledRules] = useState({
    "rule-9.1": true,
    "rule-13.4": true,
    "rule-2.1": false,
    "rule-8.4": true,
    "rule-10.3": true
  });
  const [backendUrl, setBackendUrl] = useState("http://localhost:8000");
  const [autoFix, setAutoFix] = useState(false);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(true);

  const { toast } = useToast();

  const handleSaveSettings = () => {
    // Here you would save settings to backend/localStorage
    toast({
      title: "Settings Saved",
      description: "Your configuration has been updated successfully.",
    });
  };

  const handleTestConnection = () => {
    // Test connection to Python backend
    toast({
      title: "Testing Connection",
      description: "Checking connection to Python backend...",
    });
  };

  const toggleRule = (ruleId: string) => {
    setEnabledRules(prev => ({
      ...prev,
      [ruleId]: !prev[ruleId]
    }));
  };

  const ruleDescriptions = {
    "rule-9.1": "Uninitialized variables",
    "rule-13.4": "Assignment in conditional expressions", 
    "rule-2.1": "Unreachable code",
    "rule-8.4": "Missing function declarations",
    "rule-10.3": "Implicit conversions"
  };

  return (
    <div className="space-y-6">
      {/* MISRA Standard Selection */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          MISRA Standard
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Standard Version</label>
              <Select value={misraStandard} onValueChange={setMisraStandard}>
                <SelectTrigger>
                  <SelectValue placeholder="Select MISRA standard" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="misra-c-2004">MISRA C:2004</SelectItem>
                  <SelectItem value="misra-c-2012">MISRA C:2012</SelectItem>
                  <SelectItem value="misra-cpp-2008">MISRA C++:2008</SelectItem>
                  <SelectItem value="misra-cpp-2023">MISRA C++:2023</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Badge variant="outline" className="text-xs">
                {misraStandard === "misra-c-2012" ? "143 Rules Available" : "Rules Available"}
              </Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* Rule Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Code className="h-5 w-5" />
          Rule Configuration
        </h3>
        
        <div className="space-y-4">
          {Object.entries(ruleDescriptions).map(([ruleId, description]) => (
            <div key={ruleId} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">
                    {ruleId.replace("rule-", "Rule ")}
                  </span>
                  <Badge variant={enabledRules[ruleId] ? "default" : "secondary"} className="text-xs">
                    {enabledRules[ruleId] ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Switch
                checked={enabledRules[ruleId]}
                onCheckedChange={() => toggleRule(ruleId)}
              />
            </div>
          ))}
        </div>
      </Card>

      {/* Backend Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Server className="h-5 w-5" />
          Backend Configuration
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Python Backend URL</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={backendUrl}
                onChange={(e) => setBackendUrl(e.target.value)}
                className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-sm"
                placeholder="http://localhost:8000"
              />
              <Button variant="outline" onClick={handleTestConnection}>
                <RefreshCw className="h-4 w-4" />
                Test
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Auto-fix violations</p>
                <p className="text-xs text-muted-foreground">
                  Automatically apply suggested fixes when possible
                </p>
              </div>
              <Switch checked={autoFix} onCheckedChange={setAutoFix} />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Real-time analysis</p>
                <p className="text-xs text-muted-foreground">
                  Analyze code as you type (may impact performance)
                </p>
              </div>
              <Switch checked={realTimeAnalysis} onCheckedChange={setRealTimeAnalysis} />
            </div>
          </div>
        </div>
      </Card>

      {/* Analysis Configuration */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Analysis Options</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Severity Filter</label>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Show All Violations</SelectItem>
                <SelectItem value="critical-major">Critical & Major Only</SelectItem>
                <SelectItem value="critical">Critical Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Report Format</label>
            <Select defaultValue="json">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="html">HTML Report</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>
    </div>
  );
};

export default Settings;