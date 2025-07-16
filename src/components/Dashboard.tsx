import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  TrendingUp,
  Clock
} from "lucide-react";

const Dashboard = () => {
  const stats = {
    totalFiles: 24,
    totalViolations: 47,
    criticalViolations: 5,
    majorViolations: 15,
    minorViolations: 27,
    fixedViolations: 12,
    complianceScore: 74
  };

  const recentAnalyses = [
    { id: 1, filename: "main.c", violations: 8, timestamp: "2 minutes ago", status: "completed" },
    { id: 2, filename: "utils.cpp", violations: 3, timestamp: "15 minutes ago", status: "completed" },
    { id: 3, filename: "driver.h", violations: 12, timestamp: "1 hour ago", status: "completed" },
    { id: 4, filename: "config.c", violations: 0, timestamp: "2 hours ago", status: "completed" }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Files</p>
              <p className="text-2xl font-bold">{stats.totalFiles}</p>
            </div>
            <FileText className="h-8 w-8 text-primary" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Violations</p>
              <p className="text-2xl font-bold text-destructive">{stats.totalViolations}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Fixed Issues</p>
              <p className="text-2xl font-bold text-success">{stats.fixedViolations}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
              <p className="text-2xl font-bold text-primary">{stats.complianceScore}%</p>
            </div>
            <Shield className="h-8 w-8 text-primary" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Violation Breakdown */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Violation Breakdown
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violation-critical"></div>
                <span className="text-sm font-medium">Critical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{stats.criticalViolations}</span>
                <Badge variant="destructive">{Math.round((stats.criticalViolations / stats.totalViolations) * 100)}%</Badge>
              </div>
            </div>
            <Progress value={(stats.criticalViolations / stats.totalViolations) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violation-major"></div>
                <span className="text-sm font-medium">Major</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{stats.majorViolations}</span>
                <Badge variant="destructive">{Math.round((stats.majorViolations / stats.totalViolations) * 100)}%</Badge>
              </div>
            </div>
            <Progress value={(stats.majorViolations / stats.totalViolations) * 100} className="h-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-violation-minor"></div>
                <span className="text-sm font-medium">Minor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{stats.minorViolations}</span>
                <Badge variant="secondary">{Math.round((stats.minorViolations / stats.totalViolations) * 100)}%</Badge>
              </div>
            </div>
            <Progress value={(stats.minorViolations / stats.totalViolations) * 100} className="h-2" />
          </div>
        </Card>

        {/* Recent Analyses */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Analyses
          </h3>
          
          <div className="space-y-3">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{analysis.filename}</p>
                    <p className="text-xs text-muted-foreground">{analysis.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {analysis.violations > 0 ? (
                    <Badge variant="destructive">{analysis.violations} issues</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-success text-success-foreground">Clean</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Compliance Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">MISRA Compliance Progress</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Compliance</span>
            <span>{stats.complianceScore}%</span>
          </div>
          <Progress value={stats.complianceScore} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            {100 - stats.complianceScore}% remaining to achieve full MISRA compliance
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;